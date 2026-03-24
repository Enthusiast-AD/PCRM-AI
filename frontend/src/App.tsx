import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PoliticianDashboard from "./pages/politician/Dashboard";
import AssignWork from "./pages/politician/AssignWork";
import ActiveWorks from "./pages/politician/ActiveWorks";
import Approvals from "./pages/politician/Approvals";
import Workers from "./pages/politician/Workers";
import Analytics from "./pages/politician/Analytics";
import Settings from "./pages/politician/Settings";
import WorkerDashboard from "./pages/worker/Dashboard";
import TaskDetail from "./pages/worker/TaskDetail";

import WorkerSettings from "./pages/worker/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />

              {/* Politician */}
              <Route path="/politician/dashboard" element={<ProtectedRoute requiredRole="politician"><PoliticianDashboard /></ProtectedRoute>} />
              <Route path="/politician/assign" element={<ProtectedRoute requiredRole="politician"><AssignWork /></ProtectedRoute>} />
              <Route path="/politician/works" element={<ProtectedRoute requiredRole="politician"><ActiveWorks /></ProtectedRoute>} />
              <Route path="/politician/approvals" element={<ProtectedRoute requiredRole="politician"><Approvals /></ProtectedRoute>} />
              <Route path="/politician/workers" element={<ProtectedRoute requiredRole="politician"><Workers /></ProtectedRoute>} />
              <Route path="/politician/analytics" element={<ProtectedRoute requiredRole="politician"><Analytics /></ProtectedRoute>} />
              <Route path="/politician/settings" element={<ProtectedRoute requiredRole="politician"><Settings /></ProtectedRoute>} />

              {/* Worker */}
              <Route path="/worker/dashboard" element={<ProtectedRoute requiredRole="worker"><WorkerDashboard /></ProtectedRoute>} />
              <Route path="/worker/task/:taskId" element={<ProtectedRoute requiredRole="worker"><TaskDetail /></ProtectedRoute>} />
              <Route path="/worker/settings" element={<ProtectedRoute requiredRole="worker"><WorkerSettings /></ProtectedRoute>} />

              {/* Redirects */}
              <Route path="/politician" element={<Navigate to="/politician/dashboard" replace />} />
              <Route path="/worker" element={<Navigate to="/worker/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

