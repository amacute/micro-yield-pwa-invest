import React from 'react';
import P2PMarketplace from '@/components/p2p/P2PMarketplace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const P2PLendingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Peer-to-Peer Lending Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with borrowers and lenders directly. Earn better returns on your investments
              or get competitive rates on loans.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg">Start Investing</Button>
              <Button size="lg" variant="outline">Get a Loan</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">$10M+</div>
              <div className="text-gray-600">Total Loans Funded</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">12%</div>
              <div className="text-gray-600">Average Returns</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-gray-600">Active Users</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Marketplace */}
      <div className="container mx-auto px-6 py-12">
        <P2PMarketplace />
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-6 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
            <p className="text-gray-600">
              Sign up and complete your profile verification to start investing or borrowing.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Browse Opportunities</h3>
            <p className="text-gray-600">
              Explore available loan listings or submit your loan request with competitive rates.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Earning</h3>
            <p className="text-gray-600">
              Invest in loans and earn monthly returns, or receive funding for your needs.
            </p>
          </div>
        </div>
      </div>

      {/* Trust & Security Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Trust & Security</h2>
          <p className="text-gray-600 mb-8">
            We prioritize the security of your investments and personal information.
            Our platform uses bank-level encryption and follows strict regulatory guidelines.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4">
              <div className="text-xl font-bold mb-2">256-bit</div>
              <div className="text-gray-600">SSL Encryption</div>
            </div>
            <div className="p-4">
              <div className="text-xl font-bold mb-2">100%</div>
              <div className="text-gray-600">Data Protection</div>
            </div>
            <div className="p-4">
              <div className="text-xl font-bold mb-2">24/7</div>
              <div className="text-gray-600">Monitoring</div>
            </div>
            <div className="p-4">
              <div className="text-xl font-bold mb-2">Regulated</div>
              <div className="text-gray-600">Platform</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default P2PLendingPage; 