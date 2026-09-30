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
    <div className="mx-auto max-w-2xl px-4 py-4 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono">
            Transaction Intake
          </span>
          <Badge variant="neutral" className="text-[10px]">
            Step {stepIndex + 1} of 3
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Ingest Purchase Agreement
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter transaction counterparties and upload your executed PDF contract. Contingency calendar deadlines and citation embeddings will be generated deterministically.
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
        <ol className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground select-none">
          {steps.map((s, i) => (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold transition-all ${
                  i < stepIndex
                    ? 'bg-primary text-primary-foreground'
                    : i === stepIndex
                    ? 'bg-primary/10 text-primary ring-2 ring-primary/40 font-bold'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < stepIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={i === stepIndex ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                {s.label}
              </span>
              {i < steps.length - 1 && <span className="hidden sm:block mx-2 h-px w-10 bg-border" />}
            </li>
          ))}
        </ol>
      </div>

      {/* Step 1: Form */}
      {step === 'form' && (
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Transaction Details</CardTitle>
                <CardDescription className="text-xs">
                  Primary metadata used for calculating business-day calendars and drafting reminder notices.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={fillSampleDeal}
                className="gap-1 text-[11px] h-7 text-primary hover:text-primary"
              >
                <Zap className="h-3 w-3" />
                <span>Auto-Fill Sample</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={(e) => void handleDealCreate(e)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Property Address <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. 742 Evergreen Terrace, Springfield, OR 97477"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Buyer Full Name / Entity
                  </label>
                  <Input
                    placeholder="e.g. John Martinez"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Seller Full Name / Entity
                  </label>
                  <Input
                    placeholder="e.g. Sarah Chen"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Contract Mutual Acceptance Date
                </label>
                <Input
                  type="date"
                  value={acceptanceDate}
                  onChange={(e) => setAcceptanceDate(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  The date mutual acceptance was finalized. Used as Day 0 to calculate relative business/calendar day windows.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full gap-2 h-9 text-xs mt-2">
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
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload Zone */}
      {step === 'upload' && dealId && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-50/80 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Transaction workspace initialized. Upload the executed Purchase Agreement PDF below to start automatic date extraction.</span>
          </div>
          <UploadZone dealId={dealId} onSuccess={() => setStep('done')} />
        </motion.div>
      )}

      {/* Step 3: Done */}
      {step === 'done' && dealId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-border/70 bg-card p-8 text-center shadow-sm space-y-5"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Contract Uploaded &amp; Indexed
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Automated deterministic deadline calculations, audit log, and citation embeddings are ready in your workspace.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button
              type="button"
              onClick={() => navigate(`/deals/${dealId}/assistant`)}
              size="sm"
              className="gap-1.5 text-xs h-9"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Launch AI Copilot</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/deals/${dealId}/review`)}
              size="sm"
              className="gap-1.5 text-xs h-9"
            >
              <span>Verify Deadlines</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/deals')}
              size="sm"
              className="text-xs h-9"
            >
              <span>Portfolio View</span>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
