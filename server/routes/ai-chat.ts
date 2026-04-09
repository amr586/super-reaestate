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
تحدث بالعربية الفصحى البسيطة دائماً وكن ودوداً ومفيداً.

قواعد المحادثة:
1. إذا لم يذكر المستخدم احتياجاته بوضوح، اسأله سؤالاً واحداً في كل مرة بالترتيب:
   أ) الغرض: شراء أم إيجار؟
   ب) نوع العقار: شقة، فيلا، مكتب...؟
   ج) المنطقة المفضلة في الإسكندرية؟
   د) الميزانية التقريبية؟
   هـ) عدد غرف النوم؟
2. بعد جمع المعلومات، قدّم توصيات من قائمة العقارات المتاحة.
3. عند ذكر عقار، اكتب معرّفه هكذا: [ID:123] بعد اسم العقار مباشرة لكي يتمكن المستخدم من فتحه.
4. قدّم 2-3 عقارات كحد أقصى في كل توصية.
5. إذا لم تجد عقاراً مناسباً، اعتذر وانصح بتوسيع نطاق البحث.

المناطق المتاحة: سيدي جابر، سموحة، المنتزه، العجمي، ستانلي، المندرة، كليوباترا، محطة الرمل، الأنفوشي، الدخيلة.
أنواع العقارات: شقة، فيلا، مكتب، شاليه، أرض، محل تجاري، دوبلكس، بنتهاوس.`;

router.post('/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { messages, conversationId, sessionId } = req.body;

    // Get real property data for context
    const propertiesRes = await query(`
      SELECT id, title_ar, title, type, purpose, price, area, bedrooms, district
      FROM properties WHERE status='approved' ORDER BY is_featured DESC LIMIT 30
    `);
    
    const purposeMap: Record<string,string> = { sale: 'بيع', rent: 'إيجار' };
    const propertyContext = propertiesRes.rows.map(p =>
      `ID:${p.id} | ${p.title_ar || p.title} | ${p.type} | ${purposeMap[p.purpose] || p.purpose} | ${Number(p.price).toLocaleString()} جنيه | ${p.bedrooms || 0} غرف | ${p.area}م² | ${p.district}`
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
