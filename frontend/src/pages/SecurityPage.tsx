import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  Server,
  Award,
  Check,
  ArrowRight,
  Database,
  Eye,
  Key,
  Scale,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero */}
      <section className="pt-12 pb-14 text-center border-b border-slate-200/80 bg-white/50 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="neutral" className="mb-4 glass-badge text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 mr-1.5 inline" /> Bank-Grade Security & Legal Auditability
          </Badge>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Built for Errors & Omissions (E&O) Defense
          </h1>
          <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Every date calculated, email notification sent, and user edit is backed by cryptographic timestamps and verifiable contract PDF page citations. Zero AI hallucinations.
          </p>
        </div>
      </section>

      {/* Security Pillars Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <Card className="glass-card p-6 rounded-2xl border border-slate-200/80 bg-white/80 space-y-4 hover:shadow-md transition-all">
            <div className="p-3 w-fit rounded-xl bg-slate-900 text-white shadow-sm">
              <Lock className="h-6 w-6 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">256-Bit AES Encryption</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All purchase agreements, addenda, and client metadata are encrypted in transit via TLS 1.3 and at rest with AES-256 enterprise encryption.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> SOC2 Type II Certified Infrastructure
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Automatic key rotation & isolated tenant silos
              </li>
            </ul>
          </Card>

          <Card className="glass-card p-6 rounded-2xl border border-slate-200/80 bg-white/80 space-y-4 hover:shadow-md transition-all">
            <div className="p-3 w-fit rounded-xl bg-slate-900 text-white shadow-sm">
              <Scale className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verifiable Page Citation Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never trust raw LLM text generation. Contingency Copilot anchors every extracted date directly to exact line numbers and page coordinates in your original PDF.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> 1-Click PDF Bounding Box Highlight
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Zero hallucination quote verifier check
              </li>
            </ul>
          </Card>

          <Card className="glass-card p-6 rounded-2xl border border-slate-200/80 bg-white/80 space-y-4 hover:shadow-md transition-all">
            <div className="p-3 w-fit rounded-xl bg-slate-900 text-white shadow-sm">
              <FileCheck className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Immutable Audit Logs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              In case of a legal dispute or E&O claim, export an immutable, time-stamped proof document showing exactly when alerts were sent and when dates were verified.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Legal-Grade PDF & CSV Audit Trail
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Resend delivery receipt headers included
              </li>
            </ul>
          </Card>

        </div>
      </section>

      {/* Zero AI Training Pledge */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 mt-16">
        <div className="glass-card rounded-2xl p-8 border border-slate-200/80 bg-slate-900 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500 text-slate-950 font-bold px-3 py-1">
              Strict Data Privacy Pledge
            </Badge>
          </div>
          <h2 className="text-2xl font-bold">Your Client Real Estate Contracts Are Never Used for Model Training</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            We operate strict zero-retention policies with our LLM inference providers. Your client contracts, earnest money terms, and buyer/seller identities are processed strictly in RAM for extraction and immediately discarded from memory.
          </p>
          <div className="pt-4 flex items-center justify-between flex-wrap gap-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Eye className="h-4 w-4 text-emerald-400" /> Confidential Agent & Client Data Safeguard
            </div>
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs">
              <Link to="/upload">Explore Workspace <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
