import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Register() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('كلمتا المرور غير متطابقتين');
    if (form.password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    setLoading(true);
    try {
      await api.sendOTP({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      setSuccess(`تم إرسال رمز التحقق إلى ${form.email}`);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'خطأ في إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return setError('أدخل رمز التحقق المكون من 6 أرقام');
    setLoading(true);
    try {
      const data = await api.verifyOTP(form.email, otpCode);
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setOtp(['', '', '', '', '', '']);
    setLoading(true);
    try {
      await api.sendOTP({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      setSuccess('تم إعادة إرسال رمز التحقق');
    } catch (err: any) {
      setError(err.message || 'خطأ في إعادة الإرسال');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'الاسم الكامل', icon: <User size={16} />, type: 'text', placeholder: 'اسمك الكامل' },
    { name: 'email', label: 'البريد الإلكتروني', icon: <Mail size={16} />, type: 'email', placeholder: 'example@email.com' },
    { name: 'phone', label: 'رقم الهاتف', icon: <Phone size={16} />, type: 'tel', placeholder: '01xxxxxxxxx' },
    { name: 'password', label: 'كلمة المرور', icon: <Lock size={16} />, type: 'password', placeholder: '6 أحرف على الأقل' },
    { name: 'confirmPassword', label: 'تأكيد كلمة المرور', icon: <Lock size={16} />, type: 'password', placeholder: 'أعد إدخال كلمة المرور' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center px-4 py-20" dir="rtl">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 -right-16 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/3 -left-16 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-blob-delay" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-purple-200/50 overflow-hidden">
          <div className="bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] px-8 pt-8 pb-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Building2 size={28} className="text-white" />
            </div>
            <h1 className="text-white font-black text-2xl">
              {step === 'form' ? 'إنشاء حساب' : 'تأكيد البريد الإلكتروني'}
            </h1>
            <p className="text-purple-200 text-sm mt-1">
              {step === 'form' ? 'انضم إلى إسكنك العقارية' : `أدخل الرمز المرسل إلى ${form.email}`}
            </p>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className={`w-8 h-2 rounded-full transition-all ${step === 'form' ? 'bg-white' : 'bg-white/40'}`} />
              <div className={`w-8 h-2 rounded-full transition-all ${step === 'otp' ? 'bg-white' : 'bg-white/40'}`} />
            </div>
          </div>

          <div className="px-8 py-6">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm"
              >
                <AlertCircle size={16} />{error}
              </motion.div>
            )}
            {success && step === 'otp' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 mb-4 text-sm"
              >
                <CheckCircle size={16} />{success}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {step === 'form' ? (
                <motion.form key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSendOTP} className="space-y-3"
                >
                  {fields.map(field => (
                    <div key={field.name}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{field.label}</label>
                      <div className="relative">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{field.icon}</span>
                        {field.name === 'password' || field.name === 'confirmPassword' ? (
                          <>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={form[field.name]}
                              onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                              required
                              placeholder={field.placeholder}
                              className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-10 py-2.5 text-sm outline-none focus:border-[#7C3AED] transition-all"
                            />
                            {field.name === 'password' && (
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            )}
                          </>
                        ) : (
                          <input
                            type={field.type}
                            value={form[field.name]}
                            onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                            required
                            placeholder={field.placeholder}
                            dir={field.name === 'email' || field.name === 'phone' ? 'ltr' : 'rtl'}
                            className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:border-[#7C3AED] transition-all"
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all disabled:opacity-70 mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري الإرسال...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        التالي - إرسال رمز التحقق
                        <ArrowRight size={16} />
                      </span>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOTP}
                >
                  <p className="text-gray-600 text-sm text-center mb-6">
                    أدخل رمز التحقق المكون من 6 أرقام
                  </p>

                  <div className="flex gap-2 justify-center mb-6" dir="ltr">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-11 h-14 border-2 border-gray-200 rounded-xl text-center text-xl font-black text-[#7C3AED] outline-none focus:border-[#7C3AED] focus:bg-purple-50 transition-all"
                      />
                    ))}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all disabled:opacity-70 mb-3"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري التحقق...
                      </span>
                    ) : 'تأكيد وإنشاء الحساب'}
                  </motion.button>

                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => { setStep('form'); setError(''); setOtp(['', '', '', '', '', '']); }}
                      className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
                    >
                      ← تعديل البيانات
                    </button>
                    <button type="button" onClick={handleResend} disabled={loading}
                      className="text-[#7C3AED] text-sm font-medium hover:text-purple-800 transition-colors disabled:opacity-50"
                    >
                      إعادة الإرسال
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-5 text-center">
              <p className="text-gray-500 text-sm">
                لديك حساب بالفعل؟{' '}
                <Link to="/login" className="text-[#7C3AED] font-semibold hover:text-purple-800 transition-colors">تسجيل الدخول</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
