import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { InvestmentProvider } from '@/contexts/InvestmentContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { Toaster } from '@/components/ui/sonner';
import { router } from './router';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InvestmentProvider>
          <AdminProvider>
            <RouterProvider router={router} />
            <Toaster />
          </AdminProvider>
        </InvestmentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
