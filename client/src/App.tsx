import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import BusinessDashboard from "./pages/BusinessDashboard";
import AddLocation from "./pages/AddLocation";
import { LocationsProvider } from "./contexts/LocationsContext";
import Index from "./pages/Index";
// import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import LocationDetail from "./pages/LocationDetail";
import Bookings from "./pages/Bookings";
import BusinessLocations from "./pages/BusinessLocations";
import BusinessWorkspaces from "./pages/BusinessWorkspaces";
import AddWorkspace from "./pages/AddWorkspace";
import EditLocation from "./pages/EditLocation";
import BusinessBookings from "./pages/BusinessBookings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <LocationsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/workspace/:id" element={<WorkspaceDetail />} />
              <Route path="/location/:id" element={<LocationDetail />} />
              <Route path="/business/dashboard" element={<BusinessDashboard />} />
              <Route path="/business/locations" element={<BusinessLocations />} />
              <Route path="/business/workspaces" element={<BusinessWorkspaces />} />
              <Route path="/business/bookings" element={<BusinessBookings />} />
              <Route path="/business/add-location" element={<AddLocation />} />
              <Route path="/business/add-workspace" element={<AddWorkspace />} />
              <Route path="/business/add-workspace/:locationId" element={<AddWorkspace />} />
              <Route path="/business/edit-location/:id" element={<EditLocation />} />
              <Route path="/bookings" element={<Bookings />} />
              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </TooltipProvider>
        </LocationsProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
