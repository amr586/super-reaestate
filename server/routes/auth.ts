import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'iskantek_secret_2024';

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    const existing = await query('SELECT id FROM users WHERE email=$1 OR phone=$2', [email, phone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'البريد الإلكتروني أو رقم الهاتف مسجل مسبقاً' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, phone, role, sub_role, avatar_url, created_at',
      [name, email, phone, hash, 'user']
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, sub_role: user.sub_role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err: any) {
    res.status(500).json({ error: 'خطأ في التسجيل' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    const result = await query(
      'SELECT * FROM users WHERE (email=$1 OR phone=$1) AND is_active=true',
      [emailOrPhone]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'بيانات خاطئة' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'بيانات خاطئة' });
    const token = jwt.sign({ id: user.id, role: user.role, sub_role: user.sub_role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, name, email, phone, role, sub_role, avatar_url, created_at FROM users WHERE id=$1',
      [req.user!.id]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'خطأ' });
  }
});

export default router;
