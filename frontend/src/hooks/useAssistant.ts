import { useState, useCallback, useEffect } from 'react';
import { assistantApi } from '@/services/assistantApi';
import type { AssistantMessage, Citation, ExecutiveSummary } from '@/types';

export function useAssistant(dealId: string) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusStream, setStatusStream] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [indexStatus, setIndexStatus] = useState<string>('READY');
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  useEffect(() => {
    if (!dealId) return;

    assistantApi.getSuggestions(dealId).then(setSuggestions);
    assistantApi.getSummary(dealId).then(setSummary);
    assistantApi.getIndexStatus(dealId).then((res) => setIndexStatus(res.indexStatus));
  }, [dealId]);

  const askQuestion = useCallback(
    async (questionText: string) => {
      if (!questionText.trim()) return;

      const userMsg: AssistantMessage = {
        id: `user-${Date.now()}`,
        conversationId: 'current',
        role: 'user',
        content: questionText,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);
      setStatusStream('Analyzing contract documents & relative dates...');

      try {
        const responseMessage = await assistantApi.ask({
          dealId,
          question: questionText,
          onStatus: (st) => setStatusStream(st),
          onAnswer: (msg) => {
            setMessages((prev) => [...prev.filter((m) => m.id !== msg.id), msg]);
          },
        });

        setMessages((prev) => {
          const exists = prev.some((m) => m.id === responseMessage.id);
          if (exists) return prev;
          return [...prev, responseMessage];
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
        setStatusStream(null);
      }
    },
    [dealId],
  );

  return {
    messages,
    loading,
    statusStream,
    error,
    suggestions,
    summary,
    indexStatus,
    activeCitation,
    setActiveCitation,
    askQuestion,
  };
}
