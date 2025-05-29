import { ReferralInfo } from '@/components/ReferralInfo';

export function ReferralSystem() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Referral Program</h3>
        <p className="text-sm text-muted-foreground">
          Invite friends to join Micro Yield Invest and earn $10 for each successful referral.
          Your friends will also receive a $10 bonus when they make their first investment!
        </p>
      </div>
      
      <ReferralInfo />
    </div>
  );
}
