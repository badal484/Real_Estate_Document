import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dealsApi } from '@/services/api';
import { UploadZone } from '@/components/UploadZone';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Sparkles,
  Calendar,
  User,
  ShieldCheck,
  Zap,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export function UploadPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'upload' | 'done'>('form');
  const [dealId, setDealId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [propertyAddress, setPropertyAddress] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [acceptanceDate, setAcceptanceDate] = useState('');

  const fillSampleDeal = () => {
    setPropertyAddress('1420 Evergreen Vista Way, Bellevue, WA 98004');
    setBuyerName('Alexander & Elena Vance');
    setSellerName('Highland Properties Trust');
    const today = new Date().toISOString().split('T')[0];
    setAcceptanceDate(today);
  };

  async function handleDealCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!propertyAddress.trim()) {
      setError('Property address is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const deal = await dealsApi.create({
        propertyAddress: propertyAddress.trim(),
        buyerName: buyerName.trim() || undefined,
        sellerName: sellerName.trim() || undefined,
        acceptanceDate: acceptanceDate || undefined,
      });
      setDealId(deal.id);
      setStep('upload');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { key: 'form', label: 'Deal Entities' },
    { key: 'upload', label: 'Contract Ingestion' },
    { key: 'done', label: 'AI Extraction' },
  ] as const;
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#09090B] font-mono">
            Transaction Intake
          </span>
          <Badge variant="neutral" className="text-[10px] rounded-full px-2.5 py-0.5 bg-zinc-100 text-zinc-700 border border-[#E4E4E7]">
            Step {stepIndex + 1} of 3
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#09090B] sm:text-3xl">
          Ingest Purchase Agreement
        </h1>
        <p className="mt-1 text-xs text-[#71717A]">
          Enter transaction counterparties and upload your executed PDF contract. Contingency calendar deadlines and citation embeddings will be generated deterministically.
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="rounded-full border border-[#E4E4E7] bg-white p-2 shadow-clean-xs">
        <ol className="flex items-center justify-between gap-2 text-xs font-medium text-[#71717A] select-none px-2">
          {steps.map((s, i) => (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold transition-all ${
                  i < stepIndex
                    ? 'bg-[#09090B] text-white'
                    : i === stepIndex
                    ? 'bg-zinc-100 text-[#09090B] ring-2 ring-[#09090B] font-bold'
                    : 'bg-[#F4F4F5] text-[#A1A1AA]'
                }`}
              >
                {i < stepIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={i === stepIndex ? 'font-semibold text-[#09090B]' : 'text-[#71717A]'}>
                {s.label}
              </span>
              {i < steps.length - 1 && <span className="hidden sm:block mx-2 h-px w-10 bg-[#E4E4E7]" />}
            </li>
          ))}
        </ol>
      </div>

      {/* Step 1: Form */}
      {step === 'form' && (
        <div className="rounded-3xl border border-[#E4E4E7] bg-white p-6 sm:p-7 shadow-clean-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4E4E7]">
            <div>
              <h2 className="text-base font-bold text-[#09090B]">Transaction Details</h2>
              <p className="text-xs text-[#71717A] mt-0.5">
                Primary metadata used for calculating business-day calendars and drafting reminder notices.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={fillSampleDeal}
              className="gap-1 text-[11px] h-7 rounded-full border-[#E4E4E7] text-[#09090B] hover:bg-zinc-100"
            >
              <Zap className="h-3 w-3 text-amber-500" />
              <span>Auto-Fill Sample</span>
            </Button>
          </div>

          <div>
            <form onSubmit={(e) => void handleDealCreate(e)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#09090B] flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-[#71717A]" />
                  Property Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. 742 Evergreen Terrace, Springfield, OR 97477"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="h-10 text-xs rounded-full bg-[#F4F4F5] border-[#E4E4E7] focus:bg-white focus:border-[#09090B] px-4"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#09090B] flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#71717A]" />
                    Buyer Full Name / Entity
                  </label>
                  <Input
                    placeholder="e.g. John Martinez"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="h-10 text-xs rounded-full bg-[#F4F4F5] border-[#E4E4E7] focus:bg-white focus:border-[#09090B] px-4"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#09090B] flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#71717A]" />
                    Seller Full Name / Entity
                  </label>
                  <Input
                    placeholder="e.g. Sarah Chen"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="h-10 text-xs rounded-full bg-[#F4F4F5] border-[#E4E4E7] focus:bg-white focus:border-[#09090B] px-4"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#09090B] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#71717A]" />
                  Contract Mutual Acceptance Date
                </label>
                <Input
                  type="date"
                  value={acceptanceDate}
                  onChange={(e) => setAcceptanceDate(e.target.value)}
                  className="h-10 text-xs font-mono rounded-full bg-[#F4F4F5] border-[#E4E4E7] focus:bg-white focus:border-[#09090B] px-4"
                />
                <p className="text-[11px] text-[#71717A]">
                  The date mutual acceptance was finalized. Used as Day 0 to calculate relative business/calendar day windows.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full gap-2 h-10 text-xs mt-2 rounded-full bg-[#09090B] text-white hover:bg-black font-semibold shadow-clean-xs">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating transaction workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Document Upload</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Step 2: Upload Zone */}
      {step === 'upload' && dealId && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Transaction workspace initialized. Upload the executed Purchase Agreement PDF below to start automatic date extraction.</span>
          </div>
          <div className="rounded-3xl border border-[#E4E4E7] bg-white p-6 shadow-clean-sm">
            <UploadZone dealId={dealId} onSuccess={() => setStep('done')} />
          </div>
        </motion.div>
      )}

      {/* Step 3: Done */}
      {step === 'done' && dealId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-[#E4E4E7] bg-white p-8 text-center shadow-clean-sm space-y-5"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-clean-xs">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#09090B] tracking-tight">
              Contract Uploaded &amp; Indexed
            </h2>
            <p className="text-xs text-[#71717A] max-w-md mx-auto leading-relaxed">
              Automated deterministic deadline calculations, audit log, and citation embeddings are ready in your workspace.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button
              type="button"
              onClick={() => navigate(`/deals/${dealId}/assistant`)}
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-full bg-[#09090B] text-white hover:bg-black font-medium shadow-clean-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch AI Copilot</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/deals/${dealId}/review`)}
              size="sm"
              className="gap-1.5 text-xs h-9 rounded-full border-[#E4E4E7] text-[#09090B] hover:bg-zinc-100"
            >
              <span>Verify Deadlines</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/deals')}
              size="sm"
              className="text-xs h-9 rounded-full bg-[#F4F4F5] text-[#09090B] hover:bg-zinc-200"
            >
              <span>Portfolio View</span>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
