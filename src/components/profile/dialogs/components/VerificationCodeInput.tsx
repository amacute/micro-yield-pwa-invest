
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function VerificationCodeInput({ 
  value, 
  onChange, 
  disabled = false 
}: VerificationCodeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange(newValue);
  };

  return (
    <div>
      <Label htmlFor="code">Verification Code</Label>
      <Input
        id="code"
        value={value}
        onChange={handleChange}
        placeholder="Enter 6-digit code"
        maxLength={6}
        className="font-mono text-center text-lg"
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Enter the 6-digit code from your authenticator app
      </p>
    </div>
  );
}
