import { Link } from 'react-router-dom';
import { Workspace } from '../types';
import { getAmenity } from '../data/amenities';
import { getLocation } from '../data/locations';
import { Badge } from '../components/ui/badge';
import { MapPin } from 'lucide-react';

interface WorkspaceCardProps {
    workspace: Workspace;
}

const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
    const location = getLocation(workspace.locationId.toString());

    return (
        <Link to={`/workspace/${workspace.id}`}>
            <div className="workspace-card overflow-hidden">
                <div className="relative h-48 w-full overflow-hidden">
                    <img
                        src={workspace.images[0]}
                        alt={workspace.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-lg font-semibold text-white">${workspace.pricePerHour}/hr</p>
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg">{workspace.name}</h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{location?.endereco}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{workspace.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {workspace.amenities.slice(0, 3).map(amenityId => {
                            const amenity = getAmenity(amenityId);
                            return amenity ? (
                                <Badge key={amenityId} variant="outline" className="bg-primary-light text-primary-dark">
                                    {amenity.name}
                                </Badge>
                            ) : null;
                        })}
                        {workspace.amenities.length > 3 && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700">
                                +{workspace.amenities.length - 3} more
                            </Badge>
                        )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-medium">Capacity: {workspace.capacity}</span>
                        <span className="text-sm text-primary font-medium hover:underline">View Details →</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default WorkspaceCard;