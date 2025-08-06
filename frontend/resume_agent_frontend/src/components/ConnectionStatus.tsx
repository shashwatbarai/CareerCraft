import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.healthCheck();
        setStatus('connected');
      } catch (error) {
        console.log('Backend not available:', error);
        setStatus('disconnected');
      }
    };

    // Don't check immediately to prevent blocking render
    const timeout = setTimeout(checkConnection, 1000);
    const interval = setInterval(checkConnection, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking backend connection...</span>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Backend connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-red-600">
      <XCircle className="w-4 h-4" />
      <span className="text-sm">Backend disconnected - Please start the server</span>
    </div>
  );
};