import { cn } from '../lib/utils';
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
    switch (id) {
      case 'wifi':
        return 'bg-purple-100 text-amenities-wifi';
      case 'coffee':
        return 'bg-orange-100 text-amenities-coffee';
      case 'chair':
        return 'bg-blue-100 text-amenities-chair';
      case 'park':
        return 'bg-green-100 text-amenities-park';
      case 'shopping':
        return 'bg-yellow-300 text-amenities-store';
      case 'city-center':
        return 'bg-sky-800 text-amenities-city-center';
      case 'central-location':
        return 'bg-indigo-800 text-amenities-central-location';
      case 'comfort':
        return 'bg-amber-700 text-amenities-comfort';
      case 'air-conditioning':
        return 'bg-cyan-500 text-amenities-air-conditioning';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn('amenity-badge', getAmenityColor(amenityId), className)}>
      <AmenityIcon type={amenity.icon} className="mr-1" size={14} />
      {showLabel && <span>{amenity.name}</span>}
    </div>
  );
};

export default AmenityBadge;
