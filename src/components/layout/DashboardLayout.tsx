import { FC, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, Settings, LogOut, LayoutDashboard, Bell, PlayCircle, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();

  const sidebarItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: PlayCircle, label: 'Watch Videos', path: '/dashboard/watch-videos' },
    { icon: LayoutDashboard, label: 'Tasks', path: '/dashboard/tasks/tiktok' },
    { icon: Handshake, label: 'P2P Lending', path: '/dashboard/p2p' },
    { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 bg-black/40 border-r border-yellow-600/20 flex flex-col fixed h-full">
        <div className="p-4 border-b border-yellow-600/20">
          <h1 className="text-xl font-bold hidden md:block text-white">Dashboard</h1>
          <div className="md:hidden flex justify-center">
            <Bell size={24} className="text-white" />
          </div>
        </div>
        <nav className="flex-1 p-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-lg mb-1 hover:bg-yellow-600/20 transition-colors text-white',
                location.pathname === item.path && 'bg-yellow-600/20'
              )}
            >
              <item.icon size={20} />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}
          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg mb-1 hover:bg-yellow-600/20 transition-colors text-red-400 w-full mt-auto">
            <LogOut size={20} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-16 md:pl-64">
        {/* Header */}
        <header className="h-16 border-b border-yellow-600/20 flex items-center justify-between px-4 bg-black/40">
          <h2 className="text-lg font-semibold text-white">Dashboard</h2>
          <Button variant="outline" className="border-yellow-600/20 text-white hover:bg-yellow-600/20">
            Submit a request
          </Button>
        </header>
        
        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 