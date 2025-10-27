
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WorkspaceCard from '../components/WorkspaceCard';
import CategoryNavbar from '../components/CategoryNavbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { amenities } from '../data/amenities';
import { MapPin, Search as SearchIcon, Filter, Loader2 } from 'lucide-react';
import { SearchSalaPayload, Workspace } from '../types';
import { useWorkspaces } from '@/contexts/WorkspacesContext';
import LocationSelector from '@/components/LocationSelector';

const Search = () => {
  const { getFilteredWorkspaces } = useWorkspaces();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchLocation, setSearchLocation] = useState({
    state: searchParams.get('estado') || '',
    city: searchParams.get('cidade') || ''
  });
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('local') || '');
  const [minPrice, setMinPrice] = useState(() => searchParams.get('precoMinimo') || '');
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('precoMaximo') || '');
  const [capacityInput, setCapacityInput] = useState(searchParams.get('capacidade') || '');
  const [selectedAmenities, setSelectedAmenities] = useState(() => searchParams.getAll('comodidades') || []);
  const [selectedCategory, setSelectedCategory] = useState<Workspace['categoria'] | 'all'>(
    () => (searchParams.get('categoria') as Workspace['categoria']) || 'all'
  );

  const [baseSearchResults, setBaseSearchResults] = useState<Workspace[]>([]);
  const [displayedWorkspaces, setDisplayedWorkspaces] = useState<Workspace[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Calculate workspace counts by category
  const workspaceCounts = {
    all: baseSearchResults.length,
    workstation: baseSearchResults.filter(w => w.categoria === 'workstation').length,
    'meeting-room': baseSearchResults.filter(w => w.categoria === 'meeting-room').length,
    'training-room': baseSearchResults.filter(w => w.categoria === 'training-room').length,
    auditorium: baseSearchResults.filter(w => w.categoria === 'auditorium').length,
  };

  const updateUrlParams = async () => {
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set('location', searchTerm);
    if (searchLocation.city) newParams.set('cidade', searchLocation.city);
    if (searchLocation.state) newParams.set('estado', searchLocation.state);
    if (capacityInput) newParams.set('capacidade', capacityInput);
    if (selectedCategory !== 'all') newParams.set('categoria', selectedCategory);
    if (minPrice) newParams.set('precoMinimo', minPrice);
    if (maxPrice) newParams.set('precoMaximo', maxPrice);
    selectedAmenities.forEach(amenity => newParams.append('comodidades', amenity));

    // Usa 'replace: true' para não poluir o histórico do navegador
    setSearchParams(newParams, { replace: true });
  }

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const searchPayload: SearchSalaPayload = {
        nome: searchTerm || undefined,
        cidade: searchLocation.city || undefined,
        estado: searchLocation.state || undefined,
        capacidade: capacityInput ? parseInt(capacityInput) : undefined,
        categoria: selectedCategory !== 'all' ? selectedCategory : undefined,
        precoMinimo: minPrice ? parseFloat(minPrice) : undefined,
        precoMaximo: maxPrice ? parseFloat(maxPrice) : undefined,
        comodidades: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        ordenarPor: 'preco',
        ordem: 'ASC'
      };

      const cleanPayload = Object.fromEntries(
        Object.entries(searchPayload).filter(([_, v]) => v !== undefined)
      ) as SearchSalaPayload;

      const result = await getFilteredWorkspaces(cleanPayload);

      if (result?.data) {
        setBaseSearchResults(result.data);
      } else {
        setBaseSearchResults([]);
      }
    } catch (error) {
      setBaseSearchResults([]);
      console.error("Falha ao realizar busca:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setDisplayedWorkspaces(baseSearchResults);
    } else {
      setDisplayedWorkspaces(
        baseSearchResults.filter(w => w.categoria === selectedCategory)
      );
    }
  }, [selectedCategory, baseSearchResults]);

  const handleApplyFilters = () => {
    updateUrlParams();
    performSearch();
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams();
    performSearch();
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const clearFilters = async () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setCapacityInput('');
    setSelectedAmenities([]);
    setSelectedCategory('all');
    setSearchLocation({ state: '', city: '' });
    setSearchParams({});

    setIsLoading(true);
    try {
      const result = await getFilteredWorkspaces({
        ordenarPor: 'preco',
        ordem: 'ASC'
      });

      if (result?.data) {
        setBaseSearchResults(result.data);
      } else {
        setBaseSearchResults([]);
      }
    } catch (error) {
      setBaseSearchResults([]);
      console.error("Falha ao limpar filtros: ", error);
    } finally {
      setIsLoading(false);
    }
    performSearch();
  };

  const handleCategoryChange = (category: Workspace['categoria'] | 'all') => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-secondary/35 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-4">Encontre seu Espaço Ideal</h1>

            <form onSubmit={handleSearch} className="flex w-full max-w-4xl gap-2">
              <div className="flex w-full gap-2">
                <div className="relative flex-grow">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                  <Input
                    placeholder="Pesquisar por nome do espaço ou empresa"
                    className="pl-10 h-12 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <LocationSelector
                    onLocationChange={setSearchLocation}
                  />
                </div>
              </div>
              <Button type="submit" className="h-12 px-6">
                <SearchIcon className="h-5 w-5 mr-2" />
                Buscar
              </Button>
            </form>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters - Mobile Toggle */}
            <div className="md:hidden mb-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-5 w-5 mr-2" />
                {isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </Button>
            </div>

            {/* Filters Sidebar */}
            <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block md:w-64 lg:w-80 flex-shrink-0`}>
              <div className="bg-white rounded-lg border p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filtros</h2>
                  <Button
                    variant="ghost"
                    className="text-sm h-auto p-0"
                    onClick={clearFilters}
                  >
                    Limpar Tudo
                  </Button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Faixa de Preço (R$/hora)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="min-price" className="text-xs">Mínimo</Label>
                      <Input
                        id="min-price"
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => {
                          setMinPrice(e.target.value);
                        }}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-price" className="text-xs">Máximo</Label>
                      <Input
                        id="max-price"
                        type="number"
                        placeholder="1000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Capacidade</h3>
                  <Input
                    type="number"
                    placeholder="Ex: 4 pessoas"
                    value={capacityInput}
                    onChange={(e) => setCapacityInput(e.target.value)}
                    className="h-8"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número mínimo de pessoas que o espaço deve comportar
                  </p>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="font-medium mb-2">Comodidades</h3>
                  <div className="space-y-2">
                    {amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center">
                        <Checkbox
                          id={`amenity-${amenity.id}`}
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={() => handleAmenityToggle(amenity.id)}
                        />
                        <Label
                          htmlFor={`amenity-${amenity.id}`}
                          className="ml-2 text-sm font-normal cursor-pointer"
                        >
                          {amenity.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  onClick={handleApplyFilters}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Buscando...
                    </>
                  ) : (
                    'Aplicar Filtros'
                  )}
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="flex-grow">
              {/* Category Navigation */}
              <CategoryNavbar
                activeCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                workspaceCounts={workspaceCounts}
              />
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : displayedWorkspaces.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border">
                  <h3 className="text-xl font-semibold mb-2">Nenhum espaço encontrado</h3>
                  <p className="text-gray-600 mb-4">Tente ajustar seus filtros ou termo de busca</p>
                  <Button onClick={clearFilters}>Limpar Filtros</Button>
                </div>
              ) : (
                <div className="p-0 sm:p-6"> {/* Padding aplicado aqui, mas removido em telas pequenas */}
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {displayedWorkspaces.length} {displayedWorkspaces.length === 1 ? 'Espaço' : 'Espaços'} Disponíve{displayedWorkspaces.length === 1 ? 'l' : 'is'}
                    </h2>
                    <div className="text-sm text-gray-500">
                      Ordenar por: <span className="font-medium text-gray-700">Preço (Menor para Maior)</span>
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayedWorkspaces.map((workspace) => (
                      <WorkspaceCard key={workspace.id} workspace={workspace} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;