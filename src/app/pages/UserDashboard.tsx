import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  LayoutDashboard, Building2, Heart, FileText, Clock, CheckCircle,
  XCircle, AlertCircle, Eye, Trash2, Plus, Phone, MessageCircle, LogOut, User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getRequestStatusLabel, getRequestTypeLabel, formatPrice } from '../data/mockData';

const STATUS_COLORS: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-700',
  'under-review': 'bg-blue-100 text-blue-700',
  'approved': 'bg-green-100 text-green-700',
  'rejected': 'bg-red-100 text-red-700',
  'completed': 'bg-purple-100 text-purple-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'pending': <Clock size={12} />,
  'under-review': <AlertCircle size={12} />,
  'approved': <CheckCircle size={12} />,
  'rejected': <XCircle size={12} />,
  'completed': <CheckCircle size={12} />,
};

export function UserDashboard() {
  const { currentUser, requests, properties, savedProperties, toggleSaveProperty, deleteRequest, logout } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'saved'>('overview');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F9F5FF] flex items-center justify-center pt-20" dir="rtl">
        <div className="text-center">
          <User size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">يجب تسجيل الدخول أولاً</h2>
          <Link to="/login" className="text-[#7C3AED] text-sm font-medium">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'admin') {
    navigate('/admin');
    return null;
  }

  const userRequests = requests.filter(r => r.userId === currentUser.id);
  const savedProps = properties.filter(p => savedProperties.includes(p.id));

  const stats = [
    { label: 'طلباتي', value: userRequests.length, icon: <FileText size={18} />, color: 'from-[#7C3AED] to-[#9333EA]' },
    { label: 'قيد المراجعة', value: userRequests.filter(r => r.status === 'under-review' || r.status === 'pending').length, icon: <Clock size={18} />, color: 'from-[#0A0A0A] to-[#1A1A2E]' },
    { label: 'مكتملة', value: userRequests.filter(r => r.status === 'approved' || r.status === 'completed').length, icon: <CheckCircle size={18} />, color: 'from-[#7C3AED] to-[#4C1D95]' },
    { label: 'المحفوظات', value: savedProps.length, icon: <Heart size={18} />, color: 'from-[#0A0A0A] to-[#1A1A2E]' },
  ];

  const TABS = [
    { key: 'overview', label: 'نظرة عامة', icon: <LayoutDashboard size={16} /> },
    { key: 'requests', label: 'طلباتي', icon: <FileText size={16} /> },
    { key: 'saved', label: 'المحفوظات', icon: <Heart size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F9F5FF] pt-20" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-4"
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
            {currentUser.avatar}
          </div>
          <div className="flex-1 text-center sm:text-right">
            <h1 className="text-white text-xl font-black">{currentUser.name}</h1>
            <p className="text-purple-300 text-sm">{currentUser.email}</p>
            <p className="text-purple-300 text-sm" dir="ltr">{currentUser.phone}</p>
          </div>
          <div className="flex gap-2">
            <a
              href="https://wa.me/201281378331"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-[#25D366] text-white px-3 py-2 rounded-xl text-xs font-medium"
            >
              <MessageCircle size={14} />
              واتساب
            </a>
            <a
              href="tel:+201281378331"
              className="flex items-center gap-1 bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-medium border border-white/30"
            >
              <Phone size={14} />
              اتصل بنا
            </a>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-1 bg-red-500/80 text-white px-3 py-2 rounded-xl text-xs font-medium"
            >
              <LogOut size={14} />
              خروج
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-black text-[#0A0A0A]">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-200'
                  : 'bg-white text-gray-600 border border-purple-100 hover:border-[#7C3AED]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Recent Requests */}
            <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
              <h3 className="font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                <FileText size={16} className="text-[#7C3AED]" />
                آخر الطلبات
              </h3>
              {userRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد طلبات بعد</p>
                  <Link to="/properties" className="text-[#7C3AED] text-sm font-medium mt-2 block">تصفح العقارات</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {userRequests.slice(0, 3).map(req => (
                    <div key={req.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-[#0A0A0A]">{getRequestTypeLabel(req.type)}</span>
                          {req.propertyTitle && (
                            <span className="text-xs text-gray-500">— {req.propertyTitle}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{req.createdAt}</div>
                      </div>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                        {STATUS_ICONS[req.status]}
                        {getRequestStatusLabel(req.status)}
                      </span>
                    </div>
                  ))}
                  {userRequests.length > 3 && (
                    <button
                      onClick={() => setActiveTab('requests')}
                      className="text-[#7C3AED] text-sm font-medium w-full text-center pt-1"
                    >
                      عرض كل الطلبات ({userRequests.length})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
              <h3 className="font-bold text-[#0A0A0A] mb-4">إجراءات سريعة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  to="/properties?status=for-sale"
                  className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-[#7C3AED] rounded-lg flex items-center justify-center text-white">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#0A0A0A]">تصفح للبيع</div>
                    <div className="text-xs text-gray-500">ابحث عن عقارك</div>
                  </div>
                </Link>
                <Link
                  to="/sell"
                  className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-[#0A0A0A] rounded-lg flex items-center justify-center text-white">
                    <Plus size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#0A0A0A]">بيع عقار</div>
                    <div className="text-xs text-gray-500">أضف عقارك</div>
                  </div>
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-[#7C3AED] rounded-lg flex items-center justify-center text-white">
                    <Phone size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#0A0A0A]">تواصل معنا</div>
                    <div className="text-xs text-gray-500">استفسار أو مشكلة</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-purple-50 flex items-center justify-between">
              <h3 className="font-bold text-[#0A0A0A]">جميع طلباتي ({userRequests.length})</h3>
              <Link to="/sell" className="flex items-center gap-1 text-[#7C3AED] text-sm font-medium hover:underline">
                <Plus size={14} />
                إضافة طلب
              </Link>
            </div>
            {userRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">لا توجد طلبات</p>
              </div>
            ) : (
              <div className="divide-y divide-purple-50">
                {userRequests.map(req => (
                  <div key={req.id} className="p-4 hover:bg-purple-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                            req.type === 'buy' ? 'bg-blue-100 text-blue-700' :
                            req.type === 'sell' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {getRequestTypeLabel(req.type)}
                          </span>
                          {req.propertyTitle && (
                            <span className="text-sm font-medium text-[#0A0A0A]">{req.propertyTitle}</span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs mb-2 line-clamp-2">{req.message}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>أُنشئ: {req.createdAt}</span>
                          <span>•</span>
                          <span>تحديث: {req.updatedAt}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                          {STATUS_ICONS[req.status]}
                          {getRequestStatusLabel(req.status)}
                        </span>
                        <div className="flex gap-1">
                          {req.propertyId && (
                            <Link
                              to={`/properties/${req.propertyId}`}
                              className="w-7 h-7 bg-purple-100 hover:bg-purple-200 rounded-lg flex items-center justify-center text-[#7C3AED] transition-colors"
                            >
                              <Eye size={13} />
                            </Link>
                          )}
                          <button
                            onClick={() => deleteRequest(req.id)}
                            className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-400 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            {savedProps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-12 text-center">
                <Heart size={36} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-[#0A0A0A] mb-1">لا توجد عقارات محفوظة</h3>
                <p className="text-gray-500 text-sm mb-4">احفظ العقارات التي تعجبك لمراجعتها لاحقاً</p>
                <Link to="/properties" className="bg-[#7C3AED] text-white px-6 py-2 rounded-xl text-sm font-medium">
                  تصفح العقارات
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedProps.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-purple-100 shadow-sm group">
                    <div className="relative h-44 overflow-hidden">
                      <img src={p.image} alt={p.titleAr} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <button
                        onClick={() => toggleSaveProperty(p.id)}
                        className="absolute top-3 left-3 w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white"
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                      <div className="absolute bottom-3 right-3">
                        <span className="bg-white/95 text-[#7C3AED] text-sm font-black px-3 py-1 rounded-lg">
                          {formatPrice(p.price, p.status)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-[#0A0A0A] text-sm mb-1">{p.titleAr}</h4>
                      <p className="text-gray-500 text-xs mb-3">{p.location}</p>
                      <Link
                        to={`/properties/${p.id}`}
                        className="flex items-center justify-center gap-1 bg-purple-50 hover:bg-purple-100 text-[#7C3AED] py-2 rounded-xl text-xs font-medium transition-colors"
                      >
                        <Eye size={13} />
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
