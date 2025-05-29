import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface InvestmentOption {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  returnRate: string;
  duration: string;
  risk: 'Low' | 'Medium' | 'High';
}

const investmentOptions: InvestmentOption[] = [
  {
    id: 'fixed-income',
    name: 'Fixed Income Fund',
    description: 'Stable returns with lower risk through diversified fixed-income securities',
    minAmount: 1000,
    maxAmount: 50000,
    returnRate: '6-8%',
    duration: '12 months',
    risk: 'Low'
  },
  {
    id: 'growth-fund',
    name: 'Growth Fund',
    description: 'Balance of growth and stability through mixed assets',
    minAmount: 2500,
    maxAmount: 100000,
    returnRate: '10-15%',
    duration: '24 months',
    risk: 'Medium'
  },
  {
    id: 'high-yield',
    name: 'High Yield Opportunities',
    description: 'Maximum potential returns through strategic high-growth investments',
    minAmount: 5000,
    maxAmount: 250000,
    returnRate: '15-25%',
    duration: '36 months',
    risk: 'High'
  }
];

export const Investments: FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);

  const handleInvest = (optionId: string) => {
    // TODO: Implement investment logic
    console.log(`Investing in ${optionId} with amount ${investmentAmount}`);
  };

  const getRiskColor = (risk: InvestmentOption['risk']) => {
    switch (risk) {
      case 'Low':
        return 'text-green-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'High':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Investment Options</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {investmentOptions.map((option) => (
          <Card key={option.id}>
            <CardHeader>
              <CardTitle>{option.name}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Minimum Investment</div>
                    <div className="font-medium">${option.minAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Expected Returns</div>
                    <div className="font-medium">{option.returnRate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium">{option.duration}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Risk Level</div>
                    <div className={`font-medium ${getRiskColor(option.risk)}`}>
                      {option.risk}
                    </div>
                  </div>
                </div>

                {selectedOption === option.id ? (
                  <div className="space-y-4">
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Enter investment amount"
                      min={option.minAmount}
                      max={option.maxAmount}
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleInvest(option.id)}
                        disabled={investmentAmount < option.minAmount}
                        className="flex-1"
                      >
                        Confirm Investment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedOption(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setSelectedOption(option.id)}
                    className="w-full"
                  >
                    Invest Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 