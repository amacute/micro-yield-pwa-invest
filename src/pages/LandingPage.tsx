
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Clock, PieChart, Wallet } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-axiom-primary to-axiom-secondary">
                  P2P Investment
                </span>{" "}
                Platform for Everyone
              </h1>
              
              <p className="text-lg text-muted-foreground">
                Connect directly with high-yield investment opportunities 
                on a transparent, easy-to-use platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto btn-gradient">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Log In
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                  ))}
                </div>
                <p>Trusted by 1000+ investors</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-axiom-primary/20 rounded-full blur-3xl"></div>
              <div className="relative z-10 bg-white dark:bg-axiom-dark rounded-2xl border shadow-lg p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                    <h3 className="text-2xl font-bold">$1,250.50</h3>
                  </div>
                  <div className="p-3 bg-axiom-primary/10 rounded-full">
                    <Wallet className="h-5 w-5 text-axiom-primary" />
                  </div>
                </div>
                
                <div className="h-1 bg-muted mb-6 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-axiom-primary to-axiom-secondary"></div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { name: "Urban Development", amount: "$500", return: "+15%" },
                    { name: "Tech Startup", amount: "$350", return: "+20%" },
                    { name: "P2P Loan Bundle", amount: "$400.50", return: "+12%" }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-axiom-primary/10 flex items-center justify-center">
                          <PieChart className="h-4 w-4 text-axiom-primary" />
                        </div>
                        <span>{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.amount}</div>
                        <div className="text-xs text-green-600">{item.return}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Axiomify?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform offers a unique approach to investments with a focus on transparency, 
              accessibility, and consistent returns.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="h-6 w-6 text-axiom-primary" />,
                title: "72-Hour Cycle",
                description: "Quick investment cycles with returns disbursed after just 72 hours."
              },
              {
                icon: <Shield className="h-6 w-6 text-axiom-primary" />,
                title: "Secure Platform",
                description: "Advanced security measures to keep your investments and data safe."
              },
              {
                icon: <PieChart className="h-6 w-6 text-axiom-primary" />,
                title: "Diverse Opportunities",
                description: "Access various investment categories with different risk levels."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-axiom-dark p-6 rounded-xl shadow-sm border">
                <div className="p-3 bg-axiom-primary/10 rounded-full w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-axiom-primary to-axiom-secondary text-white">
        <div className="container mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Investing?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of investors already growing their wealth on our platform. 
            Start with as little as $10.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
            
            <Link to="/learn">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/20">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-axiom-dark border-t">
        <div className="container mx-auto max-w-5xl px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-axiom-primary to-axiom-secondary flex items-center justify-center text-white font-bold">A</div>
                <span className="text-xl font-bold">Axiomify</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A peer-to-peer investment platform for short-term, high-yield opportunities.
              </p>
            </div>
            
            {["Company", "Resources", "Support"].map((category, i) => (
              <div key={i}>
                <h3 className="font-medium mb-4">{category}</h3>
                <ul className="space-y-2">
                  {["About Us", "Careers", "Blog", "Contact"].map((item, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-6 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Axiomify. All rights reserved.
            </p>
            
            <div className="flex gap-4 mt-4 md:mt-0">
              {["Terms", "Privacy", "Security"].map((item, i) => (
                <a key={i} href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
