'use client';

import { useState, useRef } from 'react';

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
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
        dragging
          ? 'border-brand-500 bg-brand-50'
          : 'border-gray-300 bg-white hover:border-brand-400 hover:bg-gray-50'
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

      <div className="text-5xl mb-4">📄</div>

      {uploading ? (
        <p className="text-sm text-brand-600 font-medium animate-pulse">Uploading…</p>
      ) : success ? (
        <p className="text-sm text-emerald-600 font-medium"> Upload successful!</p>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-700">
            Drag &amp; drop your Purchase Agreement PDF
          </p>
          <p className="mt-1 text-xs text-gray-400">or click to browse — PDF only, max 50 MB</p>
        </>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-600 font-medium">⚠ {error}</p>
      )}
    </div>
  );
}
