import { useState } from 'react';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Plus, X } from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  active: boolean;
  timeSlots: TimeSlot[];
}

interface WeeklyScheduleData {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface WeeklyScheduleProps {
  schedule: WeeklyScheduleData;
  onChange: (schedule: WeeklyScheduleData) => void;
}

const WeeklySchedule = ({ schedule, onChange }: WeeklyScheduleProps) => {
  const [newTimeSlot, setNewTimeSlot] = useState<{ [key: string]: TimeSlot }>({});

  const daysOfWeek = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  const handleDayToggle = (day: string, active: boolean) => {
    onChange({
      ...schedule,
      [day]: {
        ...schedule[day as keyof WeeklyScheduleData],
        active
      }
    });
  };

  const addTimeSlot = (day: string) => {
    const slot = newTimeSlot[day];
    if (!slot || !slot.start || !slot.end) return;

    const daySchedule = schedule[day as keyof WeeklyScheduleData];
    onChange({
      ...schedule,
      [day]: {
        ...daySchedule,
        timeSlots: [...daySchedule.timeSlots, slot]
      }
    });

    setNewTimeSlot({
      ...newTimeSlot,
      [day]: { start: '', end: '' }
    });
  };

  const removeTimeSlot = (day: string, index: number) => {
    const daySchedule = schedule[day as keyof WeeklyScheduleData];
    onChange({
      ...schedule,
      [day]: {
        ...daySchedule,
        timeSlots: daySchedule.timeSlots.filter((_, i) => i !== index)
      }
    });
  };

  const updateNewTimeSlot = (day: string, field: 'start' | 'end', value: string) => {
    setNewTimeSlot({
      ...newTimeSlot,
      [day]: {
        ...newTimeSlot[day],
        [field]: value
      }
    });
  };

  const formatTimeSlot = (slot: TimeSlot) => `${slot.start} - ${slot.end}`;

  return (
    <div className="space-y-6">
      {daysOfWeek.map(({ key, label }) => {
        const daySchedule = schedule[key as keyof WeeklyScheduleData];
        const currentNewSlot = newTimeSlot[key] || { start: '', end: '' };

        return (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{label}</Label>
              <Switch
                checked={daySchedule.active}
                onCheckedChange={(checked) => handleDayToggle(key, checked)}
              />
            </div>
            
            {daySchedule.active && (
              <div className="ml-4 space-y-3">
                {/* Existing time slots */}
                <div className="flex flex-wrap gap-2">
                  {daySchedule.timeSlots.map((slot, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs flex items-center gap-1"
                    >
                      {formatTimeSlot(slot)}
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(key, index)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Add new time slot */}
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={currentNewSlot.start}
                    onChange={(e) => updateNewTimeSlot(key, 'start', e.target.value)}
                    className="w-auto"
                  />
                  <span className="text-sm text-gray-500">até</span>
                  <Input
                    type="time"
                    value={currentNewSlot.end}
                    onChange={(e) => updateNewTimeSlot(key, 'end', e.target.value)}
                    className="w-auto"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addTimeSlot(key)}
                    disabled={!currentNewSlot.start || !currentNewSlot.end}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WeeklySchedule;
