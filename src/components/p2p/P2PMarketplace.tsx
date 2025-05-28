import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface LoanListing {
  id: string;
  amount: number;
  interestRate: number;
  duration: number;
  borrower: string;
  status: 'active' | 'funded' | 'completed';
  riskScore: number;
}

const P2PMarketplace: React.FC = () => {
  const [activeLoans, setActiveLoans] = React.useState<LoanListing[]>([
    {
      id: '1',
      amount: 5000,
      interestRate: 12,
      duration: 12,
      borrower: '0x1234...5678',
      status: 'active',
      riskScore: 85
    },
    // Add more sample data as needed
  ]);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">P2P Lending Marketplace</h1>
      
      <Tabs defaultValue="marketplace" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="my-investments">My Investments</TabsTrigger>
          <TabsTrigger value="my-loans">My Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filters */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Input placeholder="Min Amount" type="number" className="w-32" />
                <Input placeholder="Max Amount" type="number" className="w-32" />
                <Input placeholder="Min Interest Rate" type="number" className="w-32" />
                <Button>Apply Filters</Button>
              </CardContent>
            </Card>

            {/* Loan Listings */}
            {activeLoans.map((loan) => (
              <Card key={loan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    ${loan.amount.toLocaleString()}
                    <Badge variant="secondary">{loan.status}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Borrower: {loan.borrower}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Interest Rate:</span>
                      <span className="font-semibold">{loan.interestRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-semibold">{loan.duration} months</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Risk Score:</span>
                      <div className={`px-2 py-1 rounded text-white ${getRiskColor(loan.riskScore)}`}>
                        {loan.riskScore}
                      </div>
                    </div>
                    <Button className="w-full mt-4">Invest Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-investments">
          <Card>
            <CardHeader>
              <CardTitle>My Investments</CardTitle>
              <CardDescription>Track your lending portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Invested</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold">$0.00</span>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Expected Returns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="text-2xl font-bold text-green-600">$0.00</span>
                    </CardContent>
                  </Card>
                </div>
                {/* Add investment history table here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-loans">
          <Card>
            <CardHeader>
              <CardTitle>My Loans</CardTitle>
              <CardDescription>Manage your borrowing</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="mb-4">Request New Loan</Button>
              {/* Add loan management interface here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default P2PMarketplace; 