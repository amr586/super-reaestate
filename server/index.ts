import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import propertiesRouter from './routes/properties.js';
import adminRouter from './routes/admin.js';
import aiChatRouter from './routes/ai-chat.js';
import supportRouter from './routes/support.js';
import paymentsRouter from './routes/payments.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiChatRouter);
app.use('/api/support', supportRouter);
app.use('/api/payments', paymentsRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'إسكنك API' }));

app.listen(PORT, 'localhost', () => {
  console.log(`🏠 إسكنك API running on port ${PORT}`);
});
