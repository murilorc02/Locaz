import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWorkspaces } from '@/contexts/WorkspacesContext';
import { CreateBookingPayload } from '@/types';
import { useBookings } from '@/contexts/BookingsContext';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  price: number;
}

interface TimeSlotSelectorProps {
  selectedDate: Date;
  pricePerHour: number;
  onTimeSlotSelect: (timeSlots: TimeSlot[]) => void;
  selectedTimeSlots: TimeSlot[];
  workspaceId?: string;
  isLoading?: boolean;
}

export const TimeSlotSelector = ({
  selectedDate,
  pricePerHour,
  onTimeSlotSelect,
  selectedTimeSlots,
  workspaceId,
  isLoading
}: TimeSlotSelectorProps) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { getSchedulesByWorkspaceId } = useWorkspaces()
  const { createBooking, getBookingsByWorkspaceId } = useBookings()

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Load schedules from API and convert opening intervals into hourly slots (inclusive)
  const loadTimeSlots = async () => {
    try {
      // If no workspaceId provided, use fallback generated slots
      if (!workspaceId) {
        setTimeSlots([]);
        return;
      }

      const resp = await getSchedulesByWorkspaceId(workspaceId);
      // resp may already be the inner data or an envelope ({ data: { horariosFuncionamento } })
      const payload = resp?.data ?? resp;
      const horarios: any[] = payload?.horariosFuncionamento ?? payload?.data?.horariosFuncionamento ?? [];

      // Map JS Date day -> API day string
      const weekdayMap = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
      const selectedDayName = weekdayMap[selectedDate.getDay()];

      // Filter schedules for the selected day and that are active
      const daySchedules = horarios.filter(h => h.diaSemana === selectedDayName && (h.ativo === true || h.ativo === undefined));

      const slotsMap = new Map<string, TimeSlot>();

      daySchedules.forEach(s => {
        const start = (s.horarioAbertura ?? s.horarioAbertura) || '';
        const end = (s.horarioFechamento ?? s.horarioFechamento) || '';
        if (!start || !end) return;

        const startHour = parseInt(start.split(':')[0], 10);
        const endHour = parseInt(end.split(':')[0], 10);
        if (Number.isNaN(startHour) || Number.isNaN(endHour)) return;

        // inclusive: include end hour as requested (ex: 09:00-12:00 -> 09,10,11,12)
        for (let h = startHour; h <= endHour; h++) {
          const time = `${h.toString().padStart(2, '0')}:00`;
          const id = `${format(selectedDate, 'yyyy-MM-dd')}-${time}`;
          if (!slotsMap.has(id)) {
            slotsMap.set(id, { id, time, available: Boolean(s.ativo), price: pricePerHour });
          }
        }
      });

      const slots = Array.from(slotsMap.values()).sort((a, b) => a.time.localeCompare(b.time));

      // if API returned no slots for that day, fallback to generated ones
      if (slots.length === 0) {
        setTimeSlots([]);
      } else {
        setTimeSlots(slots);
      }
    } catch (err) {
      console.error('Erro ao carregar horários do workspace:', err);
      // fallback
      setTimeSlots([]);
    }
  };

  // Reload when selected date, workspace or price changes
  useEffect(() => {
    loadTimeSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, workspaceId, pricePerHour]);

  const getSlotStatus = (slot: TimeSlot) => {
    if (!slot.available) return 'occupied';
    if (selectedTimeSlots.some(s => s.id === slot.id)) return 'selected';
    return 'available';
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return;

    const isSelected = selectedTimeSlots.some(s => s.id === slot.id);
    let newSelectedSlots;

    if (isSelected) {
      // Remove slot if already selected
      newSelectedSlots = selectedTimeSlots.filter(s => s.id !== slot.id);
    } else {
      // Add slot to selection
      newSelectedSlots = [...selectedTimeSlots, slot];
    }

    onTimeSlotSelect(newSelectedSlots);
  };

  const handleBooking = async () => {
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

    // const bookingPayload: CreateBookingPayload = {} as CreateBookingPayload;
    // await createBooking(bookingPayload)

    const totalHours = selectedTimeSlots.length;
    const totalPrice = selectedTimeSlots.reduce((total, slot) => total + slot.price, 0);

    toast({
      title: "Reserva iniciada",
      description: `${totalHours} horário${totalHours > 1 ? 's' : ''} selecionado${totalHours > 1 ? 's' : ''} (R$ ${totalPrice}). Redirecionando para finalizar sua reserva...`,
    });
    // In a real app, this would navigate to booking page with selected time slot
  };

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 text-red-700 border-red-200';
      case 'selected': return 'bg-primary text-white border-primary';
      case 'available': return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Horários Disponíveis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </CardHeader>
      <CardContent>
        {/* Visual Timeline */}
        {!isLoading && timeSlots.length > 0 ? (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Linha do tempo</span>
              </div>
              <div className="relative">
                <>
                  <div className="flex h-8 rounded-lg overflow-hidden border">
                    {timeSlots.map((slot) => {
                      const status = getSlotStatus(slot);
                      return (
                        <div
                          key={slot.id}
                          className={`flex-1 cursor-pointer transition-all ${status === 'occupied'
                            ? 'bg-red-200'
                            : status === 'selected'
                              ? 'bg-primary'
                              : 'bg-green-200 hover:bg-green-300'
                            }`}
                          onClick={() => handleSlotClick(slot)}
                          title={`${slot.time} - ${slot.available ? 'Disponível' : 'Ocupado'}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{timeSlots[0].time}</span>
                    <span>{timeSlots[(timeSlots.length / 2)].time}</span>
                    <span>{timeSlots[(timeSlots.length-1)].time}</span>
                  </div>
                </>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-200 rounded"></div>
                <span className="text-xs text-muted-foreground">Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-200 rounded"></div>
                <span className="text-xs text-muted-foreground">Ocupado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span className="text-xs text-muted-foreground">Selecionado</span>
              </div>
            </div>

            {/* Time Slot Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {timeSlots.map((slot) => {
                const status = getSlotStatus(slot);
                return (
                  <Button
                    key={slot.id}
                    variant="outline"
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => handleSlotClick(slot)}
                    className={`h-12 flex flex-col items-center justify-center ${getSlotColor(status)}`}
                  >
                    <span className="font-medium">{slot.time}</span>
                    <span className="text-xs">
                      {slot.available ? `R$ ${slot.price}` : 'Ocupado'}
                    </span>
                  </Button>
                );
              })}
            </div>
          </>
        ) : (
          <div className='text-foreground/60 w-full text-center justify-center'>
            <p> Nenhum horário disponível na data selecionada. </p>
          </div>
        )}

        {selectedTimeSlots.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {selectedTimeSlots.length === 1 ? 'Horário Selecionado' : 'Horários Selecionados'}

                </p>
                <Badge variant="secondary">
                  R$ {selectedTimeSlots.length * pricePerHour}
                </Badge>
              </div>
              <div className="space-y-1">
                {selectedTimeSlots.map((slot) => (
                  <p key={slot.id} className="text-sm text-muted-foreground">
                    {slot.time} - {format(selectedDate, "dd/MM/yyyy")}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleBooking}
          className="w-full mt-4"
          size="lg"
          disabled={selectedTimeSlots.length === 0}
        >
          {selectedTimeSlots.length > 0 ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Reservar {selectedTimeSlots.length} horário{selectedTimeSlots.length > 1 ? 's' : ''}
              <span className="ml-2 text-sm">
                (R$ {selectedTimeSlots.reduce((total, slot) => total + slot.price, 0)})
              </span>
            </>
          ) : (
            "Selecione um horário"
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mt-2">
            Cancelamento gratuito até 24h antes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}