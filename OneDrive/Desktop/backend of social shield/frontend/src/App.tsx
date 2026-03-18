import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import PlatformSelection from "./pages/PlatformSelection";
import InstagramMode from "./pages/InstagramMode";
import ScanningPage from "./pages/ScanningPage";
import ResultDashboard from "./pages/ResultDashboard";
import NotFound from "./pages/NotFound";
import Chatbot from "./components/Chatbot";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/platform" element={<PlatformSelection />} />
          <Route path="/instagram" element={<InstagramMode />} />
          <Route path="/scanning" element={<ScanningPage />} />
          <Route path="/results" element={<ResultDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Chatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
