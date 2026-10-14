import { useEffect, useState } from 'react';
import { knowledgeApi } from '@/services/api';
import {
  Send,
  Loader2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Zap,
} from 'lucide-react';
import type { AssistantAnswer } from '@/types';

export function KnowledgePage() {
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  const [, setDocuments] = useState<any[]>([]);
  const [, setLoadingDocs] = useState(true);

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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ── Enterprise Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E4E4E7] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[#09090B]">
              AI Portfolio RAG Assistant &amp; Vector Store
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Tenant Isolated
            </span>
          </div>
          <p className="text-xs text-[#71717A] mt-1">
            Verifiable RAG queries across active deal contracts, disclosures, real estate law, and company policy documents.
          </p>
        </div>
      </div>

      {/* ── Search Input Form Container ── */}
      <div className="bg-white border border-[#E4E4E7] rounded-3xl p-6 shadow-clean-sm space-y-4">
        <form onSubmit={handleAskQuestion} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask any contract question (e.g. Which deals have inspection contingencies expiring this week?)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-full px-5 py-3 text-xs text-[#09090B] placeholder-[#71717A] focus:outline-none focus:border-[#09090B] focus:bg-white transition-all shadow-clean-xs"
            />
          </div>
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="px-6 py-3 rounded-full bg-[#09090B] hover:bg-black text-white text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-clean-xs active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
          >
            {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>Ask RAG Copilot</span>
          </button>
        </form>

        {/* ── Suggested Questions Chips ── */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-[#E4E4E7]">
          <span className="text-[#71717A] flex items-center gap-1 text-[11px] font-medium">
            <HelpCircle className="h-3.5 w-3.5 text-[#A1A1AA]" /> Portfolio Queries:
          </span>
          {[
            'What is the standard earnest money deposit deadline across active deals?',
            'Which counter offers modified inspection days?',
            'What remedies does the buyer have if repairs are not completed?',
          ].map((sq, i) => (
            <button
              key={i}
              onClick={() => setQuestion(sq)}
              className="rounded-full bg-[#F4F4F5] border border-[#E4E4E7] px-3.5 py-1 text-[#71717A] hover:text-[#09090B] hover:bg-white hover:border-[#D4D4D8] transition-all text-left text-xs font-medium cursor-pointer shadow-clean-xs active:scale-95"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* ── Answer Display Section ── */}
      {answer && (
        <div className="bg-white border border-[#E4E4E7] rounded-3xl p-6 shadow-clean-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7]">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <h2 className="text-sm font-semibold text-[#09090B]">Verifiable Grounded Answer</h2>
            </div>
            <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-600" /> Grounded Confidence: {Math.round((answer.confidence || 0.9) * 100)}%
            </span>
          </div>

          <p className="text-xs text-[#09090B] leading-relaxed whitespace-pre-wrap font-sans bg-[#F9FAFB] p-5 rounded-2xl border border-[#E4E4E7]">
            {answer.answer}
          </p>

          {/* ── Citations List ── */}
          {answer.citations && answer.citations.length > 0 && (
            <div className="rounded-2xl bg-white p-4 border border-[#E4E4E7] space-y-3 text-xs">
              <h3 className="font-semibold text-[#09090B] flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Traceable Document Citations ({answer.citations.length})
              </h3>

              <div className="grid gap-2 sm:grid-cols-2">
                {answer.citations.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-[#E4E4E7] bg-[#F9FAFB] space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-[#09090B]">
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#71717A]" />
                        {c.documentName || 'Contract Document'}
                      </span>
                      {c.pageNumber && (
                        <span className="font-mono text-[#71717A]">Page {c.pageNumber}</span>
                      )}
                    </div>
                    {c.quote && (
                      <p className="text-[11px] text-[#71717A] italic font-mono line-clamp-2">
                        &ldquo;{c.quote}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
