
import { Button } from '@/components/ui/button';
import { Loader2, Users } from 'lucide-react';
import { MatchSummaryCard } from './user-matching/MatchSummaryCard';
import { UserGrid } from './user-matching/UserGrid';
import { useUserMatching } from './user-matching/useUserMatching';

export function UserMatching() {
  const {
    users,
    loading,
    selectedLender,
    selectedBorrower,
    loanAmount,
    loanPurpose,
    processing,
    setSelectedLender,
    setSelectedBorrower,
    setLoanAmount,
    setLoanPurpose,
    handleCreateMatch,
    resetSelection
  } = useUserMatching();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          P2P Lending Matching
        </h2>
        {(selectedLender || selectedBorrower) && (
          <Button variant="outline" onClick={resetSelection}>
            Reset Selection
          </Button>
        )}
      </div>
      
      <MatchSummaryCard
        selectedLender={selectedLender}
        selectedBorrower={selectedBorrower}
        loanAmount={loanAmount}
        loanPurpose={loanPurpose}
        processing={processing}
        onLoanAmountChange={setLoanAmount}
        onLoanPurposeChange={setLoanPurpose}
        onCreateMatch={handleCreateMatch}
      />
      
      <UserGrid
        users={users}
        selectedLender={selectedLender}
        selectedBorrower={selectedBorrower}
        onSelectLender={setSelectedLender}
        onSelectBorrower={setSelectedBorrower}
      />
    </div>
  );
}
