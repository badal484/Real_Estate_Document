import { useEffect, useState } from 'react';
import { knowledgeApi } from '@/services/api';
import {
  BookOpen,
  Send,
  Loader2,
  FileText,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { AssistantAnswer } from '@/types';

export function KnowledgePage() {
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    loadIndexedDocs();
  }, []);

  async function loadIndexedDocs() {
    try {
      setLoadingDocs(true);
      const docs = await knowledgeApi.getDocuments();
      setDocuments(docs);
    } catch {
      // Ignore initial load error
    } finally {
      setLoadingDocs(false);
    }
  }

  async function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setAsking(true);
      const res = await knowledgeApi.ask(question.trim());
      setAnswer(res);
    } catch (err: any) {
      alert(err.message || 'Failed to search knowledge base');
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-indigo-600" />
          AI Portfolio &amp; Policy Knowledge Assistant
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Ask grounded questions across all active deal contracts, counter offers, and company policy disclosures with verifiable citations.
        </p>
      </div>

      {/* ── Search Input Form ── */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-3">
        <form onSubmit={handleAskQuestion} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question across all portfolio contracts (e.g. Which deals have inspection contingencies expiring this week?)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2"
          >
            {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Ask Copilot
          </button>
        </form>

        {/* ── Suggested Questions Chips ── */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5" /> Sample Queries:
          </span>
          {[
            'What is the standard earnest money deposit deadline across active deals?',
            'Which counter offers modified inspection days?',
            'What remedies does the buyer have if repairs are not completed?',
          ].map((sq, i) => (
            <button
              key={i}
              onClick={() => setQuestion(sq)}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* ── Answer Display Section ── */}
      {answer && (
        <div className="rounded-2xl bg-white border border-indigo-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Grounded Answer</h2>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Confidence: {Math.round((answer.confidence || 0.9) * 100)}%
            </span>
          </div>

          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{answer.answer}</p>

          {/* ── Citations List ── */}
          {answer.citations && answer.citations.length > 0 && (
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Verifiable Document Citations ({answer.citations.length})
              </h3>
              <div className="space-y-2 pt-1">
                {answer.citations.map((c: any) => (
                  <div key={c.id} className="rounded-lg bg-white p-3 border border-slate-200 text-slate-700 space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-900 text-[11px]">
                      <span className="text-indigo-600 font-bold">[^ {c.id}] {c.documentName || 'Contract Document'}</span>
                      {c.pageNumber && <span>Page {c.pageNumber}</span>}
                    </div>
                    {c.quote && (
                      <p className="text-[11px] italic text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        "{c.quote}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Portfolio Indexed Documents ── */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600" />
          Indexed Knowledge Documents ({documents.length})
        </h2>

        {loadingDocs ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No uploaded contract documents indexed in knowledge base yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((d) => (
              <div key={d.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 text-xs space-y-1">
                <div className="font-bold text-slate-900 truncate">{d.filename}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-slate-400" />
                  <span className="truncate">{d.propertyAddress}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Type: {d.docType}</span>
                  <span className="font-bold text-emerald-600">{d.chunkCount} Chunks</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
