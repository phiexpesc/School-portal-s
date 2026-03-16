import { createContext, useContext, useState, useCallback } from 'react';
import { LoadingOverlay } from '@/components/ui/LoadingButton';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  withLoading: <T>(fn: () => Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const startLoading = useCallback((message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>, message = 'Loading...'): Promise<T> => {
    startLoading(message);
    try {
      const result = await fn();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, loadingMessage, startLoading, stopLoading, withLoading }}>
      {children}
      <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
