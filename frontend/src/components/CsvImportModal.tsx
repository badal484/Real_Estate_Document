import { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Badge } from './ui/badge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (count: number) => void;
  title?: string;
  type?: 'leads' | 'properties' | string;
}

export function CsvImportModal({ isOpen, onClose, onImportSuccess, title, type = 'leads' }: Props) {
  const displayTitle = title || (type === 'properties' ? 'Import Properties CSV / MLS' : 'Import Leads CSV / Excel');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }

  function handleRunImport() {
    if (!file) return;
    setImporting(true);

    // Simulate instant CSV parse & AI extraction pipeline
    setTimeout(() => {
      setImporting(false);
      setSuccessCount(14); // 14 items imported
      onImportSuccess?.(14);
      setTimeout(() => {
        setSuccessCount(null);
        setFile(null);
        onClose();
      }, 1500);
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] mb-1">
              Instant Onboarding
            </Badge>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-indigo-600" /> {displayTitle}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {successCount !== null ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center text-emerald-800 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm">Import Complete!</h4>
            <p className="text-xs text-emerald-700">
              Successfully imported <strong>{successCount} records</strong> and extracted AI requirements automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-500">
              Upload any CSV, Excel, Zillow, or KvCORE lead export file. The AI engine will automatically parse names, contacts, and buyer criteria.
            </p>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
                <Upload className="h-8 w-8 text-indigo-600 mx-auto" />
                <p className="font-bold text-slate-800">
                  {file ? file.name : 'Click to select CSV or Excel file'}
                </p>
                <p className="text-[11px] text-slate-400">Supports .csv, .xlsx from Zillow, Realtor.com, Follow Up Boss</p>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRunImport}
                disabled={!file || importing}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold flex items-center gap-2 shadow-xs"
              >
                {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {importing ? 'AI Importing...' : 'Import & Process with AI'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
