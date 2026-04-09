import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Bed, Bath, Maximize, MapPin, Phone, MessageCircle, Heart,
  ArrowRight, Share2, Calendar, Building2, CheckCircle, Send, DollarSign,
  TrendingUp, Star, Tag, User, CreditCard, Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice, getStatusLabel, getTypeLabel } from '../data/mockData';
import { PropertyCard } from '../components/PropertyCard';

export function PropertyDetailEnhanced() {
  const { id } = useParams<{ id: string }>();
  const { properties, currentUser, savedProperties, toggleSaveProperty, addRequest, users, getSimilarPropertiesFor } = useApp();
  const navigate = useNavigate();
  const property = properties.find(p => p.id === id);

  const [activeImage, setActiveImage] = useState(0);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryName, setInquiryName] = useState(currentUser?.name || '');
  const [inquiryPhone, setInquiryPhone] = useState(currentUser?.phone || '');
  const [inquiryEmail, setInquiryEmail] = useState(currentUser?.email || '');
  const [submitted, setSubmitted] = useState(false);

  if (!property) {
    return (
      <div className="min-h-screen bg-[#F9F5FF] flex items-center justify-center pt-20" dir="rtl">
        <div className="text-center">
          <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0A0A0A] mb-2">العقار غير موجود</h2>
          <Link to="/properties" className="text-[#7C3AED] text-sm">العودة للعقارات</Link>
        </div>
      </div>
    );
  }

  const isSaved = savedProperties.includes(property.id);
  const adminUser = users.find(u => u.id === property.adminId);
  const similarProperties = getSimilarPropertiesFor(property.id);

  const handleInquiry = (type: 'buy' | 'inquiry') => {
    if (!inquiryName || !inquiryPhone) return;
    addRequest({
      type,
      userId: currentUser?.id || 'guest',
      userName: inquiryName,
      userEmail: inquiryEmail,
      userPhone: inquiryPhone,
      propertyId: property.id,
      propertyTitle: property.titleAr,
      message: inquiryMsg || `مهتم بـ ${property.titleAr}`,
      status: 'pending',
    });
    setSubmitted(true);
  };

  const statusColors: Record<string, string> = {
    'for-sale': 'bg-[#7C3AED] text-white',
    'for-rent': 'bg-[#0A0A0A] text-white',
    'sold': 'bg-gray-500 text-white',
    'rented': 'bg-gray-500 text-white',
  };

  const cashPayment = property.paymentOptions?.find(p => p.type === 'cash');
  const installmentPayment = property.paymentOptions?.find(p => p.type === 'installment');

  return (
    <div className="min-h-screen bg-[#F9F5FF] pt-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#7C3AED] transition-colors">الرئيسية</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-[#7C3AED] transition-colors">العقارات</Link>
          <span>/</span>
          <span className="text-[#0A0A0A] font-medium">{property.titleAr}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-purple-100"
            >
              <div className="relative h-72 sm:h-96">
                <img
                  src={property.images[activeImage] || property.image}
                  alt={property.titleAr}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusColors[property.status]}`}>
                    {getStatusLabel(property.status)}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-white/90 text-[#7C3AED]">
                    {getTypeLabel(property.type)}
                  </span>
                  {property.featured && (
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white flex items-center gap-1">
                      <Star size={12} fill="currentColor" />
                      مميز
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <button
                    onClick={() => toggleSaveProperty(property.id)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isSaved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                    }}
                    className="w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center text-gray-600 hover:text-[#7C3AED] transition-colors"
                  >
                    <Share2 size={16} />
                  </button>
                </div>

                {/* Price & Code */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <span className="bg-white/95 text-[#7C3AED] font-black px-4 py-2 rounded-xl shadow text-lg">
                    {formatPrice(property.price, property.status)}
                  </span>
                  {property.adCode && (
                    <span className="bg-white/95 text-gray-600 text-xs px-3 py-1 rounded-lg font-mono">
                      {property.adCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {property.images.length > 1 && (
                <div className="flex gap-2 p-3">
                  {property.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === i ? 'border-[#7C3AED]' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Payment Options */}
            {property.paymentOptions && property.paymentOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100"
              >
                <h3 className="font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-[#7C3AED]" />
                  خيارات الدفع المتاحة
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cashPayment && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <DollarSign size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0A0A0A] text-sm">الدفع نقدي</div>
                          <div className="text-xs text-gray-500">دفع كامل المبلغ</div>
                        </div>
                      </div>
                      <div className="text-2xl font-black text-green-600 mt-2">
                        {formatPrice(property.price, property.status)}
                      </div>
                    </div>
                  )}
                  {installmentPayment && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Calendar size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0A0A0A] text-sm">الدفع بالتقسيط</div>
                          <div className="text-xs text-gray-500">
                            {installmentPayment.installmentMonths} شهر
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">المقدم:</span>
                          <span className="font-bold text-blue-600">
                            {(installmentPayment.downPayment || 0).toLocaleString('ar-EG')} جنيه
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">القسط الشهري:</span>
                          <span className="font-bold text-blue-600">
                            {(installmentPayment.monthlyPayment || 0).toLocaleString('ar-EG')} جنيه/شهر
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Price Trend */}
            {property.priceHistory && property.priceHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100"
              >
                <h3 className="font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#7C3AED]" />
                  اتجاه السعر
                </h3>
                <div className="space-y-3">
                  {property.priceHistory.map((history, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{history.date}</span>
                      <span className="text-sm font-bold text-[#7C3AED]">
                        {(history.price / 1000000).toFixed(1)} مليون جنيه
                      </span>
                    </div>
                  ))}
                </div>
                {property.priceHistory.length >= 2 && (
                  <div className="mt-4 pt-4 border-t border-purple-100">
                    <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                      <span className="text-sm text-gray-600">نمو السعر</span>
                      <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                        <TrendingUp size={14} />
                        {(((property.priceHistory[property.priceHistory.length - 1].price / property.priceHistory[0].price) - 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100"
            >
              <h1 className="text-2xl font-black text-[#0A0A0A] mb-2">{property.titleAr}</h1>
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                <MapPin size={14} className="text-[#7C3AED]" />
                <span>{property.address}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: <Maximize size={18} />, label: 'المساحة', value: `${property.area} م²` },
                  ...(property.bedrooms > 0 ? [{ icon: <Bed size={18} />, label: 'غرف النوم', value: `${property.bedrooms} غرف` }] : []),
                  { icon: <Bath size={18} />, label: 'الحمامات', value: `${property.bathrooms} حمام` },
                  ...(property.floor ? [{ icon: <Building2 size={18} />, label: 'الطابق', value: `الطابق ${property.floor}` }] : []),
                ].map((stat, i) => (
                  <div key={i} className="bg-purple-50 rounded-xl p-3 text-center">
                    <div className="text-[#7C3AED] flex justify-center mb-1">{stat.icon}</div>
                    <div className="font-bold text-[#0A0A0A] text-sm">{stat.value}</div>
                    <div className="text-gray-500 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-[#0A0A0A] mb-2">عن هذا العقار</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{property.descriptionAr}</p>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar size={12} />
                <span>أُضيف في {property.createdAt}</span>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100"
            >
              <h3 className="font-bold text-[#0A0A0A] mb-4">المميزات والخدمات</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'تشطيب سوبر لوكس', 'أمن وحراسة ٢٤ ساعة', 'مواقف سيارات',
                  'مصعد كهربائي', 'شبكة انترنت فائق السرعة', 'تكييف مركزي',
                  'كاميرات مراقبة', 'مدخل مستقل', 'تجهيزات كاملة'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-[#7C3AED] flex-shrink-0" />
                    <span className="text-gray-600 text-xs">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100"
              >
                <h3 className="font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-[#7C3AED]" />
                  عقارات مشابهة قد تناسبك
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarProperties.map(prop => (
                    <PropertyCard key={prop.id} property={prop} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Agent Info */}
            {adminUser && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-2xl p-5 text-white shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center font-bold text-lg">
                    {adminUser.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">وكيل العقار</div>
                    <div className="text-white/90 text-sm">{adminUser.name}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href={`tel:${adminUser.phone}`}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-lg px-3 py-2 hover:bg-white/30 transition-colors"
                  >
                    <Phone size={16} />
                    <span className="text-sm" dir="ltr">{adminUser.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${adminUser.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-lg px-3 py-2 hover:bg-white/30 transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span className="text-sm">تواصل عبر واتساب</span>
                  </a>
                </div>
              </motion.div>
            )}

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 sticky top-24"
            >
              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={28} className="text-green-500" />
                  </div>
                  <h3 className="font-bold text-[#0A0A0A] mb-1">تم إرسال طلبك!</h3>
                  <p className="text-gray-500 text-sm mb-4">سيتواصل معك فريقنا في أقرب وقت</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-[#7C3AED] text-sm font-medium"
                  >
                    إرسال طلب آخر
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-[#0A0A0A] mb-4">تواصل بشأن هذا العقار</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={inquiryName}
                      onChange={e => setInquiryName(e.target.value)}
                      placeholder="اسمك الكامل *"
                      className="w-full bg-purple-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                    />
                    <input
                      type="tel"
                      value={inquiryPhone}
                      onChange={e => setInquiryPhone(e.target.value)}
                      placeholder="رقم الهاتف *"
                      className="w-full bg-purple-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                      dir="ltr"
                    />
                    <input
                      type="email"
                      value={inquiryEmail}
                      onChange={e => setInquiryEmail(e.target.value)}
                      placeholder="البريد الإلكتروني"
                      className="w-full bg-purple-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                      dir="ltr"
                    />
                    <textarea
                      value={inquiryMsg}
                      onChange={e => setInquiryMsg(e.target.value)}
                      rows={3}
                      placeholder="رسالتك..."
                      className="w-full bg-purple-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-purple-100 resize-none focus:border-[#7C3AED]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleInquiry('inquiry')}
                        className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-purple-300 transition-all"
                      >
                        <Send size={14} />
                        استعلام
                      </button>
                      <button
                        onClick={() => handleInquiry('buy')}
                        className="flex items-center justify-center gap-1.5 bg-[#0A0A0A] text-white py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-[#1A1A2E] transition-all"
                      >
                        <CheckCircle size={14} />
                        {property.status === 'for-rent' ? 'استأجر' : 'اشترِ'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
