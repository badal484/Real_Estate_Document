import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dealsApi } from '@/services/api';
import { UploadZone } from '@/components/UploadZone';
import {
  IconArrowRight,
  IconCheckCircle,
  IconExclamationTriangle,
  IconBuilding,
  IconDocumentText,
  IconSparkles,
} from '@/components/icons';

export function UploadPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'upload' | 'done'>('form');
  const [dealId, setDealId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Create a deal record
  async function handleDealCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    try {
      const deal = await dealsApi.create({
        propertyAddress: fd.get('propertyAddress') as string,
        buyerName: (fd.get('buyerName') as string) || undefined,
        sellerName: (fd.get('sellerName') as string) || undefined,
        acceptanceDate: (fd.get('acceptanceDate') as string) || undefined,
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
    { key: 'upload', label: 'Upload PDF' },
    { key: 'done', label: 'AI Ingestion' },
  ] as const;
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 space-y-6">
      <div>
        <span className="page-eyebrow">New Transaction</span>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
          Ingest Purchase Agreement
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter transaction entities and upload the executed contract. Contingency calendar deadlines
          and AI vector search will be computed automatically.
        </p>
      </div>

      {/* Stepper Indicator */}
      <ol className="flex items-center gap-2 text-xs font-semibold text-slate-400 select-none">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-bold transition-all ${
                i < stepIndex
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : i === stepIndex
                    ? 'bg-brand-50 text-brand-700 ring-2 ring-brand-500 font-extrabold'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i + 1}
            </span>
            <span className={i === stepIndex ? 'font-bold text-slate-900' : 'text-slate-500'}>
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="mx-1.5 h-px w-8 bg-slate-200" />}
          </li>
        ))}
      </ol>

      {step === 'form' && (
        <form onSubmit={(e) => void handleDealCreate(e)} className="card space-y-4 p-6 bg-white shadow-xs">
          <div>
            <label className="label">
              Property Address <span className="text-rose-500">*</span>
            </label>
            <input
              name="propertyAddress"
              required
              className="input"
              placeholder="e.g. 742 Evergreen Terrace, Springfield, OR 97477"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Buyer Full Name</label>
              <input name="buyerName" className="input" placeholder="e.g. John Martinez" />
            </div>
            <div>
              <label className="label">Seller Full Name</label>
              <input name="sellerName" className="input" placeholder="e.g. Sarah Chen" />
            </div>
          </div>

          <div>
            <label className="label">Contract Acceptance Date</label>
            <input name="acceptanceDate" type="date" className="input" />
            <p className="mt-1.5 text-[11px] text-slate-400">
              The date mutual acceptance was finalized. Used to calculate relative business/calendar day windows.
            </p>
          </div>

          {error && (
            <div className="banner-error">
              <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
            <span>{submitting ? 'Creating transaction record…' : 'Continue to Document Upload'}</span>
            {!submitting && <IconArrowRight className="h-4 w-4" />}
          </button>
        </form>
      )}

      {step === 'upload' && dealId && (
        <div className="space-y-4">
          <div className="banner-success">
            <IconCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Transaction record created. Upload the executed Purchase Agreement PDF below.</span>
          </div>
          <UploadZone dealId={dealId} onSuccess={() => setStep('done')} />
        </div>
      )}

      {step === 'done' && dealId && (
        <div className="card space-y-5 p-8 text-center bg-white shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/80 shadow-2xs">
            <IconCheckCircle className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Contract Uploaded &amp; Ingested</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Automated deterministic deadline calculations and quote vector embeddings have been indexed.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/deals/${dealId}/assistant`)}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <IconSparkles className="h-4 w-4 text-brand-300" />
              <span>Open AI Copilot</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/deals/${dealId}/review`)}
              className="btn-secondary text-xs py-2 px-4"
            >
              <span>Review Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/deals')}
              className="btn-secondary text-xs py-2 px-4"
            >
              <span>All Deals</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

