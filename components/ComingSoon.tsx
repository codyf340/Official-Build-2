
import React from 'react';
import { Sparkles } from 'lucide-react';

const ComingSoon: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="p-6 rounded-[2rem] border border-white/5 bg-slate-900/30 flex flex-col items-center justify-center text-center opacity-60">
    <Sparkles className="w-8 h-8 text-slate-600 mb-4" />
    <h3 className="text-lg font-bold text-slate-400 mb-1">{title}</h3>
    <p className="text-xs text-slate-500 uppercase tracking-widest">{description}</p>
  </div>
);

export default ComingSoon;
