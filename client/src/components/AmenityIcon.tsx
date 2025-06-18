import { Wifi, Coffee, MapPin, Building, Store, User } from 'lucide-react';

interface AmenityIconProps {
  type: string;
  className?: string;
  size?: number;
  color?: string;
}

const AmenityIcon = ({ type, className, size = 20, color }: AmenityIconProps) => {
  switch (type) {
    case 'wifi':
      return <Wifi className={className} size={size} color={color || "currentColor"} />;
    case 'coffee':
      return <Coffee className={className} size={size} color={color || "currentColor"} />;
    case 'park':
      return <Building className={className} size={size} color={color || "currentColor"} />;
    case 'store':
      return <Store className={className} size={size} color={color || "currentColor"} />;
    case 'city':
      return <Building className={className} size={size} color={color || "currentColor"} />;
    case 'map-pin':
      return <MapPin className={className} size={size} color={color || "currentColor"} />;
    case 'chair':
      return <User className={className} size={size} color={color || "currentColor"} />;
    default:
      return <MapPin className={className} size={size} color={color || "currentColor"} />;
  }
};

export default AmenityIcon;