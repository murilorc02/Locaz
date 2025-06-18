import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { locations } from '../data/locations';
import { getWorkspacesByLocation } from '../data/workspaces';
import { Building, MapPin, Plus } from 'lucide-react';

const BusinessDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // In a real app, this would come from the backend
  const [businessLocations] = useState(
    user && user.role === 'business' 
      ? locations.filter(location => location.businessId === user.id)
      : []
  );
  
  // Redirect if not authenticated or not a business
  if (!isAuthenticated || (user && user.role !== 'business')) {
    navigate('/');
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      
      <Navbar />
      <main className="flex-grow">
        <div className="py-8 dashboard-header">
          <div className="dashboard-header-bg"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold">Painel de Controle</h1>
                <p className="text-gray-600 mt-2">Gerencie suas localizações e espaços de trabalho</p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3">
                {/* <Button onClick={() => navigate('/business/add-location')}>
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Local
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Tabs defaultValue="locations" className="space-y-6">
            <TabsList>
              <TabsTrigger value="locations">Locais</TabsTrigger>
              <TabsTrigger value="workspaces">Espaços</TabsTrigger>
              <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
              {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
            </TabsList>
            
            {/* Locations Tab */}
            <TabsContent value="locations">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold"> Locais </h2>
                <Button variant="outline" onClick={() => navigate('/business/add-location')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Local
                </Button>
              </div>
              
              {businessLocations.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum Local Criado</h3>
                    <p className="text-gray-500 mb-6">
                      Comece adicionando sua primeira localização para espaços de trabalho
                    </p>
                    <Button onClick={() => navigate('/business/add-location')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicione seu Primeiro Local
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {businessLocations.map(location => (
                    <Card key={location.id} className="overflow-hidden">
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={location.images[0]} 
                          alt={location.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle>{location.name}</CardTitle>
                        <CardDescription className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {location.city}, {location.state}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-primary-light text-primary-dark">
                            {getWorkspacesByLocation(location.id).length} Espaços
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/business/edit-location/${location.id}`)}
                          >
                            Gerenciar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Workspaces Tab */}
            <TabsContent value="workspaces">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Meus Espaços</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {businessLocations.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500 mb-4">Você precisa adicionar um local antes de adicionar espaços de trabalho</p>
                        <Button onClick={() => navigate('/business/add-location')}>
                          Adicione seu Primeiro Local
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {businessLocations.map(location => {
                          const locationWorkspaces = getWorkspacesByLocation(location.id);
                          return (
                            <div key={location.id}>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">{location.name}</h3>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/business/add-workspace/${location.id}`)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Novo Espaço
                                </Button>
                              </div>
                              
                              {locationWorkspaces.length === 0 ? (
                                <p className="text-sm text-gray-500">Nenhum espaço adicionado para este local ainda</p>
                              ) : (
                                <div className="rounded-md border overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidade</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {locationWorkspaces.map(workspace => (
                                          <tr key={workspace.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                              {workspace.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {workspace.capacity} pessoas
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              ${workspace.pricePerHour}/hr
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                              <Badge className={workspace.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                                {workspace.available ? "Disponível" : "Indisponível"}
                                              </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                              <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => navigate(`/business/edit-workspace/${workspace.id}`)}
                                              >
                                                Editar
                                              </Button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos de Reserva</CardTitle>
                  <CardDescription>
                    Visualize e gerencie os pedidos de reserva para seus espaços de trabalho
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-12">
                  <p className="text-gray-500 mb-2">Os dados de reserva aparecerão aqui</p>
                  <p className="text-sm text-gray-400">(Demonstração)</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Analytics Tab */}
            {/* <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Business Analytics</CardTitle>
                  <CardDescription>
                    Review performance metrics for your locations
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-12">
                  <p className="text-gray-500 mb-2">Analytics data will appear here</p>
                  <p className="text-sm text-gray-400">(Demo functionality)</p>
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessDashboard;
