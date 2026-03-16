import { Loader2 } from 'lucide-react';

interface LoadingButtonProps {
  children: React.ReactNode;
  isLoading: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function LoadingButton({ 
  children, 
  isLoading, 
  onClick, 
  type = 'button',
  className = '',
  disabled = false,
  variant = 'primary'
}: LoadingButtonProps) {
  const baseClasses = 'relative flex items-center justify-center gap-2 px-4 py-2 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] hover:scale-105 active:scale-95',
    secondary: 'bg-white border-[3px] border-[rgba(26,26,26,0.85)] hover:bg-[var(--bg-primary)]',
    danger: 'bg-red-100 text-red-700 border-[3px] border-red-300 hover:bg-red-200'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {isLoading && (
        <Loader2 size={18} className="animate-spin" />
      )}
      <span className={isLoading ? 'opacity-70' : ''}>{children}</span>
    </button>
  );
}

interface LoadingOverlayProps {
  message?: string;
  isVisible: boolean;
}

export function LoadingOverlay({ message = 'Loading...', isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="card p-6 flex flex-col items-center gap-4 animate-in zoom-in duration-200">
        <div className="w-12 h-12 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
          <Loader2 size={24} className="animate-spin" />
        </div>
        <p className="text-sm font-bold text-[var(--text-secondary)]">{message}</p>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingCard({ isLoading, children, className = '' }: LoadingCardProps) {
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-[24px] flex items-center justify-center z-10">
          <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
        </div>
      )}
      {children}
    </div>
  );
}

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
