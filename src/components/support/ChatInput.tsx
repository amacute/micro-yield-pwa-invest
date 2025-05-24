
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
}

export const ChatInput = ({ message, onMessageChange, onSendMessage }: ChatInputProps) => {
  return (
    <form onSubmit={onSendMessage} className="w-full flex gap-2">
      <Input
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Type a message..."
        className="flex-1"
      />
      <Button type="submit" size="icon" className="bg-axiom-primary hover:bg-axiom-secondary">
        <Send size={16} />
      </Button>
    </form>
  );
};
