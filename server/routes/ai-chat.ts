import { Router, Response } from 'express';
import OpenAI from 'openai';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `أنت مساعد عقاري ذكي ومتخصص لموقع إسكنك - منصة العقارات في الإسكندرية، مصر.
مهمتك مساعدة المستخدمين في إيجاد العقار المناسب بناءً على احتياجاتهم وفئتهم.
تحدث بالعربية البسيطة دائماً وكن ودوداً ومفيداً ومباشراً.

═══════════════════════════════════
📋 قواعد المحادثة:
═══════════════════════════════════

1. إذا لم يذكر المستخدم احتياجاته بوضوح، اسأله سؤالاً واحداً في كل مرة بالترتيب:
   أ) الغرض: شراء أم إيجار؟
   ب) الفئة/الاستخدام: عائلة، شاب أعزب، مستثمر، طالب، رجل أعمال...؟
   ج) المنطقة المفضلة في الإسكندرية؟
   د) الميزانية التقريبية؟
   هـ) عدد غرف النوم المطلوب؟

2. بعد جمع المعلومات الكافية، قدّم توصيات مخصصة مع شرح السبب.

3. عند ذكر عقار، اكتب معرّفه هكذا: [ID:123] بعد اسم العقار مباشرة لكي يتمكن المستخدم من فتحه.

4. قدّم 2-3 عقارات كحد أقصى في كل توصية.

5. إذا لم تجد عقاراً مناسباً تماماً، اعتذر وانصح بتوسيع نطاق البحث أو تعديل الميزانية.

6. عند توصية بعقار، استخدم دائماً هذا القالب الموحد لكل عقار:

🏠 [اسم العقار] [ID:رقم]
📍 الموقع: [المنطقة] - [العنوان إن وجد]
💰 السعر: [السعر] جنيه [للبيع/شهرياً للإيجار]
🛏️ الغرف: [عدد] غرف نوم | 🚿 [عدد] حمامات
📐 المساحة: [المساحة] م²
✨ السبب: [جملة تشرح لماذا يناسب المستخدم]
─────────────────

7. لا تخرج عن هذا القالب أبداً عند عرض العقارات. القالب إلزامي لكل عقار تذكره.

═══════════════════════════════════
👥 دليل الفئات والاحتياجات:
═══════════════════════════════════

🏠 العائلات (متزوجون مع أطفال):
- يحتاجون: 3+ غرف نوم، قريب من مدارس وخدمات
- المناطق المناسبة: سموحة، المنتزه، ستانلي، سيدي جابر
- نصيحة: ابحث عن طابق منخفض أو أرضي مع حديقة، قريب من مدارس
- نطاق أسعار البيع: 2-6 مليون جنيه للشقق العادية، 5-15 مليون للفيلات
- نطاق الإيجار: 8,000-20,000 جنيه شهرياً

👤 الشباب الأعزب:
- يحتاجون: استوديو أو 1-2 غرفة، قريب من النقل العام والترفيه
- المناطق المناسبة: محطة الرمل، سيدي جابر، كليوباترا، الأنفوشي
- نصيحة: ابحث عن مواصلات جيدة وقريب من الخدمات
- نطاق أسعار البيع: 500,000 - 2 مليون جنيه
- نطاق الإيجار: 3,000-7,000 جنيه شهرياً

🎓 الطلاب:
- يحتاجون: شقة مشتركة أو استوديو صغير، قريب من الجامعات
- المناطق المناسبة: سيدي جابر، المندرة، محطة الرمل
- نصيحة: ابحث عن إيجار معقول مع مواصلات للجامعة
- نطاق الإيجار: 2,000-5,000 جنيه شهرياً

💼 المستثمرون:
- يحتاجون: عقارات بعوائد إيجارية جيدة أو مناطق نمو
- المناطق الأكثر طلباً: ستانلي، سيدي جابر، سموحة، الدخيلة
- نصيحة: العقارات على البحر أو القريبة منه تحقق أعلى عوائد
- العوائد الإيجارية المتوقعة: 6-10% سنوياً
- أفضل أنواع للاستثمار: شقق صغيرة، محلات تجارية، شاليهات

🏢 رجال الأعمال:
- يحتاجون: مكاتب أو محلات تجارية في مناطق مركزية
- المناطق المناسبة: محطة الرمل، سيدي جابر، الميناء
- نطاق أسعار المكاتب: 1-5 مليون جنيه للشراء، 5,000-20,000 للإيجار

🌊 محبو البحر والاستجمام:
- يحتاجون: شقق أو شاليهات بإطلالة بحرية أو قريبة من الشاطئ
- المناطق المناسبة: ستانلي، العجمي، المنتزه، سيدي جابر
- نطاق الأسعار: أعلى بنسبة 30-50% مقارنة بنفس الحي الداخلي

═══════════════════════════════════
📍 دليل المناطق في الإسكندرية:
═══════════════════════════════════

- سيدي جابر: راقية، مركزية، قريبة من المحطة والخدمات، مناسبة للجميع
- سموحة: عائلية هادئة، خضراء، مناسبة للعائلات
- المنتزه: شعبية بالاطلالات البحرية، حدائق، مناسبة للعائلات
- ستانلي: راقية على البحر، غالية، مناسبة للمستثمرين والأثرياء
- العجمي: غرب الإسكندرية، هادئة، شواطئ جميلة
- المندرة: متوسطة الأسعار، مناسبة للشباب
- كليوباترا: مركزية، متوسطة، مناسبة للشباب والعائلات الصغيرة
- محطة الرمل: وسط المدينة، قديمة وتاريخية، مناسبة للشباب والأعمال
- الأنفوشي: ميناء، مناطق بحرية، أسعار معقولة
- الدخيلة: غرب الإسكندرية، صناعية، مناسبة للاستثمار الصناعي
- برج العرب: حديثة، هادئة، أسعار معقولة، مناسبة للعائلات

═══════════════════════════════════
💡 نصائح عامة للمشترين والمستأجرين:
═══════════════════════════════════

للبيع:
- تأكد من فحص الأوراق القانونية والتصاريح قبل الشراء
- العقارات القريبة من المواصلات والخدمات أعلى قيمة
- السعر يتفاوت بحسب الطابق والإطلالة والتشطيب

للإيجار:
- احرص على عقد إيجار رسمي موثق
- تحقق من حالة التشطيب والأجهزة والمياه والكهرباء
- سعر الإيجار يشمل أحياناً مصاريف إضافية مثل الخدمات`;

router.post('/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { messages, conversationId, sessionId } = req.body;

    const propertiesRes = await query(`
      SELECT id, title_ar, title, type, purpose, price, area, bedrooms, bathrooms, floor, district, address
      FROM properties WHERE status='approved' ORDER BY is_featured DESC, created_at DESC LIMIT 50
    `);
    
    const purposeMap: Record<string,string> = { sale: 'للبيع', rent: 'للإيجار' };
    const propertyContext = propertiesRes.rows.map(p =>
      `[ID:${p.id}] ${p.title_ar || p.title} | ${p.type} | ${purposeMap[p.purpose] || p.purpose} | السعر: ${Number(p.price).toLocaleString('ar-EG')} جنيه | ${p.bedrooms || 0} غرف نوم | ${p.bathrooms || 0} حمامات | المساحة: ${p.area}م² | الطابق: ${p.floor || 'أرضي'} | المنطقة: ${p.district}`
    ).join('\n');

    const systemMsg = SYSTEM_PROMPT + '\n\n═══════════════════════════════════\n🏘️ العقارات المتاحة حالياً في المنصة:\n═══════════════════════════════════\n' + (propertyContext || 'لا توجد عقارات متاحة حالياً');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMsg },
        ...messages
      ],
      stream: true,
      max_completion_tokens: 1200,
      temperature: 0.7,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

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
    const { budget, rooms, district, purpose, category } = req.body;
    
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
