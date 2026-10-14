import { useState } from 'react';
import {
  IconBot,
  IconX,
  IconSparkles,
  IconDocumentText,
  IconArrowRight,
} from './icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dealAddress?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  clauseRef?: string;
}

export function CopilotDrawer({ isOpen, onClose, dealAddress }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello! I am your Real Estate Document Copilot. I've analyzed the purchase agreement for ${
        dealAddress || 'your deal'
      }. How can I assist you with contingency clauses or risk analysis?`,
      timestamp: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const PRESETS = [
    { label: 'Summarize Contingency Deadlines', query: 'What are all the active contingency deadlines in this contract?' },
    { label: 'Check Earnest Money Risk', query: 'What is the total earnest deposit at risk if buyer backs out?' },
    { label: 'Inspection Rights', query: 'What are the exact inspection contingency terms and repair request window?' },
    { label: 'Financing & Loan Approval', query: 'Is there a loan approval contingency and how many days does buyer have?' },
  ];

  function handleSend(queryText?: string) {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsTyping(true);

    // Simulate AI Copilot Response
    setTimeout(() => {
      let replyText = 'Based on the uploaded Purchase Agreement PDF: ';
      let refText: string | undefined;

      const q = textToSend.toLowerCase();
      if (q.includes('contingency') || q.includes('deadline')) {
        replyText += 'The contract contains 3 core contingencies: 1) Inspection (17 calendar days), 2) Financing Approval (21 calendar days), and 3) Title Review (10 business days). All relative dates start from the Acceptance Date.';
        refText = 'Clause Section 14.B (Page 4)';
      } else if (q.includes('earnest') || q.includes('risk') || q.includes('deposit')) {
        replyText += 'The Initial Earnest Deposit is $50,000 held in Escrow. If contingencies are unconfirmed after expiration, deposit may be subject to forfeiture per Section 22 (Liquidated Damages clause).';
        refText = 'Clause Section 3.A (Page 1)';
      } else if (q.includes('inspection') || q.includes('repair')) {
        replyText += 'Buyer has 17 calendar days from Acceptance to conduct physical property inspections, pest inspections, and deliver a Request for Repairs (CR Form) to Seller.';
        refText = 'Clause Section 14.A (Page 3)';
      } else if (q.includes('financing') || q.includes('loan')) {
        replyText += 'Buyer must obtain written loan pre-approval and deliver loan contingency removal within 21 calendar days from Acceptance Date.';
        refText = 'Clause Section 8.C (Page 2)';
      } else {
        replyText += 'I have analyzed all clauses in this agreement. The contract follows standard California Association of Realtors (CAR) Purchase Agreement structure. All key milestones are tracked on your Deal Dashboard.';
        refText = 'General Contract Analysis';
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clauseRef: refText,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-[#E4E4E7] bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E4E4E7] px-6 py-4 bg-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7]">
                <IconBot className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#09090B] flex items-center gap-2">
                  Document Copilot AI
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                    Live
                  </span>
                </h3>
                <p className="text-xs text-[#71717A] truncate max-w-[220px]">
                  {dealAddress || 'Real Estate Analysis'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#09090B] transition-colors cursor-pointer"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Preset Prompts */}
          <div className="border-b border-[#E4E4E7] bg-[#F9FAFB] p-3.5">
            <p className="px-1 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
              Instant Document Prompts
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p.query)}
                  className="rounded-full border border-[#E4E4E7] bg-white px-3 py-1 text-xs text-[#09090B] hover:border-[#A1A1AA] hover:bg-[#F4F4F5] transition-all text-left shadow-clean-xs cursor-pointer active:scale-95"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFB]/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'assistant' && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7]">
                    <IconSparkles className="h-4 w-4 text-amber-500" />
                  </span>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-clean-xs ${
                    m.sender === 'user'
                      ? 'bg-[#09090B] text-white rounded-br-xs'
                      : 'bg-white text-[#09090B] border border-[#E4E4E7] rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.clauseRef && (
                    <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-[#F4F4F5] px-2.5 py-1 text-[11px] font-medium text-[#09090B] border border-[#E4E4E7]">
                      <IconDocumentText className="h-3.5 w-3.5 text-[#71717A]" />
                      <span>{m.clauseRef}</span>
                    </div>
                  )}
                  <span className={`mt-1.5 block text-[10px] ${m.sender === 'user' ? 'text-zinc-400' : 'text-[#A1A1AA]'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#71717A] py-2">
                <IconSparkles className="h-4 w-4 animate-spin text-amber-500" />
                <span>AI is scanning document clauses...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="border-t border-[#E4E4E7] bg-white p-3.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about inspection, earnest deposit, financing..."
                className="flex-1 bg-[#F4F4F5] border border-[#E4E4E7] rounded-full px-4 py-2 text-xs text-[#09090B] placeholder-[#71717A] focus:outline-none focus:border-[#09090B] transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-full bg-[#09090B] hover:bg-black text-white p-2.5 text-xs transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <IconArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
