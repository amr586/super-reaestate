import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Building2, MapPin, Phone, Mail, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white" dir="rtl">
      <div className="w-full overflow-hidden leading-none -mb-1">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60V30C180 0 360 60 540 30C720 0 900 60 1080 30C1260 0 1380 40 1440 30V60H0Z" fill="#0A0A0A"/></svg>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <div className="text-white font-black text-xl">إسكنك</div>
                <div className="text-purple-400 text-xs">العقارية</div>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              وجهتك الأولى للعقارات في الإسكندرية. نقدم أفضل العقارات السكنية والتجارية بخدمة احترافية وموثوقة.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { color: 'bg-[#1877F2]', icon: <Facebook size={16} />, href: 'https://web.facebook.com/amr.ahmed.422543/' },
                { color: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743]', icon: <Instagram size={16} />, href: 'https://www.instagram.com/amr_3hmed9/' },
                { color: 'bg-[#0A66C2]', icon: <Linkedin size={16} />, href: '#' },
                { color: 'bg-[#25D366]', icon: <MessageCircle size={16} />, href: 'https://wa.me/201281378331' },
              ].map((s, i) => (
                <motion.a key={i} whileHover={{ scale: 1.1, y: -2 }} href={s.href} target="_blank" rel="noopener noreferrer"
                  className={`w-9 h-9 ${s.color} rounded-lg flex items-center justify-center`}>{s.icon}</motion.a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'الرئيسية' },
                { to: '/properties', label: 'جميع العقارات' },
                { to: '/properties?purpose=sale', label: 'عقارات للبيع' },
                { to: '/properties?purpose=rent', label: 'عقارات للإيجار' },
                { to: '/add-property', label: 'أضف عقارك' },
                { to: '/contact', label: 'تواصل معنا' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-1">
                    <span className="text-[#7C3AED] text-xs">›</span>{l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">أنواع العقارات</h3>
            <ul className="space-y-2">
              {['شقة', 'فيلا', 'مكتب', 'شاليه', 'محل تجاري', 'أرض'].map(t => (
                <li key={t}>
                  <Link to={`/properties?type=${t}`} className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-1">
                    <span className="text-[#7C3AED] text-xs">›</span>{t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">معلومات التواصل</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={14} className="text-[#A855F7]" />
                </div>
                <div>
                  <div className="text-white text-sm">الإسكندرية، مصر</div>
                  <div className="text-gray-500 text-xs">Alexandria, Egypt</div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-[#A855F7]" />
                </div>
                <a href="tel:+201281378331" className="text-gray-400 hover:text-white transition-colors text-sm" dir="ltr">+20 128 137 8331</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-[#A855F7]" />
                </div>
                <a href="mailto:amrw4634@gmail.com" className="text-gray-400 hover:text-white transition-colors text-sm break-all">amrw4634@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} إسكنك العقارية — جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-xs">سياسة الخصوصية</span>
            <span className="text-gray-600 text-xs">الشروط والأحكام</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
