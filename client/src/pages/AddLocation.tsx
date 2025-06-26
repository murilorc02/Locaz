import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../components/ui/use-toast';
import { amenities } from '../data/amenities';
import AmenityIcon from '../components/AmenityIcon';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../components/ui/sidebar';

const AddLocation = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated or not a business
  if (!isAuthenticated || (user && user.role !== 'business')) {
    navigate('/login');
    return null;
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationName || !address || !city || !state || !zipCode || !description || selectedAmenities.length === 0 || images.length === 0) {
      toast({
        title: "Informações Incompletas",
        description: "Preencha todos os campos e adicione pelo menos uma comodidade e uma imagem",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Local Adicionado",
        description: "Seu local foi adicionado com sucesso.",
      });
      setIsLoading(false);
      navigate('/business/locations');
    }, 1500);
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
                <h1 className="text-2xl font-bold">Adicionar Local</h1>
                <p className="text-gray-600 text-sm">Crie um novo local de trabalho</p>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            <div className="max-w-3xl mx-auto">
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
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input 
                          id="city" 
                          value={city} 
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Ex: São Paulo"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input 
                          id="state" 
                          value={state} 
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Ex: SP"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input 
                          id="zipCode" 
                          value={zipCode} 
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="Ex: 01234-567"
                          required
                        />
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
                            checked={selectedAmenities.includes(amenity.id)}
                            onCheckedChange={() => handleAmenityToggle(amenity.id)}
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
                
                <div className="flex gap-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/business/locations')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Salvando...' : 'Salvar Local'}
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

export default AddLocation;