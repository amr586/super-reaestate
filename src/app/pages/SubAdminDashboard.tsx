import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, CheckCircle, XCircle, Clock, LogOut, Eye, BarChart3, MessageSquare,
  FileText, PlusCircle, Edit3, Trash2, Users, TrendingUp, AlertCircle, Send,
  PieChart, Activity, DollarSign, RefreshCw, Search, Filter, ChevronRight, X, Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import PropertyDetailModal from '../components/PropertyDetailModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend } from 'recharts';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=120&fit=crop';
const COLORS = ['#7C3AED', '#9333EA', '#1F2937', '#6D28D9', '#4C1D95', '#A855F7'];

const STATUS_LABEL: Record<string, string> = { pending: 'قيد المراجعة', approved: 'موافق عليه', rejected: 'مرفوض', sold: 'مباع' };
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  sold: 'bg-gray-100 text-gray-600 border-gray-200'
};

function StatCard({ label, value, icon, color }: { label: string; value: any; icon: React.ReactNode; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{label}</p>
          <p className="text-3xl font-black text-gray-900">{value?.toLocaleString?.() ?? value ?? 0}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white`}>{icon}</div>
      </div>
    </motion.div>
  );
}

export default function SubAdminDashboard() {
  const { user, logout, isAdmin, isSuperAdmin, subRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [replyMsg, setReplyMsg] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (isSuperAdmin) { navigate('/superadmin'); return; }
    if (!isAdmin) { navigate('/dashboard'); return; }

    const role = user.sub_role;
    if (role === 'data_entry') setActiveTab('listings');
    else if (role === 'property_manager') setActiveTab('pending');
    else if (role === 'analytics') setActiveTab('analytics');
    else if (role === 'support') setActiveTab('tickets');
    else navigate('/admin');

    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.getAllProperties(),
        api.getStats(),
        api.getAnalytics(),
        api.getTickets(),
      ]);
      if (results[0].status === 'fulfilled') setProperties(results[0].value || []);
      if (results[1].status === 'fulfilled') setStats(results[1].value);
      if (results[2].status === 'fulfilled') setAnalytics(results[2].value);
      if (results[3].status === 'fulfilled') setTickets(results[3].value || []);
    } catch {}
    finally { setLoading(false); }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await api.approveProperty(id);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await api.rejectProperty(id);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const handleMarkSold = async (id: number) => {
    setActionLoading(id);
    try {
      await api.markSold(id);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'sold' } : p));
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const openTicket = async (ticket: any) => {
    setActiveTicket(ticket);
    const msgs = await api.getTicketMessages(ticket.id);
    setTicketMessages(msgs || []);
  };

  const sendReply = async () => {
    if (!replyMsg.trim() || !activeTicket) return;
    setSendingReply(true);
    try {
      const msg = await api.sendTicketMessage(activeTicket.id, replyMsg);
      setTicketMessages(prev => [...prev, msg]);
      setReplyMsg('');
    } catch {}
    finally { setSendingReply(false); }
  };

  const closeTicketAction = async (id: number) => {
    await api.closeTicket(id);
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'closed' } : t));
    if (activeTicket?.id === id) setActiveTicket({ ...activeTicket, status: 'closed' });
  };

  if (!user) return null;

  const ROLE_LABELS: Record<string, string> = {
    data_entry: 'مسؤول إدخال البيانات',
    property_manager: 'مدير العقارات',
    analytics: 'مسؤول التحليلات',
    support: 'مسؤول الدعم الفني',
  };

  const ROLE_COLOR: Record<string, string> = {
    data_entry: 'from-blue-500 to-blue-600',
    property_manager: 'from-[#7C3AED] to-[#9333EA]',
    analytics: 'from-green-500 to-emerald-600',
    support: 'from-orange-500 to-red-500',
  };

  const filteredProps = properties.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.title_ar?.includes(searchQuery) ||
    p.district?.includes(searchQuery)
  );

  const pendingProps = filteredProps.filter(p => p.status === 'pending');

  const TABS: Record<string, { id: string; label: string; icon: React.ReactNode }[]> = {
    data_entry: [
      { id: 'listings', label: 'العقارات', icon: <Building2 size={16} /> },
      { id: 'add', label: 'إضافة عقار', icon: <PlusCircle size={16} /> },
    ],
    property_manager: [
      { id: 'pending', label: 'بانتظار الموافقة', icon: <Clock size={16} /> },
      { id: 'approved', label: 'المعتمدة', icon: <CheckCircle size={16} /> },
      { id: 'sold', label: 'المباعة', icon: <DollarSign size={16} /> },
    ],
    analytics: [
      { id: 'analytics', label: 'الإحصائيات', icon: <BarChart3 size={16} /> },
      { id: 'overview', label: 'نظرة عامة', icon: <Activity size={16} /> },
    ],
    support: [
      { id: 'tickets', label: 'التذاكر المفتوحة', icon: <MessageSquare size={16} /> },
      { id: 'closed', label: 'المغلقة', icon: <CheckCircle size={16} /> },
    ],
  };

  const tabs = TABS[subRole || ''] || [];
  const roleLabel = ROLE_LABELS[subRole || ''] || 'أدمن';
  const roleColor = ROLE_COLOR[subRole || ''] || 'from-gray-700 to-gray-900';

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <AnimatePresence>
        {selectedPropertyId !== null && (
          <PropertyDetailModal
            propertyId={selectedPropertyId}
            onClose={() => setSelectedPropertyId(null)}
            onApprove={() => handleApprove(selectedPropertyId)}
            onReject={() => handleReject(selectedPropertyId)}
          />
        )}
      </AnimatePresence>
      <div className={`bg-gradient-to-r ${roleColor} py-8 px-4 sm:px-8`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl">لوحة {roleLabel}</h1>
              <p className="text-white/70 text-sm">{user.name} · {user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm transition-all">
              <Home size={14} />الرئيسية
            </Link>
            <button onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm transition-all"
            >
              <LogOut size={14} />خروج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* Stats Row */}
        {stats && subRole !== 'support' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="عقارات معتمدة" value={stats.totalProperties} icon={<Building2 size={20} />} color="bg-gradient-to-br from-[#7C3AED] to-[#9333EA]" />
            <StatCard label="بانتظار المراجعة" value={stats.pendingProperties} icon={<Clock size={20} />} color="bg-gradient-to-br from-yellow-400 to-yellow-500" />
            <StatCard label="مباعة" value={stats.soldProperties} icon={<TrendingUp size={20} />} color="bg-gradient-to-br from-gray-700 to-gray-900" />
            <StatCard label="المستخدمون" value={stats.totalUsers} icon={<Users size={20} />} color="bg-gradient-to-br from-green-500 to-emerald-600" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#7C3AED] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-[#7C3AED] border border-gray-100'}`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
          <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm bg-white border border-gray-100 text-gray-500 hover:bg-purple-50 transition-all mr-auto">
            <RefreshCw size={14} />تحديث
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ─── DATA ENTRY: LISTINGS ─── */}
            {activeTab === 'listings' && (
              <motion.div key="listings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="ابحث بالعنوان أو الحي..."
                      className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:border-[#7C3AED]" />
                  </div>
                </div>
                <div className="grid gap-3">
                  {filteredProps.map(prop => (
                    <motion.div key={prop.id} layout className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center">
                      <img src={prop.primary_image || DEFAULT_IMAGE} alt="" className="w-20 h-16 rounded-xl object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{prop.title_ar || prop.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{prop.district} · {Number(prop.area)}م² · {Number(prop.price).toLocaleString()} جنيه</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-bold border ${STATUS_COLOR[prop.status] || 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_LABEL[prop.status] || prop.status}
                        </span>
                      </div>
                      <Link to={`/properties/${prop.id}`} className="flex items-center gap-1 text-[#7C3AED] text-xs hover:underline">
                        <Eye size={14} />عرض
                      </Link>
                    </motion.div>
                  ))}
                  {filteredProps.length === 0 && <div className="text-center py-12 text-gray-400">لا توجد عقارات</div>}
                </div>
              </motion.div>
            )}

            {/* ─── DATA ENTRY: ADD ─── */}
            {activeTab === 'add' && (
              <motion.div key="add" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center"
              >
                <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#7C3AED]">
                  <PlusCircle size={36} />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">إضافة عقار جديد</h2>
                <p className="text-gray-500 mb-6">يمكنك إضافة عقارات جديدة عبر صفحة الإضافة</p>
                <Link to="/add-property" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white px-8 py-3 rounded-xl font-bold shadow-lg">
                  <PlusCircle size={18} />إضافة عقار
                </Link>
              </motion.div>
            )}

            {/* ─── PROPERTY MANAGER: PENDING ─── */}
            {activeTab === 'pending' && (
              <motion.div key="pending" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {pendingProps.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                    <p className="font-bold text-gray-900 mb-1">لا توجد عقارات بانتظار المراجعة</p>
                    <p className="text-gray-500 text-sm">جميع العقارات تمت مراجعتها</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pendingProps.map(prop => (
                      <motion.div key={prop.id} layout className="bg-white rounded-2xl p-5 shadow-sm border border-yellow-100">
                        <div className="flex gap-4">
                          <img src={prop.primary_image || DEFAULT_IMAGE} alt="" className="w-24 h-20 rounded-xl object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }} />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-bold text-gray-900">{prop.title_ar || prop.title}</p>
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold border border-yellow-200 flex-shrink-0">بانتظار المراجعة</span>
                            </div>
                            <p className="text-gray-500 text-sm">{prop.district} · {Number(prop.area)}م² · {Number(prop.price).toLocaleString()} جنيه · {prop.owner_name}</p>
                            <div className="flex gap-2 mt-3">
                              <button onClick={() => handleApprove(prop.id)} disabled={actionLoading === prop.id}
                                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                              >
                                <CheckCircle size={14} />{actionLoading === prop.id ? '...' : 'قبول'}
                              </button>
                              <button onClick={() => handleReject(prop.id)} disabled={actionLoading === prop.id}
                                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                              >
                                <XCircle size={14} />رفض
                              </button>
                              <button onClick={() => setSelectedPropertyId(prop.id)} className="flex items-center gap-1.5 bg-purple-50 text-[#7C3AED] px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-100 transition-colors">
                                <Eye size={14} />تفاصيل
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── PROPERTY MANAGER: APPROVED ─── */}
            {activeTab === 'approved' && (
              <motion.div key="approved" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid gap-3">
                  {filteredProps.filter(p => p.status === 'approved').map(prop => (
                    <div key={prop.id} className="bg-white rounded-2xl p-4 shadow-sm border border-green-50 flex gap-4 items-center">
                      <img src={prop.primary_image || DEFAULT_IMAGE} alt="" className="w-20 h-16 rounded-xl object-cover" onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{prop.title_ar || prop.title}</p>
                        <p className="text-gray-500 text-xs">{prop.district} · {Number(prop.price).toLocaleString()} جنيه</p>
                      </div>
                      <button onClick={() => handleMarkSold(prop.id)} disabled={actionLoading === prop.id}
                        className="flex items-center gap-1.5 bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                      >
                        <DollarSign size={12} />تحديد مباع
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── PROPERTY MANAGER: SOLD ─── */}
            {activeTab === 'sold' && (
              <motion.div key="sold" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid gap-3">
                  {filteredProps.filter(p => p.status === 'sold').map(prop => (
                    <div key={prop.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center opacity-75">
                      <img src={prop.primary_image || DEFAULT_IMAGE} alt="" className="w-20 h-16 rounded-xl object-cover grayscale" onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-700 text-sm line-clamp-1">{prop.title_ar || prop.title}</p>
                        <p className="text-gray-400 text-xs">{prop.district} · {Number(prop.price).toLocaleString()} جنيه</p>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold">مباع</span>
                    </div>
                  ))}
                  {filteredProps.filter(p => p.status === 'sold').length === 0 && (
                    <div className="text-center py-12 text-gray-400">لا توجد عقارات مباعة بعد</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── ANALYTICS ─── */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                {stats && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="إجمالي العقارات" value={stats.totalProperties} icon={<Building2 size={20} />} color="bg-gradient-to-br from-[#7C3AED] to-[#9333EA]" />
                    <StatCard label="بانتظار المراجعة" value={stats.pendingProperties} icon={<Clock size={20} />} color="bg-gradient-to-br from-yellow-400 to-orange-400" />
                    <StatCard label="مباعة" value={stats.soldProperties} icon={<TrendingUp size={20} />} color="bg-gradient-to-br from-gray-700 to-gray-900" />
                    <StatCard label="إجمالي الإيرادات" value={stats.totalRevenue ? `${Number(stats.totalRevenue).toLocaleString()} ج` : '0 ج'} icon={<DollarSign size={20} />} color="bg-gradient-to-br from-green-500 to-emerald-600" />
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analytics?.byType && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><PieChart size={18} className="text-[#7C3AED]" />توزيع أنواع العقارات</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <RPieChart>
                          <Pie data={analytics.byType} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="type" label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {analytics.byType.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </RPieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {analytics?.byDistrict && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-[#7C3AED]" />العقارات حسب الحي</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.byDistrict.slice(0, 6)} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="district" tick={{ fontSize: 12 }} width={80} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#7C3AED" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {analytics?.byMonth && analytics.byMonth.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity size={18} className="text-[#7C3AED]" />نمو العقارات الشهري</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={analytics.byMonth}>
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── ANALYTICS: OVERVIEW ─── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">نظرة عامة على جميع العقارات</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-right py-3 px-4 font-semibold text-gray-500">العقار</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-500">الحي</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-500">السعر</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-500">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties.slice(0, 15).map(p => (
                          <tr key={p.id} className="border-b border-gray-50 hover:bg-purple-50/30">
                            <td className="py-3 px-4 font-medium text-gray-900 line-clamp-1 max-w-[200px]">{p.title_ar || p.title}</td>
                            <td className="py-3 px-4 text-gray-500">{p.district}</td>
                            <td className="py-3 px-4 text-[#7C3AED] font-bold">{Number(p.price).toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${STATUS_COLOR[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── SUPPORT: TICKETS ─── */}
            {(activeTab === 'tickets' || activeTab === 'closed') && (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {activeTicket ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <div>
                        <h3 className="font-bold text-gray-900">{activeTicket.subject}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">المستخدم: {activeTicket.user_name}</p>
                      </div>
                      <div className="flex gap-2">
                        {activeTicket.status === 'open' && (
                          <button onClick={() => closeTicketAction(activeTicket.id)}
                            className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-all"
                          >إغلاق التذكرة</button>
                        )}
                        <button onClick={() => setActiveTicket(null)}
                          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
                        ><X size={14} /></button>
                      </div>
                    </div>
                    <div className="p-4 h-80 overflow-y-auto space-y-3">
                      {ticketMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender_id === user.id ? 'bg-[#7C3AED] text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {ticketMessages.length === 0 && <p className="text-center text-gray-400 text-sm">لا توجد رسائل بعد</p>}
                    </div>
                    {activeTicket.status === 'open' && (
                      <div className="p-4 border-t border-gray-100 flex gap-2">
                        <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)}
                          placeholder="اكتب ردك..."
                          onKeyDown={e => e.key === 'Enter' && sendReply()}
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C3AED]" />
                        <button onClick={sendReply} disabled={sendingReply || !replyMsg.trim()}
                          className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white hover:bg-[#6D28D9] disabled:opacity-50"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets
                      .filter(t => activeTab === 'tickets' ? t.status === 'open' : t.status === 'closed')
                      .map(ticket => (
                        <motion.div key={ticket.id} layout
                          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-purple-200 transition-all"
                          onClick={() => openTicket(ticket)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ticket.status === 'open' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                <MessageSquare size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{ticket.subject}</p>
                                <p className="text-gray-400 text-xs mt-0.5">{ticket.user_name} · {new Date(ticket.created_at).toLocaleDateString('ar-EG')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {ticket.status === 'open' ? 'مفتوح' : 'مغلق'}
                              </span>
                              <ChevronRight size={16} className="text-gray-400" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    {tickets.filter(t => activeTab === 'tickets' ? t.status === 'open' : t.status === 'closed').length === 0 && (
                      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                        <MessageSquare size={48} className="text-gray-300 mx-auto mb-3" />
                        <p className="font-bold text-gray-500">لا توجد تذاكر {activeTab === 'tickets' ? 'مفتوحة' : 'مغلقة'}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
