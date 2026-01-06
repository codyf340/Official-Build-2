
import React from 'react';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface GlobalAlertStatusProps {
  status: 'idle' | 'checking' | 'success' | 'error';
  lastChecked: string | null;
}

const GlobalAlertStatus: React.FC<GlobalAlertStatusProps> = ({ status, lastChecked }) => {
  if (status === 'idle') return null;
  const configs = {
    checking: { color: 'text-slate-300', icon: <RefreshCw className="w-3 h-3 animate-spin" />, text: 'Syncing regional nodes...' },
    success: { color: 'text-emerald-300', icon: <CheckCircle className="w-3 h-3" />, text: `System nominal. Last check: ${lastChecked}` },
    error: { color: 'text-red-300', icon: <AlertTriangle className="w-3 h-3" />, text: 'Sync failure. Re-establishing link...' }
  };
  const config = configs[status];
  return (
    <div className={`border-b border-white/5 bg-slate-900/50 py-1.5`}>
      <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
        <span className={config.color}>{config.icon}</span>
        <span className={config.color}>{config.text}</span>
      </div>
    </div>
  );
};

export default GlobalAlertStatus;
