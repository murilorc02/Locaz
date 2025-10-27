import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import Login from "./pages/Login";
import BusinessDashboard from "./pages/BusinessDashboard";
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
import WorkspaceEditor from "./pages/WorkspaceEditor";
import BusinessBookings from "./pages/BusinessBookings";
import { WorkspacesProvider } from "./contexts/WorkspacesContext";
import LocationEditor from "./pages/LocationEditor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <LocationsProvider>
          <WorkspacesProvider>
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
                <Route path="/business/add-location" element={<LocationEditor />} />
                <Route path="/business/edit-location/:id" element={<LocationEditor />} />
                <Route path="/business/add-workspace" element={<WorkspaceEditor />} />
                <Route path="/business/edit-workspace/:id" element={<WorkspaceEditor />} />
                <Route path="/bookings" element={<Bookings />} />
                {/* <Route path="*" element={<NotFound />} /> */}
              </Routes>
            </TooltipProvider>
          </WorkspacesProvider>
        </LocationsProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
