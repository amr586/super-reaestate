import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Building2, Users, FileText, MessageSquare,
  TrendingUp, Eye, Edit, Trash2, Check, X, Clock, CheckCircle,
  XCircle, AlertCircle, Plus, Search, LogOut, Bell, ChevronDown,
  Phone, Mail, MapPin, DollarSign, ArrowUpRight, Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getRequestStatusLabel, getRequestTypeLabel, getTypeLabel,
  getStatusLabel, formatPrice, Request, Property
} from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const CHARTS_DATA = {
  monthly: [
    { month: 'يناير', مبيعات: 4, إيجار: 2 },
    { month: 'فبراير', مبيعات: 6, إيجار: 3 },
    { month: 'مارس', مبيعات: 3, إيجار: 5 },
    { month: 'أبريل', مبيعات: 8, إيجار: 4 },
    { month: 'مايو', مبيعات: 5, إيجار: 6 },
    { month: 'يونيو', مبيعات: 9, إيجار: 3 },
  ],
  types: [
    { name: 'شقق', value: 45 },
    { name: 'فيلات', value: 20 },
    { name: 'دوبلكس', value: 15 },
    { name: 'مكاتب', value: 12 },
    { name: 'شاليهات', value: 8 },
  ],
};

const PIE_COLORS = ['#7C3AED', '#0A0A0A', '#A855F7', '#4C1D95', '#C4B5FD'];

const STATUS_COLORS: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-700',
  'under-review': 'bg-blue-100 text-blue-700',
  'approved': 'bg-green-100 text-green-700',
  'rejected': 'bg-red-100 text-red-700',
  'completed': 'bg-purple-100 text-purple-700',
};

type AdminTab = 'overview' | 'properties' | 'requests' | 'users' | 'messages';

export function AdminDashboard() {
  const {
    currentUser, logout, requests, updateRequestStatus, deleteRequest,
    properties, addProperty, deleteProperty, updateProperty,
    contactMessages, markMessageRead, users, tasks, updateTask
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [showAddProp, setShowAddProp] = useState(false);
  const [newProp, setNewProp] = useState({
    titleAr: '', title: '', type: 'apartment' as Property['type'],
    status: 'for-sale' as Property['status'], price: '', area: '',
    bedrooms: '', bathrooms: '', location: '', address: '',
    description: '', descriptionAr: '', image: '', featured: false,
  });

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-[#F9F5FF] flex items-center justify-center pt-20" dir="rtl">
        <div className="text-center">
          <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">غير مصرح بالدخول</h2>
          <Link to="/login" className="text-[#7C3AED] text-sm">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  const unreadMessages = contactMessages.filter(m => !m.read).length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  const TABS: { key: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'overview', label: 'الرئيسية', icon: <LayoutDashboard size={15} /> },
    { key: 'properties', label: 'العقارات', icon: <Building2 size={15} /> },
    { key: 'requests', label: 'الطلبات', icon: <FileText size={15} />, badge: pendingRequests },
    { key: 'users', label: 'المستخدمون', icon: <Users size={15} /> },
    { key: 'messages', label: 'الرسائل', icon: <MessageSquare size={15} />, badge: unreadMessages },
  ];

  const filteredRequests = requests.filter(r => {
    const matchQ = !searchQ || r.userName.includes(searchQ) || r.propertyTitle?.includes(searchQ);
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchQ && matchStatus;
  });

  const handleAddProperty = () => {
    addProperty({
      ...newProp,
      price: Number(newProp.price),
      area: Number(newProp.area),
      bedrooms: Number(newProp.bedrooms),
      bathrooms: Number(newProp.bathrooms),
      images: [newProp.image],
      sellerId: currentUser.id,
    });
    setShowAddProp(false);
    setNewProp({
      titleAr: '', title: '', type: 'apartment', status: 'for-sale',
      price: '', area: '', bedrooms: '', bathrooms: '', location: '',
      address: '', description: '', descriptionAr: '', image: '', featured: false,
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F5FF] pt-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-black text-[#0A0A0A]">لوحة الإدارة</h1>
            <p className="text-gray-500 text-sm">مرحباً، {currentUser.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="w-9 h-9 bg-white border border-purple-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-[#7C3AED] transition-colors shadow-sm">
                <Bell size={16} />
              </button>
              {(pendingRequests > 0 || unreadMessages > 0) && (
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingRequests + unreadMessages}
                </div>
              )}
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <LogOut size={14} />
              خروج
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-purple-100 mb-6 overflow-x-auto shadow-sm">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all relative ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md'
                  : 'text-gray-500 hover:text-[#7C3AED] hover:bg-purple-50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && tab.badge > 0 ? (
                <span className="w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'إجمالي العقارات', value: properties.length, icon: <Building2 size={18} />, color: 'from-[#7C3AED] to-[#9333EA]', change: '+12%' },
                { label: 'إجمالي الطلبات', value: requests.length, icon: <FileText size={18} />, color: 'from-[#0A0A0A] to-[#1A1A2E]', change: '+8%' },
                { label: 'المستخدمون', value: users.length, icon: <Users size={18} />, color: 'from-[#7C3AED] to-[#4C1D95]', change: '+25%' },
                { label: 'رسائل جديدة', value: unreadMessages, icon: <MessageSquare size={18} />, color: 'from-[#0A0A0A] to-[#1A1A2E]', change: '' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                      {stat.icon}
                    </div>
                    {stat.change && (
                      <span className="flex items-center gap-0.5 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-lg font-medium">
                        <ArrowUpRight size={12} />
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-[#0A0A0A]">{stat.value}</div>
                  <div className="text-gray-500 text-xs">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
                <h3 className="font-bold text-[#0A0A0A] mb-4">المبيعات والإيجار (٢٠٢٤)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={CHARTS_DATA.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F0FF" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="مبيعات" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="إيجار" fill="#0A0A0A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
                <h3 className="font-bold text-[#0A0A0A] mb-4">توزيع أنواع العقارات</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={CHARTS_DATA.types} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {CHARTS_DATA.types.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {CHARTS_DATA.types.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-medium text-[#0A0A0A]">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-purple-50 flex items-center justify-between">
                  <h3 className="font-bold text-[#0A0A0A] text-sm">آخر الطلبات</h3>
                  <button onClick={() => setActiveTab('requests')} className="text-[#7C3AED] text-xs">عرض الكل</button>
                </div>
                <div className="divide-y divide-purple-50">
                  {requests.slice(0, 3).map(req => (
                    <div key={req.id} className="p-3 flex items-center justify-between hover:bg-purple-50/50 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-[#0A0A0A]">{req.userName}</div>
                        <div className="text-xs text-gray-500">{getRequestTypeLabel(req.type)}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${STATUS_COLORS[req.status]}`}>
                        {getRequestStatusLabel(req.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-purple-50 flex items-center justify-between">
                  <h3 className="font-bold text-[#0A0A0A] text-sm">آخر الرسائل</h3>
                  <button onClick={() => setActiveTab('messages')} className="text-[#7C3AED] text-xs">عرض الكل</button>
                </div>
                <div className="divide-y divide-purple-50">
                  {contactMessages.slice(0, 3).map(msg => (
                    <div key={msg.id} className={`p-3 flex items-start justify-between hover:bg-purple-50/50 transition-colors ${!msg.read ? 'bg-purple-50/30' : ''}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-[#0A0A0A]">{msg.name}</div>
                          {!msg.read && <div className="w-2 h-2 bg-[#7C3AED] rounded-full" />}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{msg.subject || msg.message}</div>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 mr-2">{msg.createdAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROPERTIES */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="ابحث في العقارات..."
                  className="w-full bg-white border border-purple-100 rounded-xl pr-8 pl-3 py-2 text-sm outline-none"
                />
              </div>
              <button
                onClick={() => setShowAddProp(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md"
              >
                <Plus size={15} />
                إضافة عقار
              </button>
            </div>

            {/* Add Property Modal */}
            <AnimatePresence>
              {showAddProp && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                  onClick={e => e.target === e.currentTarget && setShowAddProp(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    dir="rtl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-[#0A0A0A]">إضافة عقار جديد</h3>
                      <button onClick={() => setShowAddProp(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'titleAr', label: 'اسم العقار (عربي)', placeholder: 'شقة فاخرة - سيدي جابر' },
                        { key: 'price', label: 'السعر', placeholder: '3500000', type: 'number' },
                        { key: 'area', label: 'المساحة (م²)', placeholder: '150', type: 'number' },
                        { key: 'bedrooms', label: 'غرف النوم', placeholder: '3', type: 'number' },
                        { key: 'bathrooms', label: 'الحمامات', placeholder: '2', type: 'number' },
                        { key: 'location', label: 'المنطقة', placeholder: 'سيدي جابر، الإسكندرية' },
                        { key: 'address', label: 'العنوان التفصيلي', placeholder: 'شارع الجيش...' },
                        { key: 'image', label: 'رابط الصورة', placeholder: 'https://...' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">{f.label}</label>
                          <input
                            type={f.type || 'text'}
                            value={newProp[f.key as keyof typeof newProp] as string}
                            onChange={e => setNewProp(prev => ({ ...prev, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            className="w-full bg-purple-50 rounded-xl px-3 py-2 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">النوع</label>
                        <select
                          value={newProp.type}
                          onChange={e => setNewProp(prev => ({ ...prev, type: e.target.value as Property['type'] }))}
                          className="w-full bg-purple-50 rounded-xl px-3 py-2 text-sm outline-none border border-purple-100"
                        >
                          <option value="apartment">شقة</option>
                          <option value="villa">فيلا</option>
                          <option value="duplex">دوبلكس</option>
                          <option value="office">مكتب</option>
                          <option value="chalet">شاليه</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">الحالة</label>
                        <select
                          value={newProp.status}
                          onChange={e => setNewProp(prev => ({ ...prev, status: e.target.value as Property['status'] }))}
                          className="w-full bg-purple-50 rounded-xl px-3 py-2 text-sm outline-none border border-purple-100"
                        >
                          <option value="for-sale">للبيع</option>
                          <option value="for-rent">للإيجار</option>
                          <option value="sold">تم البيع</option>
                          <option value="rented">تم التأجير</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">الوصف</label>
                        <textarea
                          value={newProp.descriptionAr}
                          onChange={e => setNewProp(prev => ({ ...prev, descriptionAr: e.target.value, description: e.target.value }))}
                          rows={3}
                          placeholder="وصف العقار..."
                          className="w-full bg-purple-50 rounded-xl px-3 py-2 text-sm outline-none border border-purple-100 resize-none"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newProp.featured}
                          onChange={e => setNewProp(prev => ({ ...prev, featured: e.target.checked }))}
                          className="accent-[#7C3AED]"
                        />
                        <label className="text-sm text-gray-600">عقار مميز</label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleAddProperty}
                        className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-2.5 rounded-xl text-sm font-bold"
                      >
                        إضافة العقار
                      </button>
                      <button
                        onClick={() => setShowAddProp(false)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500"
                      >
                        إلغاء
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Properties Table */}
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-purple-50 text-right">
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">العقار</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">النوع</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">الحالة</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">السعر</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">المنطقة</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {properties
                      .filter(p => !searchQ || p.titleAr.includes(searchQ) || p.location.includes(searchQ))
                      .map(prop => (
                        <tr key={prop.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={prop.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              <div>
                                <div className="text-sm font-medium text-[#0A0A0A] line-clamp-1">{prop.titleAr}</div>
                                {prop.featured && <span className="text-xs bg-purple-100 text-[#7C3AED] px-1.5 py-0.5 rounded">مميز</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{getTypeLabel(prop.type)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                              prop.status === 'for-sale' ? 'bg-purple-100 text-purple-700' :
                              prop.status === 'for-rent' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {getStatusLabel(prop.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-[#7C3AED]">{formatPrice(prop.price, prop.status)}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{prop.location}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Link
                                to={`/properties/${prop.id}`}
                                className="w-7 h-7 bg-purple-100 hover:bg-purple-200 rounded-lg flex items-center justify-center text-[#7C3AED] transition-colors"
                              >
                                <Eye size={13} />
                              </Link>
                              <button
                                onClick={() => updateProperty(prop.id, { featured: !prop.featured })}
                                className="w-7 h-7 bg-yellow-50 hover:bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 transition-colors"
                                title={prop.featured ? 'إلغاء التمييز' : 'تمييز'}
                              >
                                <TrendingUp size={13} />
                              </button>
                              <button
                                onClick={() => deleteProperty(prop.id)}
                                className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-400 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="ابحث في الطلبات..."
                  className="w-full bg-white border border-purple-100 rounded-xl pr-8 pl-3 py-2 text-sm outline-none"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-white border border-purple-100 rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option value="all">كل الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="under-review">تحت المراجعة</option>
                <option value="approved">موافق عليه</option>
                <option value="rejected">مرفوض</option>
                <option value="completed">مكتمل</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredRequests.map(req => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                          req.type === 'buy' ? 'bg-blue-100 text-blue-700' :
                          req.type === 'sell' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {getRequestTypeLabel(req.type)}
                        </span>
                        <span className="font-bold text-[#0A0A0A] text-sm">{req.userName}</span>
                        {req.propertyTitle && (
                          <span className="text-xs text-gray-500">— {req.propertyTitle}</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mb-2">{req.message}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span dir="ltr">{req.userPhone}</span>
                        <span>{req.userEmail}</span>
                        <span>{req.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                        {STATUS_COLORS[req.status] && req.status === 'pending' ? <Clock size={10} /> :
                         req.status === 'approved' ? <CheckCircle size={10} /> :
                         req.status === 'rejected' ? <XCircle size={10} /> :
                         <AlertCircle size={10} />}
                        {getRequestStatusLabel(req.status)}
                      </span>
                      <div className="flex gap-1">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'under-review')}
                            className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                          >
                            مراجعة
                          </button>
                        )}
                        {(req.status === 'pending' || req.status === 'under-review') && (
                          <>
                            <button
                              onClick={() => updateRequestStatus(req.id, 'approved')}
                              className="w-7 h-7 bg-green-50 hover:bg-green-100 rounded-lg flex items-center justify-center text-green-600 transition-colors"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => updateRequestStatus(req.id, 'rejected')}
                              className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-400 transition-colors"
                            >
                              <X size={13} />
                            </button>
                          </>
                        )}
                        {req.status === 'approved' && (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'completed')}
                            className="px-2 py-1 bg-purple-50 text-[#7C3AED] rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors"
                          >
                            إكمال
                          </button>
                        )}
                        <button
                          onClick={() => deleteRequest(req.id)}
                          className="w-7 h-7 bg-gray-50 hover:bg-red-50 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredRequests.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border border-purple-100">
                  <FileText size={36} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">لا توجد طلبات</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-purple-50">
              <h3 className="font-bold text-[#0A0A0A]">المستخدمون ({users.length})</h3>
            </div>
            <div className="divide-y divide-purple-50">
              {users.map(user => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-purple-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                      user.role === 'admin' ? 'bg-gradient-to-br from-[#7C3AED] to-[#4C1D95]' : 'bg-[#0A0A0A]'
                    }`}>
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-[#0A0A0A] text-sm flex items-center gap-2">
                        {user.name}
                        {user.role === 'admin' && (
                          <span className="text-xs bg-purple-100 text-[#7C3AED] px-1.5 py-0.5 rounded">أدمن</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span dir="ltr">{user.phone}</span>
                    <span className="bg-purple-50 text-[#7C3AED] px-2 py-0.5 rounded-lg">
                      {requests.filter(r => r.userId === user.id).length} طلب
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#0A0A0A]">رسائل التواصل ({contactMessages.length})</h3>
              <span className="text-xs text-gray-500">{unreadMessages} غير مقروءة</span>
            </div>
            {contactMessages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`bg-white rounded-2xl p-4 border shadow-sm transition-all ${!msg.read ? 'border-[#7C3AED]/30 bg-purple-50/30' : 'border-purple-100'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {msg.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-[#0A0A0A] text-sm">{msg.name}</span>
                        {!msg.read && <div className="w-2 h-2 bg-[#7C3AED] rounded-full" />}
                        {msg.subject && <span className="text-xs text-gray-500">— {msg.subject}</span>}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{msg.message}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span dir="ltr">{msg.phone}</span>
                        <a href={`mailto:${msg.email}`} className="hover:text-[#7C3AED]">{msg.email}</a>
                        <span>{msg.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!msg.read && (
                      <button
                        onClick={() => markMessageRead(msg.id)}
                        className="text-xs bg-purple-100 text-[#7C3AED] px-2 py-1 rounded-lg hover:bg-purple-200 transition-colors whitespace-nowrap"
                      >
                        تم القراءة
                      </button>
                    )}
                    <a
                      href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100 transition-colors text-center"
                    >
                      رد
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
