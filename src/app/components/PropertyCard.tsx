import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Bed, Bath, Maximize, MapPin, Heart, Eye } from 'lucide-react';
import { Property, formatPrice, getStatusLabel, getTypeLabel } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const { savedProperties, toggleSaveProperty, currentUser } = useApp();
  const isSaved = savedProperties.includes(property.id);

  const statusColors: Record<string, string> = {
    'for-sale': 'bg-[#7C3AED] text-white',
    'for-rent': 'bg-[#0A0A0A] text-white',
    'sold': 'bg-gray-500 text-white',
    'rented': 'bg-gray-500 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-purple-100 transition-all duration-300 group border border-purple-50"
      dir="rtl"
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={property.image}
          alt={property.titleAr}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-bold ${statusColors[property.status]}`}>
          {getStatusLabel(property.status)}
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-medium bg-white/90 text-[#7C3AED]">
          {getTypeLabel(property.type)}
        </div>

        {/* Save Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (currentUser) toggleSaveProperty(property.id);
          }}
          className={`absolute bottom-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isSaved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:text-red-500'
          }`}
        >
          <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
        </button>

        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white/95 text-[#7C3AED] text-sm font-black px-3 py-1 rounded-lg shadow">
            {formatPrice(property.price, property.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-[#0A0A0A] mb-1 line-clamp-1 group-hover:text-[#7C3AED] transition-colors">
          {property.titleAr}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <MapPin size={12} className="text-[#7C3AED]" />
          <span>{property.location}</span>
        </div>

        {/* Details */}
        <div className="flex items-center gap-3 text-gray-600 text-xs border-t border-gray-100 pt-3">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed size={13} className="text-[#7C3AED]" />
              <span>{property.bedrooms} غرف</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Bath size={13} className="text-[#7C3AED]" />
            <span>{property.bathrooms} حمام</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize size={13} className="text-[#7C3AED]" />
            <span>{property.area} م²</span>
          </div>
          <div className="flex-1 flex justify-end">
            <Link
              to={`/properties/${property.id}`}
              className="flex items-center gap-1 text-[#7C3AED] hover:text-[#5B21B6] transition-colors font-medium"
            >
              <Eye size={13} />
              <span>عرض</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
