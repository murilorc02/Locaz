import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkspace } from '../data/workspaces';
import { getLocation } from '../data/locations';
import { getAmenity } from '../data/amenities';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AmenityIcon from '../components/AmenityIcon';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Calendar } from '../components/ui/calendar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { MapPin } from 'lucide-react';
import { format } from 'date-fns';

const WorkspaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const workspace = id ? getWorkspace(id) : null;
  const location = workspace ? getLocation(workspace.locationId.toString()) : null;
  
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState(1);
  
  if (!workspace || !location) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Workspace not found</h1>
            <Button onClick={() => navigate('/search')}>Return to Search</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to book a workspace",
        variant: "default",
      });
      navigate('/login');
      return;
    }
    
    setBookingDialogOpen(true);
  };
  
  const handleBookingSubmit = () => {
    if (!selectedDate) return;
    
    // Calculate end time based on duration
    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(startDateTime.getHours() + duration);
    
    const totalPrice = workspace.pricePerHour * duration;
    
    // In a real app, this would make an API call to create the booking
    
    toast({
      title: "Booking Confirmed!",
      description: `You've booked ${workspace.name} for ${duration} hour${duration > 1 ? 's' : ''} on ${format(startDateTime, 'PPP')} from ${format(startDateTime, 'p')} to ${format(endDateTime, 'p')}. Total: $${totalPrice}`,
    });
    
    setBookingDialogOpen(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Workspace Images */}
        <div className="bg-gray-100">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="aspect-[16/9] w-full overflow-hidden rounded-lg">
              <img
                src={workspace.images[0]}
                alt={workspace.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-grow">
              {/* Breadcrumbs */}
              <nav className="mb-4 text-sm text-gray-500">
                <ol className="flex flex-wrap items-center space-x-1">
                  <li><a href="/" className="hover:text-primary">Home</a></li>
                  <li>/</li>
                  <li><a href="/search" className="hover:text-primary">Search</a></li>
                  <li>/</li>
                  <li><span className="text-gray-700">{workspace.name}</span></li>
                </ol>
              </nav>

              {/* Workspace Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold">{workspace.name}</h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <MapPin className="h-5 w-5 mr-1" />
                  <span>{location.nomePredio} - {location.endereco}</span>
                </div>
              </div>

              {/* Workspace Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700">{workspace.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workspace.amenities.map((amenityId) => {
                    const amenity = getAmenity(amenityId);
                    return amenity ? (
                      <div key={amenityId} className="flex items-center">
                        <AmenityIcon type={amenity.icon} className="text-primary mr-2" />
                        <span>{amenity.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Location Details */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Location</h2>
                <p className="text-gray-700 mb-4">{location.descricao}</p>
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Map view would be displayed here</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80">
              <div className="sticky top-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-baseline justify-between">
                      <div className="text-2xl font-bold">${workspace.pricePerHour}</div>
                      <div className="text-gray-500">per hour</div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center mb-2">
                        <span className="text-gray-700 font-medium">Capacity:</span>
                        <span className="ml-2">{workspace.capacity} people</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-700 font-medium">Availability:</span>
                        <span className={`ml-2 ${workspace.available ? 'text-green-600' : 'text-red-600'}`}>
                          {workspace.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleBookNow}
                      disabled={!workspace.available}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Book {workspace.name}</DialogTitle>
            <DialogDescription>
              Select your preferred date and time to book this workspace.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="mt-2"
                disabled={{ before: new Date() }}
              />
            </div>
            
            <div>
              <Label htmlFor="time">Start Time</Label>
              <Input
                id="time"
                type="time"
                min="08:00"
                max="20:00"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="8"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                className="mt-2"
              />
            </div>
            
            <div>
              <p className="text-sm text-gray-500">
                Total Price: <span className="font-bold">${workspace.pricePerHour * duration}</span>
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBookingSubmit}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspaceDetail;
