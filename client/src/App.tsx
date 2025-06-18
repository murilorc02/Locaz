import { Toaster } from "./components/ui/toaster.tsx";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import BusinessDashboard from "./pages/BusinessDashboard";
import AddLocation from "./pages/AddLocation";
//import Index from "./pages/Index";
//import NotFound from "./pages/NotFound";
//import Signup from "./pages/Signup";
//import Profile from "./pages/Profile";
//import Search from "./pages/Search";
// import WorkspaceDetail from "./pages/WorkspaceDetail";
// import LocationDetail from "./pages/LocationDetail";
//import Bookings from "./pages/Bookings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/business/dashboard" element={<BusinessDashboard />} />
            <Route path="/business/add-location" element={<AddLocation />} />
            {/* <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/workspace/:id" element={<WorkspaceDetail />} />
            <Route path="/location/:id" element={<LocationDetail />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
