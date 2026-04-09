import { Router, Response } from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin, requireSuperAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const [props, users, pending, sold, revenue] = await Promise.all([
      query("SELECT COUNT(*) FROM properties WHERE status='approved'"),
      query("SELECT COUNT(*) FROM users WHERE role='user'"),
      query("SELECT COUNT(*) FROM properties WHERE status='pending'"),
      query("SELECT COUNT(*) FROM properties WHERE status='sold'"),
      query("SELECT COALESCE(SUM(amount),0) as total FROM payment_requests WHERE status='completed'"),
    ]);
    res.json({
      totalProperties: parseInt(props.rows[0].count),
      totalUsers: parseInt(users.rows[0].count),
      pendingProperties: parseInt(pending.rows[0].count),
      soldProperties: parseInt(sold.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
    });
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.get('/properties', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT p.*,
        u.name as owner_name, u.email as owner_email, u.phone as owner_phone, u.created_at as owner_joined,
        (SELECT pi.url FROM property_images pi WHERE pi.property_id = p.id AND pi.is_primary=true LIMIT 1) as primary_image,
        (SELECT json_agg(pi.url) FROM property_images pi WHERE pi.property_id = p.id) as images
      FROM properties p LEFT JOIN users u ON u.id = p.owner_id ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.get('/properties/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT p.*,
        u.name as owner_name, u.email as owner_email, u.phone as owner_phone, u.created_at as owner_joined,
        u.id as owner_user_id,
        (SELECT json_agg(pi.url ORDER BY pi.is_primary DESC) FROM property_images pi WHERE pi.property_id = p.id) as images
      FROM properties p LEFT JOIN users u ON u.id = p.owner_id WHERE p.id=$1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'العقار غير موجود' });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.patch('/properties/:id/approve', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const sub = req.user!.sub_role;
    if (sub && sub !== 'property_manager' && req.user!.role !== 'superadmin') {
      return res.status(403).json({ error: 'صلاحية مدير العقارات فقط' });
    }
    await query("UPDATE properties SET status='approved', approved_by=$1, approved_at=NOW() WHERE id=$2",
      [req.user!.id, req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.patch('/properties/:id/reject', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await query("UPDATE properties SET status='rejected' WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.patch('/properties/:id/sold', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { buyer_id } = req.body;
    await query(
      "UPDATE properties SET status='sold', sold_to=$1, sold_at=NOW(), owner_id=$2 WHERE id=$3",
      [buyer_id || null, req.user!.id, req.params.id]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.get('/users', authenticate, requireSuperAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT id, name, email, phone, role, sub_role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.patch('/users/:id/role', authenticate, requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { role, sub_role } = req.body;
    await query('UPDATE users SET role=$1, sub_role=$2 WHERE id=$3', [role, sub_role || null, req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.patch('/users/:id/toggle', authenticate, requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await query('UPDATE users SET is_active = NOT is_active WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.get('/analytics', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const [byType, byDistrict, byMonth, payments] = await Promise.all([
      query("SELECT type, COUNT(*) as count FROM properties WHERE status='approved' GROUP BY type"),
      query("SELECT district, COUNT(*) as count FROM properties WHERE status='approved' GROUP BY district ORDER BY count DESC LIMIT 8"),
      query(`SELECT TO_CHAR(created_at, 'Mon YYYY') as month, COUNT(*) as count, SUM(price) as total_value 
             FROM properties WHERE status='approved' AND created_at > NOW() - INTERVAL '6 months' 
             GROUP BY month ORDER BY MIN(created_at)`),
      query("SELECT payment_method, COUNT(*) as count, SUM(amount) as total FROM payment_requests WHERE status='completed' GROUP BY payment_method"),
    ]);
    res.json({ byType: byType.rows, byDistrict: byDistrict.rows, byMonth: byMonth.rows, payments: payments.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ' });
  }
});

router.get('/payments', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT pr.*, u.name as buyer_name, u.phone as buyer_phone, p.title as property_title
      FROM payment_requests pr
      JOIN users u ON u.id = pr.buyer_id
      JOIN properties p ON p.id = pr.property_id
      ORDER BY pr.created_at DESC
    `);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

router.patch('/payments/:id/approve', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await query("UPDATE payment_requests SET status='completed', processed_by=$1, processed_at=NOW() WHERE id=$2",
      [req.user!.id, req.params.id]);
    const pr = await query('SELECT property_id, buyer_id FROM payment_requests WHERE id=$1', [req.params.id]);
    const { property_id, buyer_id } = pr.rows[0];
    await query("UPDATE properties SET status='sold', sold_to=$1, sold_at=NOW(), owner_id=$2 WHERE id=$3",
      [buyer_id, req.user!.id, property_id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

export default router;
