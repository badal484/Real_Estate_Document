import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  Calendar,
  Bell,
  Scale,
  ShieldCheck,
  Bot,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface FeatureItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ElementType;
  tag: string;
  link: string;
  linkLabel: string;
}

export const CORE_FEATURES: FeatureItem[] = [
  {
    id: 'ingestion',
    title: 'AI Contract Ingestion',
    category: 'Document Intelligence',
    description:
      'Upload executed Purchase & Sale Agreements. Clauses, addenda, counter offers, and mutual acceptance dates are parsed in under 3 seconds.',
    icon: FileText,
    tag: 'Instant OCR & Parser',
    link: '/upload',
    linkLabel: 'Ingest Agreement',
  },
  {
    id: 'date-math',
    title: 'Deterministic Date Math',
    category: 'Legal Calendar Engine',
    description:
      'Automatically calculates contingency deadlines adjusting for federal holidays, Saturday/Sunday rules, and jurisdiction cutoff hours.',
    icon: Calendar,
    tag: 'Zero Date Errors',
    link: '/contracts',
    linkLabel: 'View State Rules',
  },
  {
    id: 'alerts',
    title: 'Automated Milestone Alerts',
    category: 'Delivery Orchestration',
    description:
      'Dispatches verified reminders to agents, buyers, sellers, and escrow officers via Resend at T-3, T-1, and 9:00 AM on deadline day.',
    icon: Bell,
    tag: 'Email & SMS Engine',
    link: '/pricing',
    linkLabel: 'Alert Windows',
  },
  {
    id: 'copilot',
    title: 'Contingency Copilot AI',
    category: 'Interactive Assistant',
    description:
      'Natural-language RAG query interface answering contingency questions with exact verbatim quotes and clickable page citations.',
    icon: Bot,
    tag: 'Grounded RAG & Citations',
    link: '/deals',
    linkLabel: 'Explore Copilot',
  },
  {
    id: 'eo-audit',
    title: 'E&O Audit Trail',
    category: 'Compliance & Protection',
    description:
      'SHA-256 hashed immutable audit logs proving exact dates, timestamps, agent actions, and email delivery receipts for legal defense.',
    icon: ShieldCheck,
    tag: 'Cryptographic Logs',
    link: '/audit',
    linkLabel: 'Audit Ledger',
  },
  {
    id: 'state-engine',
    title: 'Multi-State Rule Engine',
    category: 'Jurisdiction Coverage',
    description:
      'Pre-configured legal rule sets for WA NWMLS, CA CAR RPA, FL FAR/BAR, TX TREC, and NY NYSAR standard purchase contracts.',
    icon: Scale,
    tag: '50-State Architecture',
    link: '/contracts',
    linkLabel: 'Compare Rules',
  },
  {
    id: 'crm-pipeline',
    title: 'Speed-to-Lead ROI Pipeline',
    category: 'Brokerage Operations',
    description:
      'Unified command center for buyer and seller leads, automatic qualification scores, property matching, and escrow stage tracking.',
    icon: Users,
    tag: 'Real Estate CRM',
    link: '/leads',
    linkLabel: 'Open Pipeline',
  },
  {
    id: 'document-inspector',
    title: 'Visual Quote Inspector',
    category: 'Verification Tools',
    description:
      'Click any AI citation to open the visual contract inspector, highlighting extracted clauses in context on the original document.',
    icon: Search,
    tag: 'In-Situ Highlights',
    link: '/deals',
    linkLabel: 'View Inspector',
  },
];

export function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = CORE_FEATURES.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const getVisibleIndices = () => {
    return [
      (currentIndex - 1 + total) % total,
      currentIndex,
      (currentIndex + 1) % total,
    ];
  };

  const [leftIdx, centerIdx, rightIdx] = getVisibleIndices();

  return (
    <div
      className="relative select-none outline-none focus:outline-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Features Carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Carousel Track ── */}
      <div className="relative overflow-hidden py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <div className="hidden lg:block">
            <FeatureCard item={CORE_FEATURES[leftIdx]} isActive={false} onSelect={prevSlide} />
          </div>

          <div className="w-full">
            <FeatureCard item={CORE_FEATURES[centerIdx]} isActive={true} />
          </div>

          <div className="hidden md:block">
            <FeatureCard item={CORE_FEATURES[rightIdx]} isActive={false} onSelect={nextSlide} />
          </div>
        </div>
      </div>

      {/* ── Carousel Bottom Controls (Arrows + Dots) ── */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200">
        <div className="text-xs font-mono text-[#71717A] flex items-center gap-2">
          <span className="text-black font-bold">0{currentIndex + 1}</span>
          <span>/</span>
          <span>0{total}</span>
          <span className="text-neutral-400 font-sans ml-2 hidden sm:inline">
            {CORE_FEATURES[currentIndex].title}
          </span>
        </div>

        {/* Progress Indicator Dots */}
        <div className="flex items-center gap-1.5" role="tablist">
          {CORE_FEATURES.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setCurrentIndex(idx)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'h-2 w-7 bg-black'
                  : 'h-2 w-2 bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrow Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            aria-label="Previous feature"
            className="h-9 w-9 rounded-full border border-neutral-200 bg-white text-neutral-800 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-clean-xs"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next feature"
            className="h-9 w-9 rounded-full border border-neutral-200 bg-white text-neutral-800 hover:border-black hover:bg-neutral-50 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-clean-xs"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  item,
  isActive,
  onSelect,
}: {
  item: FeatureItem;
  isActive: boolean;
  onSelect?: () => void;
}) {
  const Icon = item.icon;

  return (
    <div
      onClick={onSelect}
      className={`h-full flex flex-col justify-between p-7 rounded-3xl transition-all duration-300 border ${
        isActive
          ? 'bg-white border-neutral-300 shadow-clean-md scale-[1.01] ring-1 ring-black/5'
          : 'bg-[#F9FAFB] border-neutral-200/80 hover:bg-white hover:border-neutral-300 hover:shadow-clean-sm cursor-pointer'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-black text-white shadow-clean-xs'
                  : 'bg-neutral-200/60 text-neutral-700'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-500 block">
                {item.category}
              </span>
              <span className="text-[11px] text-[#09090B] font-semibold block">
                {item.tag}
              </span>
            </div>
          </div>

          {isActive && (
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          )}
        </div>

        <h3 className="text-lg font-bold text-[#09090B] tracking-tight mb-2.5">
          {item.title}
        </h3>

        <p className="text-xs text-[#52525B] leading-relaxed font-normal">
          {item.description}
        </p>
      </div>

      <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between">
        <Link
          to={item.link}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all ${
            isActive
              ? 'text-black hover:underline'
              : 'text-[#71717A] hover:text-black'
          }`}
        >
          <span>{item.linkLabel}</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>

        <span className="text-[10px] text-neutral-400 font-mono">
          Ready to deploy
        </span>
      </div>
    </div>
  );
}
