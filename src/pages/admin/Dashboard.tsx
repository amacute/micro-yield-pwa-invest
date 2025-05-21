
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Investment, useInvestment } from '@/contexts/InvestmentContext';
import { toast } from '@/components/ui/sonner';
import { Users, Clock, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminDashboard() {
  const { availableInvestments } = useInvestment();
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Mock admin stats
  const stats = {
    totalUsers: 724,
    activeInvestments: 47,
    completedInvestments: 156,
    totalVolume: 542690,
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage platform investments and users</p>
        </div>
        
        <Button>Create Investment Opportunity</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <ArrowUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Investments</p>
                <p className="text-2xl font-bold">{stats.activeInvestments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Investments</p>
                <p className="text-2xl font-bold">{stats.completedInvestments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <ArrowDown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="matching">P2P Matching</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Welcome to the admin dashboard. Here you can manage all aspects of the platform.</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={() => setSelectedTab('investments')} variant="outline" className="h-24">
                  Manage Investment Opportunities
                </Button>
                <Button onClick={() => setSelectedTab('users')} variant="outline" className="h-24">
                  Manage Users
                </Button>
                <Button onClick={() => setSelectedTab('matching')} variant="outline" className="h-24">
                  P2P Matching & Connections
                </Button>
                <Button variant="outline" className="h-24">
                  Platform Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="investments">
          <Card>
            <CardHeader>
              <CardTitle>Active Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableInvestments.map((investment) => (
                  <div key={investment.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{investment.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${investment.raised.toLocaleString()} of ${investment.goal.toLocaleString()} raised
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Input placeholder="Search users..." />
                <Button>Search</Button>
              </div>
              
              <div className="border rounded-lg">
                <div className="grid grid-cols-4 p-3 font-medium border-b bg-muted/50">
                  <div>User</div>
                  <div>Email</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="grid grid-cols-4 p-3 border-b last:border-0">
                    <div>User {index + 1}</div>
                    <div>user{index + 1}@example.com</div>
                    <div>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="matching">
          <P2PMatching />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function P2PMatching() {
  const [selectedBorrower, setSelectedBorrower] = useState<string | null>(null);
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([]);
  
  // Mock data
  const borrowers = [
    { id: 'b1', name: 'John Doe', amount: 5000, purpose: 'Small Business Loan', risk: 'Medium' },
    { id: 'b2', name: 'Jane Smith', amount: 2000, purpose: 'Property Development', risk: 'Low' },
    { id: 'b3', name: 'Alex Johnson', amount: 10000, purpose: 'Tech Startup', risk: 'High' },
  ];
  
  const investors = [
    { id: 'i1', name: 'Michael Brown', availableAmount: 2000, preferredRisk: 'Low-Medium' },
    { id: 'i2', name: 'Sarah Wilson', availableAmount: 5000, preferredRisk: 'Medium-High' },
    { id: 'i3', name: 'David Lee', availableAmount: 1000, preferredRisk: 'Low' },
    { id: 'i4', name: 'Emily Clark', availableAmount: 7500, preferredRisk: 'Any' },
  ];
  
  const handleMatch = () => {
    if (!selectedBorrower || selectedInvestors.length === 0) {
      toast.error('Please select both a borrower and at least one investor');
      return;
    }
    
    toast.success('Successfully matched investors with borrower!');
    // Reset selections
    setSelectedBorrower(null);
    setSelectedInvestors([]);
  };
  
  const toggleInvestor = (id: string) => {
    if (selectedInvestors.includes(id)) {
      setSelectedInvestors(selectedInvestors.filter(i => i !== id));
    } else {
      setSelectedInvestors([...selectedInvestors, id]);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Borrowers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {borrowers.map((borrower) => (
              <div 
                key={borrower.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedBorrower === borrower.id ? 'bg-axiom-primary/10 border-axiom-primary' : ''
                }`}
                onClick={() => setSelectedBorrower(borrower.id)}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">{borrower.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    borrower.risk === 'Low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    borrower.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {borrower.risk} Risk
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{borrower.purpose}</p>
                <p className="font-medium mt-2">Amount: ${borrower.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Investors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investors.map((investor) => (
              <div 
                key={investor.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedInvestors.includes(investor.id) ? 'bg-axiom-primary/10 border-axiom-primary' : ''
                }`}
                onClick={() => toggleInvestor(investor.id)}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">{investor.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    Preferred: {investor.preferredRisk}
                  </span>
                </div>
                <p className="font-medium mt-2">Available: ${investor.availableAmount.toLocaleString()}</p>
                {selectedInvestors.includes(investor.id) && (
                  <div className="mt-2 flex items-center gap-2">
                    <Input 
                      type="number" 
                      placeholder="Amount to invest" 
                      className="text-sm" 
                      min={10}
                      max={investor.availableAmount}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Create P2P Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium mb-2">Match Summary</h3>
              {selectedBorrower ? (
                <p>
                  Selected Borrower: {borrowers.find(b => b.id === selectedBorrower)?.name}
                </p>
              ) : (
                <p className="text-muted-foreground">No borrower selected</p>
              )}
              
              {selectedInvestors.length > 0 ? (
                <div className="mt-2">
                  <p>Selected Investors:</p>
                  <ul className="list-disc list-inside">
                    {selectedInvestors.map(id => (
                      <li key={id}>{investors.find(i => i.id === id)?.name}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted-foreground">No investors selected</p>
              )}
            </div>
            
            <Button onClick={handleMatch} disabled={!selectedBorrower || selectedInvestors.length === 0} className="w-full">
              Create P2P Match
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
