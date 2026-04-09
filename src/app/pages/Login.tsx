import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Login() {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  useEffect(() => {
    if (currentUser) navigate('/');
  }, [currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const success = login(loginForm.email, loginForm.password);
    if (success) {
      const user = JSON.parse(localStorage.getItem('estate_user') || '{}');
      if (user.role === 'super-admin') {
        navigate('/super-admin');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setRegisterSuccess(true);
    setLoading(false);
  };

  const DEMO_CREDENTIALS = [
    { role: 'سوبر أدمن', email: 'admin@estate.com', password: 'admin123' },
    { role: 'أدمن', email: 'khaled@estate.com', password: 'admin123' },
    { role: 'مستخدم', email: 'user@example.com', password: 'user123' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F5FF] flex items-center justify-center px-4 py-20" dir="rtl">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-32 -right-32 w-80 h-80 bg-[#7C3AED]/10 rounded-full filter blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#9333EA]/10 rounded-full filter blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-purple-200">
            <Building2 size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-[#0A0A0A]">إسكنك العقارية</h1>
          <p className="text-gray-500 text-sm">الإسكندرية، مصر</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-purple-100 border border-purple-50 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-purple-50">
            {[
              { key: 'login', label: 'تسجيل الدخول' },
              { key: 'register', label: 'إنشاء حساب' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as 'login' | 'register'); setError(''); setRegisterSuccess(false); }}
                className={`flex-1 py-4 text-sm font-medium transition-all relative ${
                  activeTab === tab.key ? 'text-[#7C3AED]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                      <AlertCircle size={14} className="text-red-500" />
                      <span className="text-red-600 text-sm">{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        placeholder="example@email.com"
                        className="w-full bg-purple-50 rounded-xl pr-9 pl-3 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">كلمة المرور</label>
                    <div className="relative">
                      <Lock size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginForm.password}
                        onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        placeholder="••••••••"
                        className="w-full bg-purple-50 rounded-xl pr-9 pl-9 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7C3AED]"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-purple-300 transition-all disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري الدخول...
                      </span>
                    ) : 'تسجيل الدخول'}
                  </button>

                  {/* Demo Credentials */}
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                    <p className="text-xs font-medium text-[#7C3AED] mb-2">حسابات تجريبية:</p>
                    {DEMO_CREDENTIALS.map(cred => (
                      <button
                        key={cred.email}
                        type="button"
                        onClick={() => setLoginForm({ email: cred.email, password: cred.password })}
                        className="w-full text-right text-xs text-gray-600 hover:text-[#7C3AED] py-1 transition-colors"
                      >
                        <span className="font-medium">{cred.role}:</span> {cred.email} / {cred.password}
                      </button>
                    ))}
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleRegister}
                  className="space-y-3"
                >
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                      <AlertCircle size={14} className="text-red-500" />
                      <span className="text-red-600 text-sm">{error}</span>
                    </div>
                  )}
                  {registerSuccess && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
                      <CheckCircle size={14} className="text-green-500" />
                      <span className="text-green-700 text-sm">تم إنشاء حسابك! يمكنك تسجيل الدخول الآن.</span>
                    </div>
                  )}

                  {[
                    { name: 'name', placeholder: 'الاسم الكامل', icon: <User size={15} />, type: 'text' },
                    { name: 'email', placeholder: 'البريد الإلكتروني', icon: <Mail size={15} />, type: 'email' },
                    { name: 'phone', placeholder: '+20 1xxxxxxxxx', icon: <Phone size={15} />, type: 'tel' },
                    { name: 'password', placeholder: 'كلمة المرور', icon: <Lock size={15} />, type: 'password' },
                    { name: 'confirmPassword', placeholder: 'تأكيد كلمة المرور', icon: <Lock size={15} />, type: 'password' },
                  ].map(field => (
                    <div key={field.name} className="relative">
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{field.icon}</div>
                      <input
                        type={field.type}
                        value={registerForm[field.name as keyof typeof registerForm]}
                        onChange={e => setRegisterForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                        required
                        placeholder={field.placeholder}
                        dir={field.name === 'phone' || field.name === 'email' ? 'ltr' : 'rtl'}
                        className="w-full bg-purple-50 rounded-xl pr-9 pl-3 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED] transition-colors"
                      />
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-purple-300 transition-all disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري الإنشاء...
                      </span>
                    ) : 'إنشاء الحساب'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-4">
          بالتسجيل، أنت توافق على{' '}
          <Link to="/terms" className="text-[#7C3AED] hover:underline">شروط الاستخدام</Link>
          {' '}و{' '}
          <Link to="/privacy" className="text-[#7C3AED] hover:underline">سياسة الخصوصية</Link>
        </p>
      </motion.div>
    </div>
  );
}
