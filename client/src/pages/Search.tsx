import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WorkspaceCard from '../components/WorkspaceCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { amenities } from '../data/amenities';
import { workspaces } from '../data/workspaces';
import { getLocation } from '../data/locations';
import { MapPin, Search as SearchIcon, Filter } from 'lucide-react';
import { Workspace } from '../types';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const locationQuery = searchParams.get('location') || '';
  
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([]);
  const [searchTerm, setSearchTerm] = useState(locationQuery);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Find max price for slider
  const maxPrice = Math.max(...workspaces.map(w => w.pricePerHour), 100);

  useEffect(() => {
    // Initial filter based on URL params
    filterWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationQuery]);

  const filterWorkspaces = () => {
    let filtered = [...workspaces];
    
    // Filter by search term (location or workspace name)
    if (searchTerm) {
      filtered = filtered.filter(workspace => {
        const location = getLocation(workspace.locationId.toString());
        const searchLower = searchTerm.toLowerCase();
        
        return (
          workspace.name.toLowerCase().includes(searchLower) ||
          location?.endereco.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Filter by price range
    filtered = filtered.filter(workspace => 
      workspace.pricePerHour >= priceRange[0] && 
      workspace.pricePerHour <= priceRange[1]
    );
    
    // Filter by capacity
    if (capacity) {
      filtered = filtered.filter(workspace => workspace.capacity >= capacity);
    }
    
    // Filter by amenities
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(workspace => 
        selectedAmenities.every(amenityId => workspace.amenities.includes(amenityId))
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
    setPriceRange([0, maxPrice]);
    setCapacity(null);
    setSelectedAmenities([]);
    setSearchParams({});
    setFilteredWorkspaces(workspaces);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-primary-light py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-4">Find Your Perfect Workspace</h1>
            
            <form onSubmit={handleSearch} className="flex w-full max-w-3xl">
              <div className="relative flex-grow">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by city, location, or workspace name"
                  className="pl-10 h-12 rounded-l-lg rounded-r-none border-r-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" className="h-12 px-6 rounded-l-none">
                <SearchIcon className="h-5 w-5 mr-2" />
                Search
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
                {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Filters Sidebar */}
            <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block md:w-64 lg:w-80 flex-shrink-0`}>
              <div className="bg-white rounded-lg border p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button 
                    variant="ghost" 
                    className="text-sm h-auto p-0" 
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Price Range ($/hour)</h3>
                  <div className="mb-2">
                    <Slider 
                      defaultValue={[0, maxPrice]} 
                      min={0} 
                      max={maxPrice} 
                      step={5} 
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
                
                {/* Capacity */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Minimum Capacity</h3>
                  <div className="flex space-x-2 flex-wrap">
                    {[1, 2, 4, 8, 12].map((cap) => (
                      <Button
                        key={cap}
                        variant={capacity === cap ? "default" : "outline"}
                        onClick={() => setCapacity(capacity === cap ? null : cap)}
                        className="mt-1"
                        size="sm"
                      >
                        {cap}+ people
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Amenities */}
                <div>
                  <h3 className="font-medium mb-2">Amenities</h3>
                  <div className="space-y-2">
                    {amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center">
                        <Checkbox
                          id={`amenity-${amenity.id}`}
                          checked={selectedAmenities.includes(amenity.id.toString())}
                          onCheckedChange={() => handleAmenityToggle(amenity.id.toString())}
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
                  Apply Filters
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="flex-grow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {filteredWorkspaces.length} {filteredWorkspaces.length === 1 ? 'Workspace' : 'Workspaces'} Available
                </h2>
                <div className="text-sm text-gray-500">
                  Sort by: <span className="font-medium">Price (Low to High)</span>
                </div>
              </div>

              {filteredWorkspaces.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">No workspaces found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your filters or search term</p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
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
      </main>
      <Footer />
    </div>
  );
};

export default Search;