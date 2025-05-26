
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/common/Loader';
import { countries } from '@/data/countries';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    countryCode: '+1',
    country: 'US',
    referralCode: ''
  });
  const { signup, signInWithGoogle, isLoading } = useAuth();

  // Get referral code from URL params
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const fullPhone = formData.phone ? `${formData.countryCode}${formData.phone}` : undefined;
    
    await signup(formData.name, formData.email, formData.password, {
      phone: fullPhone,
      country: formData.country,
      referralCode: formData.referralCode || undefined
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container max-w-md mx-auto pt-8">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name *
              </label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number *
              </label>
              <div className="flex gap-2">
                <Select value={formData.countryCode} onValueChange={(value) => handleInputChange('countryCode', value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+33">+33</SelectItem>
                    <SelectItem value="+49">+49</SelectItem>
                    <SelectItem value="+81">+81</SelectItem>
                    <SelectItem value="+86">+86</SelectItem>
                    <SelectItem value="+91">+91</SelectItem>
                    <SelectItem value="+234">+234</SelectItem>
                    <SelectItem value="+27">+27</SelectItem>
                    <SelectItem value="+55">+55</SelectItem>
                    <SelectItem value="+52">+52</SelectItem>
                    <SelectItem value="+61">+61</SelectItem>
                    <SelectItem value="+64">+64</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  placeholder="1234567890"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-medium">
                Country
              </label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password *
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password *
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
              />
            </div>

            {formData.referralCode && (
              <div className="space-y-2">
                <label htmlFor="referralCode" className="text-sm font-medium">
                  Referral Code
                </label>
                <Input
                  id="referralCode"
                  placeholder="Enter referral code"
                  value={formData.referralCode}
                  onChange={(e) => handleInputChange('referralCode', e.target.value)}
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full btn-gradient" 
              disabled={isLoading}
            >
              {isLoading ? <Loader size="small" color="text-white" /> : 'Create Account'}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                type="button" 
                disabled={isLoading}
                onClick={signInWithGoogle}
              >
                Google
              </Button>
              <Button variant="outline" type="button" disabled={isLoading}>
                Apple
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-center text-sm text-muted-foreground mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-axiom-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
