import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Building2, MapPin, DollarSign, Home, CheckCircle, Info } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const TYPES = ['شقة', 'فيلا', 'مكتب', 'شاليه', 'محل تجاري', 'أرض', 'دوبلكس', 'بنتهاوس'];
const DISTRICTS = ['سيدي جابر', 'سموحة', 'المنتزه', 'العجمي', 'ستانلي', 'المندرة', 'كليوباترا', 'محطة الرمل', 'الأنفوشي', 'الميناء', 'الدخيلة', 'برج العرب'];

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', title_ar: '', description: '', description_ar: '',
    type: 'شقة', purpose: 'sale', price: '', area: '',
    rooms: '', bathrooms: '', floor: '', district: 'سيدي جابر',
    city: 'الإسكندرية', address: '',
    images: ['', '', ''],
  });

  const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const updateImage = (i: number, v: string) => {
    const imgs = [...form.images];
    imgs[i] = v;
    setForm(p => ({ ...p, images: imgs }));
  };

  const handleSubmit = async () => {
    if (!user) return navigate('/login');
    setError('');
    setLoading(true);
    try {
      const images = form.images.filter(Boolean);
      await api.addProperty({
        ...form,
        price: Number(form.price),
        area: Number(form.area),
        rooms: Number(form.rooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        floor: Number(form.floor) || 0,
        images,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'خطأ في إضافة العقار');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4" dir="rtl">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">تم الإرسال بنجاح!</h2>
        <p className="text-gray-500 mb-6">سيتم مراجعة عقارك من قِبَل فريقنا وإضافته خلال 24 ساعة.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/properties')} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">تصفح العقارات</button>
          <button onClick={() => { setSuccess(false); setStep(1); setForm({ title: '', title_ar: '', description: '', description_ar: '', type: 'شقة', purpose: 'sale', price: '', area: '', rooms: '', bathrooms: '', floor: '', district: 'سيدي جابر', city: 'الإسكندرية', address: '', images: ['', '', ''] }); }}
            className="flex-1 bg-[#7C3AED] text-white py-2.5 rounded-xl text-sm font-bold"
          >إضافة عقار آخر</button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir="rtl">
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white font-black text-3xl mb-2">أضف عقارك</motion.h1>
          <p className="text-purple-200">سيتم مراجعة إعلانك وإضافته بعد الموافقة</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[{ n: 1, l: 'المعلومات الأساسية', icon: <Building2 size={16} /> }, { n: 2, l: 'التفاصيل والسعر', icon: <DollarSign size={16} /> }, { n: 3, l: 'الصور والموقع', icon: <MapPin size={16} /> }].map((s) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${step === s.n ? 'bg-[#7C3AED] text-white shadow-md' : step > s.n ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                {s.icon}<span className="hidden sm:inline">{s.l}</span><span className="sm:hidden">{s.n}</span>
              </div>
              {s.n < 3 && <div className={`w-8 h-0.5 ${step > s.n ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
              <Info size={16} />{error}
            </div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-6">المعلومات الأساسية</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم العقار (بالعربية)</label>
                <input value={form.title_ar} onChange={e => update('title_ar', e.target.value)} required placeholder="مثال: شقة فاخرة في سيدي جابر"
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">اسم العقار (بالإنجليزية)</label>
                <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Luxury apartment in Sidi Gaber"
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED] transition-all" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">نوع العقار</label>
                  <select value={form.type} onChange={e => update('type', e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED]"
                  >
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الغرض</label>
                  <select value={form.purpose} onChange={e => update('purpose', e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED]"
                  >
                    <option value="sale">للبيع</option>
                    <option value="rent">للإيجار</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الوصف (بالعربية)</label>
                <textarea value={form.description_ar} onChange={e => update('description_ar', e.target.value)} rows={4} placeholder="وصف تفصيلي للعقار..."
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C3AED] resize-none" />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-6">التفاصيل والسعر</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">السعر (جنيه)</label>
                  <input type="number" value={form.price} onChange={e => update('price', e.target.value)} required placeholder="0"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED]" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">المساحة (م²)</label>
                  <input type="number" value={form.area} onChange={e => update('area', e.target.value)} required placeholder="0"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED]" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">غرف النوم</label>
                  <input type="number" value={form.rooms} onChange={e => update('rooms', e.target.value)} placeholder="0"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED]" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الحمامات</label>
                  <input type="number" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} placeholder="0"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED]" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">الطابق</label>
                  <input type="number" value={form.floor} onChange={e => update('floor', e.target.value)} placeholder="0"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED]" dir="ltr" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-6">الصور والموقع</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">الحي/المنطقة</label>
                <select value={form.district} onChange={e => update('district', e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED]"
                >
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">العنوان التفصيلي</label>
                <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="رقم الشارع، اسم الشارع..."
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">روابط الصور (URL)</label>
                <p className="text-xs text-gray-400 mb-3">أضف روابط صور العقار من Unsplash أو أي مصدر آخر</p>
                {form.images.map((img, i) => (
                  <div key={i} className="mb-2">
                    <input value={img} onChange={e => updateImage(i, e.target.value)}
                      placeholder={`رابط الصورة ${i + 1}...`}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED]"
                      dir="ltr"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                السابق
              </button>
            )}
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} disabled={step === 1 && !form.title_ar}
                className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-purple-300 disabled:opacity-50 transition-all"
              >
                التالي
              </button>
            ) : (
              <motion.button onClick={handleSubmit} disabled={loading || !form.price || !form.area}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-purple-300 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الإرسال...
                  </span>
                ) : 'إرسال للمراجعة'}
              </motion.button>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-2xl flex items-start gap-3">
          <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-blue-700 text-sm">سيتم مراجعة إعلانك من قِبَل فريق إسكنك خلال 24 ساعة. ستتلقى إشعاراً عند الموافقة على النشر.</p>
        </div>
      </div>
    </div>
  );
}
