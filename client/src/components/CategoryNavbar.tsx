import { WorkspaceCategory } from '../types';
import { Button } from '@/components/ui/button';
import WorkspaceCategoryIcon from './WorkspaceCategoryIcon';

interface CategoryNavbarProps {
  activeCategory: WorkspaceCategory | 'all';
  onCategoryChange: (category: WorkspaceCategory | 'all') => void;
  workspaceCounts: Record<WorkspaceCategory | 'all', number>;
}

const CategoryNavbar = ({ activeCategory, onCategoryChange, workspaceCounts }: CategoryNavbarProps) => {
  const categories = [
    { id: 'all' as const, name: 'Todos', icon: null },
    { id: 'workstation' as const, name: 'Estações', icon: <WorkspaceCategoryIcon category="workstation" className="h-4 w-4" /> },
    { id: 'meeting-room' as const, name: 'Reuniões', icon: <WorkspaceCategoryIcon category="meeting-room" className="h-4 w-4" /> },
    { id: 'training-room' as const, name: 'Treinamentos', icon: <WorkspaceCategoryIcon category="training-room" className="h-4 w-4" /> },
    { id: 'auditorium' as const, name: 'Auditórios', icon: <WorkspaceCategoryIcon category="auditorium" className="h-4 w-4" /> },
  ];

  return (
    <div className="border-b border-border bg-bg-surface">
      <div className="flex space-x-1 p-1">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "ghost"}
            onClick={() => onCategoryChange(category.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-md"
          >
            {category.icon}
            <span className="font-medium">{category.name}</span>
            <span className="text-xs bg-bg-muted px-2 py-1 rounded-full">
              {workspaceCounts[category.id] || 0}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryNavbar;