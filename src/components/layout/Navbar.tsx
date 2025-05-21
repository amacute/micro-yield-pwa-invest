
import { Link, useLocation } from 'react-router-dom';
import { Home, PieChart, Wallet, User } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  
  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/dashboard'
    },
    {
      icon: PieChart,
      label: 'Invest',
      path: '/investments'
    },
    {
      icon: Wallet,
      label: 'Wallet',
      path: '/wallet'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="container mx-auto px-4">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center py-3 px-1 text-xs ${
              isActive(item.path) 
                ? 'text-axiom-primary border-t-2 border-axiom-primary -mt-[1px]' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
