import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Save } from 'lucide-react';
import WeeklySchedule from './WeeklySchedule';
import { WorkspaceCategory } from '../types';

interface DaySchedule {
  active: boolean;
  timeSlots: { start: string; end: string; }[];
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

interface DefaultScheduleEditorProps {
  onSave: (category: WorkspaceCategory, schedule: WeeklyScheduleData) => void;
}

const DEFAULT_SCHEDULES: Record<WorkspaceCategory, WeeklyScheduleData> = {
  workstation: {
    monday: { active: true, timeSlots: [{ start: '07:00', end: '11:00' }, { start: '13:00', end: '18:00' }] },
    tuesday: { active: true, timeSlots: [{ start: '07:00', end: '11:00' }, { start: '13:00', end: '18:00' }] },
    wednesday: { active: true, timeSlots: [{ start: '07:00', end: '11:00' }, { start: '13:00', end: '18:00' }] },
    thursday: { active: true, timeSlots: [{ start: '07:00', end: '11:00' }, { start: '13:00', end: '18:00' }] },
    friday: { active: true, timeSlots: [{ start: '07:00', end: '11:00' }, { start: '13:00', end: '18:00' }] },
    saturday: { active: false, timeSlots: [] },
    sunday: { active: false, timeSlots: [] }
  },
  'meeting-room': {
    monday: { active: true, timeSlots: [{ start: '08:00', end: '10:00' }, { start: '10:00', end: '12:00' }, { start: '14:00', end: '16:00' }, { start: '16:00', end: '18:00' }] },
    tuesday: { active: true, timeSlots: [{ start: '08:00', end: '10:00' }, { start: '10:00', end: '12:00' }, { start: '14:00', end: '16:00' }, { start: '16:00', end: '18:00' }] },
    wednesday: { active: true, timeSlots: [{ start: '08:00', end: '10:00' }, { start: '10:00', end: '12:00' }, { start: '14:00', end: '16:00' }, { start: '16:00', end: '18:00' }] },
    thursday: { active: true, timeSlots: [{ start: '08:00', end: '10:00' }, { start: '10:00', end: '12:00' }, { start: '14:00', end: '16:00' }, { start: '16:00', end: '18:00' }] },
    friday: { active: true, timeSlots: [{ start: '08:00', end: '10:00' }, { start: '10:00', end: '12:00' }, { start: '14:00', end: '16:00' }, { start: '16:00', end: '18:00' }] },
    saturday: { active: true, timeSlots: [{ start: '09:00', end: '11:00' }, { start: '14:00', end: '16:00' }] },
    sunday: { active: false, timeSlots: [] }
  },
  'training-room': {
    monday: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
    tuesday: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
    wednesday: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
    thursday: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
    friday: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }] },
    saturday: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }] },
    sunday: { active: false, timeSlots: [] }
  },
  auditorium: {
    monday: { active: true, timeSlots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
    tuesday: { active: true, timeSlots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
    wednesday: { active: true, timeSlots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
    thursday: { active: true, timeSlots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
    friday: { active: true, timeSlots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
    saturday: { active: true, timeSlots: [{ start: '09:00', end: '12:00' }] },
    sunday: { active: false, timeSlots: [] }
  }
};

const CATEGORY_LABELS: Record<WorkspaceCategory, string> = {
  workstation: 'Estações de Trabalho',
  'meeting-room': 'Salas de Reunião',
  'training-room': 'Salas de Treinamento',
  auditorium: 'Auditórios'
};

const DefaultScheduleEditor = ({ onSave }: DefaultScheduleEditorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<WorkspaceCategory>('workstation');
  const [schedule, setSchedule] = useState<WeeklyScheduleData>(DEFAULT_SCHEDULES.workstation);

  const handleCategoryChange = (category: WorkspaceCategory) => {
    setSelectedCategory(category);
    setSchedule(DEFAULT_SCHEDULES[category]);
  };

  const handleSave = () => {
    onSave(selectedCategory, schedule);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Configurar Horários Padrão
        </CardTitle>
        <CardDescription>
          Configure os horários padrão que serão aplicados automaticamente aos novos espaços
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Categoria do Espaço</Label>
          <Select 
            value={selectedCategory} 
            onValueChange={(value) => handleCategoryChange(value as WorkspaceCategory)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">
            Horários para {CATEGORY_LABELS[selectedCategory]}
          </Label>
          <WeeklySchedule
            schedule={schedule}
            onChange={setSchedule}
            showTemplates={false}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configuração
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DefaultScheduleEditor;