import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useInView, AnimatePresence } from 'motion/react';
import {
  Search, Building2, TrendingUp, Users, Star, ArrowLeft, MapPin,
  CheckCircle, Phone, MessageCircle, Facebook, Instagram, Linkedin,
  Shield, Award, Clock, ChevronRight
} from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { useApp } from '../context/AppContext';

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const step = end / (duration * 60);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString('ar-EG')}</span>;
}

const HERO_SLIDES = [
  {
    bg: 'https://images.unsplash.com/photo-1762059976893-e73c45e867e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1400',
    title: 'ابحث عن منزل أحلامك',
    subtitle: 'في قلب الإسكندرية',
  },
  {
    bg: 'https://images.unsplash.com/photo-1661158494764-bbf2a2e2a70d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1400',
    title: 'فيلات وشقق فاخرة',
    subtitle: 'بأفضل المواقع والأسعار',
  },
  {
    bg: 'https://images.unsplash.com/photo-1662749518398-1b429b4fee67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1400',
    title: 'إطلالات بحرية ساحرة',
    subtitle: 'كورنيش الإسكندرية الجميلة',
  },
];

export function Home() {
  const { properties } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [heroSlide, setHeroSlide] = useState(0);
  const navigate = useNavigate();

  const featuredProperties = properties.filter(p => p.featured).slice(0, 4);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchType !== 'all') params.set('status', searchType);
    navigate(`/properties?${params.toString()}`);
  };

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  const servicesRef = useRef(null);
  const servicesInView = useInView(servicesRef, { once: true });

  return (
    <div className="min-h-screen" dir="rtl">
      {/* HERO */}
      <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img
              src={HERO_SLIDES[heroSlide].bg}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-purple-400/30"
              style={{ left: `${15 + i * 15}%`, top: `${20 + i * 10}%` }}
              animate={{ y: [-20, 20, -20], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-8 h-0.5 bg-[#A855F7]" />
              <span className="text-[#A855F7] text-sm font-medium">الإسكندرية، مصر</span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={heroSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-white mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1 }}>
                  {HERO_SLIDES[heroSlide].title}
                </h1>
                <p className="text-[#A855F7] mb-6" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 600 }}>
                  {HERO_SLIDES[heroSlide].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-300 mb-8 text-base"
            >
              أكثر من ١٢٧ عقار متاح في جميع أحياء الإسكندرية. ابحث، قارن، وتواصل مع فريقنا المتخصص اليوم.
            </motion.p>

            {/* Search Box */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onSubmit={handleSearch}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl shadow-purple-900/30 flex flex-col sm:flex-row gap-2"
            >
              <select
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                className="border-0 outline-none bg-purple-50 rounded-xl px-3 py-2.5 text-sm text-[#0A0A0A] min-w-[110px]"
              >
                <option value="all">الكل</option>
                <option value="for-sale">للبيع</option>
                <option value="for-rent">للإيجار</option>
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث بالموقع أو نوع العقار..."
                className="flex-1 border-0 outline-none text-sm px-3 py-2.5 text-[#0A0A0A] bg-transparent placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-purple-300 transition-shadow"
              >
                <Search size={16} />
                بحث
              </button>
            </motion.form>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['سيدي جابر', 'جليم', 'ستانلي', 'سموحة', 'المندرة'].map(area => (
                <button
                  key={area}
                  onClick={() => navigate(`/properties?q=${area}`)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg backdrop-blur-sm transition-all border border-white/20"
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className={`transition-all duration-300 rounded-full ${i === heroSlide ? 'w-8 h-2 bg-[#A855F7]' : 'w-2 h-2 bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="py-16 bg-gradient-to-br from-[#7C3AED] to-[#4C1D95]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 127, label: 'عقار متاح', icon: <Building2 size={24} /> },
              { value: 43, label: 'عملية بيع ناجحة', icon: <TrendingUp size={24} /> },
              { value: 289, label: 'عميل راضٍ', icon: <Users size={24} /> },
              { value: 12, label: 'سنوات خبرة', icon: <Star size={24} /> },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 text-white">
                  {stat.icon}
                </div>
                <div className="text-white mb-1" style={{ fontSize: '2rem', fontWeight: 900 }}>
                  {statsInView ? <CountUp end={stat.value} /> : 0}+
                </div>
                <div className="text-purple-200 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-16 bg-[#F9F5FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[#7C3AED] text-sm font-medium mb-1"
              >
                مختارة لك
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-[#0A0A0A] text-3xl font-black"
              >
                العقارات المميزة
              </motion.h2>
            </div>
            <Link
              to="/properties"
              className="flex items-center gap-1 text-[#7C3AED] hover:text-[#5B21B6] text-sm font-medium transition-colors"
            >
              عرض الكل
              <ArrowLeft size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section ref={servicesRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#7C3AED] text-sm font-medium mb-1"
            >
              خدماتنا
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#0A0A0A] text-3xl font-black"
            >
              ماذا نقدم لك؟
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Building2 size={28} />,
                title: 'بيع العقارات',
                desc: 'نساعدك في بيع عقارك بأفضل سعر وفي أقصر وقت ممكن مع ضمان حقوقك القانونية.',
                color: 'from-[#7C3AED] to-[#9333EA]',
                link: '/sell',
              },
              {
                icon: <Search size={28} />,
                title: 'شراء العقارات',
                desc: 'نوفر لك أكبر قاعدة بيانات عقارية في الإسكندرية للعثور على منزل أحلامك.',
                color: 'from-[#0A0A0A] to-[#1A1A2E]',
                link: '/properties?status=for-sale',
              },
              {
                icon: <MessageCircle size={28} />,
                title: 'الاستعلام والاستشارة',
                desc: 'فريقنا المتخصص جاهز للإجابة على جميع استفساراتك العقارية مجاناً.',
                color: 'from-[#7C3AED] to-[#4C1D95]',
                link: '/contact',
              },
              {
                icon: <Shield size={28} />,
                title: 'الحماية القانونية',
                desc: 'نضمن سلامة جميع المعاملات العقارية وتوثيق العقود بصورة قانونية.',
                color: 'from-[#0A0A0A] to-[#1A1A2E]',
                link: '/contact',
              },
              {
                icon: <Award size={28} />,
                title: 'تقييم العقارات',
                desc: 'نقدم تقييماً دقيقاً وموضوعياً لقيمة عقارك بناءً على المعايير السوقية.',
                color: 'from-[#7C3AED] to-[#9333EA]',
                link: '/contact',
              },
              {
                icon: <Clock size={28} />,
                title: 'متابعة الطلبات',
                desc: 'تابع حالة طلبك في أي وقت من خلال لوحة التحكم الخاصة بك.',
                color: 'from-[#0A0A0A] to-[#1A1A2E]',
                link: '/dashboard',
              },
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-purple-100 transition-all group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="font-bold text-[#0A0A0A] mb-2 group-hover:text-[#7C3AED] transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{service.desc}</p>
                <Link
                  to={service.link}
                  className="flex items-center gap-1 text-[#7C3AED] text-sm font-medium hover:gap-2 transition-all"
                >
                  اعرف أكثر <ChevronRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-16 bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#7C3AED] rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#9333EA] rounded-full filter blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[#A855F7] text-sm font-medium mb-2">لماذا تختارنا؟</p>
              <h2 className="text-white text-3xl font-black mb-4">
                شريكك الموثوق<br />في عالم العقارات
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                منذ عام ٢٠١٢، ونحن نخدم عملاءنا في الإسكندرية بمهنية واحترافية عالية. فريقنا من الخبراء المتخصصين يضمن لك أفضل تجربة عقارية.
              </p>
              {[
                'أكثر من ١٢ سنة من الخبرة في سوق العقارات',
                'تغطية شاملة لجميع أحياء الإسكندرية',
                'خدمة عملاء على مدار الساعة',
                'ضمان الشفافية في جميع المعاملات',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 mb-2">
                  <CheckCircle size={16} className="text-[#A855F7] flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
              <div className="flex gap-3 mt-6">
                <Link
                  to="/properties"
                  className="flex items-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-purple-500/30 transition-shadow"
                >
                  <Building2 size={16} />
                  تصفح العقارات
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-sm font-medium border border-white/20 transition-all"
                >
                  <Phone size={16} />
                  تواصل معنا
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1761688145251-3745c842d766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
                  alt="Real Estate"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent" />
              </div>
              {/* Floating Cards */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-lg flex items-center justify-center">
                    <Star size={14} className="text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#0A0A0A]">تقييم ممتاز</div>
                    <div className="text-xs text-gray-500">٤.٩/٥ نجوم</div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#0A0A0A] rounded-lg flex items-center justify-center">
                    <MapPin size={14} className="text-[#A855F7]" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#0A0A0A]">الإسكندرية</div>
                    <div className="text-xs text-gray-500">Alexandria, EG</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOCIAL & CTA */}
      <section className="py-16 bg-gradient-to-br from-[#F9F5FF] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#0A0A0A] text-3xl font-black mb-3"
          >
            تابعنا على وسائل التواصل
          </motion.h2>
          <p className="text-gray-500 mb-8">ابقَ على اطلاع بأحدث العقارات والعروض</p>

          <div className="flex justify-center gap-4 mb-10">
            {[
              { icon: <Facebook size={22} />, label: 'Facebook', color: 'bg-[#1877F2]', href: 'https://web.facebook.com/amr.ahmed.422543/', shadow: 'hover:shadow-blue-300' },
              { icon: <Instagram size={22} />, label: 'Instagram', color: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743]', href: 'https://www.instagram.com/amr_3hmed9/', shadow: 'hover:shadow-pink-300' },
              { icon: <Linkedin size={22} />, label: 'LinkedIn', color: 'bg-[#0A66C2]', href: 'https://www.linkedin.com/in/%F0%9D%91%A8%F0%9D%91%B4%F0%9D%91%B9-%F0%9D%91%A8%F0%9D%91%AF%F0%9D%91%B4%F0%9D%91%AC%F0%9D%91%AB-613085328/', shadow: 'hover:shadow-blue-400' },
              { icon: <MessageCircle size={22} />, label: 'WhatsApp', color: 'bg-[#25D366]', href: 'https://wa.me/201281378331', shadow: 'hover:shadow-green-300' },
            ].map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-2 group`}
              >
                <div className={`w-14 h-14 ${social.color} rounded-2xl flex items-center justify-center text-white shadow-lg ${social.shadow} transition-shadow`}>
                  {social.icon}
                </div>
                <span className="text-xs text-gray-500 group-hover:text-[#7C3AED] transition-colors">{social.label}</span>
              </motion.a>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#7C3AED] to-[#9333EA] rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-black mb-2">جاهز للبدء؟</h3>
            <p className="text-purple-200 mb-5">سجّل الآن وابدأ رحلتك العقارية مع إسكنك</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/login?tab=register"
                className="flex items-center justify-center gap-2 bg-white text-[#7C3AED] px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-shadow"
              >
                إنشاء حساب مجاني
              </Link>
              <Link
                to="/properties"
                className="flex items-center justify-center gap-2 bg-white/20 text-white px-8 py-3 rounded-xl font-medium border border-white/30 hover:bg-white/30 transition-all"
              >
                تصفح العقارات
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
