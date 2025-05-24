
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
  country?: string;
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
  lastInvestmentTime?: Date;
  referrerId?: string; // Track who referred this user for this investment
};

export type ReferralRecord = {
  id: string;
  referrerId: string;
  refereeId: string;
  investmentId: string;
  investmentAmount: number;
  commissionAmount: number;
  commissionRate: number;
  date: Date;
  type: 'first_investment' | 'recommitment';
};

type InvestmentContextType = {
  availableInvestments: Investment[];
  userInvestments: UserInvestment[];
  referralRecords: ReferralRecord[];
  invest: (investmentId: string, amount: number, referrerId?: string) => Promise<void>;
  withdraw: (userInvestmentId: string) => Promise<void>;
  reinvest: (userInvestmentId: string) => Promise<void>;
  getUserReferralLink: (userId: string) => string;
  checkInvestmentEligibility: () => { eligible: boolean; timeRemaining?: number };
  getReferralStats: (userId: string) => { totalEarnings: number; totalReferrals: number };
  getUserReferrals: (userId: string) => ReferralRecord[];
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
    returnRate: 100,
    duration: 72,
    investors: 28,
    raised: 12560,
    goal: 25000,
    risk: 'Medium',
    category: 'Real Estate',
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 72),
    createdAt: new Date(),
    status: 'active',
    country: 'United States',
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
    country: 'Canada',
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
    country: 'United Kingdom',
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
    country: 'Australia',
  }
];

export const InvestmentProvider = ({ children }: InvestmentProviderProps) => {
  const [availableInvestments, setAvailableInvestments] = useState<Investment[]>(mockInvestments);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [referralRecords, setReferralRecords] = useState<ReferralRecord[]>([]);
  const { user } = useAuth();

  // Function to get user referral link
  const getUserReferralLink = (userId: string) => {
    return `${window.location.origin}/signup?ref=${userId}`;
  };

  // Get referral statistics for a user
  const getReferralStats = (userId: string) => {
    const userReferrals = referralRecords.filter(record => record.referrerId === userId);
    const totalEarnings = userReferrals.reduce((sum, record) => sum + record.commissionAmount, 0);
    const uniqueReferees = new Set(userReferrals.map(record => record.refereeId));
    
    return {
      totalEarnings,
      totalReferrals: uniqueReferees.size
    };
  };

  // Get all referrals made by a user
  const getUserReferrals = (userId: string) => {
    return referralRecords.filter(record => record.referrerId === userId);
  };

  // Check if user is eligible to invest (72-hour cycle)
  const checkInvestmentEligibility = () => {
    if (!user || userInvestments.length === 0) {
      return { eligible: true };
    }

    const lastInvestment = [...userInvestments]
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    
    if (!lastInvestment) {
      return { eligible: true };
    }

    const lastInvestmentTime = lastInvestment.date.getTime();
    const currentTime = Date.now();
    const timeDifference = currentTime - lastInvestmentTime;
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 72) {
      const timeRemaining = 72 - hoursDifference;
      return { 
        eligible: false, 
        timeRemaining: Math.ceil(timeRemaining)
      };
    }

    return { eligible: true };
  };

  const invest = async (investmentId: string, amount: number, referrerId?: string) => {
    if (!user) {
      toast.error('Please login to invest');
      return;
    }

    try {
      // Check investment eligibility (72-hour cycle)
      const eligibility = checkInvestmentEligibility();
      if (!eligibility.eligible) {
        toast.error(`You can only invest once every 72 hours. Please wait ${eligibility.timeRemaining} more hours.`);
        return;
      }

      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const investment = availableInvestments.find(inv => inv.id === investmentId);
      
      if (!investment) {
        toast.error('Investment opportunity not found');
        return;
      }
      
      if (amount < investment.minInvestment || amount > investment.maxInvestment) {
        toast.error(`Investment must be between ${user?.currencySymbol || '$'}${investment.minInvestment} and ${user?.currencySymbol || '$'}${investment.maxInvestment}`);
        return;
      }

      if (amount > (user?.walletBalance || 0)) {
        toast.error('Insufficient funds in your wallet');
        return;
      }

      // Calculate expected return
      const expectedReturn = amount + (amount * (investment.returnRate / 100));
      
      // Check if this is the user's first investment for referral tracking
      const isFirstInvestment = userInvestments.length === 0;
      
      // Create user investment record
      const userInvestment: UserInvestment = {
        id: `ui-${Date.now()}`,
        investmentId,
        amount,
        expectedReturn,
        date: new Date(),
        status: 'active',
        endDate: new Date(Date.now() + investment.duration * 60 * 60 * 1000),
        investmentTitle: investment.title,
        lastInvestmentTime: new Date(),
        referrerId: referrerId
      };
      
      setUserInvestments(prev => [...prev, userInvestment]);
      
      // Handle referral commission
      if (referrerId && referrerId !== user.id) {
        const commissionRate = 0.05; // 5% commission
        const commissionAmount = amount * commissionRate;
        
        const referralRecord: ReferralRecord = {
          id: `ref-${Date.now()}`,
          referrerId,
          refereeId: user.id,
          investmentId,
          investmentAmount: amount,
          commissionAmount,
          commissionRate,
          date: new Date(),
          type: isFirstInvestment ? 'first_investment' : 'recommitment'
        };
        
        setReferralRecords(prev => [...prev, referralRecord]);
        
        toast.success(`Investment successful! Your referrer earned ${user?.currencySymbol || '$'}${commissionAmount.toFixed(2)} commission.`);
      }
      
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
      
      toast.success(`Successfully invested ${user?.currencySymbol || '$'}${amount} in ${investment.title}`);
    } catch (error) {
      toast.error('Failed to process investment. Please try again.');
      console.error(error);
    }
  };

  const withdraw = async (userInvestmentId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const investmentToWithdraw = userInvestments.find(inv => inv.id === userInvestmentId);
      
      if (!investmentToWithdraw) {
        toast.error('Investment not found');
        return;
      }
      
      setUserInvestments(prev => 
        prev.map(inv => 
          inv.id === userInvestmentId 
            ? { ...inv, status: 'completed' as const } 
            : inv
        )
      );
      
      toast.success(`Successfully withdrawn ${user?.currencySymbol || '$'}${investmentToWithdraw.expectedReturn.toFixed(2)} to your wallet`);
    } catch (error) {
      toast.error('Failed to process withdrawal. Please try again.');
      console.error(error);
    }
  };

  const reinvest = async (userInvestmentId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const investmentToReinvest = userInvestments.find(inv => inv.id === userInvestmentId);
      
      if (!investmentToReinvest) {
        toast.error('Investment not found');
        return;
      }

      const eligibility = checkInvestmentEligibility();
      if (!eligibility.eligible) {
        toast.error(`You can only invest once every 72 hours. Please wait ${eligibility.timeRemaining} more hours.`);
        return;
      }

      const newUserInvestment: UserInvestment = {
        id: `ui-${Date.now()}`,
        investmentId: investmentToReinvest.investmentId,
        amount: investmentToReinvest.expectedReturn,
        expectedReturn: investmentToReinvest.expectedReturn + (investmentToReinvest.expectedReturn * 1),
        date: new Date(),
        status: 'active',
        endDate: new Date(Date.now() + 72 * 60 * 60 * 1000),
        investmentTitle: investmentToReinvest.investmentTitle,
        lastInvestmentTime: new Date(),
        referrerId: investmentToReinvest.referrerId
      };
      
      // Handle referral commission for recommitment
      if (investmentToReinvest.referrerId && user) {
        const commissionRate = 0.05; // 5% commission
        const commissionAmount = investmentToReinvest.expectedReturn * commissionRate;
        
        const referralRecord: ReferralRecord = {
          id: `ref-${Date.now()}`,
          referrerId: investmentToReinvest.referrerId,
          refereeId: user.id,
          investmentId: investmentToReinvest.investmentId,
          investmentAmount: investmentToReinvest.expectedReturn,
          commissionAmount,
          commissionRate,
          date: new Date(),
          type: 'recommitment'
        };
        
        setReferralRecords(prev => [...prev, referralRecord]);
      }
      
      setUserInvestments(prev => [
        ...prev.map(inv => 
          inv.id === userInvestmentId 
            ? { ...inv, status: 'completed' as const } 
            : inv
        ),
        newUserInvestment
      ]);
      
      toast.success(`Successfully reinvested ${user?.currencySymbol || '$'}${investmentToReinvest.expectedReturn.toFixed(2)}`);
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
        referralRecords,
        invest,
        withdraw,
        reinvest,
        getUserReferralLink,
        checkInvestmentEligibility,
        getReferralStats,
        getUserReferrals
      }}
    >
      {children}
    </InvestmentContext.Provider>
  );
};
