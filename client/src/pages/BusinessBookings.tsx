
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Calendar, Search, Check, X, Clock, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../components/ui/sidebar';

const mockBookings = [
  {
    id: 'book-001',
    workspaceId: 'ws-001',
    workspaceName: 'Executive Suite',
    locationName: 'The Urban Hub',
    userName: 'João Silva',
    userEmail: 'joao@email.com',
    startTime: new Date(2025, 5, 20, 10, 0),
    endTime: new Date(2025, 5, 20, 12, 0),
    totalPrice: 100,
    status: 'confirmed',
  },
  {
    id: 'book-002',
    workspaceId: 'ws-004',
    workspaceName: 'Creative Studio',
    locationName: 'Creative Commons',
    userName: 'Maria Santos',
    userEmail: 'maria@email.com',
    startTime: new Date(2025, 5, 22, 9, 0),
    endTime: new Date(2025, 5, 22, 13, 0),
    totalPrice: 160,
    status: 'pending',
  },
  {
    id: 'book-003',
    workspaceId: 'ws-006',
    workspaceName: 'Quiet Zone Desk',
    locationName: 'Tech Loft',
    userName: 'Pedro Costa',
    userEmail: 'pedro@email.com',
    startTime: new Date(2025, 5, 15, 13, 0),
    endTime: new Date(2025, 5, 15, 17, 0),
    totalPrice: 80,
    status: 'cancelled',
  },
  {
    id: 'book-004',
    workspaceId: 'ws-002',
    workspaceName: 'Open Desk',
    locationName: 'The Urban Hub',
    userName: 'Ana Oliveira',
    userEmail: 'ana@email.com',
    startTime: new Date(2025, 5, 25, 14, 0),
    endTime: new Date(2025, 5, 25, 18, 0),
    totalPrice: 60,
    status: 'pending',
  },
];


const BusinessBookings = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Redirect if not authenticated or not a business
  if (!isAuthenticated || (user && user.role !== 'business')) {
    navigate('/login');
    return null;
  }

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = 
      booking.workspaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalRevenue = filteredBookings
    .filter(booking => booking.status === 'confirmed')
    .reduce((sum, booking) => sum + booking.totalPrice, 0);

  const pendingBookings = filteredBookings.filter(booking => booking.status === 'pending').length;
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <BusinessSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Reservas</h1>
              <p className="text-gray-600 text-sm">Visualize e gerencie todas as reservas dos seus espaços</p>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reservas Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando confirmação
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredBookings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Este mês
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Confirmada</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R${totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">
                    Reservas confirmadas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar reservas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bookings Table */}
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm || statusFilter !== 'all' ? 'Nenhuma Reserva Encontrada' : 'Nenhuma Reserva'}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Tente ajustar sua busca ou filtros'
                      : 'As reservas dos seus espaços aparecerão aqui'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Reservas</CardTitle>
                  <CardDescription>
                    {filteredBookings.length} reserva(s) encontrada(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Espaço</TableHead>
                          <TableHead>Data e Hora</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map(booking => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="font-medium">{booking.userName}</p>
                                  <p className="text-sm text-gray-500">{booking.userEmail}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{booking.workspaceName}</p>
                                <p className="text-sm text-gray-500">{booking.locationName}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {format(booking.startTime, 'dd/MM/yyyy', { locale: ptBR })}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold">R${booking.totalPrice}</span>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(booking.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {booking.status === 'pending' && (
                                  <>
                                    <Button variant="ghost" size="sm" className="text-green-600">
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600">
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button variant="ghost" size="sm">
                                  Detalhes
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BusinessBookings;
