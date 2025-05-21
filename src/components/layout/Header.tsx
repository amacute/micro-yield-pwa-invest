
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-axiom-dark border-b border-border sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-axiom-primary to-axiom-secondary flex items-center justify-center text-white font-bold">A</div>
          <span className="text-xl font-bold text-axiom-dark dark:text-white">Axiomify</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/notifications" className="relative">
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">2</Badge>
              </Link>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="py-6 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>

                    <nav className="space-y-1 flex-1">
                      <Link to="/profile" className="block px-3 py-2 rounded-md hover:bg-muted">
                        My Profile
                      </Link>
                      <Link to="/settings" className="block px-3 py-2 rounded-md hover:bg-muted">
                        Settings
                      </Link>
                      <Link to="/help" className="block px-3 py-2 rounded-md hover:bg-muted">
                        Help Center
                      </Link>
                    </nav>

                    <Button onClick={logout} variant="outline" className="w-full mt-6">
                      Log Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="default">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-0 inset-x-0 z-50 bg-white dark:bg-axiom-dark p-4 h-screen">
            <div className="flex justify-between items-center mb-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-axiom-primary to-axiom-secondary flex items-center justify-center text-white font-bold">A</div>
                <span className="text-xl font-bold">Axiomify</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <nav className="flex flex-col space-y-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" className="p-3 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/investments" className="p-3 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                    Investments
                  </Link>
                  <Link to="/wallet" className="p-3 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                    Wallet
                  </Link>
                  <Link to="/profile" className="p-3 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <Button onClick={logout} variant="outline" className="w-full mt-4">
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
