import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Building2, Users, FileText, MessageSquare, ClipboardList,
  TrendingUp, Eye, Edit, Trash2, Check, X, Clock, CheckCircle,
  XCircle, AlertCircle, Plus, Search, LogOut, Bell, ChevronDown,
  Phone, Mail, MapPin, DollarSign, ArrowUpRight, Filter, Star, UserPlus,
  Settings, Target, ListTodo, CheckSquare, Calendar, BarChart3, TrendingDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getRequestStatusLabel, getRequestTypeLabel, getTypeLabel,
  getStatusLabel, formatPrice, Request, Property, Task, User
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
  pricesTrend: [
    { month: 'يناير', السعر: 3200000 },
    { month: 'فبراير', السعر: 3300000 },
    { month: 'مارس', السعر: 3450000 },
    { month: 'أبريل', السعر: 3500000 },
    { month: 'مايو', السعر: 3600000 },
    { month: 'يونيو', السعر: 3700000 },
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

type AdminTab = 'overview' | 'properties' | 'requests' | 'admins' | 'users' | 'tasks' | 'messages' | 'analytics';

export function SuperAdminDashboard() {
  const {
    currentUser, logout, requests, updateRequestStatus, deleteRequest,
    properties, addProperty, deleteProperty, updateProperty,
    contactMessages, markMessageRead, users, updateUser,
    tasks, addTask, updateTask, deleteTask
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQ, setSearchQ] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProp, setShowAddProp] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '', description: '', assignedTo: '', propertyId: '',
    priority: 'medium' as Task['priority'], dueDate: '', status: 'pending' as Task['status']
  });
  const [newProp, setNewProp] = useState({
    titleAr: '', title: '', type: 'apartment' as Property['type'],
    status: 'for-sale' as Property['status'], price: '', area: '',
    bedrooms: '', bathrooms: '', location: '', address: '',
    description: '', descriptionAr: '', image: '', featured: false,
    paymentCash: true, paymentInstallment: false,
    downPayment: '', installmentMonths: '', monthlyPayment: ''
  });

  if (!currentUser || currentUser.role !== 'super-admin') {
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
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'super-admin');
  const normalUsers = users.filter(u => u.role === 'user');

  const TABS: { key: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'overview', label: 'الرئيسية', icon: <LayoutDashboard size={15} /> },
    { key: 'properties', label: 'العقارات', icon: <Building2 size={15} /> },
    { key: 'tasks', label: 'المهام', icon: <ListTodo size={15} />, badge: pendingTasks },
    { key: 'requests', label: 'الطلبات', icon: <FileText size={15} />, badge: pendingRequests },
    { key: 'admins', label: 'الأدمن', icon: <Users size={15} /> },
    { key: 'users', label: 'العملاء', icon: <Users size={15} /> },
    { key: 'messages', label: 'الرسائل', icon: <MessageSquare size={15} />, badge: unreadMessages },
    { key: 'analytics', label: 'التحليلات', icon: <BarChart3 size={15} /> },
  ];

  const handleAddTask = () => {
    if (!newTask.title || !newTask.assignedTo) return;
    addTask({
      ...newTask,
      assignedBy: currentUser.id,
      status: 'pending',
    });
    setShowAddTask(false);
    setNewTask({
      title: '', description: '', assignedTo: '', propertyId: '',
      priority: 'medium', dueDate: '', status: 'pending'
    });
  };

  const handleAddProperty = () => {
    const paymentOptions = [];
    if (newProp.paymentCash) {
      paymentOptions.push({ type: 'cash' as const });
    }
    if (newProp.paymentInstallment && newProp.downPayment && newProp.installmentMonths) {
      paymentOptions.push({
        type: 'installment' as const,
        downPayment: Number(newProp.downPayment),
        installmentMonths: Number(newProp.installmentMonths),
        monthlyPayment: Number(newProp.monthlyPayment)
      });
    }

    addProperty({
      ...newProp,
      price: Number(newProp.price),
      area: Number(newProp.area),
      bedrooms: Number(newProp.bedrooms),
      bathrooms: Number(newProp.bathrooms),
      images: [newProp.image],
      sellerId: currentUser.id,
      adminId: currentUser.id,
      paymentOptions,
    });
    setShowAddProp(false);
    setNewProp({
      titleAr: '', title: '', type: 'apartment', status: 'for-sale',
      price: '', area: '', bedrooms: '', bathrooms: '', location: '',
      address: '', description: '', descriptionAr: '', image: '', featured: false,
      paymentCash: true, paymentInstallment: false,
      downPayment: '', installmentMonths: '', monthlyPayment: ''
    });
  };

  const getAdminName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'غير معروف';
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#0A0A0A]">لوحة السوبر أدمن</h1>
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white px-3 py-1 rounded-xl text-xs font-bold">
                Super Admin
              </span>
            </div>
            <p className="text-gray-500 text-sm">مرحباً، {currentUser.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="w-9 h-9 bg-white border border-purple-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-[#7C3AED] transition-colors shadow-sm">
                <Bell size={16} />
              </button>
              {(pendingRequests > 0 || unreadMessages > 0 || pendingTasks > 0) && (
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingRequests + unreadMessages + pendingTasks}
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
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'إجمالي العقارات', value: properties.length, icon: <Building2 size={18} />, color: 'from-[#7C3AED] to-[#9333EA]', change: '+12%' },
                { label: 'إجمالي الطلبات', value: requests.length, icon: <FileText size={18} />, color: 'from-[#0A0A0A] to-[#1A1A2E]', change: '+8%' },
                { label: 'المهام النشطة', value: pendingTasks, icon: <ListTodo size={18} />, color: 'from-[#7C3AED] to-[#4C1D95]', change: '' },
                { label: 'الأدمن', value: adminUsers.length, icon: <Users size={18} />, color: 'from-[#0A0A0A] to-[#1A1A2E]', change: '' },
                { label: 'رسائل جديدة', value: unreadMessages, icon: <MessageSquare size={18} />, color: 'from-[#7C3AED] to-[#9333EA]', change: '' },
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
                <h3 className="font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#7C3AED]" />
                  المبيعات والإيجار (٢٠٢٤)
                </h3>
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

            {/* Price Trends */}
            <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
              <h3 className="font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-[#7C3AED]" />
                اتجاهات الأسعار في السوق
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={CHARTS_DATA.pricesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F0FF" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="السعر" stroke="#7C3AED" strokeWidth={3} dot={{ fill: '#7C3AED', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-xl p-3">
                  <div className="text-xs text-gray-600 mb-1">متوسط السعر</div>
                  <div className="text-lg font-black text-[#7C3AED]">3.5 مليون</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <div className="text-xs text-gray-600 mb-1">نمو السوق</div>
                  <div className="text-lg font-black text-green-600 flex items-center gap-1">
                    <TrendingUp size={16} />
                    +15.6%
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="text-xs text-gray-600 mb-1">الطلب</div>
                  <div className="text-lg font-black text-blue-600">مرتفع</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <button
                onClick={() => setShowAddProp(true)}
                className="bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white rounded-2xl p-6 flex items-center justify-between hover:shadow-xl transition-all"
              >
                <div className="text-right">
                  <div className="font-bold mb-1">إضافة عقار جديد</div>
                  <div className="text-xs opacity-90">أضف عقار للموقع</div>
                </div>
                <Plus size={24} />
              </button>
              <button
                onClick={() => setShowAddTask(true)}
                className="bg-gradient-to-r from-[#0A0A0A] to-[#1A1A2E] text-white rounded-2xl p-6 flex items-center justify-between hover:shadow-xl transition-all"
              >
                <div className="text-right">
                  <div className="font-bold mb-1">إضافة مهمة جديدة</div>
                  <div className="text-xs opacity-90">وزع مهمة على أدمن</div>
                </div>
                <Target size={24} />
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className="bg-gradient-to-r from-[#A855F7] to-[#7C3AED] text-white rounded-2xl p-6 flex items-center justify-between hover:shadow-xl transition-all"
              >
                <div className="text-right">
                  <div className="font-bold mb-1">إدارة الأدمن</div>
                  <div className="text-xs opacity-90">عرض وتعديل الأدمن</div>
                </div>
                <Settings size={24} />
              </button>
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

            {/* Properties Table */}
            <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-purple-50 text-right">
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">العقار</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">كود الإعلان</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">المسؤول</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">النوع</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">الحالة</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">السعر</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">خيارات الدفع</th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-600">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {properties
                      .filter(p => !searchQ || p.titleAr.includes(searchQ) || p.location.includes(searchQ) || p.adCode?.includes(searchQ))
                      .map(prop => (
                        <tr key={prop.id} className="hover:bg-purple-50/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={prop.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              <div>
                                <div className="text-sm font-medium text-[#0A0A0A] line-clamp-1">{prop.titleAr}</div>
                                {prop.featured && <span className="text-xs bg-purple-100 text-[#7C3AED] px-1.5 py-0.5 rounded flex items-center gap-1 w-fit mt-0.5"><Star size={10} /> مميز</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{prop.adCode}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{getAdminName(prop.adminId || '')}</td>
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
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {prop.paymentOptions?.map((opt, i) => (
                                <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${
                                  opt.type === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {opt.type === 'cash' ? 'نقدي' : 'تقسيط'}
                                </span>
                              ))}
                            </div>
                          </td>
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
                                <Star size={13} />
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

        {/* TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#0A0A0A]">المهام ({tasks.length})</h3>
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md"
              >
                <Plus size={15} />
                إضافة مهمة
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map(task => {
                const assignedUser = users.find(u => u.id === task.assignedTo);
                const assignedByUser = users.find(u => u.id === task.assignedBy);
                const property = properties.find(p => p.id === task.propertyId);

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {task.priority === 'high' ? 'عاجل' : task.priority === 'medium' ? 'متوسط' : 'عادي'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                            task.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.status === 'pending' ? 'قيد الانتظار' : task.status === 'in-progress' ? 'جاري العمل' : 'مكتمل'}
                          </span>
                        </div>
                        <h4 className="font-bold text-[#0A0A0A] mb-1">{task.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            <span>لـ {assignedUser?.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            <span>من {assignedByUser?.name}</span>
                          </div>
                          {property && (
                            <div className="flex items-center gap-1">
                              <Building2 size={12} />
                              <span>{property.titleAr}</span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{task.dueDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {task.status === 'pending' && (
                          <button
                            onClick={() => updateTask(task.id, { status: 'in-progress' })}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                          >
                            بدء العمل
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => updateTask(task.id, { status: 'completed' })}
                            className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors flex items-center gap-1"
                          >
                            <CheckSquare size={12} />
                            إكمال
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {tasks.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border border-purple-100">
                  <ListTodo size={36} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">لا توجد مهام</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADMINS */}
        {activeTab === 'admins' && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-purple-50">
              <h3 className="font-bold text-[#0A0A0A]">الأدمن ({adminUsers.length})</h3>
            </div>
            <div className="divide-y divide-purple-50">
              {adminUsers.map(user => {
                const userTasks = tasks.filter(t => t.assignedTo === user.id);
                const userProperties = properties.filter(p => p.adminId === user.id);

                return (
                  <div key={user.id} className="p-4 hover:bg-purple-50/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                          user.role === 'super-admin' ? 'bg-gradient-to-br from-[#7C3AED] to-[#4C1D95]' : 'bg-[#0A0A0A]'
                        }`}>
                          {user.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-[#0A0A0A] text-sm flex items-center gap-2">
                            {user.name}
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              user.role === 'super-admin' ? 'bg-purple-100 text-[#7C3AED]' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.role === 'super-admin' ? 'سوبر أدمن' : 'أدمن'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          <div className="flex gap-3 mt-2">
                            <div className="bg-purple-50 px-2 py-1 rounded text-xs text-[#7C3AED]">
                              {userProperties.length} عقار
                            </div>
                            <div className="bg-blue-50 px-2 py-1 rounded text-xs text-blue-600">
                              {userTasks.length} مهمة
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span dir="ltr">{user.phone}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Task Modal */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={e => e.target === e.currentTarget && setShowAddTask(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl p-6 w-full max-w-2xl"
                dir="rtl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-[#0A0A0A]">إضافة مهمة جديدة</h3>
                  <button onClick={() => setShowAddTask(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">عنوان المهمة</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="مراجعة عقار..."
                      className="w-full bg-purple-50 rounded-xl px-3 py-2 text-sm outline-none border border-purple-100 focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">الوصف</label>
                    <textarea
                      value={newTask.description}
                      onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="تفاصيل المهمة..."
                      className="w-full bg-purple-50 rounded-xl px-3 py-2 text-sm outline-none border border-purple-100 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">تكليف لـ</label>
                      <select
                        value={newTask.assignedTo}
                        onChange={e => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                        className="w-full bg-purple-50 rounded-xl px-3 py-2 text-sm outline-none border border-purple-100"
                      >
                        <option value="">اختر أدمن</option>
                        {adminUsers.filter(u => u.id !== currentUser.id).map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">الأولوية</label>
                      <select
                        value={newTask.priority}
                        onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                        className="w-full bg-purple-50 rounded-xl px-3 py-2 text-sm outline-none border border-purple-100"
                      >
                        <option value="low">عادي</option>
                        <option value="medium">متوسط</option>
                        <option value="high">عاجل</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">العقار (اختياري)</label>
                      <select
                        value={newTask.propertyId}
                        onChange={e => setNewTask(prev => ({ ...prev, propertyId: e.target.value }))}
                        className="w-full bg-purple-50 rounded-xl px-3 py-2 text-sm outline-none border border-purple-100"
                      >
                        <option value="">بدون عقار</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{p.titleAr}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">موعد الانتهاء</label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={e => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full bg-purple-50 rounded-xl px-3 py-2 text-sm outline-none border border-purple-100"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddTask}
                    className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-2.5 rounded-xl text-sm font-bold"
                  >
                    إضافة المهمة
                  </button>
                  <button
                    onClick={() => setShowAddTask(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500"
                  >
                    إلغاء
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
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

                  {/* Payment Options */}
                  <div className="sm:col-span-2 border-t border-purple-100 pt-3 mt-2">
                    <label className="text-sm font-bold text-[#0A0A0A] mb-2 block">خيارات الدفع</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newProp.paymentCash}
                          onChange={e => setNewProp(prev => ({ ...prev, paymentCash: e.target.checked }))}
                          className="accent-[#7C3AED]"
                        />
                        <label className="text-sm text-gray-600">الدفع نقدي</label>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={newProp.paymentInstallment}
                            onChange={e => setNewProp(prev => ({ ...prev, paymentInstallment: e.target.checked }))}
                            className="accent-[#7C3AED]"
                          />
                          <label className="text-sm text-gray-600">الدفع بالتقسيط</label>
                        </div>
                        {newProp.paymentInstallment && (
                          <div className="grid grid-cols-3 gap-2 mr-6">
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">المقدم</label>
                              <input
                                type="number"
                                value={newProp.downPayment}
                                onChange={e => setNewProp(prev => ({ ...prev, downPayment: e.target.value }))}
                                placeholder="700000"
                                className="w-full bg-purple-50 rounded-lg px-2 py-1.5 text-sm outline-none border border-purple-100"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">عدد الأشهر</label>
                              <input
                                type="number"
                                value={newProp.installmentMonths}
                                onChange={e => setNewProp(prev => ({ ...prev, installmentMonths: e.target.value }))}
                                placeholder="48"
                                className="w-full bg-purple-50 rounded-lg px-2 py-1.5 text-sm outline-none border border-purple-100"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">القسط الشهري</label>
                              <input
                                type="number"
                                value={newProp.monthlyPayment}
                                onChange={e => setNewProp(prev => ({ ...prev, monthlyPayment: e.target.value }))}
                                placeholder="58333"
                                className="w-full bg-purple-50 rounded-lg px-2 py-1.5 text-sm outline-none border border-purple-100"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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

        {/* الباقي من الأقسام (REQUESTS, USERS, MESSAGES, ANALYTICS) يمكن إضافتها لاحقاً */}
        {activeTab === 'requests' && (
          <div className="text-center py-12 text-gray-500">قسم الطلبات (يمكن استخدام نفس كود AdminDashboard)</div>
        )}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-purple-50">
              <h3 className="font-bold text-[#0A0A0A]">العملاء ({normalUsers.length})</h3>
            </div>
            <div className="divide-y divide-purple-50">
              {normalUsers.map(user => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-purple-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0A0A0A] rounded-xl flex items-center justify-center text-white text-sm font-bold">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-[#0A0A0A] text-sm">{user.name}</div>
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
        {activeTab === 'messages' && (
          <div className="text-center py-12 text-gray-500">قسم الرسائل (يمكن استخدام نفس كود AdminDashboard)</div>
        )}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <h3 className="font-bold text-[#0A0A0A] mb-4">تحليلات الأداء الشاملة</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">معدل التحويل</div>
                  <div className="text-2xl font-black text-[#7C3AED]">24%</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">رضا العملاء</div>
                  <div className="text-2xl font-black text-green-600">4.8/5</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">متوسط وقت الاستجابة</div>
                  <div className="text-2xl font-black text-blue-600">2.5 ساعة</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">إجمالي المبيعات</div>
                  <div className="text-2xl font-black text-[#0A0A0A]">45 مليون</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
