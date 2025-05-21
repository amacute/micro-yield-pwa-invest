
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { Investment } from '@/contexts/InvestmentContext';

interface InvestmentCardProps {
  investment: Investment;
}

export function InvestmentCard({ investment }: InvestmentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const progressPercentage = Math.min(
    Math.round((investment.raised / investment.goal) * 100),
    100
  );

  const getRiskColor = (risk: Investment['risk']) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'High':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Link 
      to={`/investments/${investment.id}`}
      className="investment-card block group transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-lg group-hover:text-axiom-primary transition-colors">
            {investment.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {investment.description}
          </p>
        </div>
        <Badge className={getRiskColor(investment.risk)}>{investment.risk} Risk</Badge>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Raised: ${investment.raised}</span>
          <span>Goal: ${investment.goal}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Return Rate</p>
          <p className="font-medium">{investment.returnRate}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Min. Investment</p>
          <p className="font-medium">${investment.minInvestment}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Time Remaining</p>
          <CountdownTimer endTime={investment.endTime} />
        </div>
        
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Investors</p>
          <p className="font-medium">{investment.investors}</p>
        </div>
      </div>
    </Link>
  );
}
