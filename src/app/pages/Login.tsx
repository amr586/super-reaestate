import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.emailOrPhone, form.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center px-4 pt-20" dir="rtl">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-blob-delay" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-purple-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] px-8 pt-10 pb-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Building2 size={32} className="text-white" />
            </motion.div>
            <h1 className="text-white font-black text-2xl">إسكنك</h1>
            <p className="text-purple-200 text-sm mt-1">تسجيل الدخول إلى حسابك</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm"
              >
                <AlertCircle size={16} />{error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">البريد الإلكتروني أو رقم الهاتف</label>
                <div className="relative">
                  <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.emailOrPhone}
                    onChange={e => setForm(p => ({ ...p, emailOrPhone: e.target.value }))}
                    required
                    placeholder="أدخل البريد أو رقم الهاتف"
                    className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-4 py-3 text-sm outline-none focus:border-[#7C3AED] focus:shadow-[0_0_0_4px_rgba(124,58,237,0.1)] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    placeholder="كلمة المرور"
                    className="w-full border-2 border-gray-100 rounded-xl pr-10 pl-10 py-3 text-sm outline-none focus:border-[#7C3AED] focus:shadow-[0_0_0_4px_rgba(124,58,237,0.1)] transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الدخول...
                  </span>
                ) : 'تسجيل الدخول'}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                ليس لديك حساب؟{' '}
                <Link to="/register" className="text-[#7C3AED] font-semibold hover:text-purple-800 transition-colors">إنشاء حساب جديد</Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-purple-50 rounded-xl text-xs text-gray-500 space-y-0.5">
              <p className="font-semibold text-purple-700 mb-1">حسابات تجريبية (كلمة المرور: Admin@2024):</p>
              <p>🔵 سوبر أدمن: superadmin@iskantek.com</p>
              <p>🟢 داتا إنتري: dataentry@iskantek.com</p>
              <p>🟡 مدير عقارات: propmanager@iskantek.com</p>
              <p>🟠 تحليلات: analytics@iskantek.com</p>
              <p>🔴 دعم فني: support@iskantek.com</p>
              <p>⚪ مستخدم: user@example.com (User@2024)</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
