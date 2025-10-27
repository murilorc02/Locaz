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
import { ArrowLeft, Save, Loader2, Clock, Building } from 'lucide-react';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../components/ui/sidebar';
import { useLocations } from '../contexts/LocationsContext';
import { useWorkspaces } from '@/contexts/WorkspacesContext';
import { CreateSalaPayload, WorkspaceCategory, AvailableHours, OpeningHours, HorarioPayload } from '@/types';
import { workspaceAmenities } from '@/data/amenities';
import { useToast } from '@/hooks/use-toast';
import AmenityIcon from '@/components/AmenityIcon';
import WeeklySchedule from '@/components/WeeklySchedule';

const WorkspaceEditor = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Parâmetros da URL
    const { id } = useParams();

    // Determina se é modo de edição ou criação
    const isEditMode = id ? true : false;

    const getDefaultOpeningDays = () => ({
        segunda: { active: false, timeSlots: [] },
        terca: { active: false, timeSlots: [] },
        quarta: { active: false, timeSlots: [] },
        quinta: { active: false, timeSlots: [] },
        sexta: { active: false, timeSlots: [] },
        sabado: { active: false, timeSlots: [] },
        domingo: { active: false, timeSlots: [] }
    });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        capacity: '',
        pricePerHour: 0,
        category: '' as WorkspaceCategory,
        freeSchedule: false,
        schedule: getDefaultOpeningDays(),
        amenities: [] as string[],
        locationId: null,
    });

    const [useLocationSchedule, setUseLocationSchedule] = useState(false);
    const [customScheduleBackup, setCustomScheduleBackup] = useState(getDefaultOpeningDays());

    const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const {
        locations: businessLocations,
        isLoading: isLoadingLocations,
        getLocationById
    } = useLocations();

    const {
        addWorkspace,
        getWorkspaceById,
        editWorkspace,
        fetchWorkspaces
    } = useWorkspaces();

    function scheduleToWeeklySchedule(schedule: OpeningHours[] | AvailableHours[]) {
        const days = getDefaultOpeningDays();
        if (!Array.isArray(schedule)) return days;

        schedule.forEach((item) => {
            const key = item.diaSemana?.toLowerCase();
            if (key && days[key]) {
                days[key].active = item.ativo;
                days[key].timeSlots.push({
                    start: item.horarioAbertura,
                    end: item.horarioFechamento
                });
            }
        });

        return days;
    }

    function weeklyScheduleToHorarioPayload(schedule: typeof formData.schedule) {
        const result: HorarioPayload[] = [];
        Object.entries(schedule).forEach(([diaSemana, day]) => {
            day.timeSlots.forEach(slot => {
                result.push({
                    diaSemana,
                    horarioAbertura: slot.start,
                    horarioFechamento: slot.end,
                    ativo: day.active,
                })
            })
        });
        return result;
    }

    const applyLocationSchedule = async (locationId: number) => {
        if (!locationId) return;

        setIsLoadingSchedule(true);

        try {
            // Primeiro tenta encontrar o location nos dados já carregados
            const cachedLocation = businessLocations.data.find(
                loc => loc.id === Number(locationId)
            );

            let locationSchedule;
            if (cachedLocation?.horariosFuncionamento) {
                // Usa os dados em cache - sem chamada à API!
                locationSchedule = scheduleToWeeklySchedule(cachedLocation.horariosFuncionamento);
            } else {
                // Só busca da API se não tiver em cache
                const response = await getLocationById(Number(locationId));
                const location = response.data;

                if (location.horariosFuncionamento && Array.isArray(location.horariosFuncionamento)) {
                    locationSchedule = scheduleToWeeklySchedule(location.horariosFuncionamento);
                }
            }
            console.log(locationSchedule)

            if (locationSchedule) {
                // Salva o backup dos horários customizados antes de aplicar os do prédio
                setCustomScheduleBackup(formData.schedule);

                setFormData(prev => ({
                    ...prev,
                    schedule: locationSchedule
                }));

                toast({
                    title: "Horários aplicados!",
                    description: cachedLocation
                        ? `Usando horários de funcionamento de "${cachedLocation.nome}".`
                        : "Horários de funcionamento aplicados ao espaço.",
                });
            }
        } catch (error) {
            console.error("Erro ao carregar horários do location:", error);
            toast({
                title: "Aviso",
                description: "Não foi possível carregar os horários do local.",
                variant: "destructive",
            });
        } finally {
            setIsLoadingSchedule(false);
        }

    };

    const handleUseLocationScheduleToggle = async (checked: boolean) => {
        setUseLocationSchedule(checked);

        if (checked) {
            // Ativa: Aplica horários do prédio
            if (formData.locationId) {
                await applyLocationSchedule(formData.locationId);
            } else {
                toast({
                    title: "Atenção",
                    description: "Selecione um local primeiro.",
                    variant: "destructive",
                });
                setUseLocationSchedule(false);
            }
        } else {
            // Desativa: Restaura horários customizados do backup
            setFormData(prev => ({
                ...prev,
                schedule: customScheduleBackup
            }));

            toast({
                title: "Horários restaurados",
                description: "Voltando aos horários personalizados.",
            });
        }
    };

    // Carrega dados do workspace se estiver em modo de edição
    useEffect(() => {
        const loadWorkspace = async () => {
            if (isEditMode && id) {
                setIsLoadingWorkspace(true);
                try {
                    const response = await getWorkspaceById(id);
                    const workspace = response.data;

                    const workspaceSchedule = workspace.horariosFuncionamento
                        ? scheduleToWeeklySchedule(workspace.horariosFuncionamento)
                        : getDefaultOpeningDays();

                    setFormData({
                        name: workspace.nome || '',
                        description: workspace.descricao || '',
                        capacity: workspace.capacidade?.toString() || null,
                        pricePerHour: workspace.precoHora || null,
                        category: workspace.categoria || null,
                        freeSchedule: workspace.reservaGratuita || false,
                        schedule: workspaceSchedule || getDefaultOpeningDays(),
                        amenities: workspace.comodidades || [],
                        locationId: workspace.predio?.id.toString() || null,
                    });
                    setCustomScheduleBackup(workspaceSchedule);
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
    }, [isEditMode, id]);

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
            predioId: Number(formData.locationId),
            horariosFuncionamento: weeklyScheduleToHorarioPayload(formData.schedule),
            precoHora: Number(formData.pricePerHour)
        };

        try {
            if (isEditMode) {
                await editWorkspace(Number(id), payload);
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
            setCustomScheduleBackup(getDefaultOpeningDays());
            setUseLocationSchedule(false);

            navigate('/business/workspaces');
        } catch (error) {
            toast({
                title: "Erro",
                description: isEditMode
                    ? "Não foi possível atualizar o espaço."
                    : "Não foi possível criar o espaço.",
                variant: "destructive",
            });
            console.log(error);
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

    const handleLocationChange = (locationId: string) => {
        handleInputChange('locationId', Number(locationId));

        // Se já estava usando horário do prédio, aplica automaticamente para o novo local
        if (useLocationSchedule) {
            applyLocationSchedule(Number(locationId));
        }
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
                        <div className="max-w-3xl space-y-6 mx-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informações do Espaço</CardTitle>
                                        <CardDescription>
                                            {isEditMode
                                                ? 'Atualize os detalhes do espaço de trabalho'
                                                : 'Preencha os detalhes do seu novo espaço de trabalho'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
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
                                                onValueChange={handleLocationChange}
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
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                                    </CardContent>
                                </Card>

                                {/* Weekly Schedule */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Clock className="h-5 w-5 mr-2" />
                                            Horários de Funcionamento
                                        </CardTitle>
                                        <CardDescription>
                                            Configure os dias e horários disponíveis para reserva
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        <div className='flex items-center space-x-2 p-3 bg-muted rounded-lg'>
                                            <Checkbox
                                                id="useLocationSchedule"
                                                checked={useLocationSchedule}
                                                onCheckedChange={handleUseLocationScheduleToggle}
                                                disabled={!formData.locationId}
                                            />
                                            <div className='flex items-center gap-2'>
                                                <Building className='h-4 w-4 text-muted-foreground' />
                                                <Label
                                                    htmlFor='useLocationSchedule'
                                                    className='text-sm cursor-pointer'
                                                >
                                                    Usar horários de funcionamento do prédio
                                                </Label>
                                            </div>
                                        </div>

                                        {!formData.locationId && (
                                            <p className='text-xs text-muted-foreground'>
                                                Selecione um local para habilitar essa opção
                                            </p>
                                        )}

                                        <WeeklySchedule
                                            schedule={formData.schedule}
                                            onChange={(schedule) => {
                                                setFormData(prev => ({ ...prev, schedule }));
                                                if (!useLocationSchedule) {
                                                    setCustomScheduleBackup(schedule);
                                                }
                                            }}
                                            showTemplates={!useLocationSchedule}
                                        />

                                        {useLocationSchedule && (
                                            <p className='text-xs text-amber-600'>
                                                ⚠️ Os horários estão sendo sincronizados com o prédio. Desmarque a opção acima para personalizar.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="flex gap-4">
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
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default WorkspaceEditor;