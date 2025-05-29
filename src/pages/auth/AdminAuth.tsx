
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader } from '@/components/common/Loader';
import { toast } from '@/components/ui/sonner';

export default function AdminAuth() {
  const [activeTab, setActiveTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { login, signup, isLoading } = useAuth();
  const { checkAdminStatus } = useAdmin();
  const navigate = useNavigate();

  const validatePassword = (value: string) => {
    if (value.length < 12) {
      return "Password must be at least 12 characters long";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      
      // Check if user has admin privileges
      await checkAdminStatus();
      
      // Note: The actual admin check will be done by the AdminProvider
      // If user is not admin, they'll be redirected appropriately
      navigate('/admin');
    } catch (error) {
      toast.error('Invalid credentials or insufficient privileges');
    }
  };

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    // Validate admin key - using a more secure key
    if (adminKey !== 'AXIOM_ADMIN_2024_SECURE_KEY_v1.2.3') {
      toast.error('Invalid admin registration key');
      return;
    }
    
    try {
      // Create admin account
      await signup(name, email, password);
      
      // Note: Admin privileges will need to be granted manually by a super admin
      // in the database after account creation for security
      toast.success('Admin account created successfully. Admin privileges must be granted by a super administrator.');
      navigate('/admin');
    } catch (error) {
      toast.error('Failed to create admin account');
    }
  };

  return (
    <div className="container max-w-md mx-auto pt-8">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Portal</CardTitle>
          <CardDescription className="text-center">
            Secure administrative access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="admin-email" className="text-sm font-medium">
                    Admin Email
                  </label>
                  <Input
                    id="admin-email"
                    placeholder="admin@axiomify.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="admin-password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full btn-gradient" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader size="small" color="text-white" /> : 'Secure Admin Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleAdminSignup} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="admin-name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="admin-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="admin-signup-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="admin-signup-email"
                    placeholder="admin@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="admin-signup-password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="admin-signup-password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  {passwordError && (
                    <p className="text-xs text-red-500">
                      {passwordError}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="admin-confirm-password" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <Input
                    id="admin-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="admin-key" className="text-sm font-medium">
                    Admin Registration Key
                  </label>
                  <Input
                    id="admin-key"
                    type="password"
                    placeholder="Enter secure admin registration key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Secure admin registration key required. Contact your system administrator.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full btn-gradient" 
                  disabled={isLoading || !!passwordError}
                >
                  {isLoading ? <Loader size="small" color="text-white" /> : 'Create Secure Admin Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Link to="/" className="text-center text-sm text-axiom-primary hover:underline w-full">
            Return to Home
          </Link>
          <p className="text-center text-xs text-red-600 mt-4">
            ⚠️ Admin access requires proper authorization
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
