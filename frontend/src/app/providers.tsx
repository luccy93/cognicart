'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { WebSocketProvider } from '@/components/websocket/websocket-provider';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        {children}
        <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#15151D',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#00E587', secondary: '#fff' } },
          error: { iconTheme: { primary: '#FF6B35', secondary: '#fff' } },
        }}
      />
      </WebSocketProvider>
    </QueryClientProvider>
  );
}
