
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/layout/Layout";
import { PWAPrompt } from "./components/PWAPrompt";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AdminAuth from "./pages/auth/AdminAuth";
import EmailVerification from "./pages/auth/EmailVerification";
import Dashboard from "./pages/Dashboard";
import P2PDashboard from "./pages/p2p/Dashboard";
import Wallet from "./pages/wallet/Wallet";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import P2PManagement from "./pages/admin/P2PManagement";
import TermsAndConditions from "./pages/legal/TermsAndConditions";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import { SignUp } from '@/components/auth/SignUp';
import { CheckEmail } from '@/components/auth/CheckEmail';
import { VerifyEmail } from '@/components/auth/VerifyEmail';
import { ReferralInfo } from '@/components/dashboard/ReferralInfo';
import KYCVerificationPage from "./pages/profile/kyc";
import AdminKYCPage from "./pages/admin/kyc";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
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
            <Route path="/p2p" element={<Layout requireAuth><P2PDashboard /></Layout>} />
            <Route path="/wallet" element={<Layout requireAuth><Wallet /></Layout>} />
            <Route path="/profile" element={<Layout requireAuth><Profile /></Layout>} />
            <Route path="/profile/kyc" element={<Layout requireAuth><KYCVerificationPage /></Layout>} />
            <Route path="/admin" element={<Layout requireAuth><AdminDashboard /></Layout>} />
            <Route path="/admin/p2p" element={<Layout requireAuth><P2PManagement /></Layout>} />
            <Route path="/admin/kyc" element={<Layout requireAuth><AdminKYCPage /></Layout>} />
            <Route path="/terms-and-conditions" element={<Layout><TermsAndConditions /></Layout>} />
            <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/check-email" element={<CheckEmail />} />
            <Route path="/auth/verify" element={<VerifyEmail />} />
            <Route path="/dashboard/referrals" element={<ReferralInfo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
