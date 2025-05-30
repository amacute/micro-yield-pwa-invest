import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Loader } from '@/components/common/Loader';

// Lazy loaded components
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const AdminAuth = lazy(() => import('@/pages/auth/AdminAuth'));
const EmailVerification = lazy(() => import('@/pages/auth/EmailVerification'));
const PrivacyPolicy = lazy(() => import('@/pages/legal/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('@/pages/legal/TermsAndConditions'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Index = lazy(() => import('@/pages/Index'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));
const Investments = lazy(() => import('@/pages/investments/Investments'));
const InvestmentDetails = lazy(() => import('@/pages/investments/InvestmentDetails'));
const P2PLending = lazy(() => import('@/pages/investments/P2PLending'));
const Wallet = lazy(() => import('@/pages/wallet/Wallet'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader />
  </div>
);

// Router configuration
export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/signup',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Signup />
      </Suspense>
    ),
  },
  {
    path: '/admin-auth',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminAuth />
      </Suspense>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <Suspense fallback={<PageLoader />}>
        <EmailVerification />
      </Suspense>
    ),
  },
  {
    path: '/privacy',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrivacyPolicy />
      </Suspense>
    ),
  },
  {
    path: '/terms',
    element: (
      <Suspense fallback={<PageLoader />}>
        <TermsAndConditions />
      </Suspense>
    ),
  },

  // Protected routes with layout
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'index',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Index />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: 'investments',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Investments />
          </Suspense>
        ),
      },
      {
        path: 'investments/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InvestmentDetails />
          </Suspense>
        ),
      },
      {
        path: 'p2p-lending',
        element: (
          <Suspense fallback={<PageLoader />}>
            <P2PLending />
          </Suspense>
        ),
      },
      {
        path: 'wallet',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Wallet />
          </Suspense>
        ),
      },
      {
        path: 'tasks',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Tasks />
          </Suspense>
        ),
      },
      {
        path: 'admin',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
    ],
  },

  // Catch all route
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
]); 