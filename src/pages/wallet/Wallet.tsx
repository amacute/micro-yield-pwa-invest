
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { DepositOptions } from '@/components/wallet/DepositOptions';
import { WithdrawalOptions } from '@/components/wallet/WithdrawalOptions';
import { P2PPayment } from '@/components/wallet/P2PPayment';
import { VerificationForm } from '@/components/verification/VerificationForm';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowDown, ArrowUp, Clock, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Wallet() {
  const { user } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [showP2P, setShowP2P] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  // Mock transaction data
  const transactions = [
    {
      id: 't1',
      type: 'deposit',
      amount: 500,
      date: new Date(2023, 4, 15),
      status: 'completed',
      description: 'Bank Deposit'
    },
    {
      id: 't2',
      type: 'investment',
      amount: -200,
      date: new Date(2023, 4, 16),
      status: 'completed',
      description: 'Urban Development Project'
    },
    {
      id: 't3',
      type: 'return',
      amount: 230,
      date: new Date(2023, 4, 19),
      status: 'completed',
      description: 'Return from Urban Development'
    },
    {
      id: 't4',
      type: 'withdrawal',
      amount: -100,
      date: new Date(2023, 4, 20),
      status: 'processing',
      description: 'Withdrawal to Bank'
    }
  ];
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'investment':
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'return':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const resetViews = () => {
    setShowDeposit(false);
    setShowWithdrawal(false);
    setShowP2P(false);
    setShowVerification(false);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">Manage your funds and transactions</p>
      </div>
      
      <BalanceCard />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => {
            resetViews();
            setShowDeposit(true);
          }}
        >
          Deposit Funds
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => {
            resetViews();
            setShowWithdrawal(true);
          }}
        >
          Withdraw Funds
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => {
            resetViews();
            setShowP2P(true);
          }}
        >
          P2P Payment
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => {
            resetViews();
            setShowVerification(true);
          }}
        >
          Verification
        </Button>
      </div>
      
      {(showDeposit || showWithdrawal || showP2P || showVerification) && (
        <div>
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => resetViews()}
          >
            ← Back to Transactions
          </Button>
          
          {showDeposit && <DepositOptions />}
          {showWithdrawal && <WithdrawalOptions />}
          {showP2P && <P2PPayment />}
          {showVerification && <VerificationForm />}
        </div>
      )}
      
      {!showDeposit && !showWithdrawal && !showP2P && !showVerification && (
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Card>
              <CardContent className="p-6 space-y-4">
                {transactions.length > 0 ? (
                  transactions.map(transaction => (
                    <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No transactions found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="deposits">
            <Card>
              <CardContent className="p-6">
                {transactions.filter(t => t.type === 'deposit').length > 0 ? (
                  transactions
                    .filter(t => t.type === 'deposit')
                    .map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-full">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-green-600">
                            +{transaction.amount.toFixed(2)}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No deposits found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="investments">
            <Card>
              <CardContent className="p-6">
                {transactions.filter(t => t.type === 'investment').length > 0 ? (
                  transactions
                    .filter(t => t.type === 'investment')
                    .map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-full">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-red-600">
                            {transaction.amount.toFixed(2)}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No investments found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdrawals">
            <Card>
              <CardContent className="p-6">
                {transactions.filter(t => t.type === 'withdrawal').length > 0 ? (
                  transactions
                    .filter(t => t.type === 'withdrawal')
                    .map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-full">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-red-600">
                            {transaction.amount.toFixed(2)}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No withdrawals found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
