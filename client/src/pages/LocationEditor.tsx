import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { amenities } from '../data/amenities';
import AmenityIcon from '../components/AmenityIcon';
import { ArrowLeft, Clock, Save, SearchIcon, Upload, X, Loader2 } from 'lucide-react';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../components/ui/sidebar';
import { useLocations } from '../contexts/LocationsContext';
import WeeklySchedule from '@/components/WeeklySchedule';
import { CreatePredioPayload, HorarioPayload, Location, OpeningHours } from '@/types';
import LocationSelector from '@/components/LocationSelector';

const LocationEditor = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  
  // Determina se é modo de edição ou criação
  const isEditMode = !!id;
  
  const { addLocation, getLocationById, editLocation } = useLocations();

  const getDefaultOpeningDays = () => ({
    segunda: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
    terca: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
    quarta: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
    quinta: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
    sexta: { active: true, timeSlots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }] },
    sabado: { active: false, timeSlots: [] },
    domingo: { active: false, timeSlots: [] }
  });

  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({ state: '', city: '' });
  const [zipCode, setZipCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [schedule, setSchedule] = useState(getDefaultOpeningDays());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  function openingHoursToWeeklySchedule(openingHours: OpeningHours[]) {
    const days = getDefaultOpeningDays();
    if (!Array.isArray(openingHours)) return days;

    Object.keys(days).forEach(key => {
      days[key].active = false;
      days[key].timeSlots = [];
    });

    openingHours.forEach((oh) => {
      const key = oh.diaSemana?.toLowerCase();
      if (key && days[key]) {
        days[key].active = oh.ativo;
        days[key].timeSlots.push({
          start: oh.horarioAbertura,
          end: oh.horarioFechamento
        });
      }
    });

    return days;
  }

  function weeklyScheduleToHorarioPayload(scheduleData: typeof schedule): HorarioPayload[] {
    const payload: HorarioPayload[] = [];

    Object.entries(scheduleData).forEach(([day, dayData]) => {
      if (dayData.active && dayData.timeSlots.length > 0) {
        dayData.timeSlots.forEach(slot => {
          payload.push({
            diaSemana: day,
            horarioAbertura: slot.start,
            horarioFechamento: slot.end,
            ativo: dayData.active
          });
        });
      }
    });

    return payload;
  }

  useEffect(() => {
    const loadLocation = async () => {
      if (isEditMode && id) {
        setIsLoadingLocation(true);
        try {
          const response = await getLocationById(Number(id));
          const locationData = response.data;

          if (locationData.usuario.id !== user?.id) {
            toast({
              title: "Acesso negado",
              description: "Você não tem permissão para editar este local.",
              variant: "destructive"
            });
            navigate('/business/locations');
            return;
          }

          setLocationName(locationData.nome || '');
          setAddress(locationData.endereco || '');
          setLocation({ city: locationData.cidade || '', state: locationData.estado || '' });
          setZipCode(locationData.cep || '');
          setDescription(locationData.descricao || '');
          setImages(locationData.imagens || []);
        //   setSelectedAmenities(locationData.comodidades || []);
          setSchedule(
            locationData.horariosFuncionamento 
              ? openingHoursToWeeklySchedule(locationData.horariosFuncionamento)
              : getDefaultOpeningDays()
          );
        } catch (error) {
          toast({
            title: "Erro ao carregar",
            description: "Não foi possível carregar os dados do local.",
            variant: "destructive"
          });
          navigate('/business/locations');
        } finally {
          setIsLoadingLocation(false);
        }
      }
    };

    loadLocation();
  }, [isEditMode, id]);

  // Redirect if not authenticated or not a business
  useEffect(() => {
    if (!isAuthenticated || (user && user.tipo !== 'locador')) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  if (isLoadingLocation || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleCepLookup = async (cep: string) => {
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
      if (!response.ok) {
        throw new Error('CEP não encontrado ou inválido');
      }

      const data = await response.json();
      setAddress(data.street);
      setLocation({ state: data.state, city: data.city });
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const runCepSearch = () => {
    const cleanCep = zipCode.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      handleCepLookup(cleanCep);
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleImageUpload = () => {
    setImages([...images, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=500']);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ 
        title: "Erro de Autenticação", 
        description: "Usuário não encontrado.", 
        variant: "destructive" 
      });
      return;
    }

    if (!locationName || !address || !location.city || !location.state || !zipCode || !description) {
      toast({
        title: "Informações Incompletas",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const horariosPayload = weeklyScheduleToHorarioPayload(schedule);

    if (horariosPayload.length === 0) {
      toast({
        title: "Horários de funcionamento incompletos",
        description: "Defina o horário de funcionamento para ao menos um dia",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        // Modo de edição
        const updatePayload: Partial<Location> = {
          id: Number(id),
          nome: locationName,
          endereco: address,
          cidade: location.city,
          estado: location.state,
          cep: zipCode,
          descricao: description,
          horariosFuncionamento: horariosPayload.map((h, index) => ({
            ...h,
            id: index, // IDs temporários
            predio: { id: Number(id) }
          })),
          usuario: user
        };

        await editLocation(updatePayload);
        
        toast({
          title: "Local Atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        // Modo de criação
        const createPayload: CreatePredioPayload = {
          nome: locationName,
          endereco: address,
          cidade: location.city,
          estado: location.state,
          cep: zipCode,
          descricao: description,
          horariosFuncionamento: horariosPayload,
          usuarioId: user.id
        };

        await addLocation(createPayload);

        toast({
          title: "Local Adicionado!",
          description: "Seu novo local foi salvo com sucesso.",
        });
      }
      
      navigate('/business/locations');
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: (error as Error).message || "Ocorreu um problema ao salvar o local.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const maskCep = (value: string): string => {
    if (!value) return "";
    const digits = value.replace(/\D/g, '');
    const truncateDigits = digits.slice(0, 8);
    return truncateDigits.replace(/^(\d{5})(\d)/, '$1-$2');
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = maskCep(e.target.value);
    setZipCode(formattedCep);
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
                onClick={() => navigate('/business/locations')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditMode ? 'Editar Local' : 'Adicionar Local'}
                </h1>
                <p className="text-gray-600 text-sm">
                  {isEditMode 
                    ? 'Atualize as informações do local' 
                    : 'Crie um novo local de trabalho'}
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                    <CardDescription>
                      Dados principais do local
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="locationName">Nome do Local</Label>
                      <Input
                        id="locationName"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="Ex: Hub Criativo Centro"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ex: Rua Principal, 123"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className='col-span-2'>
                        <LocationSelector
                          showLabels={true}
                          onLocationChange={setLocation}
                          height='h-10'
                          initialState={location.state}
                          initialCity={location.city}
                        />
                      </div>
                      <div className="space-y-2 col-span-1">
                        <Label htmlFor="zipCode">CEP</Label>
                        <div className='grid grid-cols-4 focus-visible:ring-ring'>
                          <Input
                            id="zipCode"
                            value={zipCode}
                            onChange={handleZipCodeChange}
                            required
                            placeholder='_____-___'
                            className='rounded-r-none col-start-1 col-end-4'
                            maxLength={9}
                          />
                          <Button
                            type='button'
                            className='bg-primary rounded-l-none col-start-4'
                            onClick={runCepSearch}
                          >
                            <SearchIcon className='text-white' />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descreva o local, incluindo o ambiente, localização e características especiais."
                        rows={4}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Amenities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Comodidades e Recursos</CardTitle>
                    <CardDescription>
                      Selecione todas as comodidades disponíveis neste local
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {amenities.map((amenity) => (
                        <div key={amenity.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`amenity-${amenity.id}`}
                            checked={selectedAmenities.includes(amenity.id.toString())}
                            onCheckedChange={() => handleAmenityToggle(amenity.id.toString())}
                          />
                          <Label
                            htmlFor={`amenity-${amenity.id}`}
                            className="flex items-center cursor-pointer"
                          >
                            <AmenityIcon type={amenity.icon} className="mr-2 text-primary" />
                            <div>
                              <span>{amenity.name}</span>
                              {amenity.description && (
                                <p className="text-xs text-gray-500">{amenity.description}</p>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Photos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fotos do Local</CardTitle>
                    <CardDescription>
                      Adicione fotos do local (mínimo 1)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Local ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleImageUpload}
                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors"
                      >
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Adicionar Foto</span>
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                      Para demonstração, uma imagem de exemplo será adicionada ao clicar em "Adicionar Foto"
                    </p>
                  </CardContent>
                </Card>

                {/* Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Horários de Funcionamento
                    </CardTitle>
                    <CardDescription>
                      Configure os dias e horários em que este local está disponível
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WeeklySchedule
                      schedule={schedule}
                      onChange={setSchedule}
                      showTemplates={isEditMode}
                    />
                  </CardContent>
                </Card>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/business/locations')}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditMode ? 'Salvar Alterações' : 'Salvar Local'}
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

export default LocationEditor;