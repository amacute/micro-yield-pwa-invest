
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 py-20 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center justify-between">
          <div className="md:w-1/2 space-y-6 mt-8 md:mt-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Invest Smarter, <span className="text-axiom-primary">Grow Faster</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover high-return investment opportunities with Axiomify. Start your journey to financial freedom today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/signup">
                <Button className="text-lg h-12 px-8 btn-gradient">Get Started</Button>
              </Link>
              <Link to="/investments">
                <Button variant="outline" className="text-lg h-12 px-8">
                  View Investments
                </Button>
              </Link>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-8">
              <div>
                <p className="text-3xl font-bold text-axiom-primary">100%</p>
                <p className="text-sm text-muted-foreground">Return on Investment</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-axiom-primary">72h</p>
                <p className="text-sm text-muted-foreground">Investment Timeline</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-axiom-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Active Investors</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="/placeholder.svg" 
              alt="Investment Growth" 
              className="rounded-2xl shadow-2xl" 
              width={600} 
              height={400} 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-axiom-dark">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Axiomify?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg transition-all hover:shadow-lg">
              <div className="h-12 w-12 rounded-full bg-axiom-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-axiom-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">High Returns</h3>
              <p className="text-muted-foreground">Enjoy up to 100% returns on your investments within 72 hours.</p>
            </div>
            <div className="p-6 border rounded-lg transition-all hover:shadow-lg">
              <div className="h-12 w-12 rounded-full bg-axiom-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-axiom-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-muted-foreground">Your investments are protected with industry-leading security measures.</p>
            </div>
            <div className="p-6 border rounded-lg transition-all hover:shadow-lg">
              <div className="h-12 w-12 rounded-full bg-axiom-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-axiom-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">P2P Transactions</h3>
              <p className="text-muted-foreground">Seamless peer-to-peer transactions for deposits and withdrawals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-axiom-primary to-axiom-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Investing?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">Join thousands of investors who have already started their journey to financial freedom with Axiomify.</p>
          <Link to="/signup">
            <Button className="text-lg h-12 px-8 bg-white text-axiom-primary hover:bg-gray-100">Create Account Now</Button>
          </Link>
        </div>
      </section>

      {/* Footer with Address */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Axiomify</h3>
              <p className="text-gray-300 mb-4">
                Democratizing short-term investments through a transparent, decentralized P2P platform.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <p className="text-gray-300 mb-2">
                1900 Connecticut Ave NW<br />
                Washington, DC 20009<br />
                United States
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/terms-and-conditions" className="text-gray-300 hover:text-white block">
                  Terms & Conditions
                </Link>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-white block">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Axiomify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
