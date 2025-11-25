import { useParams, useNavigate } from 'react-router-dom';
import { getAmenity } from '../data/amenities';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WorkspaceCard from '../components/WorkspaceCard';
import AmenityIcon from '../components/AmenityIcon';
import { Button } from '../components/ui/button';
import { MapPin } from 'lucide-react';
import { useWorkspaces } from '@/contexts/WorkspacesContext';
import { useLocations } from '@/contexts/LocationsContext';
import { LocationApiResponse, Workspace } from '@/types';
import { useEffect, useState } from 'react';

const LocationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLocationById } = useLocations();
  const { workspaces: fetchedWorkspaces, fetchWorkspaces } = useWorkspaces();
  const [location, setLocation] = useState({} as LocationApiResponse);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState([] as Workspace[]);
  
  const findLocation = async () => {
    try{
      const located = await getLocationById(id as unknown as number);
      setLocation(located);
      return;
    } catch (err) {
      throw new Error("Não foi possível encontrar os locais: ", err);
    }
  };

  const findWorkspacesByLocId = async () => {
    try {
      fetchWorkspaces();
      const locatedWorkspaces = fetchedWorkspaces.data.filter(
        (workspace) => workspace.predio.id === id as unknown as number
      );
      setFilteredWorkspaces(locatedWorkspaces);
    } catch (err) {
      throw new Error("Não foi possível encontrar os espaços desse local: ", err);
    }
  }

  useEffect(() => {
    findLocation();
    findWorkspacesByLocId()
  }, [])
  
  if (!location) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Location not found</h1>
            <Button onClick={() => navigate('/search')}>Return to Search</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Location Hero */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={location.data.imagens?.[0]}
            alt={location.data.nome}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white">{location.data.nome}</h1>
            <div className="flex items-center mt-2 text-white/90">
              <MapPin className="h-5 w-5 mr-1" />
              <span>{location.data.endereco}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Location Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">About this location</h2>
            <p className="text-gray-700">{location.data.descricao}</p>
          </div>
          
          {/* Amenities & Features */}
          {/* <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Features & Amenities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {location.data.comodidades.map((amenityId) => {
                const amenity = getAmenity(amenityId);
                return amenity ? (
                  <div key={amenityId} className="flex items-center">
                    <AmenityIcon type={amenity.icon} className="text-primary mr-2" />
                    <div>
                      <span className="font-medium">{amenity.name}</span>
                      {amenity.description && (
                        <p className="text-sm text-gray-500">{amenity.description}</p>
                      )}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div> */}
          
          {/* Available Workspaces */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Available Workspaces</h2>
            {filteredWorkspaces.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredWorkspaces.map(workspace => (
                  <WorkspaceCard key={workspace.id} workspace={workspace} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">No workspaces available</h3>
                <p className="text-gray-500 mb-4">This location currently has no available workspaces.</p>
                <Button onClick={() => navigate('/search')}>Back to Search</Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LocationDetail;
