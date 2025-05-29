
import { UserCard } from './UserCard';

interface UserGridProps {
  users: any[];
  selectedLender: any | null;
  selectedBorrower: any | null;
  onSelectLender: (user: any) => void;
  onSelectBorrower: (user: any) => void;
}

export function UserGrid({
  users,
  selectedLender,
  selectedBorrower,
  onSelectLender,
  onSelectBorrower
}: UserGridProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-muted-foreground">
          No eligible users found. Users must make a deposit before participating in P2P lending.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          selectedLender={selectedLender}
          selectedBorrower={selectedBorrower}
          onSelectLender={onSelectLender}
          onSelectBorrower={onSelectBorrower}
        />
      ))}
    </div>
  );
}
