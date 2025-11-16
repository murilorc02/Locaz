import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar } from '../components/ui/calendar';
import { ArrowLeft, CheckCircle, MapPin, Users } from 'lucide-react';
import { useWorkspaces } from '@/contexts/WorkspacesContext';
import { Workspace, Location, CreateBookingPayload } from '@/types';
import { useLocations } from '@/contexts/LocationsContext';
import defaultImage from '../assets/imgs/bg_header.jpg';
import { TimeSlotSelector } from '@/components/TimeSlotSelector';
import AmenityBadge from '@/components/AmenityBadge';
import { BarLoader } from 'react-spinners';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useBookings } from '@/contexts/BookingsContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ptBR } from 'date-fns/locale';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  price: number;
}

const WorkspaceDetail = () => {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();
  const { getWorkspaceById, isLoading: isWorkspaceContextLoading } = useWorkspaces();
  const { getLocationById, isLoading: isLocationContextLoading } = useLocations();
  const { createBooking } = useBookings();

  const [workspace, setWorkspace] = useState({} as Workspace);
  const [location, setLocation] = useState({} as Location);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');

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

  const handleBookingClick = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para reservar um espaço.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (selectedTimeSlots.length === 0) {
      toast({
        title: "Selecione um horário",
        description: "Escolha pelo menos um horário disponível para prosseguir com a reserva.",
        variant: "destructive",
      });
      return;
    }

    // Build booking payload
    if (!id) {
      toast({
        title: "Erro",
        description: "Workspace não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setIsBookingModalOpen(true);
  }

  const handleConfirmBooking = async () => {
    // Sort selected slots in ascending order and use first and last as start and end times
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.time.localeCompare(b.time));

    // Convert display time (HH:MM) to API format (HH:MM:SS)
    const horarioInicio = sortedSlots[0].time + ':00';
    const horarioFim = sortedSlots[sortedSlots.length - 1].time + ':00';

    const bookingPayload: CreateBookingPayload = {
      salaId: Number(id),
      locatarioId: user.id,
      dataReservada: format(selectedDate, "yyyy-MM-dd"),
      horarioInicio,
      horarioFim,
      valorTotal: selectedTimeSlots.length * workspace.precoHora,
      observacoes: bookingNotes,
    };

    try {
      await createBooking(bookingPayload);
      toast({
        title: "Reserva realizada",
        description: `Reserva criada para ${selectedTimeSlots.length} horário${selectedTimeSlots.length > 1 ? 's' : ''}.`,
      });
      // Optionally, redirect or clear selection
    } catch (err) {
      toast({
        title: "Erro ao reservar",
        description: "Não foi possível criar a reserva. Tente novamente.",
        variant: "destructive",
      });
    }
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
                onBookingClick={handleBookingClick}
              />
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
            <DialogDescription>
              Revise os detalhes da sua reserva antes de confirmar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Workspace Info */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Espaço</h4>
              <p className="font-medium">{workspace.nome}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location.nome} - {location.cidade}, {location.estado}
              </p>
            </div>

            {/* Date and Time Slots */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Data e Horários</h4>
              <p className="text-sm font-medium">
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedTimeSlots.map((slot) => (
                  <span key={slot.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {slot.time}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {selectedTimeSlots.length} horário{selectedTimeSlots.length > 1 ? 's' : ''}
                </span>
                <span className="font-medium">R$ {workspace.precoHora}</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">R$ {selectedTimeSlots.length * workspace.precoHora}</span>
              </div>
            </div>

            {/* Notes Field */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações ou pedidos especiais para sua reserva..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmBooking}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default WorkspaceDetail;
