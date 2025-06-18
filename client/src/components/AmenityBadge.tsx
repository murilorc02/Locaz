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
      case 'comfortable':
        return 'bg-blue-100 text-blue-600';
      case 'park-nearby':
        return 'bg-green-100 text-amenities-park';
      case 'shopping-nearby':
        return 'bg-blue-100 text-amenities-store';
      case 'city-center':
        return 'bg-pink-100 text-amenities-city';
      case 'central-location':
        return 'bg-indigo-100 text-indigo-600';
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
