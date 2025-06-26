import { Link } from 'react-router-dom';
import { Location } from '../types';
import { getAmenity } from '../data/amenities';
import { Badge } from '../components/ui/badge';
import { MapPin } from 'lucide-react';

interface LocationCardProps {
  location: Location;
}

const LocationCard = ({ location }: LocationCardProps) => {
  return (
    <Link to={`/location/${location.id}`}>
      <div className="workspace-card overflow-hidden">
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={location.images?.[0] || 'https://via.placeholder.com/600x400'}
            alt={location.nomePredio}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white">{location.nomePredio}</h3>
            <div className="flex items-center text-white/90 text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{location.endereco}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="mt-1 text-gray-600 line-clamp-2">{location.descricao}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {location.pontosDeDestaque.slice(0, 4).map(amenityId => {
              const amenity = getAmenity(amenityId);
              return amenity ? (
                <Badge key={amenityId} variant="outline" className="bg-primary-light text-primary-dark">
                  {amenity.name}
                </Badge>
              ) : null;
            })}
            {location.pontosDeDestaque.length > 4 && (
              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                +{location.pontosDeDestaque.length - 4} more
              </Badge>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <span className="text-sm text-primary font-medium hover:underline">View Spaces →</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LocationCard;
