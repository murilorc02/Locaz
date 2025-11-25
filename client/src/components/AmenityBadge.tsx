
import { cn } from '@/lib/utils';
import AmenityIcon from './AmenityIcon';
import { getAmenity } from '../data/amenities';

interface AmenityBadgeProps {
  amenityId: string;
  className?: string;
  showLabel?: boolean;
}

const AmenityBadge = ({ amenityId, className, showLabel = true }: AmenityBadgeProps) => {
  const amenity = getAmenity(amenityId);
  
  if (!amenity) return null;
  
  const getAmenityColor = (id: string) => {
    // Workspace-specific amenity colors
    switch (id) {
      case 'wifi-gratis':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cafe-gratis':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cadeiras-ergonomicas':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'espaco-kids':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'espaco-descompressao':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'ar-condicionado':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'projetor':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'quadro-branco':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'estacionamento':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'copa':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      
      // Location-specific amenity colors  
      case 'park-nearby':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'shopping-nearby':
        return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'city-center':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'central-location':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      
      // Legacy support
      case 'wifi':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'coffee':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'comfortable':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border', getAmenityColor(amenityId), className)}>
      <AmenityIcon type={amenity.icon} className="mr-1" size={14} />
      {showLabel && <span>{amenity.name}</span>}
    </div>
  );
};

export default AmenityBadge;
