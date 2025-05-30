import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TikTokTask from '@/pages/TikTokTask';
import WatchVideos from '@/pages/WatchVideos';
import P2PLendingDashboard from '@/pages/P2PLendingDashboard';
import Home from '@/pages/Home';
import { AuthProvider } from '@/contexts/AuthContext';

// Placeholder components for other routes
const Wallet = () => <div>Wallet Page</div>;
const Settings = () => <div>Settings Page</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Routes>
                  <Route index element={<Navigate to="/dashboard/p2p" replace />} />
                  <Route path="tasks/tiktok" element={<TikTokTask />} />
                  <Route path="watch-videos" element={<WatchVideos />} />
                  <Route path="p2p" element={<P2PLendingDashboard />} />
                  <Route path="wallet" element={<Wallet />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </DashboardLayout>
            }
          />
        </Routes>
        <Toaster position="top-center" />
      </Router>
    </AuthProvider>
  );
}

export default App;
