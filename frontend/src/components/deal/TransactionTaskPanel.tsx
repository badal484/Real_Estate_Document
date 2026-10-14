import { useEffect, useState } from 'react';
import { tasksApi } from '@/services/api';
import {
  CheckSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  User,
  FileText,
} from 'lucide-react';

interface TransactionTaskPanelProps {
  dealId: string;
  documents: any[];
}

export function TransactionTaskPanel({ dealId, documents }: TransactionTaskPanelProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extractingDocId, setExtractingDocId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [dealId]);

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksApi.list(dealId);
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction tasks');
    } finally {
      setLoading(false);
    }
  }

  async function handleExtractTasks(docId: string) {
    try {
      setExtractingDocId(docId);
      await tasksApi.extractFromDoc(dealId, docId);
      loadTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to extract tasks from document');
    } finally {
      setExtractingDocId(null);
    }
  }

  async function handleTaskStatusChange(taskId: string, status: 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED') {
    try {
      await tasksApi.reviewTask(dealId, taskId, { status });
      loadTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Section Header & Document Extraction Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-[#E4E4E7] shadow-clean-sm">
        <div>
          <h2 className="text-base font-semibold text-[#09090B] flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-[#09090B]" />
            Transaction Obligations &amp; Milestone Tasks ({tasks.length})
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Non-contingency obligations (escrow deposits, HOA disclosures, repair milestones) extracted from uploaded contract documents.
          </p>
        </div>

        {documents.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#71717A] font-medium">Extract from doc:</span>
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleExtractTasks(doc.id)}
                disabled={extractingDocId === doc.id}
                className="rounded-full bg-[#F4F4F5] border border-[#E4E4E7] px-3 py-1.5 text-xs font-medium text-[#09090B] hover:bg-white hover:border-[#D4D4D8] transition-all flex items-center gap-1.5 shadow-clean-xs active:scale-95 cursor-pointer"
              >
                {extractingDocId === doc.id ? (
                  <Loader2 className="h-3 w-3 animate-spin text-[#09090B]" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-[#71717A]" />
                )}
                <span>{doc.filename.slice(0, 15)}...</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content States ── */}
      {loading ? (
        <div className="flex justify-center py-12 bg-white rounded-3xl border border-[#E4E4E7]">
          <Loader2 className="h-6 w-6 animate-spin text-[#09090B]" />
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-rose-50 border border-rose-200 p-5 text-center text-xs text-rose-700">
          <AlertCircle className="h-5 w-5 mx-auto mb-1 text-rose-600" />
          {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#E4E4E7] p-8 text-center bg-white text-xs text-[#71717A]">
          No non-contingency milestone tasks recorded. Click "Extract from doc" above to parse tasks.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={`rounded-2xl border p-4.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                  isCompleted
                    ? 'bg-[#F9FAFB] border-[#E4E4E7] opacity-75'
                    : 'bg-white border-[#E4E4E7] shadow-clean-xs hover:border-[#D4D4D8]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : task.isHumanReviewed
                          ? 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {task.isHumanReviewed ? (isCompleted ? 'Completed' : 'Reviewed & Approved') : 'Pending Agent Review'}
                    </span>
                    <h3 className={`text-sm font-semibold ${isCompleted ? 'line-through text-[#A1A1AA]' : 'text-[#09090B]'}`}>
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <p className="text-xs text-[#71717A] italic">"{task.description}"</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#71717A] pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#A1A1AA]" />
                      Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    {task.amount && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <DollarSign className="h-3.5 w-3.5" /> ${task.amount.toLocaleString()}
                      </span>
                    )}

                    {task.assignedTo && (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-[#A1A1AA]" /> {task.assignedTo}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Task Action Buttons ── */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isCompleted ? (
                    <button
                      onClick={() => handleTaskStatusChange(task.id, 'COMPLETED')}
                      className="px-4 py-1.5 rounded-full bg-[#09090B] text-white text-xs font-medium hover:bg-black transition-all flex items-center gap-1.5 shadow-clean-xs active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Mark Done</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTaskStatusChange(task.id, 'IN_PROGRESS')}
                      className="px-4 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#09090B] text-xs font-medium hover:bg-white transition-all active:scale-95 cursor-pointer"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
