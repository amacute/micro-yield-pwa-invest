
import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: Date;
  onComplete?: () => void;
}

export function CountdownTimer({ endTime, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsComplete(true);
        onComplete?.();
        return {
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  if (isComplete) {
    return <div className="text-axiom-primary font-medium">Complete</div>;
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <div className="bg-axiom-primary/10 rounded px-1.5 py-0.5">{formatTime(timeLeft.hours)}h</div>
      <span>:</span>
      <div className="bg-axiom-primary/10 rounded px-1.5 py-0.5">{formatTime(timeLeft.minutes)}m</div>
      <span>:</span>
      <div className="bg-axiom-primary/10 rounded px-1.5 py-0.5">{formatTime(timeLeft.seconds)}s</div>
    </div>
  );
}
