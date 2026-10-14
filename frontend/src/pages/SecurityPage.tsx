import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  Check,
  ArrowRight,
  Eye,
  Scale,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#09090B] pb-24 font-sans">
      {/* Hero */}
      <section className="pt-12 pb-14 text-center border-b border-[#E4E4E7] bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="neutral" className="mb-4 bg-zinc-100 text-zinc-800 border border-[#E4E4E7] px-3.5 py-1 text-xs font-medium rounded-full">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 mr-1.5 inline" /> Bank-Grade Security &amp; Legal Auditability
          </Badge>
          <h1 className="text-4xl font-extrabold text-[#09090B] tracking-tight sm:text-5xl">
            Built for Errors &amp; Omissions (E&amp;O) Defense
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#71717A] max-w-2xl mx-auto leading-relaxed">
            Every date calculated, email notification sent, and user edit is backed by cryptographic timestamps and verifiable contract PDF page citations. Zero AI hallucinations.
          </p>
        </div>
      </section>

      {/* Security Pillars Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-7 rounded-3xl border border-[#E4E4E7] space-y-4 shadow-clean-sm hover:shadow-clean-md transition-all">
            <div className="p-3 w-fit rounded-2xl bg-zinc-100 text-[#09090B] border border-[#E4E4E7]">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#09090B]">256-Bit AES Encryption</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              All purchase agreements, addenda, and client metadata are encrypted in transit via TLS 1.3 and at rest with AES-256 enterprise encryption.
            </p>
            <ul className="space-y-2 text-xs text-[#71717A] pt-3 border-t border-[#E4E4E7]">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> SOC2 Type II Certified Infrastructure
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Automatic key rotation &amp; isolated tenant silos
              </li>
            </ul>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-[#E4E4E7] space-y-4 shadow-clean-sm hover:shadow-clean-md transition-all">
            <div className="p-3 w-fit rounded-2xl bg-zinc-100 text-[#09090B] border border-[#E4E4E7]">
              <Scale className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#09090B]">Verifiable Page Citation Engine</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Never trust raw LLM text generation. Contingency Copilot anchors every extracted date directly to exact line numbers and page coordinates in your original PDF.
            </p>
            <ul className="space-y-2 text-xs text-[#71717A] pt-3 border-t border-[#E4E4E7]">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> 1-Click PDF Bounding Box Highlight
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Zero hallucination quote verifier check
              </li>
            </ul>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-[#E4E4E7] space-y-4 shadow-clean-sm hover:shadow-clean-md transition-all">
            <div className="p-3 w-fit rounded-2xl bg-zinc-100 text-[#09090B] border border-[#E4E4E7]">
              <FileCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#09090B]">Immutable Audit Logs</h3>
            <p className="text-xs text-[#71717A] leading-relaxed">
              In case of a legal dispute or E&amp;O claim, export an immutable, time-stamped proof document showing exactly when alerts were sent and when dates were verified.
            </p>
            <ul className="space-y-2 text-xs text-[#71717A] pt-3 border-t border-[#E4E4E7]">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Legal-Grade PDF &amp; CSV Audit Trail
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Resend delivery receipt headers included
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Zero AI Training Pledge */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 mt-16">
        <div className="bg-white rounded-3xl p-8 border border-[#E4E4E7] text-[#09090B] shadow-clean-sm space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold px-3 py-1 rounded-full text-xs">
              Strict Data Privacy Pledge
            </Badge>
          </div>
          <h2 className="text-2xl font-bold text-[#09090B]">Your Client Real Estate Contracts Are Never Used for Model Training</h2>
          <p className="text-xs text-[#71717A] leading-relaxed">
            We operate strict zero-retention policies with our LLM inference providers. Your client contracts, earnest money terms, and buyer/seller identities are processed strictly in RAM for extraction and immediately discarded from memory.
          </p>
          <div className="pt-4 flex items-center justify-between flex-wrap gap-4 border-t border-[#E4E4E7]">
            <div className="flex items-center gap-2 text-xs text-[#71717A]">
              <Eye className="h-4 w-4 text-emerald-600" /> Confidential Agent &amp; Client Data Safeguard
            </div>
            <Button asChild className="rounded-full bg-[#09090B] hover:bg-black text-white font-medium text-xs px-5 py-2 shadow-clean-xs">
              <Link to="/upload">Explore Workspace <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
