import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
}

export const TimeSlotSelector = ({
  selectedDate,
  pricePerHour,
  onTimeSlotSelect,
  selectedTimeSlots
}: TimeSlotSelectorProps) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Generate time slots from 7 AM to 7 PM
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 7; hour < 19; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        id: `slot-${hour}`,
        time: timeString,
        available: Math.random() > 0.3, // 70% chance of being available
        price: pricePerHour
      });
    }
    return slots;
  };

  const [timeSlots] = useState<TimeSlot[]>(generateTimeSlots());

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

  const handleBooking = () => {
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
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Linha do tempo (7h às 19h)</span>
          </div>
          <div className="relative">
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
              <span>7h</span>
              <span>13h</span>
              <span>19h</span>
            </div>
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

        {selectedTimeSlots.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {selectedTimeSlots.length === 1 ? 'Horário Selecionado' : 'Horários Selecionados'}

                </p>
                <Badge variant="secondary">
                  R$ {selectedTimeSlots.reduce((total, slot) => total + slot.price, 0)}
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