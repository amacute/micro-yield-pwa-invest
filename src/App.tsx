
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { InvestmentProvider } from '@/contexts/InvestmentContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout/Layout';
import { Outlet } from 'react-router-dom';

// Public pages
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import AdminAuth from '@/pages/auth/AdminAuth';
import EmailVerification from '@/pages/auth/EmailVerification';
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import TermsAndConditions from '@/pages/legal/TermsAndConditions';
import NotFound from '@/pages/NotFound';

// Protected pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Investments from '@/pages/investments/Investments';
import InvestmentDetails from '@/pages/investments/InvestmentDetails';
import Wallet from '@/pages/wallet/Wallet';
import Tasks from '@/pages/Tasks';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <InvestmentProvider>
            <AdminProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/admin-auth" element={<AdminAuth />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                
                {/* Protected routes with layout */}
                <Route path="/*" element={<Layout><Outlet /></Layout>}>
                  <Route path="index" element={<Index />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="investments" element={<Investments />} />
                  <Route path="investments/:id" element={<InvestmentDetails />} />
                  <Route path="wallet" element={<Wallet />} />
                  <Route path="tasks" element={<Tasks />} />
                  
                  {/* Admin routes */}
                  <Route path="admin" element={<AdminDashboard />} />
                </Route>
                
                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </AdminProvider>
          </InvestmentProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
