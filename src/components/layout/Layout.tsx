
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Header } from './Header';
import { Navbar } from './Navbar';
import { Loader } from '@/components/common/Loader';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CustomerCareChat } from '@/components/support/CustomerCareChat';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function Layout({ children, requireAuth = false, requireAdmin = false }: LayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();

  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/serviceWorker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(err => {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }
  }, []);

  // Show loader while checking authentication status
  if (isLoading || (requireAdmin && adminLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // If auth is required but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin is required but user is not admin, redirect to dashboard
  if (requireAdmin && (!isAuthenticated || !isAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (isAuthenticated && ['/login', '/signup'].includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-axiom-light dark:bg-axiom-dark">
        <Header />
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <main className="flex-1 container mx-auto px-4 py-6 md:px-6">
          {children}
        </main>
        {isAuthenticated && (
          <footer className="sticky bottom-0 bg-white dark:bg-axiom-dark border-t border-border">
            <Navbar />
          </footer>
        )}
        <div className="py-2 text-center text-xs text-muted-foreground border-t">
          <div className="container mx-auto flex justify-center space-x-4">
            <a href="/terms-and-conditions" className="hover:underline">Terms and Conditions</a>
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
          </div>
        </div>
        
        {/* Add the customer care chat component */}
        <CustomerCareChat />
      </div>
    </TooltipProvider>
  );
}
