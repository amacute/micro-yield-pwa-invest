
import { User, MessageCircle } from 'lucide-react';
import { Message } from './types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={`mb-4 ${
        message.isBot ? 'flex' : 'flex justify-end'
      }`}
    >
      {message.isBot && (
        <div className="h-8 w-8 mr-2 rounded-full bg-axiom-primary/10 flex items-center justify-center text-axiom-primary">
          <MessageCircle size={14} />
        </div>
      )}
      <div
        className={`rounded-lg px-4 py-2 max-w-[80%] ${
          message.isBot
            ? 'bg-muted/50 text-foreground'
            : 'bg-axiom-primary text-white ml-2'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {!message.isBot && (
        <div className="h-8 w-8 ml-2 rounded-full bg-axiom-primary/10 flex items-center justify-center text-axiom-primary">
          <User size={14} />
        </div>
      )}
    </div>
  );
};
