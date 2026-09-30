import { useState, useRef } from 'react';
import { documentsApi } from '@/services/api';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Loader2 } from 'lucide-react';

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
      await documentsApi.upload(dealId, file);
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
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) void uploadFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
        dragging
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30'
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

      <div
        className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
          success
            ? 'bg-success/10 text-success border border-success/20'
            : uploading
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'bg-muted text-muted-foreground border border-border'
        }`}
      >
        {success ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <UploadCloud className="h-5 w-5" />
        )}
      </div>

      {uploading ? (
        <p className="mt-3 text-xs font-semibold text-foreground">Uploading &amp; indexing document&hellip;</p>
      ) : success ? (
        <p className="mt-3 text-xs font-semibold text-success">Upload and ingestion successful.</p>
      ) : (
        <>
          <p className="mt-3 text-xs font-semibold text-foreground">
            Drag and drop your contract PDF here, or <span className="underline text-primary">browse</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">PDF contracts, counter offers, and addenda up to 50 MB</p>
        </>
      )}

      {error && (
        <p className="mt-2.5 flex items-center justify-center gap-1 text-xs font-medium text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
