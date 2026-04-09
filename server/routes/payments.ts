import { Router, Response } from 'express';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// InstaPay wallet: +201281378331 
// Vodafone Cash: +201281378331

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { property_id, amount, payment_method, notes } = req.body;
    
    const propRes = await query("SELECT * FROM properties WHERE id=$1 AND status='approved'", [property_id]);
    if (!propRes.rows[0]) return res.status(404).json({ error: 'العقار غير متاح' });
    
    const result = await query(
      "INSERT INTO payment_requests (property_id, buyer_id, amount, payment_method, notes, status) VALUES ($1,$2,$3,$4,$5,'pending') RETURNING *",
      [property_id, req.user!.id, amount, payment_method, notes]
    );
    res.status(201).json({
      payment: result.rows[0],
      walletInfo: {
        instapay: '+201281378331',
        vodafone: '+201281378331',
        message: `يرجى تحويل مبلغ ${amount.toLocaleString()} جنيه على ${payment_method === 'instapay' ? 'InstaPay' : 'فودافون كاش'}: +201281378331`
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في طلب الدفع' });
  }
});

router.get('/my-payments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT pr.*, p.title as property_title, p.primary_image
      FROM payment_requests pr
      LEFT JOIN (
        SELECT p2.*, (SELECT pi.url FROM property_images pi WHERE pi.property_id = p2.id AND pi.is_primary=true LIMIT 1) as primary_image
        FROM properties p2
      ) p ON p.id = pr.property_id
      WHERE pr.buyer_id = $1 ORDER BY pr.created_at DESC
    `, [req.user!.id]);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

export default router;
