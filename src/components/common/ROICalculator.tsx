
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface ROICalculatorProps {
  minInvestment: number;
  maxInvestment: number;
  returnRate: number;
  onChange?: (amount: number) => void;
}

export function ROICalculator({ 
  minInvestment, 
  maxInvestment, 
  returnRate, 
  onChange 
}: ROICalculatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState(minInvestment);
  
  useEffect(() => {
    // Initialize with min investment
    setInvestmentAmount(minInvestment);
  }, [minInvestment]);

  const handleSliderChange = (value: number[]) => {
    const amount = value[0];
    setInvestmentAmount(amount);
    onChange?.(amount);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = Number(event.target.value);
    
    // Validate amount is within range
    if (!isNaN(amount)) {
      const clampedAmount = Math.min(Math.max(amount, minInvestment), maxInvestment);
      setInvestmentAmount(clampedAmount);
      onChange?.(clampedAmount);
    }
  };

  // Calculate expected return
  const expectedReturn = investmentAmount + (investmentAmount * (returnRate / 100));

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Investment Calculator</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-muted-foreground">Investment Amount</label>
              <span className="text-sm font-medium">${investmentAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Slider 
                  min={minInvestment} 
                  max={maxInvestment} 
                  step={1} 
                  value={[investmentAmount]} 
                  onValueChange={handleSliderChange}
                />
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  value={investmentAmount}
                  onChange={handleInputChange}
                  min={minInvestment}
                  max={maxInvestment}
                  className="text-right"
                />
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${minInvestment}</span>
              <span>${maxInvestment}</span>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Return Rate:</span>
              <span className="text-sm font-medium">{returnRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Expected Return:</span>
              <span className="text-sm font-medium">${expectedReturn.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-axiom-primary/10 p-4 rounded-md">
            <div className="flex justify-between">
              <span className="font-medium">Profit:</span>
              <span className="font-medium text-axiom-primary">${(expectedReturn - investmentAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
