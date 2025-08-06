import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export const AgentStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'active' | 'inactive'>('checking');

  useEffect(() => {
    const checkAgentStatus = async () => {
      try {
        await api.healthCheck();
        setStatus('active');
      } catch (error) {
        setStatus('inactive');
      }
    };

    checkAgentStatus();
    const interval = setInterval(checkAgentStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Checking agents...</span>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Agents active</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-red-600">
      <XCircle className="w-4 h-4" />
      <span className="text-sm">Agents offline</span>
    </div>
  );
};