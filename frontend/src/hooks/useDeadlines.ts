import { useState, useEffect } from 'react';
import { deadlinesApi } from '@/services/api';
import type { Deadline, ConfirmDeadlineInput } from '@/types';

interface UseDeadlinesReturn {
  deadlines: Deadline[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  confirmDeadline: (deadlineId: string, input: ConfirmDeadlineInput) => Promise<Deadline>;
}

export function useDeadlines(dealId: string): UseDeadlinesReturn {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    if (!dealId) return;
    setLoading(true);
    setError(null);

    deadlinesApi
      .list(dealId)
      .then(setDeadlines)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [dealId, rev]);

  const confirmDeadline = async (deadlineId: string, input: ConfirmDeadlineInput) => {
    const updated = await deadlinesApi.confirm(dealId, deadlineId, input);
    setRev((r) => r + 1);
    return updated;
  };

  return {
    deadlines,
    loading,
    error,
    refetch: () => setRev((r) => r + 1),
    confirmDeadline,
  };
}

