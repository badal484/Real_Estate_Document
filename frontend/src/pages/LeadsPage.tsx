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
  TrendingUp,
  Bot,
  Zap,
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
    URGENT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    HIGH: 'bg-[#C9A961]/15 text-[#C9A961] border-[#C9A961]/30',
    MEDIUM: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    LOW: 'bg-white/5 text-[#9A9AA5] border-white/10',
  };

  const statusColors: Record<string, string> = {
    NEW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CONTACTED: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    QUALIFIED: 'bg-[#C9A961]/15 text-[#C9A961] border-[#C9A961]/30',
    PROPOSAL: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    WON: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    LOST: 'bg-white/5 text-[#9A9AA5] border-white/10',
  };

  const totalLeadsCount = leads.length;
  const urgentCount = leads.filter((l) => l.priority === 'URGENT' || l.priority === 'HIGH').length;
  const newLeadsCount = leads.filter((l) => l.status === 'NEW').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              AI Lead Operations &amp; Extraction
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A961]/10 px-2.5 py-0.5 text-xs font-semibold text-[#C9A961] border border-[#C9A961]/25">
              <Zap className="h-3 w-3 text-[#C9A961]" /> Auto-Extraction Active
            </span>
          </div>
          <p className="text-xs text-[#9A9AA5] mt-0.5">
            Real-time buyer requirement synthesis, state machine controls &amp; inventory matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCsvModal(true)}
            className="btn-stripe-secondary text-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-stripe-primary text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Inbound Lead</span>
          </button>
        </div>
      </div>

      {/* ── Stripe Metric Cards Grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stripe-card p-4 flex items-center justify-between bg-[#141418] border border-white/[0.08] rounded-2xl">
          <div>
            <span className="text-[10px] font-mono font-medium text-[#9A9AA5] uppercase tracking-widest">Total Active Leads</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{totalLeadsCount}</div>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> Live Pipeline
            </span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#181820] text-[#C9A961] border border-[#C9A961]/25">
            <Users className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="stripe-card p-4 flex items-center justify-between bg-[#141418] border border-white/[0.08] rounded-2xl">
          <div>
            <span className="text-[10px] font-mono font-medium text-[#9A9AA5] uppercase tracking-widest">New Inbound Queue</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{newLeadsCount}</div>
            <span className="text-[11px] text-[#9A9AA5] mt-1 font-mono">Awaiting Contact</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="stripe-card p-4 flex items-center justify-between bg-[#141418] border border-white/[0.08] rounded-2xl">
          <div>
            <span className="text-[10px] font-mono font-medium text-[#9A9AA5] uppercase tracking-widest">High Priority Buyers</span>
            <div className="text-2xl font-bold text-[#C9A961] font-mono mt-1">{urgentCount}</div>
            <span className="text-[11px] text-[#C9A961] font-medium mt-1">Immediate Timeline</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#181820] text-[#C9A961] border border-[#C9A961]/25">
            <Zap className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="stripe-card p-4 flex items-center justify-between bg-[#141418] border border-white/[0.08] rounded-2xl">
          <div>
            <span className="text-[10px] font-mono font-medium text-[#9A9AA5] uppercase tracking-widest">AI Autopilot Engine</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">Active</div>
            <span className="text-[11px] text-[#C9A961] font-medium mt-1 font-mono">Gemini 2.5 Engine</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#181820] text-[#C9A961] border border-[#C9A961]/25">
            <Bot className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="stripe-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141418] border border-white/[0.08] rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6E6E7A]" />
          <input
            type="text"
            placeholder="Search leads by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 text-xs bg-[#181820] border-white/[0.08] text-white placeholder:text-[#6E6E7A] focus:border-[#C9A961]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-[#6E6E7A]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-base w-auto py-1.5 text-xs bg-[#181820] border-white/[0.08] text-white focus:border-[#C9A961]"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-base w-auto py-1.5 text-xs bg-[#181820] border-white/[0.08] text-white focus:border-[#C9A961]"
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
        <div className="stripe-card flex justify-center py-16 bg-[#141418] border border-white/[0.08] rounded-2xl">
          <Loader2 className="h-7 w-7 animate-spin text-[#C9A961]" />
        </div>
      ) : error ? (
        <div className="banner-error">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="empty-state bg-[#141418] border border-white/[0.08] rounded-2xl p-8 text-center">
          <Sparkles className="h-8 w-8 text-[#C9A961] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">No leads in queue</h3>
          <p className="text-xs text-[#9A9AA5] mt-1 max-w-sm mx-auto">
            Get started by adding your first inbound lead or importing contacts via CSV.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-stripe-primary mt-3 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Add First Lead
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => {
            const req = lead.requirements;
            const initials = lead.fullName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={lead.id}
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="stripe-card p-4 flex flex-col justify-between cursor-pointer bg-[#141418] border border-white/[0.08] hover:border-[#C9A961]/40 rounded-2xl transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#181820] text-[#C9A961] font-semibold text-xs border border-white/[0.08]">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-white group-hover:text-[#C9A961] transition-colors">
                          {lead.fullName}
                        </h3>
                        <span className={`inline-block px-2 py-0.2 text-[10px] font-mono rounded-full border mt-0.5 ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${priorityColors[lead.priority]}`}>
                      {lead.priority}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#9A9AA5] mb-3 bg-[#181820] p-2.5 rounded-xl border border-white/[0.08]">
                    {lead.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#6E6E7A] flex-shrink-0" />
                        <span className="truncate text-[#F5F5F7] text-[11px] font-mono">{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#6E6E7A] flex-shrink-0" />
                        <span className="text-[#F5F5F7] text-[11px] font-mono">{lead.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* ── Requirement Summary Pill ── */}
                  <div className="rounded-xl bg-[#181820] p-3 border border-white/[0.08] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#9A9AA5] text-[11px]">
                      <span className="flex items-center gap-1 text-white">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                        Max Budget
                      </span>
                      <span className="text-[#C9A961] font-mono font-medium">
                        {req?.maxBudget ? `$${req.maxBudget.toLocaleString()}` : 'Flexible'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#9A9AA5] text-[11px]">
                      <span className="flex items-center gap-1 text-white">
                        <Building2 className="h-3.5 w-3.5 text-[#C9A961]" />
                        Preference
                      </span>
                      <span className="text-[#F5F5F7]">
                        {req?.propertyType || 'Any'} • {req?.minBedrooms ? `${req.minBedrooms}+ Beds` : 'Any'}
                      </span>
                    </div>

                    {req?.preferredLocations?.length > 0 && (
                      <p className="text-[10px] text-[#9A9AA5] truncate pt-1 border-t border-white/[0.08]">
                        📍 {req.preferredLocations.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#6E6E7A]">
                  <span className="text-[10px] font-mono">Source: {lead.source}</span>
                  <span className="text-[#C9A961] font-semibold text-[11px] flex items-center gap-1">
                    Open Cockpit <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Lead Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#141418] p-6 border border-white/[0.08] shadow-2xl space-y-4 animate-in fade-in duration-150 text-white">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#C9A961]" />
                Add Inbound Lead &amp; Auto-Extract
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#9A9AA5] hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="label-base">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="input-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-base">Email</label>
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base">Phone</label>
                  <input
                    type="text"
                    placeholder="(555) 019-2831"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="label-base">
                  Customer Message / Enquiry Notes (Gemini AI Auto-Extract)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Looking for a 3 bedroom condo in Downtown under $650k..."
                  value={newEnquiryText}
                  onChange={(e) => setNewEnquiryText(e.target.value)}
                  className="input-base"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-stripe-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-stripe-primary text-xs"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save &amp; Auto-Extract
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
