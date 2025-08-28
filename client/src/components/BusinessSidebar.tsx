import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Building, Home, Users, Calendar, BarChart3, Settings, Plus } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '../components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from './UserAvatar';

const businessMenuItems = [
  {
    title: 'Visão Geral',
    url: '/business/dashboard',
    icon: Home,
  },
  {
    title: 'Locais',
    url: '/business/locations',
    icon: Building,
  },
  {
    title: 'Espaços',
    url: '/business/workspaces',
    icon: Users,
  },
  {
    title: 'Reservas',
    url: '/business/bookings',
    icon: Calendar,
  }
];

const quickActions = [
  {
    title: 'Adicionar Local',
    url: '/business/add-location',
    icon: Plus,
  },
];

export function BusinessSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/business/dashboard') {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">WorkHub</h2>
            <p className="text-sm text-gray-500">Painel Admin</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ações Rápidas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-auto w-full items-center justify-start gap-3 rounded-lg px-3 py-2">
                <UserAvatar
                  className="h-9 w-9"
                  src={user.avatar}
                  name={user.name}
                />

                <div className="flex flex-col items-start">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-gray-500">Locador</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem>
                <Link to="/" className="w-full">Página Inicial</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/profile" className="w-full">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                Sair
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}