import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { ArrowLeft, MapPin, Users } from 'lucide-react';
import { useWorkspaces } from '@/contexts/WorkspacesContext';
import { Workspace, Location } from '@/types';
import { useLocations } from '@/contexts/LocationsContext';
import defaultImage from '../assets/imgs/bg_header.jpg';
import { TimeSlotSelector } from '@/components/TimeSlotSelector';
import AmenityBadge from '@/components/AmenityBadge';
import { BarLoader } from 'react-spinners';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  price: number;
}

const WorkspaceDetail = () => {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const { getWorkspaceById, isLoading: isWorkspaceContextLoading } = useWorkspaces();
  const { getLocationById, isLoading: isLocationContextLoading } = useLocations();
  const [workspace, setWorkspace] = useState({} as Workspace);
  const [location, setLocation] = useState({} as Location);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);

  const findWorkspaceData = async (id: number) => {
    setIsPageLoading(true);
    try {
      const locatedWorkspace = await getWorkspaceById(id);
      setWorkspace(locatedWorkspace.data);
      const locatedLocation = await getLocationById(locatedWorkspace.data.predio.id);
      setLocation(locatedLocation.data);
    } catch (err) {
      throw new Error(err)
    } finally {
      setIsPageLoading(false);
    }
  }

  useEffect(() => {
    findWorkspaceData(Number(id));
  }, [id]);

  const handleTimeSlotSelect = (timeSlots: TimeSlot[]) => {
    setSelectedTimeSlots(timeSlots);
  };

  if (isPageLoading || isLocationContextLoading || isWorkspaceContextLoading || !workspace || !location) {
    return (
      <div className='flex justify-center items-center min-h-[100vh]'>
        <div className='flex-col text-center space-y-3'>
          <BarLoader
            color="#1e3a3f"
            height={4}
            loading={isPageLoading}
            speedMultiplier={1}
            width={100}
          />
          <p className='font-semibold'>Carregando</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={workspace.imagens?.[selectedImage] || defaultImage}
                    alt={workspace.nome}
                    className="w-full h-full object-cover"
                  />
                </div>
                {workspace.imagens?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {workspace.imagens.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'
                          }`}
                      >
                        <img
                          src={image}
                          alt={`${workspace.nome} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Workspace Info */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{workspace.nome}</h1>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <Button
                        variant="link"
                        className="p-0 h-auto text-muted-foreground hover:text-primary"
                        onClick={() => navigate(`/location/${location.id}`)}
                      >
                        {location.nome} - {location.cidade}, {location.estado}
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Até {workspace.capacidade} pessoa{workspace.capacidade > 1 && 's'}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{workspace.descricao}</p>

                {/* Amenities */}
                <div>
                  <h3 className="font-semibold mb-3">Comodidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {workspace.comodidades?.map((amenityId) => (
                      <AmenityBadge key={amenityId} amenityId={amenityId} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Reservar Espaço</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">R$ {workspace.precoHora ?? ''}</span>
                      <span className="text-muted-foreground">/hora</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Selection */}
                  <div>
                    <h4 className="font-medium mb-3">Selecione a Data</h4>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && (
                          setSelectedDate(date),
                          setSelectedTimeSlots([])
                        )}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Time Slot Selection */}
              <TimeSlotSelector
                selectedDate={selectedDate}
                pricePerHour={workspace.precoHora ? workspace.precoHora : 0}
                onTimeSlotSelect={handleTimeSlotSelect}
                selectedTimeSlots={selectedTimeSlots}
                workspaceId={id}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WorkspaceDetail;
