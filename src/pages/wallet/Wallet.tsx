
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DepositOptions } from '@/components/wallet/DepositOptions';
import { WithdrawalOptions } from '@/components/wallet/WithdrawalOptions';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';

export default function Wallet() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock portfolio data
  const portfolioStats = {
    totalInvested: 2500,
    totalReturns: 3250,
    activeInvestments: 3,
    completedInvestments: 5,
    roi: 30
  };

  const recentInvestments = [
    {
      id: '1',
      title: 'Tech Startup Fund',
      amount: 1000,
      return: 1300,
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: '2',
      title: 'Real Estate Investment',
      amount: 1500,
      return: 1950,
      status: 'active',
      date: '2024-01-20'
    }
  ];

  const formatCurrency = (amount: number) => {
    return `${user?.currencySymbol || '$'}${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">Manage your funds and view transactions</p>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-2">Available Balance</p>
              <p className="text-3xl font-bold">
                {formatCurrency(user?.walletBalance || 0)}
              </p>
            </div>
            <WalletIcon className="h-12 w-12 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-xl font-bold">{formatCurrency(portfolioStats.totalInvested)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowUpRight className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Returns</p>
                <p className="text-xl font-bold">{formatCurrency(portfolioStats.totalReturns)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-600 font-bold">{portfolioStats.activeInvestments}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-bold">Investments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">+{portfolioStats.roi}%</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-xl font-bold">This Year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">
            <WalletIcon className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="deposit">
            <ArrowDownLeft className="h-4 w-4 mr-2" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Withdraw
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Investments</CardTitle>
              <CardDescription>Your latest investment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvestments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{investment.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Invested: {formatCurrency(investment.amount)} • {investment.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {formatCurrency(investment.return)}
                      </p>
                      <Badge variant={investment.status === 'completed' ? 'default' : 'secondary'}>
                        {investment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposit">
          <DepositOptions />
        </TabsContent>

        <TabsContent value="withdraw">
          <WithdrawalOptions />
        </TabsContent>

        <TabsContent value="history">
          <TransactionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
