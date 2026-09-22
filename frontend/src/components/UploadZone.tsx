'use client';

import { useState, useRef } from 'react';
import { IconArrowUpTray, IconCheckCircle, IconExclamationTriangle } from './icons';

interface Props {
  dealId: string;
  onSuccess?: () => void;
}

export function UploadZone({ dealId, onSuccess }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const form = new FormData();
      form.append('file', file);

      const apiBase = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api';
      const res = await fetch(`${apiBase}/deals/${dealId}/documents`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: { message?: string } }).error?.message ?? 'Upload failed');
      }

      setSuccess(true);
      onSuccess?.();
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
      className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
        dragging
          ? 'border-brand-500 bg-brand-50'
          : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50'
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
        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
          success ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-50 text-brand-700'
        }`}
      >
        {success ? (
          <IconCheckCircle className="h-6 w-6" />
        ) : (
          <IconArrowUpTray className={`h-6 w-6 ${uploading ? 'animate-pulse' : ''}`} />
        )}
      </span>

      {uploading ? (
        <p className="mt-4 text-sm font-medium text-brand-700">Uploading&hellip;</p>
      ) : success ? (
        <p className="mt-4 text-sm font-medium text-emerald-700">Upload successful.</p>
      ) : (
        <>
          <p className="mt-4 text-sm font-semibold text-slate-700">
            Drag &amp; drop your Purchase Agreement PDF
          </p>
          <p className="mt-1 text-xs text-slate-400">or click to browse — PDF only, max 50 MB</p>
        </>
      )}

      {error && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-red-600">
          <IconExclamationTriangle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
