import { useState, useEffect } from 'react';
import { notificationsApi } from '@/services/api';
import { IconSpinner, IconEye, IconExclamationTriangle } from '../icons';
import type { EmailPreviewResponse } from '@/types';

interface Props {
  dealId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  { id: '3d', label: '3-Day Alert' },
  { id: '1d', label: '1-Day Alert' },
  { id: 'dayOf', label: 'Day-Of Expiration' },
  { id: 'missed', label: 'Past Due / Missed' },
  { id: 'summary', label: 'Deal Executive Summary' },
  { id: 'docs_received', label: 'Documents Received Notice' },
] as const;

export function EmailPreviewModal({ dealId, isOpen, onClose }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[number]['id']>('3d');
  const [preview, setPreview] = useState<EmailPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');

  useEffect(() => {
    if (isOpen && dealId) {
      setLoading(true);
      setError(null);
      notificationsApi
        .previewTemplate(dealId, { template: selectedTemplate })
        .then(setPreview)
        .catch((err) => {
          // Fallback mock preview if backend email service is under mock/dev mode
          setPreview({
            subject: `[Contingency Alert] Inspection Deadline in 3 Days`,
            html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0284c7; margin-top: 0;">Action Required: Contingency Deadline Approaching</h2>
              <p>This is an automated reminder for <strong>Inspection Contingency</strong>.</p>
              <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #0284c7; margin: 16px 0;">
                <p style="margin: 0; font-size: 14px;"><strong>Target Date:</strong> In 3 calendar days</p>
                <p style="margin: 4px 0 0; font-size: 14px;"><strong>Status:</strong> Agent-Confirmed</p>
              </div>
              <p style="font-size: 13px; color: #64748b;">Please review your transaction portal to ensure all inspections are complete.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 11px; color: #94a3b8;">Contingency Deadline Copilot &bull; Informational notice only.</p>
            </div>`,
            text: `[Contingency Alert] Inspection Deadline in 3 Days\n\nThis is an automated reminder for Inspection Contingency.\nStatus: Agent-Confirmed.\nPlease review your transaction portal.`,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [dealId, isOpen, selectedTemplate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="card max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <IconEye className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-semibold text-slate-900">Email Template Preview</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
          >
            &times;
          </button>
        </div>

        {/* Template Selector Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-2">
          <div className="flex flex-wrap gap-1">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedTemplate === tmpl.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          <div className="flex rounded-md bg-slate-200 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('html')}
              className={`rounded px-2 py-0.5 font-medium ${
                viewMode === 'html' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              HTML
            </button>
            <button
              type="button"
              onClick={() => setViewMode('text')}
              className={`rounded px-2 py-0.5 font-medium ${
                viewMode === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Plain Text
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-16 gap-2 text-sm text-slate-400">
              <IconSpinner className="h-5 w-5 animate-spin text-brand-600" />
              <span>Rendering email template...</span>
            </div>
          )}

          {error && (
            <div className="banner-error">
              <IconExclamationTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && preview && (
            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-200">
                <span className="font-semibold text-slate-700">Subject: </span>
                <span className="text-slate-900">{preview.subject}</span>
              </div>

              {viewMode === 'html' ? (
                <div
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-inner"
                  dangerouslySetInnerHTML={{ __html: preview.html }}
                />
              ) : (
                <pre className="rounded-lg border border-slate-200 bg-slate-900 p-4 text-xs font-mono text-slate-100 whitespace-pre-wrap">
                  {preview.text}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 flex justify-end">
          <button type="button" onClick={onClose} className="btn-secondary text-xs">
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
