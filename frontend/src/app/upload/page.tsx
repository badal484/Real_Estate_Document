'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dealsApi } from '@/services/api';
import { UploadZone } from '@/components/UploadZone';
import { IconArrowRight, IconCheckCircle, IconExclamationTriangle } from '@/components/icons';

export default function UploadPage() {
  const router = useRouter();
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
        buyerName: fd.get('buyerName') as string || undefined,
        sellerName: fd.get('sellerName') as string || undefined,
        acceptanceDate: fd.get('acceptanceDate') as string || undefined,
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
    { key: 'form', label: 'Deal details' },
    { key: 'upload', label: 'Upload contract' },
    { key: 'done', label: 'Complete' },
  ] as const;
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="page-eyebrow">New Deal</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Upload Contract</h1>
      <p className="mb-6 mt-2 text-sm text-slate-500">
        Enter deal details, then upload the Purchase Agreement PDF. Contingency deadlines will be
        extracted automatically.
      </p>

      <ol className="mb-8 flex items-center gap-2 text-xs font-medium text-slate-400">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                i < stepIndex
                  ? 'bg-brand-700 text-white'
                  : i === stepIndex
                    ? 'bg-brand-100 text-brand-800 ring-2 ring-brand-600'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i + 1}
            </span>
            <span className={i === stepIndex ? 'font-semibold text-slate-700' : ''}>{s.label}</span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-slate-200" />}
          </li>
        ))}
      </ol>

      {step === 'form' && (
        <form onSubmit={(e) => void handleDealCreate(e)} className="card space-y-4 p-6">
          <div>
            <label className="label">
              Property Address <span className="text-red-500">*</span>
            </label>
            <input
              name="propertyAddress"
              required
              className="input"
              placeholder="123 Main St, San Francisco, CA 94102"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Buyer Name</label>
              <input name="buyerName" className="input" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="label">Seller Name</label>
              <input name="sellerName" className="input" placeholder="John Smith" />
            </div>
          </div>

          <div>
            <label className="label">Acceptance Date</label>
            <input name="acceptanceDate" type="date" className="input" />
            <p className="mt-1 text-xs text-slate-400">
              The date both parties signed. Used to calculate relative deadlines.
            </p>
          </div>

          {error && (
            <p className="banner-error">
              <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating deal…' : 'Continue to Upload'}
            {!submitting && <IconArrowRight className="h-4 w-4" />}
          </button>
        </form>
      )}

      {step === 'upload' && dealId && (
        <div className="space-y-4">
          <p className="banner-success">
            <IconCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            Deal created. Now upload the Purchase Agreement PDF.
          </p>
          <UploadZone dealId={dealId} onSuccess={() => setStep('done')} />
        </div>
      )}

      {step === 'done' && dealId && (
        <div className="card space-y-4 p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <IconCheckCircle className="h-7 w-7" />
          </span>
          <h2 className="text-xl font-bold text-slate-900">Contract uploaded</h2>
          <p className="text-sm text-slate-500">
            Extraction is running in the background. You can review the deadlines once complete.
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => router.push(`/deals/${dealId}/review`)} className="btn-primary">
              Review Deadlines
            </button>
            <button onClick={() => router.push('/deals')} className="btn-secondary">
              All Deals
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
