
import { Link } from 'react-router-dom';
import { Location } from '../types';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import AmenityBadge from './AmenityBadge';
import defaultImage from '../assets/imgs/bg_header.jpg'

interface LocationCardProps {
  location: Location;
}

const LocationCard = ({ location }: LocationCardProps) => {
  return (
    <Link to={`/location/${location.id}`}>
      <div className="workspace-card overflow-hidden">
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={location.imagens?.[0] || defaultImage}
            alt={location.nome}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white">{location.nome}</h3>
            <div className="flex items-center text-white/90 text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{location.endereco} | {location.cidade}, {location.estado.slice(0,2)} </span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="mt-1 text-gray-600 line-clamp-2">{location.descricao}</p>
          {/* <div className="mt-3 flex flex-wrap gap-2">
            {location.pontosDeDestaque.slice(0, 4).map(amenityId => (
              <AmenityBadge key={amenityId} amenityId={amenityId} showLabel={true} />
            ))}
            {location.pontosDeDestaque.length > 4 && (
              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                +{location.pontosDeDestaque.length - 4} mais
              </Badge>
            )}
          </div> */}
          <div className="mt-4 flex justify-end">
            <span className="text-sm text-primary font-medium hover:underline">Ver Espaços →</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LocationCard;
