import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, X, Building2 } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { useApp } from '../context/AppContext';
import { PropertyType, PropertyStatus } from '../data/mockData';

const PROPERTY_TYPES: { value: PropertyType | 'all'; label: string }[] = [
  { value: 'all', label: 'كل الأنواع' },
  { value: 'apartment', label: 'شقة' },
  { value: 'villa', label: 'فيلا' },
  { value: 'duplex', label: 'دوبلكس' },
  { value: 'office', label: 'مكتب' },
  { value: 'chalet', label: 'شاليه' },
];

const STATUS_OPTIONS: { value: PropertyStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'for-sale', label: 'للبيع' },
  { value: 'for-rent', label: 'للإيجار' },
];

const LOCATIONS = ['الكل', 'سيدي جابر', 'سموحة', 'ستانلي', 'جليم', 'المندرة', 'ميامي', 'كليوباترا', 'العجمي'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price-asc', label: 'السعر: الأقل' },
  { value: 'price-desc', label: 'السعر: الأعلى' },
  { value: 'area-desc', label: 'المساحة: الأكبر' },
];

export function Properties() {
  const { properties } = useApp();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState<PropertyType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<PropertyStatus | 'all'>(
    (searchParams.get('status') as PropertyStatus) || 'all'
  );
  const [selectedLocation, setSelectedLocation] = useState('الكل');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    if (q) setSearchQuery(q);
    if (status) setSelectedStatus(status as PropertyStatus);
    if (type) setSelectedType(type as PropertyType);
  }, [searchParams]);

  const filtered = properties
    .filter(p => {
      const matchesQuery = !searchQuery ||
        p.titleAr.includes(searchQuery) ||
        p.location.includes(searchQuery) ||
        p.address.includes(searchQuery);
      const matchesType = selectedType === 'all' || p.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
      const matchesLocation = selectedLocation === 'الكل' || p.location.includes(selectedLocation);
      const matchesMin = !minPrice || p.price >= Number(minPrice);
      const matchesMax = !maxPrice || p.price <= Number(maxPrice);
      return matchesQuery && matchesType && matchesStatus && matchesLocation && matchesMin && matchesMax;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'area-desc') return b.area - a.area;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedLocation('الكل');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedStatus !== 'all' ||
    selectedLocation !== 'الكل' || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-[#F9F5FF] pt-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-purple-300 text-sm mb-1">تصفح</p>
            <h1 className="text-white text-3xl font-black mb-4">جميع العقارات</h1>

            {/* Search */}
            <div className="flex gap-2 max-w-2xl">
              <div className="flex-1 relative">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم أو الموقع..."
                  className="w-full bg-white/95 rounded-xl py-2.5 pr-9 pl-3 text-sm outline-none text-[#0A0A0A] placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  showFilters ? 'bg-white text-[#7C3AED]' : 'bg-white/20 text-white border border-white/30'
                }`}
              >
                <SlidersHorizontal size={16} />
                فلاتر
                {hasActiveFilters && <span className="w-2 h-2 bg-red-400 rounded-full" />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-purple-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#0A0A0A]">خيارات الفلترة</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-red-500 text-sm hover:text-red-600">
                  <X size={14} />
                  مسح الكل
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">نوع العقار</label>
                <div className="flex flex-wrap gap-1">
                  {PROPERTY_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setSelectedType(t.value)}
                      className={`px-3 py-1 rounded-lg text-xs transition-all ${
                        selectedType === t.value
                          ? 'bg-[#7C3AED] text-white'
                          : 'bg-purple-50 text-gray-600 hover:bg-purple-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">الحالة</label>
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setSelectedStatus(s.value)}
                      className={`px-3 py-1 rounded-lg text-xs transition-all ${
                        selectedStatus === s.value
                          ? 'bg-[#0A0A0A] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">المنطقة</label>
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="w-full bg-purple-50 rounded-lg px-3 py-2 text-sm outline-none text-[#0A0A0A] border border-purple-100"
                >
                  {LOCATIONS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">نطاق السعر (جنيه)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="من"
                    className="w-full bg-purple-50 rounded-lg px-3 py-2 text-sm outline-none border border-purple-100"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="إلى"
                    className="w-full bg-purple-50 rounded-lg px-3 py-2 text-sm outline-none border border-purple-100"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[#7C3AED]" />
            <span className="text-sm text-gray-600">
              <span className="font-bold text-[#0A0A0A]">{filtered.length}</span> عقار
            </span>
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-white border border-purple-100 rounded-xl px-3 py-2 text-sm outline-none text-[#0A0A0A]"
          >
            {SORT_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Type Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => setSelectedStatus(s.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedStatus === s.value
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-200'
                  : 'bg-white text-gray-600 border border-purple-100 hover:border-[#7C3AED]'
              }`}
            >
              {s.label}
            </button>
          ))}
          <div className="w-px bg-purple-100 mx-1" />
          {PROPERTY_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedType === t.value
                  ? 'bg-[#0A0A0A] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-purple-100 hover:border-[#0A0A0A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={28} className="text-[#7C3AED]" />
            </div>
            <h3 className="text-[#0A0A0A] font-bold mb-2">لا توجد نتائج</h3>
            <p className="text-gray-500 text-sm mb-4">جرب تعديل معايير البحث</p>
            <button
              onClick={clearFilters}
              className="bg-[#7C3AED] text-white px-6 py-2 rounded-xl text-sm font-medium"
            >
              مسح الفلاتر
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
