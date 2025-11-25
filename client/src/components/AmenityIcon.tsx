
import { Wifi, Coffee, MapPin, Building, Store, User, Sofa, Projector, Baby, Snowflake, Square, Car, Utensils } from 'lucide-react';
import { OfficeChairIcon } from "@phosphor-icons/react";

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
      return <OfficeChairIcon className={className} size={size} color={color || "currentColor"} />;
    case 'sofa':
      return <Sofa className={className} size={size} color={color || "currentColor"} />;
    case 'projector':
      return <Projector className={className} size={size} color={color || "currentColor"} />;
    case 'baby':
      return <Baby className={className} size={size} color={color || "currentColor"} />;
    case 'snowflake':
      return <Snowflake className={className} size={size} color={color || "currentColor"} />;
    case 'square':
      return <Square className={className} size={size} color={color || "currentColor"} />;
    case 'car':
      return <Car className={className} size={size} color={color || "currentColor"} />;
    case 'utensils':
      return <Utensils className={className} size={size} color={color || "currentColor"} />;
    default:
      return <MapPin className={className} size={size} color={color || "currentColor"} />;
  }
};

export default AmenityIcon;
