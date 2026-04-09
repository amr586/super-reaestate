import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, X, Building2, Loader } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { api } from '../lib/api';

const TYPES = ['الكل', 'شقة', 'فيلا', 'مكتب', 'شاليه', 'محل تجاري', 'أرض'];
const PURPOSES = [{ v: 'all', l: 'الكل' }, { v: 'sale', l: 'للبيع' }, { v: 'rent', l: 'للإيجار' }];
const DISTRICTS = ['الكل', 'سيدي جابر', 'سموحة', 'المنتزه', 'العجمي', 'ستانلي', 'المندرة', 'كليوباترا', 'محطة الرمل'];

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    purpose: searchParams.get('purpose') || 'all',
    type: searchParams.get('type') || 'الكل',
    district: searchParams.get('district') || 'الكل',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rooms: searchParams.get('rooms') || '',
    page: 1,
  });

  useEffect(() => {
    loadProperties();
  }, [filters]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const params: any = { page: filters.page, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.purpose !== 'all') params.purpose = filters.purpose;
      if (filters.type !== 'الكل') params.type = filters.type;
      if (filters.district !== 'الكل') params.district = filters.district;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.rooms) params.rooms = filters.rooms;
      const data = await api.getProperties(params);
      setProperties(data.properties || []);
      setTotal(data.total || 0);
    } catch { setProperties([]); }
    finally { setLoading(false); }
  };

  const updateFilter = (key: string, value: any) => {
    setFilters(p => ({ ...p, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', purpose: 'all', type: 'الكل', district: 'الكل', minPrice: '', maxPrice: '', rooms: '', page: 1 });
  };

  const activeFiltersCount = [
    filters.search, filters.purpose !== 'all' ? filters.purpose : '',
    filters.type !== 'الكل' ? filters.type : '',
    filters.district !== 'الكل' ? filters.district : '',
    filters.minPrice, filters.maxPrice, filters.rooms,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-white font-black text-3xl mb-2">تصفح العقارات</motion.h1>
          <p className="text-purple-200">{total} عقار متاح في الإسكندرية</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-48 relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                placeholder="ابحث عن عقار..."
                className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:border-[#7C3AED] transition-all"
              />
            </div>
            <div className="flex gap-2">
              {PURPOSES.map(p => (
                <button key={p.v} onClick={() => updateFilter('purpose', p.v)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filters.purpose === p.v ? 'bg-[#7C3AED] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-purple-50'}`}
                >{p.l}</button>
              ))}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${showFilters ? 'bg-[#7C3AED] text-white' : 'bg-gray-100 text-gray-600 hover:bg-purple-50'}`}
            >
              <SlidersHorizontal size={16} />فلاتر
              {activeFiltersCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFiltersCount}</span>}
            </button>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all">
                <X size={14} />مسح
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">النوع</label>
                    <select value={filters.type} onChange={e => updateFilter('type', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#7C3AED]"
                    >
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">المنطقة</label>
                    <select value={filters.district} onChange={e => updateFilter('district', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#7C3AED]"
                    >
                      {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">السعر من</label>
                    <input type="number" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
                      placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">السعر إلى</label>
                    <input type="number" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
                      placeholder="بلا حد" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#7C3AED]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">عدد الغرف (على الأقل)</label>
                    <select value={filters.rooms} onChange={e => updateFilter('rooms', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#7C3AED]"
                    >
                      <option value="">الكل</option>
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-[#7C3AED] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">جاري تحميل العقارات...</p>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={36} className="text-[#7C3AED]" />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-2">لا توجد عقارات</h3>
            <p className="text-gray-500 text-sm">لم يتم العثور على عقارات تطابق معايير البحث</p>
            <button onClick={clearFilters} className="mt-4 text-[#7C3AED] text-sm font-medium hover:underline">مسح الفلاتر</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
            </div>
            {/* Pagination */}
            {total > 12 && (
              <div className="flex justify-center gap-2 mt-8">
                <button disabled={filters.page === 1} onClick={() => updateFilter('page', filters.page - 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-50 hover:bg-purple-50 transition-all"
                >السابق</button>
                <span className="px-4 py-2 text-sm text-gray-600">صفحة {filters.page} من {Math.ceil(total / 12)}</span>
                <button disabled={filters.page >= Math.ceil(total / 12)} onClick={() => updateFilter('page', filters.page + 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm disabled:opacity-50 hover:bg-purple-50 transition-all"
                >التالي</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
