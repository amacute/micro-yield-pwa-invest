
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from './AuthContext';

export type Investment = {
  id: string;
  title: string;
  description: string;
  amount: number;
  minInvestment: number;
  maxInvestment: number;
  returnRate: number; // percentage
  duration: number; // in hours
  investors: number;
  raised: number;
  goal: number;
  risk: 'Low' | 'Medium' | 'High';
  category: 'Real Estate' | 'Business' | 'Crypto' | 'P2P';
  endTime: Date;
  createdAt: Date;
  status: 'active' | 'funded' | 'completed' | 'failed';
};

export type UserInvestment = {
  id: string;
  investmentId: string;
  amount: number;
  expectedReturn: number;
  date: Date;
  status: 'active' | 'completed' | 'failed';
  endDate: Date;
  investmentTitle: string;
};

type InvestmentContextType = {
  availableInvestments: Investment[];
  userInvestments: UserInvestment[];
  invest: (investmentId: string, amount: number) => Promise<void>;
  withdraw: (userInvestmentId: string) => Promise<void>;
  reinvest: (userInvestmentId: string) => Promise<void>;
};

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

export const useInvestment = () => {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestment must be used within an InvestmentProvider');
  }
  return context;
};

type InvestmentProviderProps = {
  children: ReactNode;
};

// Mock investment data
const mockInvestments: Investment[] = [
  {
    id: '1',
    title: 'Urban Development Project',
    description: 'Fund a new urban development project in downtown area with expected high returns.',
    amount: 0,
    minInvestment: 10,
    maxInvestment: 5000,
    returnRate: 100, // Updated to 100% return
    duration: 72, // 72 hours
    investors: 28,
    raised: 12560,
    goal: 25000,
    risk: 'Medium',
    category: 'Real Estate',
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 72), // 72 hours from now
    createdAt: new Date(),
    status: 'active',
  },
  {
    id: '2',
    title: 'Tech Startup Funding',
    description: 'Support an emerging tech startup with innovative AI solutions for healthcare.',
    amount: 0,
    minInvestment: 10,
    maxInvestment: 10000,
    returnRate: 100, // Updated to 100% return
    duration: 72, // 72 hours
    investors: 15,
    raised: 8700,
    goal: 15000,
    risk: 'High',
    category: 'Business',
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 72), // 72 hours from now
    createdAt: new Date(),
    status: 'active',
  },
  {
    id: '3',
    title: 'Cryptocurrency Mining Pool',
    description: 'Join a cryptocurrency mining pool with steady returns and distributed risk.',
    amount: 0,
    minInvestment: 10,
    maxInvestment: 2000,
    returnRate: 100, // Updated to 100% return
    duration: 72, // 72 hours
    investors: 42,
    raised: 4230,
    goal: 10000,
    risk: 'Medium',
    category: 'Crypto',
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 72), // 72 hours from now
    createdAt: new Date(),
    status: 'active',
  },
  {
    id: '4',
    title: 'P2P Loan Bundle',
    description: 'Diversified bundle of peer-to-peer loans across multiple industries.',
    amount: 0,
    minInvestment: 10,
    maxInvestment: 3000,
    returnRate: 100, // Updated to 100% return
    duration: 72, // 72 hours
    investors: 56,
    raised: 18450,
    goal: 20000,
    risk: 'Low',
    category: 'P2P',
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 72), // 72 hours from now
    createdAt: new Date(),
    status: 'active',
  }
];

export const InvestmentProvider = ({ children }: InvestmentProviderProps) => {
  const [availableInvestments, setAvailableInvestments] = useState<Investment[]>(mockInvestments);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const { user } = useAuth();

  const invest = async (investmentId: string, amount: number) => {
    if (!user) {
      toast.error('Please login to invest');
      return;
    }

    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const investment = availableInvestments.find(inv => inv.id === investmentId);
      
      if (!investment) {
        toast.error('Investment opportunity not found');
        return;
      }
      
      if (amount < investment.minInvestment || amount > investment.maxInvestment) {
        toast.error(`Investment must be between $${investment.minInvestment} and $${investment.maxInvestment}`);
        return;
      }

      if (amount > (user?.walletBalance || 0)) {
        toast.error('Insufficient funds in your wallet');
        return;
      }

      // Calculate expected return
      const expectedReturn = amount + (amount * (investment.returnRate / 100));
      
      // Create user investment record
      const userInvestment: UserInvestment = {
        id: `ui-${Date.now()}`,
        investmentId,
        amount,
        expectedReturn,
        date: new Date(),
        status: 'active',
        endDate: new Date(Date.now() + investment.duration * 60 * 60 * 1000),
        investmentTitle: investment.title
      };
      
      setUserInvestments(prev => [...prev, userInvestment]);
      
      // Update investment data
      const updatedInvestments = availableInvestments.map(inv => {
        if (inv.id === investmentId) {
          return {
            ...inv,
            raised: inv.raised + amount,
            investors: inv.investors + 1,
          };
        }
        return inv;
      });
      
      setAvailableInvestments(updatedInvestments);
      
      // In a real app, we would update the user's wallet balance via an API
      // For now we'll just show a success message
      toast.success(`Successfully invested $${amount} in ${investment.title}`);
    } catch (error) {
      toast.error('Failed to process investment. Please try again.');
      console.error(error);
    }
  };

  const withdraw = async (userInvestmentId: string) => {
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find the investment to withdraw
      const investmentToWithdraw = userInvestments.find(inv => inv.id === userInvestmentId);
      
      if (!investmentToWithdraw) {
        toast.error('Investment not found');
        return;
      }
      
      // Update status to completed
      setUserInvestments(prev => 
        prev.map(inv => 
          inv.id === userInvestmentId 
            ? { ...inv, status: 'completed' as const } 
            : inv
        )
      );
      
      toast.success(`Successfully withdrawn $${investmentToWithdraw.expectedReturn.toFixed(2)} to your wallet`);
    } catch (error) {
      toast.error('Failed to process withdrawal. Please try again.');
      console.error(error);
    }
  };

  const reinvest = async (userInvestmentId: string) => {
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find the completed investment to reinvest
      const investmentToReinvest = userInvestments.find(inv => inv.id === userInvestmentId);
      
      if (!investmentToReinvest) {
        toast.error('Investment not found');
        return;
      }

      // Create a new investment with the returned amount
      const newUserInvestment: UserInvestment = {
        id: `ui-${Date.now()}`,
        investmentId: investmentToReinvest.investmentId,
        amount: investmentToReinvest.expectedReturn,
        expectedReturn: investmentToReinvest.expectedReturn + (investmentToReinvest.expectedReturn * 0.15), // Assuming 15% return
        date: new Date(),
        status: 'active',
        endDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
        investmentTitle: investmentToReinvest.investmentTitle
      };
      
      // Update the original investment to completed status
      setUserInvestments(prev => [
        ...prev.map(inv => 
          inv.id === userInvestmentId 
            ? { ...inv, status: 'completed' as const } 
            : inv
        ),
        newUserInvestment
      ]);
      
      toast.success(`Successfully reinvested $${investmentToReinvest.expectedReturn.toFixed(2)}`);
    } catch (error) {
      toast.error('Failed to process reinvestment. Please try again.');
      console.error(error);
    }
  };

  return (
    <InvestmentContext.Provider
      value={{
        availableInvestments,
        userInvestments,
        invest,
        withdraw,
        reinvest,
      }}
    >
      {children}
    </InvestmentContext.Provider>
  );
};
