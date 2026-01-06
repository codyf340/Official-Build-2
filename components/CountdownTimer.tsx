
import React, { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string; // ISO string
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const calculateTimeLeft = (): TimeLeft | null => {
    const difference = +new Date(targetDate) - +new Date();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return null;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
        <div className="bg-slate-900/30 border-b border-white/5 py-1.5">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-center">
                <Rocket className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <p className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest">
                    SYSTEM LIVE
                </p>
            </div>
        </div>
    );
  }

  const timerComponents = [
    { label: 'd', value: timeLeft.days },
    { label: 'h', value: timeLeft.hours },
    { label: 'm', value: timeLeft.minutes },
    { label: 's', value: timeLeft.seconds },
  ];

  return (
    <div className="bg-slate-900/30 border-b border-white/5 py-1">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-4 text-center">
        <p className="text-[8px] font-black text-red-500 uppercase tracking-[0.2em]">Launch In:</p>
        <div className="flex items-center gap-3">
            {timerComponents.map((component, index) => (
                <React.Fragment key={component.label}>
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-white font-mono">
                          {String(component.value).padStart(2, '0')}
                        </span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">{component.label}</span>
                    </div>
                    {index < timerComponents.length - 1 && <span className="text-xs font-thin text-slate-700">:</span>}
                </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
