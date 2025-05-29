
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserCardProps {
  user: any;
  selectedLender: any | null;
  selectedBorrower: any | null;
  onSelectLender: (user: any) => void;
  onSelectBorrower: (user: any) => void;
}

export function UserCard({
  user,
  selectedLender,
  selectedBorrower,
  onSelectLender,
  onSelectBorrower
}: UserCardProps) {
  const isSelectedLender = selectedLender?.id === user.id;
  const isSelectedBorrower = selectedBorrower?.id === user.id;
  
  const cardClassName = `cursor-pointer transition-all ${
    isSelectedLender ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' :
    isSelectedBorrower ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' :
    'hover:shadow-md'
  }`;

  return (
    <Card className={cardClassName}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium">{user.full_name || "Unnamed User"}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">${Number(user.wallet_balance || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Balance</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className="text-xs">
            Profile Created
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isSelectedLender ? "default" : "outline"}
            onClick={() => onSelectLender(isSelectedLender ? null : user)}
            disabled={isSelectedBorrower}
            className="flex-1"
          >
            Lender
          </Button>
          <Button
            size="sm"
            variant={isSelectedBorrower ? "default" : "outline"}
            onClick={() => onSelectBorrower(isSelectedBorrower ? null : user)}
            disabled={isSelectedLender}
            className="flex-1"
          >
            Borrower
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
