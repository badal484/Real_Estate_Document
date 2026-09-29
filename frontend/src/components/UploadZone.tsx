import { useState, useRef } from 'react';
import { IconArrowUpTray, IconCheckCircle, IconExclamationTriangle, IconSparkles, IconSpinner } from './icons';

interface Props {
  dealId: string;
  onSuccess?: () => void;
}

export function UploadZone({ dealId, onSuccess }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extractionStage, setExtractionStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (file.type !== 'application/pdf') {
      setError('Only PDF documents are accepted.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);
    setFileDetails({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    });

    setExtractionStage('Reading PDF text & layout...');

    try {
      const form = new FormData();
      form.append('file', file);

      const apiBase = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001/api';

      setTimeout(() => setExtractionStage('AI scanning California RPA contingency clauses...'), 800);
      setTimeout(() => setExtractionStage('Calculating calendar/business days & holidays...'), 1600);

      const res = await fetch(`${apiBase}/deals/${dealId}/documents`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: { message?: string } }).error?.message ?? 'Upload failed');
      }

      setExtractionStage('Extraction Complete!');
      setSuccess(true);
      setTimeout(() => onSuccess?.(), 600);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) void uploadFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center backdrop-blur-xl transition-all duration-300 ${
        dragging
          ? 'border-brand-400 bg-brand-500/15 shadow-xl shadow-brand-500/20'
          : success
          ? 'border-emerald-500/50 bg-emerald-500/10'
          : 'border-slate-800 bg-slate-900/60 hover:border-brand-500/40 hover:bg-slate-900/80 hover:shadow-xl'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadFile(file);
        }}
      />

      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 ${
          success
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : uploading
            ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 ring-4 ring-brand-500/10'
            : 'bg-slate-800 text-slate-300 border border-slate-700'
        }`}
      >
        {success ? (
          <IconCheckCircle className="h-7 w-7" />
        ) : uploading ? (
          <IconSpinner className="h-7 w-7 animate-spin" />
        ) : (
          <IconArrowUpTray className="h-7 w-7" />
        )}
      </span>

      {uploading ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-brand-300 flex items-center justify-center gap-2">
            <IconSparkles className="h-4 w-4 text-brand-400 animate-spin" />
            {extractionStage}
          </p>
          {fileDetails && (
            <p className="text-xs text-slate-400 font-mono">
              {fileDetails.name} ({fileDetails.size})
            </p>
          )}
        </div>
      ) : success ? (
        <div className="mt-4 space-y-1">
          <p className="text-sm font-bold text-emerald-400">PDF Uploaded &amp; Clauses Analyzed!</p>
          <p className="text-xs text-slate-400">Redirecting to deadline review...</p>
        </div>
      ) : (
        <div className="mt-4 space-y-1.5">
          <p className="text-sm font-bold text-slate-100">
            Drag &amp; drop your Purchase Agreement PDF
          </p>
          <p className="text-xs text-slate-400">
            Supports California RPA-CA, Commercial, &amp; Standard Purchase Agreements (PDF up to 50MB)
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
          <IconExclamationTriangle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
