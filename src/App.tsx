import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { InvestmentProvider } from "./contexts/InvestmentContext";
import { Layout } from "./components/layout/Layout";
import { PWAPrompt } from "./components/PWAPrompt";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AdminAuth from "./pages/auth/AdminAuth";
import EmailVerification from "./pages/auth/EmailVerification";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/investments/Investments";
import InvestmentDetails from "./pages/investments/InvestmentDetails";
import Wallet from "./pages/wallet/Wallet";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import TermsAndConditions from "./pages/legal/TermsAndConditions";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import { SignUp } from '@/components/auth/SignUp';
import { CheckEmail } from '@/components/auth/CheckEmail';
import { VerifyEmail } from '@/components/auth/VerifyEmail';
import { ReferralInfo } from '@/components/dashboard/ReferralInfo';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <InvestmentProvider>
          <TooltipProvider>
            <Toaster />
            <PWAPrompt />
            <Routes>
              <Route path="/" element={<Layout><LandingPage /></Layout>} />
              <Route path="/login" element={<Layout><Login /></Layout>} />
              <Route path="/signup" element={<Layout><Signup /></Layout>} />
              <Route path="/admin-auth" element={<Layout><AdminAuth /></Layout>} />
              <Route path="/verify-email" element={<Layout><EmailVerification /></Layout>} />
              <Route path="/dashboard" element={<Layout requireAuth><Dashboard /></Layout>} />
              <Route path="/investments" element={<Layout requireAuth><Investments /></Layout>} />
              <Route path="/investments/:id" element={<Layout requireAuth><InvestmentDetails /></Layout>} />
              <Route path="/wallet" element={<Layout requireAuth><Wallet /></Layout>} />
              <Route path="/profile" element={<Layout requireAuth><Profile /></Layout>} />
              <Route path="/admin" element={<Layout requireAuth><AdminDashboard /></Layout>} />
              <Route path="/terms-and-conditions" element={<Layout><TermsAndConditions /></Layout>} />
              <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
              <Route path="/auth/signup" element={<SignUp />} />
              <Route path="/auth/check-email" element={<CheckEmail />} />
              <Route path="/auth/verify" element={<VerifyEmail />} />
              <Route path="/dashboard/referrals" element={<ReferralInfo />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </InvestmentProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
