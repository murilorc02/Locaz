import { Wifi, Coffee, MapPin, Flower2, Building, Store, Armchair, Trees, AirVent } from 'lucide-react';

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
      return <Trees className={className} size={size} color={color || "currentColor"} />;
    case 'store':
      return <Store className={className} size={size} color={color || "currentColor"} />;
    case 'city':
      return <Building className={className} size={size} color={color || "currentColor"} />;
    case 'map-pin':
      return <MapPin className={className} size={size} color={color || "currentColor"} />;
    case 'chair':
      return <Armchair className={className} size={size} color={color || "currentColor"} />;
    case 'flower2':
      return <Flower2 className={className} size={size} color={color || "currentColor"} />;
    case 'air-vent':
      return <AirVent className={className} size={size} color={color || "currentColor"} />;
    default:
      return <MapPin className={className} size={size} color={color || "currentColor"} />;
  }
};

export default AmenityIcon;