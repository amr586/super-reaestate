import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Building2, Users, CreditCard, CheckCircle, XCircle, Clock, LogOut, Eye, ShieldCheck, BarChart3, MessageSquare, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=120&fit=crop';

const SUB_ROLES = [
  { value: '', label: 'مستخدم عادي' },
  { value: 'data_entry', label: 'إدخال البيانات' },
  { value: 'property_manager', label: 'مدير العقارات' },
  { value: 'analytics', label: 'التحليلات' },
  { value: 'support', label: 'الدعم الفني' },
];

export default function SuperAdminDashboard() {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!isSuperAdmin) { navigate('/dashboard'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, propData, usersData, paymentsData] = await Promise.allSettled([
        api.getStats(),
        api.getAllProperties(),
        api.getUsers(),
        api.getAdminPayments(),
      ]);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (propData.status === 'fulfilled') setProperties(propData.value || []);
      if (usersData.status === 'fulfilled') setUsers(usersData.value || []);
      if (paymentsData.status === 'fulfilled') setPayments(paymentsData.value || []);
    } catch {}
    finally { setLoading(false); }
  };

  const approveProperty = async (id: number) => {
    await api.approveProperty(id);
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
  };

  const rejectProperty = async (id: number) => {
    await api.rejectProperty(id);
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
  };

  const markSold = async (id: number) => {
    await api.markSold(id);
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'sold' } : p));
  };

  const approvePayment = async (id: number) => {
    await api.approvePayment(id);
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
  };

  const updateUserRole = async (id: number, role: string, subRole?: string) => {
    await api.updateRole(id, role, subRole);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role, sub_role: subRole } : u));
  };

  const toggleUser = async (id: number) => {
    await api.toggleUser(id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
  };

  if (!user || !isSuperAdmin) return null;

  const pendingProps = properties.filter(p => p.status === 'pending');
  const pendingPayments = payments.filter(p => p.status === 'pending');

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: <LayoutDashboard size={16} /> },
    { id: 'properties', label: 'العقارات', icon: <Building2 size={16} />, badge: pendingProps.length },
    { id: 'users', label: 'المستخدمين', icon: <Users size={16} /> },
    { id: 'payments', label: 'المدفوعات', icon: <CreditCard size={16} />, badge: pendingPayments.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Super Admin Header */}
        <div className="bg-gradient-to-r from-gray-900 via-[#4C1D95] to-[#7C3AED] rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-48 h-48 bg-white rounded-full -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-400 rounded-full translate-y-1/2 blur-3xl" />
          </div>
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={28} className="text-yellow-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black">سوبر أدمن</h1>
                  <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-md font-bold">SUPER</span>
                </div>
                <p className="text-purple-200 text-sm">مرحباً، {user.name} — صلاحيات كاملة</p>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-medium">
              <LogOut size={15} />خروج
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'إجمالي العقارات', value: stats.totalProperties || 0, icon: <Building2 size={20} />, color: 'from-[#7C3AED] to-[#9333EA]' },
              { label: 'بانتظار المراجعة', value: stats.pendingProperties || 0, icon: <Clock size={20} />, color: 'from-yellow-500 to-orange-500' },
              { label: 'إجمالي المستخدمين', value: stats.totalUsers || 0, icon: <Users size={20} />, color: 'from-gray-700 to-gray-900' },
              { label: 'عقارات مباعة', value: stats.soldProperties || 0, icon: <CheckCircle size={20} />, color: 'from-green-500 to-green-700' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-white mb-3`}>{s.icon}</div>
                <div className="text-2xl font-black text-gray-900">{s.value}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-[#7C3AED] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t.icon}{t.label}
              {(t as any).badge > 0 && <span className={`text-xs rounded-full px-2 py-0.5 ${activeTab === t.id ? 'bg-white/30 text-white' : 'bg-red-100 text-red-600'}`}>{(t as any).badge}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-[#7C3AED] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-yellow-500" />عقارات تحتاج مراجعة ({pendingProps.length})
                  </h3>
                  {pendingProps.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">لا توجد عقارات بانتظار المراجعة</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingProps.slice(0, 5).map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <img src={p.primary_image || DEFAULT_IMAGE} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 line-clamp-1">{p.title_ar || p.title}</div>
                            <div className="text-xs text-gray-400">{p.district} · {Number(p.price).toLocaleString()} ج</div>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => approveProperty(p.id)} className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                              <CheckCircle size={14} />
                            </button>
                            <button onClick={() => rejectProperty(p.id)} className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                              <XCircle size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-[#7C3AED]" />مدفوعات بانتظار التأكيد ({pendingPayments.length})
                  </h3>
                  {pendingPayments.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">لا توجد مدفوعات بانتظار</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingPayments.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CreditCard size={16} className="text-[#7C3AED]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900">{p.user_name || 'مستخدم'}</div>
                            <div className="text-xs text-gray-400">{Number(p.amount).toLocaleString()} ج · {p.payment_method}</div>
                          </div>
                          <button onClick={() => approvePayment(p.id)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors">
                            تأكيد
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">جميع العقارات ({properties.length})</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {properties.map(p => (
                    <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <img src={p.primary_image || DEFAULT_IMAGE} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm line-clamp-1">{p.title_ar || p.title}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{p.district} · {Number(p.price).toLocaleString()} جنيه · {p.user_name || 'مجهول'}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${({ pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', sold: 'bg-gray-100 text-gray-600' } as Record<string, string>)[p.status] || ''}`}>
                        {({ pending: 'مراجعة', approved: 'موافق', rejected: 'مرفوض', sold: 'مباع' } as Record<string, string>)[p.status] || p.status}
                      </span>
                      <div className="flex gap-2 flex-shrink-0">
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => approveProperty(p.id)} className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-center text-green-600 transition-colors">
                              <CheckCircle size={15} />
                            </button>
                            <button onClick={() => rejectProperty(p.id)} className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center text-red-600 transition-colors">
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        {p.status === 'approved' && (
                          <button onClick={() => markSold(p.id)} className="px-3 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 font-medium transition-colors">مباع</button>
                        )}
                        <Link to={`/properties/${p.id}`} className="w-8 h-8 bg-purple-100 hover:bg-purple-200 rounded-lg flex items-center justify-center text-[#7C3AED] transition-colors">
                          <Eye size={15} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">إدارة المستخدمين ({users.length})</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {users.map(u => (
                    <div key={u.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="w-11 h-11 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{u.name}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{u.email}</div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <select
                          value={u.role === 'admin' || u.role === 'superadmin' ? `${u.role}:${u.sub_role || ''}` : 'user'}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === 'user') updateUserRole(u.id, 'user');
                            else if (val === 'superadmin:') updateUserRole(u.id, 'superadmin');
                            else {
                              const [, sub] = val.split(':');
                              updateUserRole(u.id, 'admin', sub || undefined);
                            }
                          }}
                          disabled={u.id === user?.id}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#7C3AED] disabled:opacity-50"
                        >
                          <option value="user">مستخدم</option>
                          <option value="admin:data_entry">أدمن · إدخال بيانات</option>
                          <option value="admin:property_manager">أدمن · مدير عقارات</option>
                          <option value="admin:analytics">أدمن · تحليلات</option>
                          <option value="admin:support">أدمن · دعم فني</option>
                          <option value="superadmin:">سوبر أدمن</option>
                        </select>
                        <button onClick={() => toggleUser(u.id)} disabled={u.id === user?.id}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${u.is_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                        >
                          {u.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">طلبات الدفع ({payments.length})</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {payments.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">لا توجد طلبات دفع</p>
                  ) : payments.map(p => (
                    <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CreditCard size={18} className="text-[#7C3AED]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{p.user_name || 'مستخدم'}</div>
                        <div className="text-gray-400 text-xs">{p.property_title_ar || 'عقار'} · {Number(p.amount).toLocaleString()} ج · {p.payment_method}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${p.status === 'approved' ? 'bg-green-100 text-green-700' : p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.status === 'approved' ? 'موافق' : p.status === 'rejected' ? 'مرفوض' : 'بانتظار'}
                      </span>
                      {p.status === 'pending' && (
                        <button onClick={() => approvePayment(p.id)} className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors flex-shrink-0">
                          تأكيد
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
