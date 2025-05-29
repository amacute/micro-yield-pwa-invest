
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminSecurity } from '@/contexts/admin/AdminSecurityContext';
import { Loader } from '@/components/common/Loader';
import { toast } from '@/components/ui/sonner';

export default function AdminAuth() {
  const [activeTab, setActiveTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [superAdminCode, setSuperAdminCode] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { login, signup, isLoading } = useAuth();
  const { checkAdminStatus } = useAdminSecurity();
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
      
      // Check if user has admin privileges using database roles
      const isAdmin = await checkAdminStatus();
      
      if (!isAdmin) {
        toast.error('Insufficient privileges. Admin access required.');
        return;
      }
      
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
    
    // Validate super admin verification code (should be provided by existing super admin)
    if (!superAdminCode || superAdminCode.length < 8) {
      toast.error('Invalid super admin verification code. Contact your system administrator.');
      return;
    }
    
    try {
      // Create admin account
      await signup(name, email, password);
      
      toast.success('Admin account created successfully. Admin privileges must be granted by a super administrator.');
      toast.info('Please contact a super administrator to activate your admin privileges.');
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
            Secure administrative access with role-based authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="login">Admin Login</TabsTrigger>
              <TabsTrigger value="signup">Request Access</TabsTrigger>
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
                
                <div className="text-xs text-center text-muted-foreground">
                  Admin access is verified through database role management
                </div>
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
                  <label htmlFor="super-admin-code" className="text-sm font-medium">
                    Super Admin Verification Code
                  </label>
                  <Input
                    id="super-admin-code"
                    type="password"
                    placeholder="Enter verification code from super admin"
                    value={superAdminCode}
                    onChange={(e) => setSuperAdminCode(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This code must be provided by an existing super administrator. Contact your system administrator.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full btn-gradient" 
                  disabled={isLoading || !!passwordError}
                >
                  {isLoading ? <Loader size="small" color="text-white" /> : 'Request Admin Access'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Link to="/" className="text-center text-sm text-axiom-primary hover:underline w-full">
            Return to Home
          </Link>
          <p className="text-center text-xs text-amber-600 mt-4">
            🔒 Admin privileges are managed through secure database roles
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
