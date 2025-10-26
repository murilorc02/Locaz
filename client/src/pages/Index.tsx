
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import LocationCard from '@/components/LocationCard';
import { Search, MapPin } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useLocations } from '@/contexts/LocationsContext';
import { Location, LocationApiResponse } from '@/types';

const Index = () => {
  const { isLoading, getLocationById } = useLocations();
  const [searchLocation, setSearchLocation] = useState('');
  const [featuredLocations, setFeaturedLocations] = useState([] as Location[]);
  const navigate = useNavigate();

  const getFeaturedLocations = async () => {
    let loc: LocationApiResponse;
    try {
      loc = (await getLocationById(1));
      setFeaturedLocations((prev) => [...prev, loc.data])
    } catch (e) {
      console.log("Não foi possível encontrar os locais: ", e)
      setFeaturedLocations([])
    }
  }

  useEffect(() => {
    getFeaturedLocations();
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?location=${encodeURIComponent(searchLocation)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative">
          <div
            className="bg-cover bg-center h-[380px] sm:h-[500px] md:h-[600px]"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80')",
              backgroundPosition: "center 30%"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-secondary/60" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex h-full items-center justify-center">
              <div className="max-w-3xl text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:!leading-[3.8rem] md:!leading-[4.5rem] text-white sm:text-5xl md:text-6xl">
                  Encontre Seu Local de <br />
                  Trabalho
                  <span className="text-secondary text-3xl sm:text-5xl md:text-6xl bg-muted mx-1 px-2 rounded-lg center">Perfeito</span>
                </h1>
                <p className="mt-4 sm:mt-6 sm:text-lg text-sm text-white w-3/4 place-self-center">
                  Descubra e agende locais de trabalho na sua área.
                  De ambientes silenciosos à salas de conferência colaborativas.
                </p>
                <div className="mt-6 sm:mt-10">
                  <form onSubmit={handleSearch} className="flex w-[85%] max-w-lg mx-auto">
                    <div className="relative flex-grow">
                      <MapPin className="absolute left-2.5 sm:left-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Where do you want to work?"
                        className="pl-8 sm:pl-10 h-10 sm:h-12 text-[0.75rem] rounded-l-lg rounded-r-none border-r-0"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="h-10 sm:h-12 px-4 sm:px-6 sm:text-[0.75rem] md:text-base rounded-l-none">
                      <Search className="h-5 w-5 mr-0 sm:mr-2" />
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
            <h2 className="text-3xl font-bold text-center">Como Funciona</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                    <Search className="h-6 w-6 text-background" />
                  </div>
                  <h3 className="text-xl font-bold">Pesquise</h3>
                  <p className="mt-2 text-gray-600">
                    Encontre espaços de acordo com sua necessidade de locação, preço ou comodidades
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-background">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Agende</h3>
                  <p className="mt-2 text-gray-600">
                    Reserve seu espaço pelas horas ou dias que precisar sem dificuldades
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-background">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Trabalhe</h3>
                  <p className="mt-2 text-gray-600">
                    Compareça e seja produtivo em seu ambiente profissional de trabalho
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
              <h2 className="text-3xl font-bold">Locais em Destaque</h2>
              <Button variant="outline" onClick={() => navigate('/search')}>
                Ver tudo
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {!featuredLocations ?
                (
                  <div>
                    <p> Não há locais disponíveis ainda </p>
                  </div>
                )
                :
                featuredLocations.map((location) => (
                  <LocationCard key={location.id} location={location} />
                ))
              }
            </div>
          </div>
        </section>

        {/* For Business Owners CTA */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0 md:max-w-xl">
                <h2 className="text-3xl font-bold">É dono de um local?</h2>
                <p className="mt-4 text-white/90">
                  Cadastre seus espaços de trabalho em nossa plataforma e alcance centenas de profissionais que estão procurando pelo local perfeito para trabalhar!
                </p>
                <Button
                  variant="secondary"
                  className="mt-6 bg-white text-primary hover:bg-gray-100"
                  onClick={() => navigate('/signup')}
                >
                  Cadastre seu espaço agora
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
