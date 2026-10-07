import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsApi } from '@/services/api';
import { CsvImportModal } from '@/components/CsvImportModal';
import {
  Users,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  Building2,
  DollarSign,
  ChevronRight,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';

export function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // New Lead Form State
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEnquiryText, setNewEnquiryText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, priorityFilter]);

  async function fetchLeads() {
    try {
      setLoading(true);
      setError(null);
      const data = await leadsApi.list({
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setLeads(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLead(e: React.FormEvent) {
    e.preventDefault();
    if (!newFullName.trim()) return;

    try {
      setSubmitting(true);
      const lead = await leadsApi.create({
        fullName: newFullName,
        email: newEmail || undefined,
        phone: newPhone || undefined,
        enquiryText: newEnquiryText || undefined,
        source: 'MANUAL',
      });
      setShowAddModal(false);
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewEnquiryText('');
      navigate(`/leads/${lead.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  }

  const priorityColors: Record<string, string> = {
    URGENT: 'bg-rose-100 text-rose-800 border-rose-200',
    HIGH: 'bg-amber-100 text-amber-800 border-amber-200',
    MEDIUM: 'bg-sky-100 text-sky-800 border-sky-200',
    LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const statusColors: Record<string, string> = {
    NEW: 'bg-emerald-500 text-white',
    CONTACTED: 'bg-blue-600 text-white',
    QUALIFIED: 'bg-indigo-600 text-white',
    PROPOSAL: 'bg-purple-600 text-white',
    WON: 'bg-teal-600 text-white',
    LOST: 'bg-slate-400 text-white',
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-600" />
            AI Lead Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Capture, analyze, and track potential buyer requirements with automated Gemini extraction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCsvModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Import CSV / Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Inbound Lead
          </button>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* ── Content States ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center text-rose-700">
          <AlertCircle className="h-6 w-6 mx-auto mb-2" />
          {error}
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50">
          <Sparkles className="h-10 w-10 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No leads found</h3>
          <p className="text-sm text-slate-500 mt-1">Get started by creating your first inbound lead or form inquiry.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => {
            const req = lead.requirements;
            return (
              <div
                key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="group relative rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full mb-1.5 ${statusColors[lead.status]}`}>
                        {lead.status}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {lead.fullName}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${priorityColors[lead.priority]}`}>
                      {lead.priority}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    {lead.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* ── Requirement Quick Summary ── */}
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-700 font-semibold">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                        Budget
                      </span>
                      <span>
                        {req?.maxBudget ? `$${req.maxBudget.toLocaleString()}` : 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                        Type / Beds
                      </span>
                      <span>
                        {req?.propertyType || 'Any'} • {req?.minBedrooms ? `${req.minBedrooms}+ beds` : 'Any'}
                      </span>
                    </div>
                    {req?.preferredLocations?.length > 0 && (
                      <p className="text-[11px] text-slate-500 truncate pt-1">
                        📍 {req.preferredLocations.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Source: {lead.source}</span>
                  <span className="text-indigo-600 font-medium flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    View Workspace <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Lead Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Inbound Lead & Auto-Extract</h2>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="(555) 019-2831"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enquiry Message / Notes (AI will extract budget, beds & location)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Looking for a 3 bedroom condo in Downtown under $650k, hoping to move in within 60 days."
                  value={newEnquiryText}
                  onChange={(e) => setNewEnquiryText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create &amp; Extract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CSV Import Modal ── */}
      <CsvImportModal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        type="leads"
        onImportSuccess={fetchLeads}
      />
    </div>
  );
}
