import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { getWorkspacesByLocation } from '../data/workspaces';
import { Building, MapPin, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../components/ui/sidebar';
import { useLocations } from '../contexts/LocationsContext';

const BusinessLocations = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { locations: businessLocations } = useLocations();
  const [searchTerm, setSearchTerm] = useState('');

  // In a real app, this would come from the backend

  // Redirect if not authenticated or not a business
  if (!isAuthenticated || (user && user.role !== 'business')) {
    navigate('/login');
    return null;
  }

  const filteredLocations = businessLocations.filter(location =>
    location.nomePredio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <BusinessSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
              <div>
                <h1 className="text-2xl font-bold">Gerenciar Locais</h1>
                <p className="text-gray-600 text-sm">Visualize e gerencie todos os seus locais</p>
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
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar locais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {filteredLocations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm ? 'Nenhum Local Encontrado' : 'Nenhum Local Adicionado'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm
                      ? 'Tente ajustar sua busca'
                      : 'Comece adicionando seu primeiro local de trabalho'
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => navigate('/business/add-location')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Local
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredLocations.map(location => {
                  const workspaceCount = getWorkspacesByLocation(location.id).length;
                  return (
                    <Card key={location.id} className="overflow-hidden">
                      <div className="h-40 overflow-hidden">
                        <img
                          src={location.images?.[0] || ''}
                          alt={location.nomePredio}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {location.nomePredio}
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/business/edit-location/${location.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardTitle>
                        <CardDescription className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {location.endereco}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-primary-light text-primary-dark">
                            {workspaceCount} Espaços
                          </Badge>
                          <Badge variant="outline">
                            {location.pontosDeDestaque.length} Comodidades
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {location.descricao}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/location/${location.id}`)}
                          >
                            Visualizar
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/business/edit-location/${location.id}`)}
                          >
                            Gerenciar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BusinessLocations;