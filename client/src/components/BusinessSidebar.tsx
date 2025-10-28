
import { NavLink, useLocation } from 'react-router-dom';
import { Building, Home, Users, Calendar, Plus, Info } from 'lucide-react';
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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useEffect } from 'react';

const businessMenuItems = [
  {
    title: 'Visão Geral',
    url: '/business/dashboard',
    icon: Info,
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
  },
];

const quickActions = [
  {
    title: 'Adicionar Local',
    url: '/business/add-location',
    icon: Plus,
  },
  {
    title: 'Adicionar Espaço',
    url: '/business/add-workspace',
    icon: Plus,
  },
];

export function BusinessSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;
  const { isMobile } = useSidebar();

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
            <h2 className="text-lg font-semibold">Locaz</h2>
            <p className="text-sm text-gray-500">Painel Admin</p>
          </div>
        </div>

        {isMobile && (
          <VisuallyHidden>
            <SheetHeader>
              <SheetTitle>Menu Lateral do Painel de Controle</SheetTitle>
              <SheetDescription>
                Navegação principal do painel de controle do locador.
              </SheetDescription>
            </SheetHeader>
          </VisuallyHidden>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuButton asChild className='my-4 mt-0'>
            <NavLink to={'/'} className={'flex gap-2 flex-row items-center'}>
              <Home className='h-4 w-4' />
              <span> Página Inicial </span>
            </NavLink>
          </SidebarMenuButton>
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
              <Button variant="ghost" className="w-full h-auto p-2">
                <div className="flex items-center space-x-3 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.nome} />
                    <AvatarFallback>{user.nome.charAt(1)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">{user.nome}</p>
                    <p className="text-xs text-gray-500">Empresa</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <NavLink to="/profile" className="w-full">Editar Perfil</NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
