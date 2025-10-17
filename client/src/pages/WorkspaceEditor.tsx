import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../components/ui/sidebar';
import { useLocations } from '../contexts/LocationsContext';
import { useWorkspaces } from '@/contexts/WorkspacesContext';
import { CreateSalaPayload, WorkspaceCategory, Workspace } from '@/types';
import { workspaceAmenities } from '@/data/amenities';
import { useToast } from '@/hooks/use-toast';
import AmenityIcon from '@/components/AmenityIcon';

const WorkspaceEditor = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Parâmetros da URL
    const { workspaceId } = useParams();

    // Determina se é modo de edição ou criação
    const isEditMode = !!workspaceId;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        capacity: '',
        pricePerHour: 0,
        category: '' as WorkspaceCategory,
        freeSchedule: false,
        amenities: [] as string[],
        locationId: '',
    });

    const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { locations: businessLocations, isLoading: isLoadingLocations } = useLocations();
    const { addWorkspace, getWorkspaceById, editWorkspace, fetchWorkspaces } = useWorkspaces();

    // Carrega dados do workspace se estiver em modo de edição
    useEffect(() => {
        const loadWorkspace = async () => {
            if (isEditMode && workspaceId) {
                setIsLoadingWorkspace(true);
                try {
                    const response = await getWorkspaceById(Number(workspaceId));
                    const workspace = response.data;

                    setFormData({
                        name: workspace.nome || '',
                        description: workspace.descricao || '',
                        capacity: workspace.capacidade?.toString() || '',
                        pricePerHour: workspace.precoHora || 0,
                        category: workspace.categoria || '' as WorkspaceCategory,
                        freeSchedule: workspace.reservaGratuita || false,
                        amenities: workspace.comodidades || [],
                        locationId: workspace.predio?.id.toString() || null,
                    });
                } catch (error) {
                    toast({
                        title: "Erro",
                        description: "Não foi possível carregar os dados do espaço.",
                        variant: "destructive",
                    });
                    navigate('/business/workspaces');
                } finally {
                    setIsLoadingWorkspace(false);
                }
            }
        };

        loadWorkspace();
    }, [isEditMode, workspaceId]);

    useEffect(() => {
        if (!isAuthenticated || user?.tipo !== 'locador') {
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);

    // Loading states
    if (isLoadingLocations || isLoadingWorkspace || !businessLocations?.data || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const userLocations = businessLocations.data.filter(
        (location) => location.usuario?.id === user?.id
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.locationId) {
            toast({
                title: "Erro",
                description: "Selecione um local para o espaço.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);

        const payload: CreateSalaPayload = {
            nome: formData.name,
            descricao: formData.description,
            capacidade: Number(formData.capacity),
            categoria: formData.category,
            reservaGratuita: formData.freeSchedule,
            comodidades: formData.amenities,
            predioId: formData.locationId.toString(),
            precoHora: formData.pricePerHour
        };

        try {
            if (isEditMode) {
                // Modo de edição
                await editWorkspace({
                    id: Number(workspaceId),
                    ...payload
                });
                await fetchWorkspaces();
                toast({
                    title: "Sucesso!",
                    description: "Espaço atualizado com sucesso.",
                });
            } else {
                // Modo de criação
                await addWorkspace(payload);
                await fetchWorkspaces();
                toast({
                    title: "Sucesso!",
                    description: "Espaço criado com sucesso.",
                });
            }
            navigate('/business/workspaces');
        } catch (error) {
            toast({
                title: "Erro",
                description: isEditMode
                    ? "Não foi possível atualizar o espaço."
                    : "Não foi possível criar o espaço.",
                variant: "destructive",
            });
            console.log(error)
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAmenityToggle = (amenityId: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenityId)
                ? prev.amenities.filter(id => id !== amenityId)
                : [...prev.amenities, amenityId]
        }));
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <BusinessSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/business/workspaces')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {isEditMode ? 'Editar Espaço' : 'Adicionar Espaço'}
                                </h1>
                                <p className="text-gray-600 text-sm">
                                    {isEditMode
                                        ? 'Atualize as informações do espaço'
                                        : 'Crie um novo espaço de trabalho'}
                                </p>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-6">
                        <div className="max-w-3xl mx-auto">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações do Espaço</CardTitle>
                                    <CardDescription>
                                        {isEditMode
                                            ? 'Atualize os detalhes do espaço de trabalho'
                                            : 'Preencha os detalhes do seu novo espaço de trabalho'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nome do Espaço</Label>
                                            <Input
                                                id="name"
                                                placeholder="Ex: Sala de Reunião A"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Descrição</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Descreva as características do espaço..."
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                required
                                                rows={4}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="capacity">Capacidade</Label>
                                                <Input
                                                    id="capacity"
                                                    type="number"
                                                    placeholder="Ex: 8"
                                                    value={formData.capacity}
                                                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                                                    required
                                                    min="1"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="price">Preço por Hora (R$)</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Ex: 50.00"
                                                    disabled={formData.freeSchedule}
                                                    value={formData.pricePerHour}
                                                    onChange={(e) => handleInputChange('pricePerHour', e.target.valueAsNumber)}
                                                    required
                                                    min="0"
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="freeSchedule"
                                                        checked={formData.freeSchedule}
                                                        onCheckedChange={(checked) => {
                                                            handleInputChange('freeSchedule', checked);
                                                            handleInputChange('pricePerHour', 0);
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor="freeSchedule"
                                                        className="text-sm font-normal cursor-pointer"
                                                    >
                                                        Permitir reservas gratuitas
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">Categoria</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(value) => handleInputChange('category', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma categoria" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="meeting-room">Sala de Reunião</SelectItem>
                                                    <SelectItem value="training-room">Sala de Treinamento</SelectItem>
                                                    <SelectItem value="workstation">Estação de Trabalho</SelectItem>
                                                    <SelectItem value="auditorium">Auditório</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location">Local</Label>
                                            <Select
                                                value={formData.locationId?.toString() || ''}
                                                onValueChange={(value) => handleInputChange('locationId', Number(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um local" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {userLocations.map(location => (
                                                        <SelectItem key={location.id} value={location.id.toString()}>
                                                            {location.nome}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Comodidades</Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {workspaceAmenities.map((amenity) => (
                                                    <div key={amenity.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={amenity.id}
                                                            checked={formData.amenities.includes(amenity.id)}
                                                            onCheckedChange={() => handleAmenityToggle(amenity.id)}
                                                        />
                                                        <AmenityIcon type={amenity.icon} />
                                                        <div className="flex flex-col">
                                                            <Label
                                                                htmlFor={amenity.id}
                                                                className="text-sm cursor-pointer"
                                                            >
                                                                {amenity.name}
                                                            </Label>
                                                            <Label className="text-xs font-normal">
                                                                {amenity.description}
                                                            </Label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-6">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => navigate('/business/workspaces')}
                                                disabled={isSaving}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button type="submit" className="flex-1" disabled={isSaving}>
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        {isEditMode ? 'Atualizar Espaço' : 'Salvar Espaço'}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default WorkspaceEditor;