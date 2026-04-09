import { Router, Response } from 'express';
import OpenAI from 'openai';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `أنت مساعد عقاري ذكي لموقع إسكنك - منصة العقارات في الإسكندرية، مصر.
مهمتك مساعدة المستخدمين في إيجاد العقار المناسب بناءً على احتياجاتهم.
تحدث بالعربية دائماً وكن ودوداً ومفيداً.
عند سؤالك عن عقارات، اسأل عن: الميزانية، عدد الغرف، المنطقة المفضلة، الغرض (شراء/إيجار).
المناطق المتاحة في الإسكندرية: سيدي جابر، سموحة، المنتزه، العجمي، ستانلي، المندرة، كليوباترا، محطة الرمل.
أنواع العقارات: شقة، فيلا، مكتب، شاليه، أرض، محل تجاري.`;

router.post('/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { messages, conversationId, sessionId } = req.body;

    // Get real property data for context
    const propertiesRes = await query(`
      SELECT title, type, purpose, price, area, rooms, district, status
      FROM properties WHERE status='approved' LIMIT 20
    `);
    
    const propertyContext = propertiesRes.rows.map(p => 
      `${p.title}: ${p.type} للـ${p.purpose === 'sale' ? 'بيع' : 'إيجار'}, ${p.price.toLocaleString()} جنيه, ${p.rooms || 0} غرف, ${p.area}م², ${p.district}`
    ).join('\n');

    const systemMsg = SYSTEM_PROMPT + '\n\nالعقارات المتاحة حالياً:\n' + propertyContext;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemMsg },
        ...messages
      ],
      stream: true,
      max_completion_tokens: 1000,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save conversation
    if (req.headers.authorization) {
      try {
        const jwt = await import('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'iskantek_secret_2024') as any;
        
        let convId = conversationId;
        if (!convId) {
          const conv = await query('INSERT INTO ai_conversations (user_id, session_id) VALUES ($1,$2) RETURNING id', [decoded.id, sessionId]);
          convId = conv.rows[0].id;
        }
        const lastUserMsg = messages[messages.length - 1]?.content;
        if (lastUserMsg) {
          await query('INSERT INTO ai_messages (conversation_id, role, content) VALUES ($1,$2,$3)', [convId, 'user', lastUserMsg]);
          await query('INSERT INTO ai_messages (conversation_id, role, content) VALUES ($1,$2,$3)', [convId, 'assistant', fullResponse]);
        }
      } catch {}
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error(err);
    res.write(`data: ${JSON.stringify({ error: 'خطأ في الذكاء الاصطناعي' })}\n\n`);
    res.end();
  }
});

router.post('/recommend', async (req: AuthRequest, res: Response) => {
  try {
    const { budget, rooms, district, purpose } = req.body;
    
    let conditions = ["status = 'approved'"];
    const params: any[] = [];
    let idx = 1;
    if (budget) { conditions.push(`price <= $${idx++}`); params.push(Number(budget)); }
    if (rooms) { conditions.push(`rooms >= $${idx++}`); params.push(Number(rooms)); }
    if (district) { conditions.push(`district ILIKE $${idx++}`); params.push(`%${district}%`); }
    if (purpose) { conditions.push(`purpose = $${idx++}`); params.push(purpose); }

    const result = await query(`
      SELECT p.*, (SELECT pi.url FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary=true LIMIT 1) as primary_image
      FROM properties p WHERE ${conditions.join(' AND ')}
      ORDER BY p.is_featured DESC, p.created_at DESC LIMIT 6
    `, params);

    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

export default router;
