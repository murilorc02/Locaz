import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import LocationCard from '../components/LocationCard';
import { locations } from '../data/locations';
import { Search, MapPin } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const Index = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?location=${encodeURIComponent(searchLocation)}`);
  };

  // Featured locations
  const featuredLocations = locations.slice(0, 3);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative">
          <div 
            className="bg-cover bg-center h-[500px] md:h-[600px]"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80')",
              backgroundPosition: "center 30%"
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex h-full items-center justify-center">
              <div className="max-w-3xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                  Find Your Perfect<br />
                  <span className="text-primary">Workspace</span> Today
                </h1>
                <p className="mt-6 text-lg text-white">
                  Discover and book professional workspaces in your area.
                  From quiet desks to collaborative meeting rooms.
                </p>
                <div className="mt-10">
                  <form onSubmit={handleSearch} className="flex w-full max-w-lg mx-auto">
                    <div className="relative flex-grow">
                      <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Where do you want to work?"
                        className="pl-10 h-12 rounded-l-lg rounded-r-none border-r-0"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="h-12 px-6 rounded-l-none">
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center">How It Works</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Search</h3>
                  <p className="mt-2 text-gray-600">
                    Find workspaces that match your needs by location, price, or amenities.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Book</h3>
                  <p className="mt-2 text-gray-600">
                    Reserve your workspace for the hours or days you need with instant confirmation.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Work</h3>
                  <p className="mt-2 text-gray-600">
                    Show up and be productive in your professional workspace environment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Locations */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Featured Locations</h2>
              <Button variant="outline" onClick={() => navigate('/search')}>
                View All
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredLocations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          </div>
        </section>

        {/* For Business Owners CTA */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0 md:max-w-xl">
                <h2 className="text-3xl font-bold">Own a Workspace?</h2>
                <p className="mt-4 text-white/90">
                  List your workspace on our platform and reach thousands of professionals 
                  looking for the perfect place to work. It's easy to get started and start 
                  earning.
                </p>
                <Button 
                  variant="secondary" 
                  className="mt-6 bg-white text-primary hover:bg-gray-100"
                  onClick={() => navigate('/signup')}
                >
                  Start Listing
                </Button>
              </div>
              <div className="w-full md:w-1/2 lg:w-2/5">
                <img 
                  src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80" 
                  alt="Business workspace" 
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;