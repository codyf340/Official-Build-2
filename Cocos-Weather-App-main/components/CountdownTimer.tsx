
import React, { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string; // ISO string
}

// Fix: Changed from 'const TimeLeft' to 'interface TimeLeft' for correct type definition.
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

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  if (!timeLeft) {
    return (
        <div className="bg-slate-900/50 border-b border-white/5 py-3">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-4 text-center">
                <Rocket className="w-6 h-6 text-emerald-400 animate-pulse" />
                <p className="text-sm font-bold text-emerald-300 uppercase tracking-widest">
                    Big Coco's Weather Bureau Is Officially Live!
                </p>
            </div>
        </div>
    );
  }

  const timerComponents = [
    { label: 'days', value: timeLeft.days },
    { label: 'hours', value: timeLeft.hours },
    { label: 'minutes', value: timeLeft.minutes },
    { label: 'seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="bg-slate-900/50 border-b border-white/5 py-3">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center">
        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Official Launch In:</p>
        <div className="flex items-center gap-4 sm:gap-6">
            {timerComponents.map((component, index) => (
                <React.Fragment key={component.label}>
                    <div className="flex flex-col items-center">
                        <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tighter">
                          {String(component.value).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{component.label}</span>
                    </div>
                    {index < timerComponents.length - 1 && <span className="text-3xl font-thin text-slate-700">:</span>}
                </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
