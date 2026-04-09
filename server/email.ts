import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: { user, pass },
  });
}

export async function sendOTPEmail(to: string, otp: string, name: string): Promise<boolean> {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!transporter || !from) {
    console.log(`[OTP DEV] Email: ${to} | OTP: ${otp}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"إسكنك العقارية" <${from}>`,
      to,
      subject: 'رمز التحقق - إسكنك',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f9f7ff; padding: 30px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #7C3AED; font-size: 28px; margin: 0;">🏠 إسكنك</h1>
            <p style="color: #6B7280; margin: 4px 0 0;">منصة العقارات في الإسكندرية</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(124,58,237,0.1);">
            <p style="color: #374151; font-size: 16px; margin: 0 0 16px;">مرحباً <strong>${name}</strong>،</p>
            <p style="color: #6B7280; margin: 0 0 24px;">رمز التحقق الخاص بك لإنشاء حسابك في إسكنك:</p>
            <div style="background: linear-gradient(135deg, #7C3AED, #9333EA); border-radius: 12px; padding: 20px; margin: 0 auto 24px; max-width: 200px;">
              <span style="color: white; font-size: 36px; font-weight: 900; letter-spacing: 8px;">${otp}</span>
            </div>
            <p style="color: #9CA3AF; font-size: 13px; margin: 0;">⏱️ صالح لمدة <strong>10 دقائق</strong> فقط</p>
            <p style="color: #9CA3AF; font-size: 12px; margin: 8px 0 0;">إذا لم تطلب هذا الرمز، تجاهل هذا البريد</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}
