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
    URGENT: 'bg-rose-50 text-rose-700 border-rose-200',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
    MEDIUM: 'bg-sky-50 text-sky-700 border-sky-200',
    LOW: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const statusColors: Record<string, string> = {
    NEW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CONTACTED: 'bg-blue-50 text-blue-700 border-blue-200',
    QUALIFIED: 'bg-indigo-50 text-[#635bff] border-indigo-200',
    PROPOSAL: 'bg-purple-50 text-purple-700 border-purple-200',
    WON: 'bg-teal-50 text-teal-700 border-teal-200',
    LOST: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const totalLeadsCount = leads.length;
  const urgentCount = leads.filter((l) => l.priority === 'URGENT' || l.priority === 'HIGH').length;
  const newLeadsCount = leads.filter((l) => l.status === 'NEW').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ── Stripe Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e3e8ee] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#0a2540]">
              AI Lead Operations &amp; Extraction
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#635bff]/10 px-2.5 py-0.5 text-xs font-bold text-[#635bff] border border-[#635bff]/20">
              <Zap className="h-3 w-3 text-[#635bff]" /> Auto-Extraction Active
            </span>
          </div>
          <p className="text-xs text-[#4f566b] mt-0.5">
            Real-time buyer requirement synthesis, state machine controls &amp; inventory matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCsvModal(true)}
            className="btn-stripe-secondary text-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#059669]" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-stripe-primary text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Inbound Lead
          </button>
        </div>
      </div>

      {/* ── Stripe Metric Cards Grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stripe-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Total Active Leads</span>
            <div className="text-2xl font-black text-[#0a2540] mt-1">{totalLeadsCount}</div>
            <span className="text-[11px] text-[#059669] font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> Live Pipeline
            </span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#635bff]/10 text-[#635bff] border border-[#635bff]/20">
            <Users className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="stripe-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">New Inbound Queue</span>
            <div className="text-2xl font-black text-[#059669] mt-1">{newLeadsCount}</div>
            <span className="text-[11px] text-[#4f566b] mt-1">Awaiting Contact</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#059669] border border-emerald-200">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="stripe-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">High Priority Buyers</span>
            <div className="text-2xl font-black text-[#d97706] mt-1">{urgentCount}</div>
            <span className="text-[11px] text-[#d97706] font-bold mt-1">Immediate Timeline</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-[#d97706] border border-amber-200">
            <Zap className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="stripe-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">AI Autopilot Engine</span>
            <div className="text-2xl font-black text-[#0a2540] mt-1">Active</div>
            <span className="text-[11px] text-[#635bff] font-bold mt-1">Gemini 2.5 Engine</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#0a2540] border border-[#e3e8ee]">
            <Bot className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="stripe-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8792a2]" />
          <input
            type="text"
            placeholder="Search leads by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-[#8792a2]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-base w-auto py-1.5 text-xs"
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
            className="input-base w-auto py-1.5 text-xs"
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
        <div className="stripe-card flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-[#635bff]" />
        </div>
      ) : error ? (
        <div className="banner-error">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="empty-state">
          <Sparkles className="h-8 w-8 text-[#635bff] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#0a2540]">No leads in queue</h3>
          <p className="text-xs text-[#4f566b] mt-1 max-w-sm mx-auto">
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
                className="stripe-card p-4 flex flex-col justify-between cursor-pointer hover:border-[#635bff]/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f8] text-[#0a2540] font-bold text-xs border border-[#e3e8ee]">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-[#0a2540] group-hover:text-[#635bff] transition-colors">
                          {lead.fullName}
                        </h3>
                        <span className={`inline-block px-2 py-0.2 text-[10px] font-extrabold rounded-full border mt-0.5 ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${priorityColors[lead.priority]}`}>
                      {lead.priority}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[#4f566b] mb-3 bg-[#f8f9fa] p-2 rounded-lg border border-[#e3e8ee]">
                    {lead.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#8792a2] flex-shrink-0" />
                        <span className="truncate text-[#1a1f36] text-[11px]">{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#8792a2] flex-shrink-0" />
                        <span className="text-[#1a1f36] text-[11px]">{lead.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* ── Requirement Summary Pill ── */}
                  <div className="rounded-lg bg-[#f8f9fa] p-3 border border-[#e3e8ee] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#4f566b] font-semibold text-[11px]">
                      <span className="flex items-center gap-1 text-[#0a2540]">
                        <DollarSign className="h-3.5 w-3.5 text-[#059669]" />
                        Max Budget
                      </span>
                      <span className="text-[#0a2540] font-bold">
                        {req?.maxBudget ? `$${req.maxBudget.toLocaleString()}` : 'Flexible'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#4f566b] text-[11px]">
                      <span className="flex items-center gap-1 text-[#0a2540]">
                        <Building2 className="h-3.5 w-3.5 text-[#635bff]" />
                        Preference
                      </span>
                      <span className="text-[#1a1f36]">
                        {req?.propertyType || 'Any'} • {req?.minBedrooms ? `${req.minBedrooms}+ Beds` : 'Any'}
                      </span>
                    </div>

                    {req?.preferredLocations?.length > 0 && (
                      <p className="text-[10px] text-[#8792a2] truncate pt-1 border-t border-[#e3e8ee]">
                        📍 {req.preferredLocations.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#e3e8ee] flex items-center justify-between text-xs text-[#8792a2]">
                  <span className="text-[10px]">Source: {lead.source}</span>
                  <span className="text-[#635bff] font-bold text-[11px] flex items-center gap-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a2540]/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 border border-[#e3e8ee] shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#e3e8ee] pb-3">
              <h2 className="text-sm font-bold text-[#0a2540] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#635bff]" />
                Add Inbound Lead &amp; Auto-Extract
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#8792a2] hover:text-[#0a2540] text-xs font-bold"
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

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e3e8ee]">
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
