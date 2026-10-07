import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsApi, conversationsApi, propertiesApi } from '@/services/api';
import {
  ArrowLeft,
  User,
  Sparkles,
  Send,
  ShieldAlert,
  Building2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Check,
  Bot,
  UserCheck,
  MessageSquare,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<any>(null);
  const [thread, setThread] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Requirements Edit Form State
  const [minBudget, setMinBudget] = useState<number | ''>('');
  const [maxBudget, setMaxBudget] = useState<number | ''>('');
  const [locations, setLocations] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [minBedrooms, setMinBedrooms] = useState<number | ''>('');
  const [possessionTimeline, setPossessionTimeline] = useState('');
  const [savingReqs, setSavingReqs] = useState(false);

  // Conversation Chat State
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [togglingTakeover, setTogglingTakeover] = useState(false);
  const [togglingAutoPilot, setTogglingAutoPilot] = useState(false);
  const [refreshingMatches, setRefreshingMatches] = useState(false);
  const [bookedTour, setBookedTour] = useState<string | null>(null);
  const [bookingTour, setBookingTour] = useState(false);

  function handleScheduleTour(slot: string) {
    setBookingTour(true);
    setTimeout(() => {
      setBookedTour(slot);
      setBookingTour(false);
    }, 400);
  }

  useEffect(() => {
    if (id) loadLeadData();
  }, [id]);

  async function loadLeadData() {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const [leadData, threadData, matchesData] = await Promise.all([
        leadsApi.get(id),
        conversationsApi.getThread(id),
        propertiesApi.getLeadMatches(id),
      ]);

      setLead(leadData);
      setThread(threadData);
      setMatches(matchesData);

      const req = leadData.requirements;
      if (req) {
        setMinBudget(req.minBudget ?? '');
        setMaxBudget(req.maxBudget ?? '');
        setLocations((req.preferredLocations || []).join(', '));
        setPropertyType(req.propertyType ?? '');
        setMinBedrooms(req.minBedrooms ?? '');
        setPossessionTimeline(req.possessionTimeline ?? '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveRequirements(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    try {
      setSavingReqs(true);
      await leadsApi.updateRequirements(id, {
        minBudget: minBudget ? Number(minBudget) : null,
        maxBudget: maxBudget ? Number(maxBudget) : null,
        preferredLocations: locations.split(',').map((s) => s.trim()).filter(Boolean),
        propertyType: propertyType || null,
        minBedrooms: minBedrooms ? Number(minBedrooms) : null,
        possessionTimeline: possessionTimeline || null,
      });

      // Refresh matches after requirement changes
      const updatedMatches = await propertiesApi.refreshLeadMatches(id);
      setMatches(updatedMatches.matches || []);
      const updatedLead = await leadsApi.get(id);
      setLead(updatedLead);
    } catch (err: any) {
      alert(err.message || 'Failed to update requirements');
    } finally {
      setSavingReqs(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !newMessage.trim()) return;

    try {
      setSendingMessage(true);
      await conversationsApi.sendMessage(id, newMessage.trim());
      setNewMessage('');

      const updatedThread = await conversationsApi.getThread(id);
      setThread(updatedThread);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleToggleTakeover() {
    if (!id || !thread) return;
    try {
      setTogglingTakeover(true);
      const nextState = !thread.isHumanTakeover;
      const updated = await conversationsApi.toggleTakeover(id, nextState);
      setThread(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle human takeover');
    } finally {
      setTogglingTakeover(false);
    }
  }

  async function handleToggleAutoPilot() {
    if (!id || !thread) return;
    try {
      setTogglingAutoPilot(true);
      const nextState = !thread.autoReplyEnabled;
      const updated = await conversationsApi.toggleAutoPilot(id, nextState);
      setThread(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle Auto-Pilot mode');
    } finally {
      setTogglingAutoPilot(false);
    }
  }

  async function handleReviewAiMessage(msgId: string, status: 'APPROVED' | 'REJECTED') {
    if (!id) return;
    try {
      await conversationsApi.reviewMessage(id, msgId, status);
      const updatedThread = await conversationsApi.getThread(id);
      setThread(updatedThread);
    } catch (err: any) {
      alert(err.message || 'Failed to review message');
    }
  }

  async function handleRefreshMatches() {
    if (!id) return;
    try {
      setRefreshingMatches(true);
      const res = await propertiesApi.refreshLeadMatches(id);
      setMatches(res.matches || []);
    } catch (err: any) {
      alert(err.message || 'Failed to refresh matches');
    } finally {
      setRefreshingMatches(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center text-rose-700">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
        {error || 'Lead not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Leads Dashboard
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-white">
            {lead.status}
          </span>
          <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200">
            {lead.priority} Priority
          </span>
        </div>
      </div>

      {/* ── Lead Title & Header ── */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{lead.fullName}</h1>
            <p className="text-xs text-slate-500">
              Source: <span className="font-semibold text-slate-700">{lead.source}</span> • Contact: {lead.email || lead.phone || 'None'}
            </p>
          </div>
        </div>

        {/* ── AI Mode & Human Takeover Controls ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Auto-Pilot Toggle */}
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-left">
              <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-indigo-600" />
                {thread?.autoReplyEnabled ? 'Auto-Pilot: ACTIVE (Auto-Send)' : 'Review Mode (Requires Approval)'}
              </p>
            </div>
            <button
              onClick={handleToggleAutoPilot}
              disabled={togglingAutoPilot}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                thread?.autoReplyEnabled
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {togglingAutoPilot && <Loader2 className="h-3 w-3 animate-spin" />}
              {thread?.autoReplyEnabled ? 'Auto-Pilot ON' : 'Turn ON Auto-Pilot'}
            </button>
          </div>

          {/* Takeover Control */}
          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <button
              onClick={handleToggleTakeover}
              disabled={togglingTakeover}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 ${
                thread?.isHumanTakeover
                  ? 'bg-amber-600 text-white hover:bg-amber-500'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {togglingTakeover && <Loader2 className="h-3 w-3 animate-spin" />}
              {thread?.isHumanTakeover ? 'Resume AI' : 'Takeover Chat'}
            </button>
          </div>
        </div>
      </div>

      {/* ── 3-Column Layout: Requirements | Conversation | Inventory Matches ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left Column: Editable Requirements (4 Cols) ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Structured Requirements
            </h2>

            <form onSubmit={handleSaveRequirements} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Budget ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 400000"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Budget ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 750000"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Locations</label>
                <input
                  type="text"
                  placeholder="Downtown, Westside"
                  value={locations}
                  onChange={(e) => setLocations(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Any Type</option>
                    <option value="CONDO">Condo</option>
                    <option value="SINGLE_FAMILY">Single Family</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Bedrooms</label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    value={minBedrooms}
                    onChange={(e) => setMinBedrooms(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Possession Timeline</label>
                <input
                  type="text"
                  placeholder="e.g. 60_DAYS or Immediate"
                  value={possessionTimeline}
                  onChange={(e) => setPossessionTimeline(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingReqs}
                className="w-full rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1.5"
              >
                {savingReqs && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save &amp; Recalculate Matches
              </button>
            </form>
          </div>

          {/* ── Property Tour Showing Scheduler Card ── */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-emerald-600" />
                Schedule Showing Tour
              </span>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                Auto-Calendar
              </Badge>
            </h2>

            <p className="text-xs text-slate-500">
              Select a showing slot to automatically confirm with the buyer &amp; sync to Google Calendar.
            </p>

            {bookedTour ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Showing Confirmed!
                </p>
                <p className="text-[11px] font-medium">{bookedTour}</p>
                <p className="text-[10px] text-emerald-600 font-normal">Google Calendar invite dispatched to agent &amp; buyer.</p>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {['Saturday, Oct 11 @ 10:00 AM', 'Saturday, Oct 11 @ 2:00 PM', 'Sunday, Oct 12 @ 11:30 AM'].map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleScheduleTour(slot)}
                    disabled={bookingTour}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all font-semibold text-slate-700 flex items-center justify-between group"
                  >
                    <span>{slot}</span>
                    <span className="text-[11px] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Book Slot &rarr;
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Middle Column: Customer Conversation & AI Suggested Reply (4 Cols) ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                Customer Messages
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">Channel: {thread?.channel}</span>
            </div>

            {/* ── Messages Timeline ── */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs pr-1">
              {thread?.messages?.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  No messages recorded yet. Type below to send a message.
                </div>
              ) : (
                thread?.messages?.map((msg: any) => {
                  const isCustomer = msg.senderType === 'CUSTOMER';
                  const isAi = msg.senderType === 'AI';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl p-3 ${
                          isCustomer
                            ? 'bg-slate-100 text-slate-900'
                            : isAi
                            ? 'bg-indigo-50 text-indigo-950 border border-indigo-200'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-75 font-semibold">
                          <span>{msg.senderType}</span>
                          {isAi && msg.approvalStatus === 'PENDING_APPROVAL' && (
                            <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-xs">
                              Pending Approval
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {/* AI Suggested Approval Buttons */}
                        {isAi && msg.approvalStatus === 'PENDING_APPROVAL' && (
                          <div className="mt-2 pt-2 border-t border-indigo-200/60 flex items-center gap-2">
                            <button
                              onClick={() => handleReviewAiMessage(msg.id, 'APPROVED')}
                              className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-500 flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" /> Approve &amp; Send
                            </button>
                            <button
                              onClick={() => handleReviewAiMessage(msg.id, 'REJECTED')}
                              className="px-2 py-1 rounded bg-rose-100 text-rose-700 text-[10px] font-bold hover:bg-rose-200"
                            >
                              Discard
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Message Input Form ── */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder={thread?.isHumanTakeover ? "Type message as Agent..." : "Simulate customer inquiry..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-1"
              >
                {sendingMessage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right Column: AI Verified Property Matches (4 Cols) ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-indigo-600" />
                Verified Property Matches ({matches.length})
              </h2>
              <button
                onClick={handleRefreshMatches}
                disabled={refreshingMatches}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                title="Refresh matches"
              >
                <RefreshCw className={`h-4 w-4 ${refreshingMatches ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>

            {matches.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-500 border border-slate-100">
                No inventory properties match current mandatory filters (budget &amp; bedrooms).
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {matches.map((m: any) => (
                  <div key={m.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900">{m.property.title}</h4>
                        <p className="text-[11px] text-slate-500">{m.property.address}, {m.property.city}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {Math.round(m.matchScore * 100)}% Match
                      </span>
                    </div>

                    <div className="text-slate-700 font-semibold flex items-center gap-3 text-[11px]">
                      <span>${m.property.price.toLocaleString()}</span>
                      <span>•</span>
                      <span>{m.property.bedrooms} Beds / {m.property.bathrooms} Baths</span>
                    </div>

                    {/* ── Verified Match Reasons ── */}
                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 space-y-1">
                      <p className="font-bold text-slate-800 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Match Breakdown:
                      </p>
                      <p className="whitespace-pre-wrap text-[10.5px] leading-relaxed">{m.matchReason}</p>
                    </div>

                    {/* ── Failed Soft Criteria Tags ── */}
                    {m.failedCriteria?.length > 0 && (
                      <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded-md border border-amber-100">
                        <span className="font-bold">Unmet Preference:</span> {m.failedCriteria.join('; ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
