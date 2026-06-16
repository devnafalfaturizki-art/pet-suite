import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Toaster } from '@/components/ui/toaster';
import './index.css';
import './styles/print.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error: any) => {
        // Don't retry on permission errors or not-found
        if (error?.code === '42501' || error?.code === 'PGRST116') return false;
        // Don't retry on configuration errors (Supabase not set up)
        if (error?.code === 'CONFIG_ERROR') return false;
        // Max 2 retries for transient errors
        return count < 2;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: 0,
    },
  },
});

function Root() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

// Hydrate safely - ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Ensure index.html contains <div id="root"></div>');
}

ReactDOM.createRoot(rootElement).render(<Root />);