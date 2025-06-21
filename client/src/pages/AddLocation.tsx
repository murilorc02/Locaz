import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../components/ui/use-toast';
import { amenities } from '../data/amenities';
import AmenityIcon from '../components/AmenityIcon';
import { useLocations } from '../contexts/LocationsContext';

const AddLocation = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addLocation } = useLocations();

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
    // For demo purposes, we'll add a placeholder image
    setImages([...images, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=500']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName || !address || !city || !state || !zipCode || !description || selectedAmenities.length === 0 ) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields and add at least one amenity and image",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    const fullAdrress = `${address}, ${city}, ${state} - ${zipCode}`;
    const payload = {
      nomePredio: locationName,
      endereco: fullAdrress,
      pontosDeDestaque: selectedAmenities.length > 0
    };

    try {
      await addLocation(payload, user!);

      toast({
        title: "Local Adicionado",
        description: "Sua nova localização foi salva com sucesso"
      });
      navigate('/business/dashboard');
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: (error as Error).message || "Ocorreu um problema.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-primary-light py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">Novo Local</h1>
            <p className="text-gray-600 mt-2">Crie uma nova localização de espaço de trabalho para sua empresa</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="locationName">Nome do Local</Label>
                  <Input 
                    id="locationName" 
                    value={locationName} 
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Downtown Creative Hub"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input 
                    id="address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 123 Main Street"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input 
                      id="city" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. San Francisco"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input 
                      id="state" 
                      value={state} 
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. CA"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input 
                    id="zipCode" 
                    value={zipCode} 
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="e.g. 94105"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your location, including the atmosphere, surroundings, and special features."
                    rows={5}
                  />
                </div>
              </div>
            </div>
            
            {/* Amenities */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Comodidades e Recursos</h2>              
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
            </div>
            
            {/* Photos
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Fotos</h2>
              <p className="text-gray-500 mb-4">Envie fotos do seu local (mín. 1)</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                    <img src={image} alt="Location" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                <div 
                  className="aspect-square border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
                  onClick={handleImageUpload}
                >
                  <div className="text-center p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="block mt-1 text-sm text-gray-500">Adicionar Foto</span>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-3">
                Para fins de demonstração, adicionaremos uma imagem de espaço reservado quando você clicar em "Adicionar Foto"
              </p>
            </div> */}
            
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/business/dashboard')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar Local'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddLocation;