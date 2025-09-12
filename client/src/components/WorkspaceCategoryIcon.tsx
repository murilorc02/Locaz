import { WorkspaceCategory } from '../types';
import { MonitorSpeaker, Presentation, GraduationCap } from 'lucide-react';

interface WorkspaceCategoryIconProps {
  category: WorkspaceCategory;
  className?: string;
}

const WorkspaceCategoryIcon = ({ category, className = "h-5 w-5" }: WorkspaceCategoryIconProps) => {
  switch (category) {
    case 'workstation':
      return <MonitorSpeaker className={className} />;
    case 'meeting-room':
      return <Presentation className={className} />;
    case 'training-room':
      return <GraduationCap className={className} />;
    default:
      return <MonitorSpeaker className={className} />;
  }
};

export default WorkspaceCategoryIcon;