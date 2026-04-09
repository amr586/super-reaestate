import { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, MessageCircle, Facebook, Instagram, Linkedin, Send, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Contact() {
  const { addContactMessage } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContactMessage(form);
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const SOCIAL_LINKS = [
    {
      icon: <Facebook size={20} />,
      label: 'Facebook',
      handle: 'amr.ahmed',
      color: 'bg-[#1877F2]',
      href: 'https://web.facebook.com/amr.ahmed.422543/',
    },
    {
      icon: <Instagram size={20} />,
      label: 'Instagram',
      handle: 'amr_3hmed9',
      color: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743]',
      href: 'https://www.instagram.com/amr_3hmed9/',
    },
    {
      icon: <Linkedin size={20} />,
      label: 'LinkedIn',
      handle: 'عمرو أحمد',
      color: 'bg-[#0A66C2]',
      href: 'https://www.linkedin.com/in/%F0%9D%91%A8%F0%9D%91%B4%F0%9D%91%B9-%F0%9D%91%A8%F0%9D%91%AF%F0%9D%91%B4%F0%9D%91%AC%F0%9D%91%AB-613085328/',
    },
    {
      icon: <MessageCircle size={20} />,
      label: 'WhatsApp',
      handle: '+20 128 137 8331',
      color: 'bg-[#25D366]',
      href: 'https://wa.me/201281378331',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F5FF] pt-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Phone size={26} className="text-white" />
            </div>
            <h1 className="text-white text-3xl font-black mb-2">تواصل معنا</h1>
            <p className="text-purple-200">نحن هنا للإجابة على جميع استفساراتك</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            {/* Info Cards */}
            {[
              {
                icon: <MapPin size={20} />,
                title: 'العنوان',
                lines: ['الإسكندرية، مصر', 'Alexandria, Egypt'],
              },
              {
                icon: <Phone size={20} />,
                title: 'الهاتف',
                lines: ['+20 128 137 8331'],
                href: 'tel:+201281378331',
              },
              {
                icon: <Mail size={20} />,
                title: 'البريد الإلكتروني',
                lines: ['amrw4634@gmail.com'],
                href: 'mailto:amrw4634@gmail.com',
              },
              {
                icon: <Clock size={20} />,
                title: 'ساعات العمل',
                lines: ['السبت - الخميس', '٩ صباحاً - ١٠ مساءً'],
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                  {item.icon}
                </div>
                <div>
                  <div className="font-bold text-[#0A0A0A] text-sm mb-0.5">{item.title}</div>
                  {item.lines.map((line, j) => (
                    item.href ? (
                      <a key={j} href={item.href} className="text-gray-500 text-sm hover:text-[#7C3AED] transition-colors block" dir="ltr">
                        {line}
                      </a>
                    ) : (
                      <div key={j} className="text-gray-500 text-sm">{line}</div>
                    )
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Social */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm"
            >
              <h3 className="font-bold text-[#0A0A0A] mb-4">وسائل التواصل الاجتماعي</h3>
              <div className="grid grid-cols-2 gap-3">
                {SOCIAL_LINKS.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group"
                  >
                    <div className={`w-9 h-9 ${social.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                      {social.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0A0A0A] group-hover:text-[#7C3AED] transition-colors">{social.label}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[80px]">{social.handle}</div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100"
            >
              {submitted ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-3xl flex items-center justify-center mx-auto mb-5"
                  >
                    <CheckCircle size={36} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-[#0A0A0A] mb-2">تم إرسال رسالتك!</h3>
                  <p className="text-gray-500 mb-6">سيتواصل معك فريقنا في أقرب وقت ممكن. شكراً لثقتك بنا!</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white px-8 py-2.5 rounded-xl text-sm font-bold"
                  >
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-black text-[#0A0A0A] text-xl mb-5">أرسل لنا رسالة</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">الاسم الكامل *</label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="اسمك الكامل"
                          className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">رقم الهاتف *</label>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          placeholder="+20 1xxxxxxxxx"
                          dir="ltr"
                          className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">البريد الإلكتروني</label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="example@email.com"
                          className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">الموضوع</label>
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED] transition-colors"
                        >
                          <option value="">اختر الموضوع</option>
                          <option value="استفسار عن عقار">استفسار عن عقار</option>
                          <option value="طلب بيع عقار">طلب بيع عقار</option>
                          <option value="طلب شراء عقار">طلب شراء عقار</option>
                          <option value="تقييم عقار">تقييم عقار</option>
                          <option value="شكوى">شكوى</option>
                          <option value="أخرى">أخرى</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">الرسالة *</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="اكتب رسالتك هنا..."
                        className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-purple-100 focus:border-[#7C3AED] transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-300 transition-shadow"
                    >
                      <Send size={16} />
                      إرسال الرسالة
                    </button>
                  </form>

                  {/* Quick WhatsApp */}
                  <div className="mt-5 pt-5 border-t border-purple-50">
                    <p className="text-center text-gray-500 text-xs mb-3">أو تواصل معنا مباشرة عبر</p>
                    <a
                      href="https://wa.me/201281378331"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-green-200 transition-all"
                    >
                      <MessageCircle size={16} />
                      WhatsApp: +20 128 137 8331
                    </a>
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
