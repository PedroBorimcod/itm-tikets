import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProducerAuthProvider } from "@/hooks/useProducerAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { LanguageProvider } from "@/hooks/useLanguage";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MyTickets from "./pages/MyTickets";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminEvents from "./pages/AdminEvents";
import AdminProducers from "./pages/AdminProducers";
import AdminPixPayments from "./pages/AdminPixPayments";
import ProducerAuth from "./pages/ProducerAuth";
import ProducerDashboard from "./pages/ProducerDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import QRScanner from "./pages/QRScanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ProducerAuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/my-tickets" element={<MyTickets />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin/events" element={<AdminEvents />} />
                  <Route path="/admin/producers" element={<AdminProducers />} />
                  <Route path="/admin/pix-payments" element={<AdminPixPayments />} />
                  <Route path="/producer-auth" element={<ProducerAuth />} />
                  <Route path="/producer-dashboard" element={<ProducerDashboard />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
                  <Route path="/qr-scanner" element={<QRScanner />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ProducerAuthProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
