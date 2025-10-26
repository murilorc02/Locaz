import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Users, Plus, Search, Edit, Trash2, DollarSign, AlertTriangle } from 'lucide-react';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../components/ui/sidebar';
import { useLocations } from '../contexts/LocationsContext';
import { useWorkspaces } from '@/contexts/WorkspacesContext';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const BusinessWorkspaces = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const [workspaceToDelete, setWorkspaceToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { locations: businessLocations, fetchLocations } = useLocations();
  const { workspaces: businessWorkspaces, fetchWorkspaces, deleteWorkspace } = useWorkspaces();

  useEffect(() => {
    const reloadData = async () => {
      if (isAuthenticated && user?.tipo === 'locador') {
        // Recarrega ambos em paralelo
        await Promise.all([
          fetchLocations(),
          fetchWorkspaces()
        ]);
      }
    };

    reloadData();
  }, [isAuthenticated, user, fetchLocations, fetchWorkspaces]);

  // Redirect if not authenticated or not a business
  useEffect(() => {
    if (!isAuthenticated || (user && user.tipo !== 'locador')) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate])

  if (!businessLocations?.data || !businessWorkspaces.data || !user) {
    return <div> Carregando... </div>
  }

  const userLocations = businessLocations.data.filter(
    (location) => location.usuario.id === user.id,
  );

  const userWorkspacesIds = userLocations.flatMap(
    (location) => location.salas.map((sala) => sala.id) || []
  );

  const userWorkspaces = businessWorkspaces.data.filter(
    (workspace) => userWorkspacesIds.includes(workspace.id)
  );

  const filteredWorkspaces = userWorkspaces.filter(workspace => {
    const matchesSearch = workspace.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' ||
      (workspace.predio.id ? workspace.predio.id.toString() === selectedLocation : false);
    return matchesSearch && matchesLocation;
  });

  const getLocationName = (locationId: number | undefined) => {
    if (locationId == null) {
      return 'Local não encontrado';
    }
    const location = userLocations.find(loc => loc.id === locationId);
    return location ? location.nome : 'Local não encontrado';
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;

    setIsDeleting(true);
    try {
      await deleteWorkspace(workspaceToDelete.id);

      toast({
        title: "Espaço excluído!",
        description: `"${workspaceToDelete.name}" foi removido com sucesso.`,
      });

      // Recarrega os dados
      await Promise.all([
        fetchLocations(),
        fetchWorkspaces()
      ]);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o espaço. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setWorkspaceToDelete(null);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <BusinessSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
              <div>
                <h1 className="text-2xl font-bold">Gerenciar Espaços</h1>
                <p className="text-gray-600 text-sm">Visualize e gerencie todos os seus espaços de trabalho</p>
              </div>
              <div className="mt-2 md:mt-0">
                <Button
                  onClick={() => navigate('/business/add-workspace')}
                  disabled={userLocations.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Espaço
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar espaços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por local" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Locais</SelectItem>
                  {userLocations.map(location => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {userLocations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum Local Disponível</h3>
                  <p className="text-gray-500 mb-6">
                    Você precisa adicionar um local antes de criar espaços
                  </p>
                  <Button onClick={() => navigate('/business/add-location')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Local
                  </Button>
                </CardContent>
              </Card>
            ) : filteredWorkspaces.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm || selectedLocation !== 'all' ? 'Nenhum Espaço Encontrado' : 'Nenhum Espaço Adicionado'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || selectedLocation !== 'all'
                      ? 'Tente ajustar sua busca ou filtros'
                      : 'Comece adicionando seu primeiro espaço de trabalho'
                    }
                  </p>
                  {!searchTerm && selectedLocation === 'all' && (
                    <Button onClick={() => navigate('/business/add-workspace')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Espaço
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Espaços de Trabalho</CardTitle>
                  <CardDescription>
                    {filteredWorkspaces.length} espaço(s) encontrado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Local</TableHead>
                          <TableHead>Capacidade</TableHead>
                          <TableHead>Preço/Hora</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWorkspaces.map(workspace => (
                          <TableRow key={workspace.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                {/* <img 
                                  src={workspace.imagens[0]} 
                                  alt={workspace.nome}
                                  className="w-10 h-10 rounded object-cover"
                                /> */}
                                <div>
                                  <p className="font-medium">{workspace.nome}</p>
                                  <p className="text-sm text-gray-500">{workspace.descricao}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getLocationName(workspace.predio.id)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {workspace.capacidade || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                R${workspace.precoHora || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              {/* <Badge 
                                className={workspace.dispo 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                                }
                              >
                                {workspace.available ? "Disponível" : "Indisponível"}
                              </Badge> */}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/business/edit-workspace/${workspace.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => setWorkspaceToDelete({ id: workspace.id, name: workspace.nome })}
                                >
                                  <Trash2 className="h-4 w-4" />
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

      <AlertDialog open={!!workspaceToDelete} onOpenChange={(open) => !open && setWorkspaceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Tem certeza que deseja excluir o espaço{' '}
                <span className="font-semibold text-foreground">"{workspaceToDelete?.name}"</span>?
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
              onClick={handleDeleteWorkspace}
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

export default BusinessWorkspaces;
