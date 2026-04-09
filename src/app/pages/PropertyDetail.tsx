import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Bed, Bath, Maximize, MapPin, Phone, MessageCircle, Heart,
  ArrowRight, Share2, Calendar, Building2, CheckCircle, Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice, getStatusLabel, getTypeLabel } from '../data/mockData';

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { properties, currentUser, savedProperties, toggleSaveProperty, addRequest } = useApp();
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

  const relatedProperties = properties
    .filter(p => p.id !== property.id && p.type === property.type)
    .slice(0, 3);

  const statusColors: Record<string, string> = {
    'for-sale': 'bg-[#7C3AED] text-white',
    'for-rent': 'bg-[#0A0A0A] text-white',
    'sold': 'bg-gray-500 text-white',
    'rented': 'bg-gray-500 text-white',
  };

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
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusColors[property.status]}`}>
                    {getStatusLabel(property.status)}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-white/90 text-[#7C3AED]">
                    {getTypeLabel(property.type)}
                  </span>
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

                {/* Price */}
                <div className="absolute bottom-4 right-4">
                  <span className="bg-white/95 text-[#7C3AED] font-black px-4 py-2 rounded-xl shadow text-lg">
                    {formatPrice(property.price, property.status)}
                  </span>
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

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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
              transition={{ delay: 0.2 }}
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
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
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
                    />
                    <textarea
                      value={inquiryMsg}
                      onChange={e => setInquiryMsg(e.target.value)}
                      placeholder="رسالتك..."
                      rows={3}
                      className="w-full bg-purple-50 rounded-xl px-3 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED] resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInquiry('buy')}
                        className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1 shadow-md hover:shadow-purple-300 transition-shadow"
                      >
                        <Send size={14} />
                        أريد الشراء
                      </button>
                      <button
                        onClick={() => handleInquiry('inquiry')}
                        className="flex-1 bg-[#0A0A0A] text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                      >
                        استعلام
                      </button>
                    </div>
                  </div>

                  {/* Direct Contact */}
                  <div className="border-t border-purple-50 mt-4 pt-4 space-y-2">
                    <a
                      href="tel:+201281378331"
                      className="flex items-center gap-2 bg-green-50 hover:bg-green-100 rounded-xl px-3 py-2.5 transition-colors"
                    >
                      <Phone size={16} className="text-green-600" />
                      <span className="text-sm text-green-700 font-medium" dir="ltr">+20 128 137 8331</span>
                    </a>
                    <a
                      href={`https://wa.me/201281378331?text=مهتم بـ ${property.titleAr}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl px-3 py-2.5 transition-colors"
                    >
                      <MessageCircle size={16} className="text-[#25D366]" />
                      <span className="text-sm text-green-700 font-medium">تواصل عبر واتساب</span>
                    </a>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Related */}
        {relatedProperties.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-black text-[#0A0A0A] mb-6">عقارات مشابهة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProperties.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/properties/${p.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-purple-100 hover:shadow-lg hover:shadow-purple-100 transition-all group"
                >
                  <div className="h-40 overflow-hidden">
                    <img src={p.image} alt={p.titleAr} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-sm text-[#0A0A0A] mb-1">{p.titleAr}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7C3AED] font-black text-sm">{formatPrice(p.price, p.status)}</span>
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <MapPin size={11} />
                        <span>{p.location}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
