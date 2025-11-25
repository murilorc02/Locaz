import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Building, MapPin, Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../components/ui/sidebar';
import { useLocations } from '../contexts/LocationsContext';
import { Skeleton } from '../components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

const BusinessLocations = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { locations: businessLocations, isLoading, error, deleteLocation } = useLocations();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationToDelete, setLocationToDelete] = useState<{ id: number; name: string; salas: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated or not a business
  useEffect(() => {
    if (!isAuthenticated || user?.tipo !== 'locador') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Loading states
  if (isLoading || !businessLocations?.data || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  const filteredLocations = businessLocations.data.filter(location =>
    location.usuario.id === user.id &&
    (location.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.endereco.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteLocation = async () => {
    if (!locationToDelete) return;
    if (locationToDelete.salas > 0) {
      toast({
        title:"Erro ao excluir",
        description: "Exclua ou mova as salas pertencentes para excluir esse local.",
        variant: "destructive"
      });
      return;
    } 
    setIsDeleting(true);
    try {
      await deleteLocation(locationToDelete.id);
      toast({
        title: "Espaço excluído!",
        description: `"${locationToDelete.name}" foi removido com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o espaço. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setLocationToDelete(null);
    }
  };

  const renderContent = () => {
    // Tratamento de loading e erro
    if (isLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
        </div>
      );
    }

    if (error) {
      return <div className="text-center py-12 text-red-500">{error}</div>;
    }

    if (filteredLocations.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? 'Nenhum Local Encontrado' : 'Nenhum Local Adicionado'}
            </h3>
            {!searchTerm && (
              <Button onClick={() => navigate('/business/add-location')}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Local
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLocations.map(location => {
          // Contagem de workspaces corrigida
          const workspaceCount = location.salas?.length || 0;
          return (
            <Card key={location.id} className="overflow-hidden flex flex-col">
              <div className="h-40 overflow-hidden bg-gray-200 flex items-center justify-center">
                {/* Placeholder para imagem, já que não vem do backend ainda */}
                <Building className="h-16 w-16 text-gray-400" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {location.nome}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/business/edit-location/${location.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setLocationToDelete({ id: location.id, name: location.nome, salas: location.salas.length })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="flex items-center pt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {location.endereco}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-primary-light text-primary-dark">{workspaceCount} Espaços</Badge>
                    {/* {location.pontosDeDestaque && <Badge variant="secondary">Destaque</Badge>} */}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/location/${location.id}`)}>
                    Visualizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };


  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <BusinessSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-row sm:flex-col md:flex-row justify-between items-center w-full">
              <div>
                <h1 className="text-2xl font-bold">Gerenciar Locais</h1>
                <p className="text-gray-600 text-sm">Visualize e gerencie todos os seus locais</p>
              </div>
              <div>
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
            {renderContent()}
          </main>
        </SidebarInset>
      </div>

      <AlertDialog open={!!locationToDelete} onOpenChange={(open) => !open && setLocationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Tem certeza que deseja excluir o local{' '}
                <span className="font-semibold text-foreground">"{locationToDelete?.name}"</span>?
              </p>
              <p className="text-red-600 font-medium">
                Esta ação não pode ser desfeita e todas as reservas relacionadas serão afetadas.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLocation}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir Espaço'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </SidebarProvider>
  );
};

export default BusinessLocations;