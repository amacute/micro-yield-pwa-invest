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
import { useState, useEffect } from 'react';

export default function Wallet() {
  const { user } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [showP2P, setShowP2P] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      resetViews();
      
      switch (hash) {
        case 'deposit':
          setShowDeposit(true);
          break;
        case 'withdraw':
          setShowWithdrawal(true);
          break;
        case 'p2p':
          setShowP2P(true);
          break;
        case 'verification':
          setShowVerification(true);
          break;
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
  
  const handleBackClick = () => {
    window.location.hash = '';
    resetViews();
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
          onClick={() => window.location.hash = 'deposit'}
        >
          Add Funds
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => window.location.hash = 'withdraw'}
        >
          Withdraw Funds
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => window.location.hash = 'p2p'}
        >
          P2P Payment
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => window.location.hash = 'verification'}
        >
          Verification
        </Button>
      </div>
      
      {(showDeposit || showWithdrawal || showP2P || showVerification) && (
        <div>
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={handleBackClick}
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
        <TransactionHistory />
      )}
    </div>
  );
}
