'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dealsApi } from '@/services/api';
import { UploadZone } from '@/components/UploadZone';

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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">New Deal — Upload Contract</h1>
      <p className="text-gray-500 text-sm mb-8">
        Enter deal details, then upload the Purchase Agreement PDF. Contingency deadlines will be
        extracted automatically.
      </p>

      {step === 'form' && (
        <form onSubmit={(e) => void handleDealCreate(e)} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Address <span className="text-red-500">*</span>
            </label>
            <input
              name="propertyAddress"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="123 Main St, San Francisco, CA 94102"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
              <input
                name="buyerName"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seller Name</label>
              <input
                name="sellerName"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="John Smith"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Acceptance Date</label>
            <input
              name="acceptanceDate"
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              The date both parties signed. Used to calculate relative deadlines.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">⚠ {error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? 'Creating deal…' : 'Continue to Upload →'}
          </button>
        </form>
      )}

      {step === 'upload' && dealId && (
        <div className="space-y-4">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            ✅ Deal created. Now upload the Purchase Agreement PDF.
          </div>
          <UploadZone
            dealId={dealId}
            onSuccess={() => setStep('done')}
          />
        </div>
      )}

      {step === 'done' && dealId && (
        <div className="card p-8 text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-bold text-gray-900">Contract uploaded!</h2>
          <p className="text-sm text-gray-500">
            Extraction is running in the background. You can review the deadlines once complete.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push(`/deals/${dealId}/review`)}
              className="btn-primary"
            >
              Review Deadlines
            </button>
            <button
              onClick={() => router.push('/deals')}
              className="btn-secondary"
            >
              All Deals
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
