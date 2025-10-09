import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Clock } from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  active: boolean;
  timeSlots: TimeSlot[];
}

interface WeeklyScheduleData {
  segunda: DaySchedule;
  terca: DaySchedule;
  quarta: DaySchedule;
  quinta: DaySchedule;
  sexta: DaySchedule;
  sabado: DaySchedule;
  domingo: DaySchedule;
}

interface WeeklyScheduleProps {
  schedule: WeeklyScheduleData;
  onChange: (schedule: WeeklyScheduleData) => void;
  showTemplates?: boolean;
}

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

const SCHEDULE_TEMPLATES = {
  workstation: {
    name: 'Estações de Trabalho',
    description: 'Horário comercial padrão',
    schedule: {
      segunda: { active: true, timeSlots: [{ start: '07:00', end: '11:00' }, { start: '13:00', end: '18:00' }] },
      terca: { active: true, timeSlots: [{ start: '07:00', end: '11:00' }, { start: '13:00', end: '18:00' }] },
      quarta: { active: true, timeSlots: [{ start: '07:00', end: '11:00' }, { start: '13:00', end: '18:00' }] },
      quinta: { active: true, timeSlots: [{ start: '07:00', end: '11:00' }, { start: '13:00', end: '18:00' }] },
      sexta: { active: true, timeSlots: [{ start: '07:00', end: '11:00' }, { start: '13:00', end: '18:00' }] },
      sabado: { active: false, timeSlots: [] },
      domingo: { active: false, timeSlots: [] }
    }
  },
  'meeting-room': {
    name: 'Salas de Reunião',
    description: 'Blocos de 2 horas',
    schedule: {
      segunda: { active: true, timeSlots: [{ start: '08:00', end: '10:00' }, { start: '10:00', end: '12:00' }, { start: '14:00', end: '16:00' }, { start: '16:00', end: '18:00' }] },
      terca: { active: true, timeSlots: [{ start: '08:00', end: '10:00' }, { start: '10:00', end: '12:00' }, { start: '14:00', end: '16:00' }, { start: '16:00', end: '18:00' }] },
      quarta: { active: true, timeSlots: [{ start: '08:00', end: '10:00' }, { start: '10:00', end: '12:00' }, { start: '14:00', end: '16:00' }, { start: '16:00', end: '18:00' }] },
      quinta: { active: true, timeSlots: [{ start: '08:00', end: '10:00' }, { start: '10:00', end: '12:00' }, { start: '14:00', end: '16:00' }, { start: '16:00', end: '18:00' }] },
      sexta: { active: true, timeSlots: [{ start: '08:00', end: '10:00' }, { start: '10:00', end: '12:00' }, { start: '14:00', end: '16:00' }, { start: '16:00', end: '18:00' }] },
      sabado: { active: true, timeSlots: [{ start: '09:00', end: '11:00' }, { start: '14:00', end: '16:00' }] },
      domingo: { active: false, timeSlots: [] }
    }
  },
  'training-room': {
    name: 'Salas de Treinamento',
    description: 'Períodos matutino e vespertino',
    schedule: {
      segunda: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
      terca: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
      quarta: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
      quinta: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
      sexta: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
      sabado: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }] },
      domingo: { active: false, timeSlots: [] }
    }
  }
};

const WeeklySchedule = ({ schedule, onChange, showTemplates = true }: WeeklyScheduleProps) => {
  const [newTimeSlot, setNewTimeSlot] = useState<{ [key: string]: TimeSlot }>({});

  const applyTemplate = (templateKey: keyof typeof SCHEDULE_TEMPLATES) => {
    const template = SCHEDULE_TEMPLATES[templateKey];
    onChange(template.schedule);
  };

  const daysOfWeek = [
    { key: 'segunda', label: 'Segunda-feira' },
    { key: 'terca', label: 'Terça-feira' },
    { key: 'quarta', label: 'Quarta-feira' },
    { key: 'quinta', label: 'Quinta-feira' },
    { key: 'sexta', label: 'Sexta-feira' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
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
      {showTemplates && (
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Templates de Horário
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(SCHEDULE_TEMPLATES).map(([key, template]) => (
              <Button
                key={key}
                type="button"
                variant="outline"
                className="h-auto p-3 flex flex-col items-start"
                onClick={() => applyTemplate(key as keyof typeof SCHEDULE_TEMPLATES)}
              >
                <span className="font-medium text-sm">{template.name}</span>
                <span className="text-xs text-muted-foreground mt-1">{template.description}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {daysOfWeek.map(({ key, label }) => {
        const daySchedule = schedule[key as keyof WeeklyScheduleData] ??{ active: false, timeSlots: [] };
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={currentNewSlot.start}
                    onValueChange={(value) => updateNewTimeSlot(key, 'start', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Início" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">até</span>
                  <Select
                    value={currentNewSlot.end}
                    onValueChange={(value) => updateNewTimeSlot(key, 'end', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Fim" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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