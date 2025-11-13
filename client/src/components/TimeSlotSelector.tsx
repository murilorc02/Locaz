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
  onDateChange?: (newDate: Date) => void;
}

export const TimeSlotSelector = ({
  selectedDate,
  pricePerHour,
  onTimeSlotSelect,
  selectedTimeSlots,
  workspaceId,
  isLoading,
  onDateChange
}: TimeSlotSelectorProps) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { getSchedulesByWorkspaceId } = useWorkspaces();
  const { createBooking } = useBookings();
  const { user } = useAuth();

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [effectiveDate, setEffectiveDate] = useState<Date>(selectedDate);

  // Check if a time slot is in the past (only for today)
  const isSlotInPast = (slot: TimeSlot): boolean => {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const slotDate = slot.id.split('-')[0]; // Extract date from id (yyyy-MM-dd)

    // Only consider past if slot is today AND time is before current hour
    if (slotDate === today) {
      const slotHour = parseInt(slot.time.split(':')[0], 10);
      const currentHour = now.getHours();
      return slotHour < currentHour;
    }

    return false;
  };

  // Mark slots as available based on past/present status and actual availability
  const getAvailableStatus = (slot: TimeSlot): boolean => {
    return slot.available && !isSlotInPast(slot);
  };

  // Load schedules from API and convert opening intervals into hourly slots (inclusive)
  const loadTimeSlots = async (dateToLoad: Date) => {
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
      const selectedDayName = weekdayMap[dateToLoad.getDay()];

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

        // Exclude the closing hour: if space closes at 18h, last selectable slot is 17h
        // inclusive: include hours up to (but excluding) end hour (ex: 09:00-18:00 -> 09,10,...,17)
        for (let h = startHour; h < endHour; h++) {
          const time = `${h.toString().padStart(2, '0')}:00`;
          const id = `${format(dateToLoad, 'yyyy-MM-dd')}-${time}`;
          if (!slotsMap.has(id)) {
            slotsMap.set(id, { id, time, available: Boolean(s.ativo), price: pricePerHour });
          }
        }
      });

      let slots = Array.from(slotsMap.values()).sort((a, b) => a.time.localeCompare(b.time));

      // Filter out past slots for today
      slots = slots.filter(slot => !isSlotInPast(slot));

      // If no valid slots for today, try next day
      if (slots.length === 0 && format(dateToLoad, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
        const nextDay = new Date(dateToLoad);
        nextDay.setDate(nextDay.getDate() + 1);
        setEffectiveDate(nextDay);
        if (onDateChange) onDateChange(nextDay);
        await loadTimeSlots(nextDay);
        return;
      }

      setTimeSlots(slots);
    } catch (err) {
      console.error('Erro ao carregar horários do workspace:', err);
      setTimeSlots([]);
    }
  };

  // Reload when selected date, workspace or price changes
  useEffect(() => {
    setEffectiveDate(selectedDate);
    loadTimeSlots(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, workspaceId, pricePerHour]);

  const getSlotStatus = (slot: TimeSlot) => {
    if (isSlotInPast(slot)) return 'past';
    if (!slot.available) return 'occupied';
    if (selectedTimeSlots.some(s => s.id === slot.id)) return 'selected';
    return 'available';
  };

  // Check if slots are consecutive (no gaps in time)
  const areSlotConsecutive = (slots: TimeSlot[]): boolean => {
    if (slots.length <= 1) return true;

    const sortedSlots = [...slots].sort((a, b) => a.time.localeCompare(b.time));
    
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const currentHour = parseInt(sortedSlots[i].time.split(':')[0], 10);
      const nextHour = parseInt(sortedSlots[i + 1].time.split(':')[0], 10);
      
      // Next slot should be exactly 1 hour after current
      if (nextHour - currentHour !== 1) {
        return false;
      }
    }
    
    return true;
  };

  const handleSlotClick = (slot: TimeSlot) => {
    // Prevent clicking past or unavailable slots
    if (isSlotInPast(slot) || !slot.available) return;

    const isSelected = selectedTimeSlots.some(s => s.id === slot.id);
    let newSelectedSlots;

    if (isSelected) {
      // Remove slot if already selected
      newSelectedSlots = selectedTimeSlots.filter(s => s.id !== slot.id);
    } else {
      // Try to add slot
      const candidateSlots = [...selectedTimeSlots, slot];
      
      // Check if new selection would be consecutive
      if (!areSlotConsecutive(candidateSlots)) {
        toast({
          title: "Horários não consecutivos",
          description: "Você pode selecionar apenas horários consecutivos sem interrupções.",
          variant: "destructive",
        });
        return;
      }

      newSelectedSlots = candidateSlots;
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

    // Build booking payload
    if (!workspaceId) {
      toast({
        title: "Erro",
        description: "Workspace não encontrado.",
        variant: "destructive",
      });
      return;
    }

    // Sort selected slots in ascending order and use first and last as start and end times
    const sortedSlots = [...selectedTimeSlots].sort((a, b) => a.time.localeCompare(b.time));
    
    const bookingPayload: CreateBookingPayload = {
      salaId: Number(workspaceId),
      locatarioId: user.id,
      dataReservada: format(selectedDate, "yyyy-MM-dd"),
      horarioInicio: sortedSlots[0].time,
      horarioFim: sortedSlots[sortedSlots.length - 1].time,
      valorTotal: selectedTimeSlots.length * pricePerHour,
      observacoes: "Reserva via app",
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

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'past': return 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed';
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
          {format(effectiveDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </CardHeader>
      <CardContent>
        {/* Visual Timeline */}
        {!isLoading && timeSlots.length > 0 ? (
          <>
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
                    disabled={isSlotInPast(slot) || !slot.available}
                    onClick={() => handleSlotClick(slot)}
                    className={`h-12 flex flex-col items-center justify-center ${getSlotColor(getSlotStatus(slot))}`}
                  >
                    <span className="font-medium">{slot.time}</span>
                    <span className="text-xs">
                      {isSlotInPast(slot) ? 'Passou' : slot.available ? `R$ ${slot.price}` : 'Ocupado'}
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
                (R$ {selectedTimeSlots.length * pricePerHour})
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