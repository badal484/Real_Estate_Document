import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dealsApi } from '@/services/api';
import { UploadZone } from '@/components/UploadZone';
import { IconArrowRight, IconCheckCircle, IconExclamationTriangle, IconSparkles, IconBuilding } from '@/components/icons';

export function UploadPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'upload' | 'done'>('form');
  const [dealId, setDealId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [address, setAddress] = useState('');
  const [buyer, setBuyer] = useState('');
  const [seller, setSeller] = useState('');
  const [acceptanceDate, setAcceptanceDate] = useState('');

  // Sample Preset Loader
  function handleLoadSample() {
    setAddress('12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038');
    setBuyer('Priya Ramesh Patel');
    setSeller('Aarav Vikram Sharma');
    setAcceptanceDate(new Date().toISOString().split('T')[0]!);
  }

  // Step 1: Create deal
  async function handleDealCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const deal = await dealsApi.create({
        propertyAddress: address,
        buyerName: buyer || undefined,
        sellerName: seller || undefined,
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
    { key: 'form', label: 'Agreement Details' },
    { key: 'upload', label: 'Upload PDF Contract' },
    { key: 'done', label: 'AI Extraction Complete' },
  ] as const;
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <span className="page-eyebrow">New Contract Analysis</span>
        <h1 className="mt-1.5 text-2xl font-bold text-white tracking-tight">Analyze Purchase Agreement</h1>
        <p className="mt-1 text-xs text-slate-400">
          Enter agreement details, then upload your PDF contract to extract contingency deadlines and risk metrics automatically.
        </p>
      </div>

      {/* Stepper Progress */}
      <ol className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl">
        {steps.map((s, i) => (
          <li key={s.key} className="flex flex-1 items-center gap-2.5">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i < stepIndex
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : i === stepIndex
                  ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 shadow-lg shadow-brand-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {i < stepIndex ? <IconCheckCircle className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`text-xs font-semibold ${i === stepIndex ? 'text-white' : 'text-slate-500'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-slate-800" />}
          </li>
        ))}
      </ol>

      {step === 'form' && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <IconBuilding className="h-5 w-5 text-brand-400" />
              Step 1: Property &amp; Party Details
            </h2>
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              <IconSparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>⚡ Load Sample California RPA</span>
            </button>
          </div>

          <form onSubmit={(e) => void handleDealCreate(e)} className="space-y-4">
            <div>
              <label className="label">
                Property Address <span className="text-rose-400">*</span>
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="input"
                placeholder="e.g. 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Buyer Name</label>
                <input
                  value={buyer}
                  onChange={(e) => setBuyer(e.target.value)}
                  className="input"
                  placeholder="e.g. Priya Ramesh Patel"
                />
              </div>
              <div>
                <label className="label">Seller Name</label>
                <input
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                  className="input"
                  placeholder="e.g. Aarav Vikram Sharma"
                />
              </div>
            </div>

            <div>
              <label className="label">Acceptance Date (Mutual Execution)</label>
              <input
                type="date"
                value={acceptanceDate}
                onChange={(e) => setAcceptanceDate(e.target.value)}
                className="input"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                The date both parties signed. Used as Day 0 for relative contingency date calculations.
              </p>
            </div>

            {error && (
              <p className="banner-error">
                <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting || !address.trim()} className="btn-primary w-full py-3">
              {submitting ? 'Creating Deal Record…' : 'Continue to Upload Contract PDF'}
              {!submitting && <IconArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}

      {step === 'upload' && dealId && (
        <div className="space-y-4">
          <p className="banner-success">
            <IconCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            Deal record created. Upload the Purchase Agreement PDF below to start AI clause parsing.
          </p>
          <UploadZone dealId={dealId} onSuccess={() => setStep('done')} />
        </div>
      )}

      {step === 'done' && dealId && (
        <div className="card space-y-6 p-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/30">
            <IconCheckCircle className="h-8 w-8" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white">Purchase Agreement Uploaded!</h2>
            <p className="mt-2 text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              AI extraction process complete. Inspection, Financing, and Title contingency deadlines have been calculated.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={() => navigate(`/deals/${dealId}/review`)} className="btn-primary text-xs py-2.5 px-5">
              Review Extracted Deadlines
            </button>
            <button onClick={() => navigate(`/deals/${dealId}`)} className="btn-secondary text-xs py-2.5 px-5">
              View Deal Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

