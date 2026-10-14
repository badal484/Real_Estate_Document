import { useState } from 'react';
import type { ContingencyClause, Deadline } from '@/types';
import { PdfViewer } from './pdf/PdfViewer';
import {
  IconX,
  IconDocumentText,
  IconSparkles,
  IconShieldCheck,
  IconCheckCircle,
  IconClock,
  IconEye,
  IconDownload,
  IconChevronLeft,
  IconChevronRight,
} from './icons';
import { formatDate } from '@/utils/date';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  propertyAddress: string;
  deadlines: Deadline[];
}

export function DocumentInspectorModal({
  isOpen,
  onClose,
  propertyAddress,
  deadlines,
}: Props) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!isOpen) return null;

  const currentDeadline = deadlines[activeTab] || deadlines[0];
  const clause = currentDeadline?.clause;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-3xl border border-[#E4E4E7] bg-white shadow-2xl overflow-hidden text-[#09090B]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E4E4E7] bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-[#09090B] border border-[#E4E4E7]">
              <IconDocumentText className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#09090B]">Document Reader &amp; AI Inspector</h2>
                <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2.5 py-0.5">OCR Parsed</span>
              </div>
              <p className="text-xs text-[#71717A] truncate max-w-md">{propertyAddress}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-[#E4E4E7] bg-[#F4F4F5] px-2 py-1 text-xs text-[#71717A]">
              <button
                onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                className="px-2 py-0.5 font-bold hover:text-[#09090B]"
              >
                -
              </button>
              <span className="w-12 text-center text-[#09090B] font-mono font-semibold">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="px-2 py-0.5 font-bold hover:text-[#09090B]"
              >
                +
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#71717A] hover:bg-zinc-100 hover:text-[#09090B] transition-colors"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Split View Content */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
          {/* Left Column: PdfViewer */}
          <div className="flex flex-col border-r border-[#E4E4E7] bg-[#F9FAFB] p-4 lg:col-span-7 overflow-hidden">
            <PdfViewer
              fileUrl=""
              initialPage={clause?.pageNumber || 3}
              highlightQuote={clause?.rawText || currentDeadline?.clause?.rawText}
            />
          </div>

          {/* Right Column: Clause Breakdown & AI Reasoning */}
          <div className="flex flex-col bg-white p-6 lg:col-span-5 overflow-y-auto space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#09090B] font-mono block mb-1">
                AI Extraction Inspector
              </span>
              <h3 className="text-lg font-bold text-[#09090B]">Contingency Breakdown</h3>
              <p className="text-xs text-[#71717A]">Select an extracted clause to inspect detailed calculation &amp; verification rules.</p>
            </div>

            {/* Clause Selector Tabs */}
            <div className="space-y-2">
              {deadlines.map((d, idx) => (
                <button
                  key={d.id}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left rounded-2xl p-3.5 border transition-all flex items-center justify-between ${
                    activeTab === idx
                      ? 'border-[#09090B] bg-[#F4F4F5] text-[#09090B] shadow-clean-xs'
                      : 'border-[#E4E4E7] bg-white text-[#71717A] hover:border-zinc-400'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-[#09090B]">{d.label}</p>
                    <p className="text-[11px] text-[#71717A]">
                      Due: {formatDate(d.confirmedDate || d.computedDate)}
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                    d.status === 'PENDING' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {d.status}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Clause Deep-Dive */}
            {currentDeadline && (
              <div className="rounded-3xl border border-[#E4E4E7] bg-[#F9FAFB] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#09090B]">
                    AI Logic &amp; Date Calculation
                  </h4>
                  <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold flex items-center gap-1">
                    <IconShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Rule
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-white p-3.5 border border-[#E4E4E7] shadow-clean-xs">
                    <span className="text-[#71717A] block text-[10px]">Computed Date</span>
                    <span className="font-bold text-[#09090B] font-mono">{formatDate(currentDeadline.computedDate)}</span>
                  </div>
                  <div className="rounded-2xl bg-white p-3.5 border border-[#E4E4E7] shadow-clean-xs">
                    <span className="text-[#71717A] block text-[10px]">Day Rule Type</span>
                    <span className="font-bold text-[#09090B] capitalize">{currentDeadline.dayType} days</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#09090B] block mb-1">State Holiday Adjustment Logic</span>
                  <p className="text-xs text-[#71717A] bg-white p-3.5 rounded-2xl border border-[#E4E4E7] leading-relaxed shadow-clean-xs">
                    If computed deadline falls on a weekend or California official state holiday, execution rolls forward to 5:00 PM on the next business day pursuant to Civil Code Section 11.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
