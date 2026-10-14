import { useState } from 'react';
import {
  Building2,
  BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContractStandard {
  id: string;
  name: string;
  state: string;
  code: string;
  popularIn: string;
  defaultDayMath: string;
  cutoffTime: string;
  clauses: {
    title: string;
    standardDays: string;
    type: 'strict' | 'flexible' | 'critical';
    citation: string;
    description: string;
  }[];
}

const CONTRACT_STANDARDS: ContractStandard[] = [
  {
    id: 'nwmls',
    name: 'NWMLS Form 21',
    state: 'Washington',
    code: 'NWMLS F21',
    popularIn: 'Seattle, Bellevue, Tacoma, Spokane',
    defaultDayMath: 'Calendar Days (If 5 days or less, excludes Sat/Sun/Holidays)',
    cutoffTime: '9:00 PM Pacific Standard Time',
    clauses: [
      {
        title: 'Earnest Money Deposit',
        standardDays: '2 Business Days',
        type: 'critical',
        citation: 'Section 3(b) - Delivery of Deposit',
        description: 'Buyer must deliver earnest money to Escrow Holder within 2 days after Mutual Acceptance.',
      },
      {
        title: 'Inspection Contingency (Form 35)',
        standardDays: '10 Calendar Days',
        type: 'strict',
        citation: 'Form 35 Clause 1 - Inspection Period',
        description: 'Buyer has 10 days to conduct inspections and issue Form 35R notice to Seller.',
      },
      {
        title: 'Financing Contingency (Form 22A)',
        standardDays: '21 Calendar Days',
        type: 'critical',
        citation: 'Form 22A Clause 1 - Loan Application',
        description: 'Buyer must make full application within 5 days and obtain commitment within 21 days.',
      },
      {
        title: 'Title Review (Form 22T)',
        standardDays: '5 Calendar Days',
        type: 'flexible',
        citation: 'Form 22T Clause 2 - Title Examination',
        description: 'Buyer has 5 days after receipt of preliminary title commitment to object to encumbrances.',
      },
    ],
  },
  {
    id: 'car',
    name: 'CAR Residential Purchase Agreement (RPA)',
    state: 'California',
    code: 'CAR RPA 2026',
    popularIn: 'Los Angeles, San Francisco, San Diego, Orange County',
    defaultDayMath: 'Calendar Days (Ending at 11:59 PM)',
    cutoffTime: '11:59 PM Pacific Standard Time',
    clauses: [
      {
        title: 'Initial Deposit (EMD)',
        standardDays: '3 Calendar Days',
        type: 'critical',
        citation: 'Paragraph 3D(1) - Initial Deposit',
        description: 'Deposit to escrow within 3 business days after acceptance via wire or cashier check.',
      },
      {
        title: 'Buyer Physical Inspection',
        standardDays: '17 Calendar Days',
        type: 'strict',
        citation: 'Paragraph 14B(1) - Buyer Contingencies',
        description: 'Buyer has 17 days after acceptance to complete all inspections and deliver Notice to Perform.',
      },
      {
        title: 'Loan & Appraisal Contingency',
        standardDays: '17 Calendar Days',
        type: 'critical',
        citation: 'Paragraph 8B/8C - Financing Terms',
        description: 'Appraisal must meet purchase price and loan approval commitment must be issued.',
      },
      {
        title: 'Seller Disclosures Delivery',
        standardDays: '7 Calendar Days',
        type: 'flexible',
        citation: 'Paragraph 14A - Seller Deliveries',
        description: 'Seller must deliver TDS, SPQ, and natural hazard disclosures within 7 days.',
      },
    ],
  },
  {
    id: 'farbar',
    name: 'FAR/BAR AS-IS Contract',
    state: 'Florida',
    code: 'FAR/BAR 2026',
    popularIn: 'Miami, Orlando, Tampa, Jacksonville',
    defaultDayMath: 'Calendar Days (Excludes Weekends & National Holidays)',
    cutoffTime: '5:00 PM Eastern Standard Time',
    clauses: [
      {
        title: 'Escrow Deposit Receipt',
        standardDays: '3 Calendar Days',
        type: 'critical',
        citation: 'Section 2(a) - Initial Deposit',
        description: 'Escrow agent must provide written verification of deposit receipt within 3 days.',
      },
      {
        title: 'Inspection & Cancel Window',
        standardDays: '15 Calendar Days',
        type: 'strict',
        citation: 'Section 12 - Property Inspection',
        description: 'Buyer may terminate for any reason during inspection window by written notice before 5 PM.',
      },
      {
        title: 'Financing Approval Period',
        standardDays: '30 Calendar Days',
        type: 'critical',
        citation: 'Section 8(b) - Loan Approval',
        description: 'Buyer has 30 days to secure written loan approval and inform Seller.',
      },
    ],
  },
  {
    id: 'trec',
    name: 'TREC One to Four Family Contract',
    state: 'Texas',
    code: 'TREC 20-17',
    popularIn: 'Houston, Dallas, Austin, San Antonio',
    defaultDayMath: 'Strict Calendar Days (Ending 5:00 PM)',
    cutoffTime: '5:00 PM Central Standard Time',
    clauses: [
      {
        title: 'Earnest Money & Option Fee',
        standardDays: '3 Calendar Days',
        type: 'critical',
        citation: 'Paragraph 5 - Earnest Money',
        description: 'Buyer must deliver earnest money AND option fee to escrow agent within 3 days.',
      },
      {
        title: 'Termination Option Period',
        standardDays: '7 to 10 Days (Negotiated)',
        type: 'strict',
        citation: 'Paragraph 5B - Option Right',
        description: 'Unrestricted right to terminate contract upon payment of option fee within agreed days.',
      },
      {
        title: 'Third Party Financing Addendum',
        standardDays: '21 Calendar Days',
        type: 'critical',
        citation: 'Paragraph 2A - Financing Approval',
        description: 'Buyer must obtain buyer approval for loan terms within specified days.',
      },
    ],
  },
];

export function ContractsLibraryPage() {
  const [activeTab, setActiveTab] = useState<string>('nwmls');

  const currentStandard = CONTRACT_STANDARDS.find((c) => c.id === activeTab) || CONTRACT_STANDARDS[0];

  return (
    <div className="space-y-8 pb-16 max-w-[1600px] mx-auto">
      {/* Header */}
      <section className="pt-4 pb-8 text-center border-b border-[#E4E4E7]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="neutral" className="mb-3 bg-zinc-100 text-zinc-800 border-zinc-200 px-3.5 py-1 text-xs font-medium rounded-full">
            <BookOpen className="h-3.5 w-3.5 text-[#09090B] mr-1.5 inline" /> State Real Estate Contract Knowledge Base
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#09090B] tracking-tight">
            State Contract Standards &amp; Rules Engine
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#71717A] max-w-2xl mx-auto leading-relaxed">
            Contingency Copilot automatically adapts date calculations, weekend spillovers, and cutoff times based on official state association guidelines.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="space-y-6">
        {/* State Tabs Navigation */}
        <div className="p-1 bg-[#F4F4F5] rounded-full inline-flex border border-[#E4E4E7] overflow-x-auto max-w-full">
          {CONTRACT_STANDARDS.map((std) => (
            <button
              key={std.id}
              type="button"
              onClick={() => setActiveTab(std.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === std.id
                  ? 'bg-white text-[#09090B] font-semibold shadow-xs'
                  : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>{std.name}</span>
              <span className="opacity-60 text-[10px]">({std.state})</span>
            </button>
          ))}
        </div>

        {/* Selected Standard Overview Card */}
        <div className="bg-white rounded-3xl border border-[#E4E4E7] p-6 sm:p-7 shadow-clean-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E4E7] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[#09090B]">{currentStandard.name}</h2>
                <Badge variant="success" className="text-[10px] px-2.5 py-0.5 rounded-full">
                  {currentStandard.code}
                </Badge>
              </div>
              <p className="text-xs text-[#71717A] mt-1">Prevalent in: {currentStandard.popularIn}</p>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="text-[#71717A] block">Standard Cutoff Time</span>
              <strong className="text-[#09090B] font-mono font-medium">{currentStandard.cutoffTime}</strong>
            </div>
          </div>

          <div className="p-3.5 bg-[#F9FAFB] border border-[#E4E4E7] rounded-2xl text-xs text-[#71717A]">
            <strong className="text-[#09090B] font-medium">Calculation Rule: </strong>
            {currentStandard.defaultDayMath}
          </div>
        </div>

        {/* Standard Clauses Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {currentStandard.clauses.map((clause, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-[#E4E4E7] p-5 shadow-clean-sm hover:border-[#D4D4D8] transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-[#09090B]">{clause.title}</h3>
                  <Badge
                    variant={clause.type === 'critical' ? 'destructive' : clause.type === 'strict' ? 'warning' : 'neutral'}
                    className="text-[10px] uppercase px-2 py-0.5 rounded-full"
                  >
                    {clause.type}
                  </Badge>
                </div>

                <div className="text-xl font-semibold text-[#09090B] font-mono mb-2">
                  {clause.standardDays}
                </div>

                <p className="text-xs text-[#71717A] leading-relaxed">{clause.description}</p>
              </div>

              <div className="pt-3 border-t border-[#E4E4E7] text-[11px] font-mono text-[#A1A1AA]">
                {clause.citation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
