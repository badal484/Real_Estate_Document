import { useState, useEffect, useCallback, useRef } from 'react';
import { assistantApi } from '@/services/api';
import type {
  AssistantMessage,
  Citation,
  DealSummaryResponse,
  IndexStatusResponse,
} from '@/types';

export function useAssistant(dealId: string) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [summary, setSummary] = useState<DealSummaryResponse | null>(null);
  const [indexStatus, setIndexStatus] = useState<IndexStatusResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [streamingStage, setStreamingStage] = useState<'retrieving' | 'reasoning' | 'verifying' | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load initial contextual suggestions & summary
  const loadInitialData = useCallback(async () => {
    try {
      const [sugRes, sumRes, idxRes] = await Promise.allSettled([
        assistantApi.getSuggestions(dealId),
        assistantApi.getSummary(dealId),
        assistantApi.getIndexStatus(dealId),
      ]);

      if (sugRes.status === 'fulfilled') setSuggestions(sugRes.value.suggestions || []);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (idxRes.status === 'fulfilled') setIndexStatus(idxRes.value);
    } catch (err) {
      console.warn('Failed to load initial assistant data:', err);
    }
  }, [dealId]);

  useEffect(() => {
    if (dealId) {
      loadInitialData();
    }
  }, [dealId, loadInitialData]);

  // Ask question with SSE streaming & JSON fallback
  const askQuestion = async (question: string) => {
    if (!question.trim()) return;

    setError(null);
    setLoading(true);
    setStreamingStage('retrieving');
    setStreamingMessage('Loading deal documents & contract records...');

    // Add user message to state immediately
    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      conversationId: conversationId || '',
      role: 'user',
      content: question,
      citations: null,
      suggestedFollowUps: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const baseUrl = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001/api';
    const sseUrl = `${baseUrl}/deals/${dealId}/assistant/ask?stream=true`;

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(sseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ question, conversationId }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to get answer from assistant.`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const matchEvent = block.match(/^event: (.*)$/m);
          const matchData = block.match(/^data: ([\s\S]*)$/m);

          const eventType = matchEvent ? matchEvent[1].trim() : 'message';
          const rawData = matchData ? matchData[1].trim() : '';

          if (!rawData) continue;

          try {
            const data = JSON.parse(rawData);

            if (eventType === 'status') {
              setStreamingStage(data.stage);
              setStreamingMessage(data.message);
            } else if (eventType === 'answer') {
              setConversationId(data.conversationId);
              const assistantMsg: AssistantMessage = {
                id: data.messageId || `asst-${Date.now()}`,
                conversationId: data.conversationId,
                role: 'assistant',
                content: data.answer,
                citations: data.citations,
                suggestedFollowUps: data.suggestedFollowUps,
                createdAt: data.createdAt || new Date().toISOString(),
              };
              setMessages((prev) => [...prev, assistantMsg]);
            } else if (eventType === 'error') {
              setError(data.message || 'An error occurred during reasoning.');
            }
          } catch (e) {
            console.warn('Error parsing SSE block:', e);
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      console.warn('SSE stream failed or fallback to plain JSON:', err);
      // Fallback to standard JSON endpoint
      try {
        const res = await assistantApi.ask(dealId, { question, conversationId });
        setConversationId(res.conversationId);
        const assistantMsg: AssistantMessage = {
          id: res.messageId,
          conversationId: res.conversationId,
          role: 'assistant',
          content: res.answer,
          citations: res.citations,
          suggestedFollowUps: res.suggestedFollowUps,
          createdAt: res.createdAt,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (jsonErr: any) {
        setError(jsonErr.message || 'Failed to get answer from AI Knowledge Assistant.');
      }
    } finally {
      setLoading(false);
      setStreamingStage(null);
      setStreamingMessage('');
    }
  };

  const focusCitation = (citation: Citation) => {
    setActiveCitation(citation);
  };

  const clearMessages = () => {
    setMessages([]);
    setConversationId(undefined);
    setActiveCitation(null);
  };

  return {
    messages,
    conversationId,
    suggestions,
    summary,
    indexStatus,
    loading,
    streamingStage,
    streamingMessage,
    error,
    activeCitation,
    askQuestion,
    focusCitation,
    clearMessages,
    reloadSummary: loadInitialData,
  };
}
