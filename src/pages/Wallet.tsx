import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 5000,
    status: 'completed',
    date: '2024-03-15',
    description: 'Bank transfer deposit'
  },
  {
    id: '2',
    type: 'investment',
    amount: -2500,
    status: 'completed',
    date: '2024-03-14',
    description: 'Growth Fund investment'
  },
  {
    id: '3',
    type: 'return',
    amount: 375,
    status: 'completed',
    date: '2024-03-13',
    description: 'Fixed Income Fund returns'
  }
];

export const Wallet: FC = () => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement deposit/withdrawal logic
    console.log(`${activeTab}ing ${amount}`);
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'return':
        return 'text-green-500';
      case 'withdrawal':
      case 'investment':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
            <CardDescription>Your current wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$2,875.00</div>
            <div className="mt-4 flex space-x-2">
              <Button
                onClick={() => setActiveTab('deposit')}
                variant={activeTab === 'deposit' ? 'default' : 'outline'}
                className="flex-1"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Deposit
              </Button>
              <Button
                onClick={() => setActiveTab('withdraw')}
                variant={activeTab === 'withdraw' ? 'default' : 'outline'}
                className="flex-1"
              >
                <MinusCircle className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deposit/Withdraw Form */}
        <Card>
          <CardHeader>
            <CardTitle>{activeTab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}</CardTitle>
            <CardDescription>
              {activeTab === 'deposit'
                ? 'Add funds to your investment wallet'
                : 'Withdraw funds to your bank account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                />
              </div>
              <Button type="submit" className="w-full">
                {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transaction History</CardTitle>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${getTransactionColor(transaction.type)}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </div>
                  <div className={`text-sm ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 