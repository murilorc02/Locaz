import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const mockBookings = [
  {
    id: 'book-001',
    workspaceId: 'ws-001',
    workspaceName: 'Executive Suite',
    locationName: 'The Urban Hub',
    locationCity: 'San Francisco',
    locationState: 'CA',
    startTime: new Date(2025, 5, 20, 10, 0),
    endTime: new Date(2025, 5, 20, 12, 0),
    totalPrice: 100,
    status: 'confirmed',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
  },
  {
    id: 'book-002',
    workspaceId: 'ws-004',
    workspaceName: 'Creative Studio',
    locationName: 'Creative Commons',
    locationCity: 'San Francisco',
    locationState: 'CA',
    startTime: new Date(2025, 5, 22, 9, 0),
    endTime: new Date(2025, 5, 22, 13, 0),
    totalPrice: 160,
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
  },
  {
    id: 'book-003',
    workspaceId: 'ws-006',
    workspaceName: 'Quiet Zone Desk',
    locationName: 'Tech Loft',
    locationCity: 'San Francisco',
    locationState: 'CA',
    startTime: new Date(2025, 5, 15, 13, 0),
    endTime: new Date(2025, 5, 15, 17, 0),
    totalPrice: 80,
    status: 'cancelled',
    image: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
  }
];

type BookingStatus = 'confirmed' | 'pending' | 'cancelled';

const Bookings = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const [activeTab, setActiveTab] = useState<string>('all');
  
  const filteredBookings = activeTab === 'all'
    ? mockBookings
    : mockBookings.filter(booking => booking.status === activeTab);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-primary-light py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-gray-600 mt-2">Manage your workspace reservations</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="all">All Bookings</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
              
              <Button variant="outline" onClick={() => navigate('/search')}>
                Find New Workspace
              </Button>
            </div>
            
            <TabsContent value={activeTab}>
              {filteredBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
                    <p className="text-gray-500 mb-6">
                      {activeTab === 'all' 
                        ? "You haven't made any bookings yet" 
                        : `You don't have any ${activeTab} bookings`}
                    </p>
                    <Button onClick={() => navigate('/search')}>
                      Find a Workspace
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map(booking => (
                    <Card key={booking.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/4 h-48 md:h-auto">
                          <img 
                            src={booking.image} 
                            alt={booking.workspaceName} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-6 flex-grow">
                          <div className="flex flex-wrap justify-between gap-2">
                            <h2 className="text-xl font-bold">{booking.workspaceName}</h2>
                            {getStatusBadge(booking.status)}
                          </div>
                          
                          <div className="mt-2 flex items-center text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{booking.locationName} - {booking.locationCity}, {booking.locationState}</span>
                          </div>
                          
                          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Date & Time</p>
                              <p className="font-medium">
                                {format(booking.startTime, 'PPP')}
                              </p>
                              <p>
                                {format(booking.startTime, 'p')} - {format(booking.endTime, 'p')}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-500">Price</p>
                              <p className="font-bold text-lg">${booking.totalPrice}</p>
                            </div>
                          </div>
                          
                          <div className="mt-6 flex flex-wrap gap-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/workspace/${booking.workspaceId}`)}
                            >
                              View Workspace
                            </Button>
                            
                            {booking.status === 'pending' && (
                              <>
                                <Button size="sm">
                                  Confirm
                                </Button>
                                <Button variant="destructive" size="sm">
                                  Cancel
                                </Button>
                              </>
                            )}
                            
                            {booking.status === 'confirmed' && (
                              <Button variant="destructive" size="sm">
                                Cancel Booking
                              </Button>
                            )}
                            
                            {booking.status === 'cancelled' && (
                              <Button size="sm">
                                Book Again
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bookings;
