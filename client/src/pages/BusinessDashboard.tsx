import { useLocations } from '../contexts/LocationsContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { getWorkspacesByLocation } from '../data/workspaces';
import { Building, Calendar, Clock, MapPin, Plus, TrendingUp, Users } from 'lucide-react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { Skeleton } from '../components/ui/skeleton';
import { useEffect } from 'react';

const BusinessDashboard = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { locations: locations, isLoading: isLocationsLoading, error } = useLocations();
  const navigate = useNavigate();

  useEffect(() => {
    // Só redirecione se a verificação de auth já terminou E o usuário não for um locador autenticado
    if (!isAuthLoading && (!isAuthenticated || user?.tipo !== 'locador')) {
      navigate('/');
    }
  }, [user, isAuthenticated, isAuthLoading, navigate]);

  // Se a autenticação ainda está carregando ou se o usuário não é válido, não renderize nada ainda
  if (isAuthLoading || !isAuthenticated || user?.tipo !== 'locador') {
    return <div>Carregando...</div>; // Ou um componente de spinner
  }

  const totalLocations = locations.length;
  const totalWorkspaces = locations.reduce(
    (acc, location) => acc + (location.salas?.length || 0), 0
  );

  const totalBookings = 45; // Mock data
  const monthlyRevenue = 12500; // Mock data

  const renderContent = () => {
    // Tratamento de erro
    if (error) {
      return <div className="flex justify-center items-center h-full text-red-500"><p>{error}</p></div>;
    }

    if (isLocationsLoading) {
      return (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card><CardHeader><Skeleton className="h-4 w-2/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-2/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-2/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-2/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-12 w-full mt-4" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-12 w-full mt-4" /></CardContent></Card>
          </div>
        </>
      );
    }

    return (
      <>
        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Locais</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLocations}</div>
              <p className="text-xs text-muted-foreground">
                {totalLocations > 0 ? '+2 este mês' : 'Adicione seu primeiro local'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Espaços Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWorkspaces}</div>
              <p className="text-xs text-muted-foreground">
                {totalWorkspaces > 0 ? '+4 este mês' : 'Nenhum espaço cadastrado'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas do Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8% em relação ao mês passado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Locais Recentes</CardTitle>
              <CardDescription>
                Seus locais mais ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {locations.length === 0 ? (
                console.log(locations.length),
                <div className="text-center py-6">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhum local adicionado ainda</p>
                  <Button onClick={() => navigate('/business/add-location')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Local
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {locations.slice(0, 3).map(location => (
                    <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{location.nomePredio}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {location.endereco}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {getWorkspacesByLocation(location.id).length} espaços
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Últimas reservas e atividades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Nova reserva confirmada</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Há 2 horas
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Novo espaço adicionado</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Ontem
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Meta mensal atingida</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      3 dias atrás
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <BusinessSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
              <div>
                <h1 className="text-2xl font-bold">Visão Geral</h1>
                <p className="text-gray-600 text-sm">Resumo das suas atividades</p>
              </div>
              <div className="mt-2 md:mt-0">
                <Button onClick={() => navigate('/business/add-location')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Local
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BusinessDashboard;
