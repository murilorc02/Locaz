
import { Link } from 'react-router-dom';
import { LocationApiResponse, Workspace } from '../types';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import WorkspaceCategoryIcon from './WorkspaceCategoryIcon';
import AmenityBadge from './AmenityBadge';
import { useEffect, useState } from 'react';
import { useLocations } from '@/contexts/LocationsContext';

interface WorkspaceCardProps {
  workspace: Workspace;
}

const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  const { getLocationById } = useLocations();
  const [location, setLocation] = useState({} as LocationApiResponse);
  
  const getLocation = async () => {
    try {
      const fetchedLocation = await getLocationById(workspace.predio.id);
      setLocation(fetchedLocation)
    } catch (err) {
      throw new Error(err);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <Link to={`/workspace/${workspace.id}`}>
      <div className="workspace-card overflow-hidden">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={workspace.imagens[0]}
            alt={workspace.nome}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-lg font-semibold text-white">R${workspace.precoHora}/hr</p>
          </div>
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
            <WorkspaceCategoryIcon category={workspace.categoria} className="h-4 w-4 text-text-primary" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg">{workspace.nome}</h3>
          <div className="flex items-center text-text-muted text-sm mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location?.data.endereco}</span>
          </div>
          <p className="mt-2 text-sm text-text-muted line-clamp-2">{workspace.descricao}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {workspace.comodidades.slice(0, 3).map(amenityId => (
              <AmenityBadge key={amenityId} amenityId={amenityId} showLabel={true} />
            ))}
            {workspace.comodidades.length > 3 && (
              <Badge variant="outline" className="bg-bg-muted text-text-muted">
                +{workspace.comodidades.length - 3}
              </Badge>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium">Capacidade: {workspace.capacidade}</span>
            <span className="text-sm text-primary font-medium hover:underline">Detalhes →</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WorkspaceCard;
