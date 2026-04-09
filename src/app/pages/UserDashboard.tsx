import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Building2, Heart, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop';

function PropertyRow({ property }: { property: any }) {
  const STATUS_LABEL: Record<string, string> = { pending: 'مراجعة', approved: 'موافق', rejected: 'مرفوض', sold: 'مباع' };
  const STATUS_COLOR: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', sold: 'bg-gray-100 text-gray-600' };
  return (
    <Link to={`/properties/${property.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-100 transition-all flex gap-4 p-4 group"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <img src={property.primary_image || DEFAULT_IMAGE} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-[#7C3AED] transition-colors">{property.title_ar || property.title}</div>
        <div className="text-gray-500 text-xs mt-0.5">{property.district} · {Number(property.area)}م²</div>
        <div className="text-[#7C3AED] font-bold text-sm mt-1">{Number(property.price).toLocaleString()} جنيه</div>
      </div>
      <span className={`self-start px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${STATUS_COLOR[property.status] || 'bg-gray-100 text-gray-600'}`}>
        {STATUS_LABEL[property.status] || property.status}
      </span>
    </Link>
  );
}

function EmptyState({ icon, title, desc, link, linkLabel }: { icon: React.ReactNode; title: string; desc: string; link: string; linkLabel: string; }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
      <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#7C3AED]">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 text-sm mb-4">{desc}</p>
      <Link to={link} className="text-[#7C3AED] font-semibold text-sm hover:underline">{linkLabel}</Link>
    </div>
  );
}

export default function UserDashboard() {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('properties');
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (isSuperAdmin) { navigate('/superadmin'); return; }
    if (isAdmin) { navigate('/admin'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propertiesData, savedData, paymentsData] = await Promise.allSettled([
        api.getProperties({ user_id: user?.id }),
        api.getSaved(),
        api.myPayments(),
      ]);
      if (propertiesData.status === 'fulfilled') setMyProperties((propertiesData.value as any).properties || []);
      if (savedData.status === 'fulfilled') setSavedProperties((savedData.value as any) || []);
      if (paymentsData.status === 'fulfilled') setPayments((paymentsData.value as any) || []);
    } catch {}
    finally { setLoading(false); }
  };

  if (!user) return null;

  const tabs = [
    { id: 'properties', label: 'عقاراتي', icon: <Building2 size={16} />, count: myProperties.length },
    { id: 'saved', label: 'المحفوظات', icon: <Heart size={16} />, count: savedProperties.length },
    { id: 'payments', label: 'طلباتي', icon: <CreditCard size={16} />, count: payments.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-3xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="text-center sm:text-right flex-1">
              <h1 className="text-2xl font-black">{user.name}</h1>
              <p className="text-purple-200 text-sm mt-1">{user.email}</p>
              {user.phone && <p className="text-purple-200 text-sm" dir="ltr">{user.phone}</p>}
            </div>
            <button onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-medium"
            >
              <LogOut size={15} />تسجيل الخروج
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? 'bg-[#7C3AED] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t.icon}<span className="hidden sm:inline">{t.label}</span>
              {t.count > 0 && <span className={`text-xs rounded-full px-2 py-0.5 ${activeTab === t.id ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-[#7C3AED] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'properties' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">عقاراتي ({myProperties.length})</h2>
                  <Link to="/add-property" className="flex items-center gap-1.5 bg-[#7C3AED] text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90">
                    <Building2 size={14} />أضف عقاراً
                  </Link>
                </div>
                {myProperties.length === 0 ? (
                  <EmptyState icon={<Building2 size={32} />} title="لا توجد عقارات" desc="لم تُضف أي عقارات بعد" link="/add-property" linkLabel="أضف أول عقار" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myProperties.map(p => <PropertyRow key={p.id} property={p} />)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                <h2 className="font-bold text-gray-900 mb-4">المحفوظات ({savedProperties.length})</h2>
                {savedProperties.length === 0 ? (
                  <EmptyState icon={<Heart size={32} />} title="لا توجد مفضلات" desc="احفظ العقارات التي تعجبك" link="/properties" linkLabel="تصفح العقارات" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedProperties.map((p: any) => <PropertyRow key={p.id} property={p} />)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <h2 className="font-bold text-gray-900 mb-4">طلباتي ({payments.length})</h2>
                {payments.length === 0 ? (
                  <EmptyState icon={<CreditCard size={32} />} title="لا توجد طلبات" desc="لم تُقدم أي طلبات شراء بعد" link="/properties" linkLabel="تصفح العقارات" />
                ) : (
                  <div className="space-y-3">
                    {payments.map((p: any) => (
                      <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CreditCard size={20} className="text-[#7C3AED]" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-sm">{p.property_title_ar || 'عقار'}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{Number(p.amount).toLocaleString()} جنيه · {p.payment_method}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${p.status === 'approved' ? 'bg-green-100 text-green-700' : p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status === 'approved' ? 'موافق عليه' : p.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
