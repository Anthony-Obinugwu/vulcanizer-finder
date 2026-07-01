import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type AlertProps = {
  variant?: 'error' | 'success' | 'info';
  message: string;
  className?: string;
};

const variants = {
  error: {
    container: 'bg-red-950/30 border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]',
    icon: <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
  },
  success: {
    container: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    icon: <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
  },
  info: {
    container: 'bg-blue-950/30 border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    icon: <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
  }
};

export default function Alert({ variant = 'error', message, className = '' }: AlertProps) {
  const currentVariant = variants[variant];

  return (
    <div className={`border p-4 rounded-2xl flex items-start gap-3 backdrop-blur-md transition-all ${currentVariant.container} ${className}`}>
      {currentVariant.icon}
      <p className="font-medium">{message}</p>
    </div>
  );
}
