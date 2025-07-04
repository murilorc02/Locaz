import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { getLocation } from '../data/locations';
import { ArrowLeft, Save, Upload, X, Clock, User, MapPin } from 'lucide-react';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../components/ui/sidebar';
import WeeklySchedule from '../components/WeeklySchedule';

type TimeSlot = { start: string; end: string };
type DaySchedule = { active: boolean; timeSlots: TimeSlot[] };
type Schedule = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};
type Owner = { name: string; photo: string; description: string };
type FormData = {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  images: string[];
  schedule: Schedule;
  owner: Owner;
};

const EditLocation = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const location = id ? getLocation(id) : null;
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    images: [] as string[],
    schedule: {
      monday: { active: true, timeSlots: [{ start: '07:00', end: '18:00' }] },
      tuesday: { active: true, timeSlots: [{ start: '07:00', end: '18:00' }] },
      wednesday: { active: true, timeSlots: [{ start: '07:00', end: '18:00' }] },
      thursday: { active: true, timeSlots: [{ start: '07:00', end: '18:00' }] },
      friday: { active: true, timeSlots: [{ start: '07:00', end: '18:00' }] },
      saturday: { active: false, timeSlots: [] },
      sunday: { active: false, timeSlots: [] }
    },
    owner: {
      name: '',
      photo: '',
      description: ''
    }
  });
  
  // Redirect if not authenticated or not a business
  if (!isAuthenticated || (user && user.tipo !== 'locador')) {
    navigate('/login');
    return null;
  }

  if (!location) {
    navigate('/business/locations');
    return null;
  }

  useEffect(() => {
    if (location) {
      setFormData(prev => ({
        ...prev,
        name: location.nomePredio,
        address: location.endereco,
        description: location.descricao ?? '',
        images: location.images || [],
      }));
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updated location data:', formData);
    navigate('/business/locations');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOwnerChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      owner: { ...prev.owner, [field]: value }
    }));
  };

  const addImage = () => {
    const newImage = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80';
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
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
                onClick={() => navigate('/business/locations')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Editar Local</h1>
                <p className="text-gray-600 text-sm">Gerencie as informações do local</p>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Informações Básicas
                    </CardTitle>
                    <CardDescription>
                      Dados principais do local
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Local</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Imagens do Local</CardTitle>
                    <CardDescription>
                      Adicione fotos do local e do prédio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Local ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={addImage}
                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors"
                      >
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Adicionar Imagem</span>
                      </button>
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
                  <CardContent>
                    <WeeklySchedule
                      schedule={formData.schedule}
                      onChange={(schedule) => setFormData(prev => ({ ...prev, schedule }))}
                    />
                  </CardContent>
                </Card>

                {/* Owner Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Informações do Proprietário
                    </CardTitle>
                    <CardDescription>
                      Dados opcionais do responsável pelo local
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Nome do Proprietário</Label>
                      <Input
                        id="ownerName"
                        value={formData.owner.name}
                        onChange={(e) => handleOwnerChange('name', e.target.value)}
                        placeholder="Nome completo (opcional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownerPhoto">Foto do Proprietário</Label>
                      <Input
                        id="ownerPhoto"
                        value={formData.owner.photo}
                        onChange={(e) => handleOwnerChange('photo', e.target.value)}
                        placeholder="URL da foto (opcional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownerDescription">Descrição</Label>
                      <Textarea
                        id="ownerDescription"
                        value={formData.owner.description}
                        onChange={(e) => handleOwnerChange('description', e.target.value)}
                        placeholder="Breve descrição sobre o proprietário (opcional)"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/business/locations')}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
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

export default EditLocation;
