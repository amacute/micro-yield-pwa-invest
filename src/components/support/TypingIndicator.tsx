
import { MessageCircle } from 'lucide-react';

export const TypingIndicator = () => {
  return (
    <div className="flex mb-4">
      <div className="h-8 w-8 mr-2 rounded-full bg-axiom-primary/10 flex items-center justify-center text-axiom-primary">
        <MessageCircle size={14} />
      </div>
      <div className="bg-muted/50 rounded-lg px-4 py-2">
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
          <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};
