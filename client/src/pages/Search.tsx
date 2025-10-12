
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WorkspaceCard from '../components/WorkspaceCard';
import CategoryNavbar from '../components/CategoryNavbar';
import AmenityBadge from '../components/AmenityBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { amenities } from '../data/amenities';
import { MapPin, Search as SearchIcon, Filter } from 'lucide-react';
import { Location, LocationApiResponse, Workspace, WorkspacesApiResponse } from '../types';
import { useWorkspaces } from '@/contexts/WorkspacesContext';
import { useLocations } from '@/contexts/LocationsContext';

const Search = () => {
  const { workspaces, fetchWorkspaces } = useWorkspaces();
  const { getLocationById } = useLocations();

  const [searchParams, setSearchParams] = useSearchParams();
  const locationQuery = searchParams.get('location') || '';

  const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([]);
  const [searchTerm, setSearchTerm] = useState(locationQuery);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [capacityInput, setCapacityInput] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Workspace['categoria'] | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Find max price for reference
  const workspaceMaxPrice = Math.max(...workspaces.data.map(w => w.precoHora), 100);

  // Calculate workspace counts by category
  const workspaceCounts = {
    all: workspaces.data.length,
    workstation: workspaces.data.filter(w => w.categoria === 'workstation').length,
    'meeting-room': workspaces.data.filter(w => w.categoria === 'meeting-room').length,
    'training-room': workspaces.data.filter(w => w.categoria === 'training-room').length,
    auditorium: workspaces.data.filter(w => w.categoria === 'auditorium').length,
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [])

  useEffect(() => {
    // Initial filter based on URL params
    filterWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationQuery]);

  const filterWorkspaces = async () => {
    let filtered: Workspace[] = workspaces.data;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = workspaces.data.filter(workspace => workspace.categoria == selectedCategory);
    }

    // Filter by search term (location or workspace name)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const results = [];

      for (const workspace of filtered) {
        const nameMatches = workspace.nome.toLowerCase().includes(searchLower);

        if (nameMatches) {
          results.push(workspace);
          continue;
        }

        try {
          const location = await getLocationById(workspace.predioId);

          if (location) {
            const locationMatches =
              location.data.nome.toLowerCase().includes(searchLower) ||
              location.data.cidade.toLowerCase().includes(searchLower) ||
              location.data.estado.toLowerCase().includes(searchLower);

              if (locationMatches) {
                results.push(workspace);
              }
          }
        } catch (err) {
          throw new Error(err);
        }
      }
    }

    // Filter by price range
    const minPriceNum = minPrice ? parseFloat(minPrice) : 0;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice) : Infinity;
    filtered = filtered.filter(workspace =>
      workspace.precoHora >= minPriceNum &&
      workspace.precoHora <= maxPriceNum
    );

    // Filter by capacity
    const capacityNum = capacityInput ? parseInt(capacityInput) : null;
    if (capacityNum) {
      filtered = filtered.filter(workspace => workspace.capacidade >= capacityNum);
    }

    // Filter by amenities
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(workspace =>
        selectedAmenities.every(amenityId => workspace.comodidades.includes(amenityId))
      );
    }

    setFilteredWorkspaces(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterWorkspaces();
    setSearchParams({ location: searchTerm });
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setCapacityInput('');
    setSelectedAmenities([]);
    setSelectedCategory('all');
    setSearchParams({});
    setFilteredWorkspaces(workspaces.data);
  };

  const handleCategoryChange = (category: Workspace['categoria'] | 'all') => {
    setSelectedCategory(category);
  };

  // Effect to trigger filtering only when category changes or on initial load
  useEffect(() => {
    filterWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-t from-transparent to-secondary/35 via-transparent py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-4">Encontre seu Espaço Ideal</h1>

            <form onSubmit={handleSearch} className="flex w-full max-w-4xl gap-2">
              <div className="relative flex-grow">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                <Input
                  placeholder="Pesquisar por cidade, local ou nome do espaço"
                  className="pl-10 h-12 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={(value: Workspace['categoria'] | 'all') => setSelectedCategory(value)}>
                <SelectTrigger className="w-48 h-12">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  <SelectItem value="workstation">Estações de Trabalho</SelectItem>
                  <SelectItem value="meeting-room">Salas de Reunião</SelectItem>
                  <SelectItem value="training-room">Salas de Treinamento</SelectItem>
                  <SelectItem value="auditorium">Auditórios</SelectItem>
                </SelectContent>
              </Select>
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
                        onChange={(e) => setMinPrice(e.target.value)}
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
                  <h3 className="font-medium mb-2">Capacidade Desejada</h3>
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
                  onClick={filterWorkspaces}
                >
                  Aplicar Filtros
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

              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {filteredWorkspaces.length} {filteredWorkspaces.length === 1 ? 'Espaço' : 'Espaços'} Disponíve{filteredWorkspaces.length === 1 ? 'l' : 'is'}
                  </h2>
                  <div className="text-sm text-text-muted">
                    Ordenar por: <span className="font-medium">Preço (Menor para Maior)</span>
                  </div>
                </div>

                {filteredWorkspaces.length === 0 ? (
                  <div className="text-center py-16 bg-bg-muted rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Nenhum espaço encontrado</h3>
                    <p className="text-text-muted mb-4">Tente ajustar seus filtros ou termo de busca</p>
                    <Button onClick={clearFilters}>Limpar Filtros</Button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredWorkspaces.map((workspace) => (
                      <WorkspaceCard key={workspace.id} workspace={workspace} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;