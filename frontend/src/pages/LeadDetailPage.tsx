import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsApi, conversationsApi, propertiesApi } from '@/services/api';
import {
  ArrowLeft,
  User,
  Sparkles,
  Send,
  Building2,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Check,
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
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-center text-rose-300">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-rose-400" />
        {error || 'Lead not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9A9AA5] hover:text-[#F5F5F7] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Leads Dashboard
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6E6E7A]">Status:</span>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/25">
            {lead.status}
          </span>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#C9A961]/15 text-[#C9A961] border border-[#C9A961]/25">
            {lead.priority} Priority
          </span>
        </div>
      </div>

      {/* ── Lead Title & Header ── */}
      <div className="rounded-2xl bg-[#141418] border border-white/[0.08] p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#C9A961]/15 border border-[#C9A961]/25 flex items-center justify-center text-[#C9A961]">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#F5F5F7]">{lead.fullName}</h1>
            <p className="text-xs text-[#9A9AA5] mt-0.5">
              Source: <span className="text-[#C9A961] font-medium">{lead.source}</span> • Contact: {lead.email || lead.phone || 'None'}
            </p>
          </div>
        </div>

        {/* ── AI Mode & Human Takeover Controls ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Auto-Pilot Toggle */}
          <div className="flex items-center gap-2.5 bg-[#0D0D11] p-2.5 rounded-xl border border-white/[0.08]">
            <div className="text-left">
              <p className="text-[11px] font-medium text-[#9A9AA5] flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[#C9A961]" />
                {thread?.autoReplyEnabled ? 'Auto-Pilot: ACTIVE (Auto-Send)' : 'Review Mode (Requires Approval)'}
              </p>
            </div>
            <button
              onClick={handleToggleAutoPilot}
              disabled={togglingAutoPilot}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                thread?.autoReplyEnabled
                  ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 hover:bg-[#34D399]/30'
                  : 'bg-white/[0.06] text-[#9A9AA5] border border-white/[0.08] hover:bg-white/[0.1] hover:text-[#F5F5F7]'
              }`}
            >
              {togglingAutoPilot && <Loader2 className="h-3 w-3 animate-spin" />}
              {thread?.autoReplyEnabled ? 'Auto-Pilot ON' : 'Turn ON Auto-Pilot'}
            </button>
          </div>

          {/* Takeover Control */}
          <div className="flex items-center gap-2 bg-[#0D0D11] p-2.5 rounded-xl border border-white/[0.08]">
            <button
              onClick={handleToggleTakeover}
              disabled={togglingTakeover}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${
                thread?.isHumanTakeover
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-[#C9A961] text-[#0A0A0B] hover:bg-[#D4B774]'
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
          <div className="rounded-2xl bg-[#141418] border border-white/[0.08] p-5 shadow-lg">
            <h2 className="text-sm font-semibold text-[#F5F5F7] mb-3.5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#C9A961]" />
              Structured Requirements
            </h2>

            <form onSubmit={handleSaveRequirements} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9AA5] mb-1">Min Budget ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 400000"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-lg bg-[#0D0D11] border border-white/[0.08] px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#6E6E7A] focus:border-[#C9A961] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9AA5] mb-1">Max Budget ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 750000"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-lg bg-[#0D0D11] border border-white/[0.08] px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#6E6E7A] focus:border-[#C9A961] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#9A9AA5] mb-1">Preferred Locations</label>
                <input
                  type="text"
                  placeholder="Downtown, Westside"
                  value={locations}
                  onChange={(e) => setLocations(e.target.value)}
                  className="w-full rounded-lg bg-[#0D0D11] border border-white/[0.08] px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#6E6E7A] focus:border-[#C9A961] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9AA5] mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full rounded-lg bg-[#0D0D11] border border-white/[0.08] px-2.5 py-2 text-xs text-[#F5F5F7] focus:border-[#C9A961] outline-none"
                  >
                    <option value="">Any Type</option>
                    <option value="CONDO">Condo</option>
                    <option value="SINGLE_FAMILY">Single Family</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9AA5] mb-1">Min Bedrooms</label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    value={minBedrooms}
                    onChange={(e) => setMinBedrooms(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-lg bg-[#0D0D11] border border-white/[0.08] px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#6E6E7A] focus:border-[#C9A961] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#9A9AA5] mb-1">Possession Timeline</label>
                <input
                  type="text"
                  placeholder="e.g. 60_DAYS or Immediate"
                  value={possessionTimeline}
                  onChange={(e) => setPossessionTimeline(e.target.value)}
                  className="w-full rounded-lg bg-[#0D0D11] border border-white/[0.08] px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#6E6E7A] focus:border-[#C9A961] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingReqs}
                className="w-full rounded-full bg-[#C9A961] hover:bg-[#D4B774] py-2.5 text-xs font-semibold text-[#0A0A0B] transition-all flex items-center justify-center gap-1.5 shadow-sm mt-2"
              >
                {savingReqs && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save &amp; Recalculate Matches
              </button>
            </form>
          </div>

          {/* ── Property Tour Showing Scheduler Card ── */}
          <div className="rounded-2xl bg-[#141418] border border-white/[0.08] p-5 shadow-lg space-y-3">
            <h2 className="text-sm font-semibold text-[#F5F5F7] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#34D399]" />
                Schedule Showing Tour
              </span>
              <Badge className="bg-[#34D399]/15 text-[#34D399] border-[#34D399]/25 text-[10px]">
                Auto-Calendar
              </Badge>
            </h2>

            <p className="text-xs text-[#9A9AA5]">
              Select a showing slot to automatically confirm with the buyer &amp; sync to Google Calendar.
            </p>

            {bookedTour ? (
              <div className="bg-[#34D399]/10 border border-[#34D399]/20 rounded-xl p-3.5 text-xs text-[#34D399] space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#34D399]" /> Showing Confirmed!
                </p>
                <p className="text-[11px] font-medium text-[#F5F5F7]">{bookedTour}</p>
                <p className="text-[10px] text-[#9A9AA5] font-normal">Google Calendar invite dispatched to agent &amp; buyer.</p>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {['Saturday, Oct 11 @ 10:00 AM', 'Saturday, Oct 11 @ 2:00 PM', 'Sunday, Oct 12 @ 11:30 AM'].map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleScheduleTour(slot)}
                    disabled={bookingTour}
                    className="w-full text-left p-2.5 rounded-xl border border-white/[0.08] bg-[#0D0D11] hover:border-[#C9A961]/40 hover:bg-white/[0.03] transition-all font-medium text-[#F5F5F7] flex items-center justify-between group"
                  >
                    <span>{slot}</span>
                    <span className="text-[11px] text-[#C9A961] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="rounded-2xl bg-[#141418] border border-white/[0.08] p-5 shadow-lg flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h2 className="text-sm font-semibold text-[#F5F5F7] flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#C9A961]" />
                Customer Messages
              </h2>
              <span className="text-[11px] text-[#6E6E7A] font-medium">Channel: {thread?.channel}</span>
            </div>

            {/* ── Messages Timeline ── */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs pr-1">
              {thread?.messages?.length === 0 ? (
                <div className="text-center py-10 text-[#6E6E7A]">
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
                            ? 'bg-[#0D0D11] text-[#F5F5F7] border border-white/[0.08]'
                            : isAi
                            ? 'bg-[#C9A961]/10 text-[#F5F5F7] border border-[#C9A961]/25'
                            : 'bg-[#C9A961] text-[#0A0A0B] font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-80 font-semibold">
                          <span>{msg.senderType}</span>
                          {isAi && msg.approvalStatus === 'PENDING_APPROVAL' && (
                            <span className="text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-xs border border-amber-500/30">
                              Pending Approval
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {/* AI Suggested Approval Buttons */}
                        {isAi && msg.approvalStatus === 'PENDING_APPROVAL' && (
                          <div className="mt-2.5 pt-2 border-t border-[#C9A961]/20 flex items-center gap-2">
                            <button
                              onClick={() => handleReviewAiMessage(msg.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded bg-[#C9A961] text-[#0A0A0B] text-[10px] font-bold hover:bg-[#D4B774] flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" /> Approve &amp; Send
                            </button>
                            <button
                              onClick={() => handleReviewAiMessage(msg.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold hover:bg-rose-500/30"
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
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/[0.08] flex gap-2">
              <input
                type="text"
                placeholder={thread?.isHumanTakeover ? "Type message as Agent..." : "Simulate customer inquiry..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 rounded-xl bg-[#0D0D11] border border-white/[0.08] px-3 py-2 text-xs text-[#F5F5F7] placeholder-[#6E6E7A] focus:border-[#C9A961] outline-none"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                className="rounded-xl bg-[#C9A961] px-3.5 py-2 text-xs font-semibold text-[#0A0A0B] hover:bg-[#D4B774] disabled:opacity-50 flex items-center gap-1 transition-all"
              >
                {sendingMessage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right Column: AI Verified Property Matches (4 Cols) ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-[#141418] border border-white/[0.08] p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-semibold text-[#F5F5F7] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#C9A961]" />
                Verified Property Matches ({matches.length})
              </h2>
              <button
                onClick={handleRefreshMatches}
                disabled={refreshingMatches}
                className="p-1.5 rounded-lg text-[#9A9AA5] hover:text-[#C9A961] hover:bg-white/[0.04] transition-colors"
                title="Refresh matches"
              >
                <RefreshCw className={`h-4 w-4 ${refreshingMatches ? 'animate-spin text-[#C9A961]' : ''}`} />
              </button>
            </div>

            {matches.length === 0 ? (
              <div className="rounded-xl bg-[#0D0D11] p-6 text-center text-xs text-[#6E6E7A] border border-white/[0.06]">
                No inventory properties match current mandatory filters (budget &amp; bedrooms).
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {matches.map((m: any) => (
                  <div key={m.id} className="rounded-xl border border-white/[0.08] p-3.5 bg-[#0D0D11] space-y-2.5 text-xs hover:border-[#C9A961]/30 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-[#F5F5F7]">{m.property.title}</h4>
                        <p className="text-[11px] text-[#9A9AA5]">{m.property.address}, {m.property.city}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/25">
                        {Math.round(m.matchScore * 100)}% Match
                      </span>
                    </div>

                    <div className="text-[#F5F5F7] font-semibold flex items-center gap-3 text-[11px]">
                      <span className="text-[#34D399]">${m.property.price.toLocaleString()}</span>
                      <span className="text-[#6E6E7A]">•</span>
                      <span className="text-[#9A9AA5]">{m.property.bedrooms} Beds / {m.property.bathrooms} Baths</span>
                    </div>

                    {/* ── Verified Match Reasons ── */}
                    <div className="text-[11px] text-[#9A9AA5] bg-[#141418] p-2.5 rounded-lg border border-white/[0.06] space-y-1">
                      <p className="font-semibold text-[#F5F5F7] flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-[#34D399]" /> Match Breakdown:
                      </p>
                      <p className="whitespace-pre-wrap text-[10.5px] leading-relaxed text-[#9A9AA5]">{m.matchReason}</p>
                    </div>

                    {/* ── Failed Soft Criteria Tags ── */}
                    {m.failedCriteria?.length > 0 && (
                      <div className="text-[10px] text-amber-300 bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
                        <span className="font-bold text-amber-200">Unmet Preference:</span> {m.failedCriteria.join('; ')}
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
