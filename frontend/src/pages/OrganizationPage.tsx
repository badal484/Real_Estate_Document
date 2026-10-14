import { useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Bot,
  Key,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Trash2,
  Palette,
  Code,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'BROKER_ADMIN' | 'AGENT';
  status: 'ACTIVE' | 'PENDING';
  joinedAt: string;
}

export function OrganizationPage() {
  const { user } = useAuth();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // White-Label Settings State
  const [orgName, setOrgName] = useState('Apex Brokerage Group Inc.');
  const [customDomain, setCustomDomain] = useState('ai.apexbrokerage.com');
  const [primaryColor, setPrimaryColor] = useState('#09090B');
  const [aiPersona, setAiPersona] = useState('PROFESSIONAL');
  const [maxAutoBudget, setMaxAutoBudget] = useState('2500000');
  const [savedBranding, setSavedBranding] = useState(false);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'BROKER_ADMIN' | 'AGENT'>('AGENT');
  const [sendingInvite, setSendingInvite] = useState(false);

  // Mock Team Members for B2B Agency
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: user?.name || 'Demo Broker Admin',
      email: user?.email || 'admin@brokerage.com',
      role: 'BROKER_ADMIN',
      status: 'ACTIVE',
      joinedAt: '2026-01-15',
    },
    {
      id: '2',
      name: 'Sarah Jenkins',
      email: 'sarah.j@brokerage.com',
      role: 'AGENT',
      status: 'ACTIVE',
      joinedAt: '2026-02-01',
    },
    {
      id: '3',
      name: 'Michael Vance',
      email: 'michael.v@brokerage.com',
      role: 'AGENT',
      status: 'ACTIVE',
      joinedAt: '2026-03-10',
    },
    {
      id: '4',
      name: 'Elena Rostova',
      email: 'elena.r@brokerage.com',
      role: 'AGENT',
      status: 'PENDING',
      joinedAt: '2026-10-01',
    },
  ]);

  const webhookSecret = 'whsec_copilot_b2b_9f8a7b6c5d4e3f2a1';
  const embedCodeSnippet = `<script src="https://cdn.contingencycopilot.com/widget.js" data-org="whsec_copilot_b2b_9f8a7b6c5d4e3f2a1" async></script>`;

  function handleCopyWebhookSecret() {
    navigator.clipboard.writeText(webhookSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  function handleCopyEmbedSnippet() {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  }

  function handleSaveBranding(e: React.FormEvent) {
    e.preventDefault();
    setSavedBranding(true);
    setTimeout(() => setSavedBranding(false), 2500);
  }

  function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSendingInvite(true);
    setTimeout(() => {
      const newMember: TeamMember = {
        id: String(Date.now()),
        name: inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        role: inviteRole,
        status: 'PENDING',
        joinedAt: new Date().toISOString().split('T')[0],
      };
      setTeamMembers([...teamMembers, newMember]);
      setInviteEmail('');
      setSendingInvite(false);
      setShowInviteModal(false);
    }, 600);
  }

  function handleRemoveMember(memberId: string) {
    if (confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter((m) => m.id !== memberId));
    }
  }

  return (
    <div className="space-y-8 pb-12 max-w-[1600px] mx-auto">
      {/* ── B2B Header Card ── */}
      <div className="bg-white border border-[#E4E4E7] p-8 rounded-3xl relative overflow-hidden shadow-clean-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> B2B Enterprise Workspace
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-semibold text-zinc-800 border border-zinc-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Multi-Tenant RAG Ready
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#09090B] tracking-tight">
              Agency &amp; Brokerage Administration
            </h1>
            <p className="text-xs text-[#71717A] max-w-2xl leading-relaxed">
              Manage your real estate brokerage seats, tenant-isolated vector indexing, whitelabel branding, and lead capture webhooks.
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="px-5 py-2.5 rounded-full bg-[#09090B] hover:bg-black text-white text-xs font-medium flex items-center gap-2 shadow-clean-xs transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* ── Team Members Grid & Table ── */}
      <div className="bg-white border border-[#E4E4E7] rounded-3xl p-6 sm:p-7 shadow-clean-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-4">
          <div>
            <h2 className="text-base font-semibold text-[#09090B] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#09090B]" />
              Authorized Agents &amp; Staff ({teamMembers.length})
            </h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              Team members share your brokerage's isolated contract knowledge base and lead pool.
            </p>
          </div>
          <Badge variant="neutral" className="text-xs px-3 py-1 rounded-full bg-[#F4F4F5] text-[#09090B] border-[#E4E4E7]">
            Plan Limit: 4 / 20 Seats Used
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-[#71717A] border-b border-[#E4E4E7]">
              <tr>
                <th className="pb-3 pl-2">Name &amp; Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Joined Date</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E7]">
              {teamMembers.map((m) => (
                <tr key={m.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#09090B] text-white flex items-center justify-center font-semibold text-xs">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-[#09090B] block">{m.name}</span>
                        <span className="text-[11px] text-[#71717A] font-mono">{m.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7]">
                      {m.role === 'BROKER_ADMIN' ? 'Broker / Admin' : 'Real Estate Agent'}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        m.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-[#71717A] font-mono">{m.joinedAt}</td>
                  <td className="py-3.5 text-right pr-2">
                    {m.role !== 'BROKER_ADMIN' && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="text-[#A1A1AA] hover:text-rose-600 transition-colors p-1.5 cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Settings Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Whitelabel & Branding */}
        <div className="bg-white border border-[#E4E4E7] rounded-3xl p-6 sm:p-7 shadow-clean-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#E4E4E7] pb-4">
            <Palette className="h-5 w-5 text-[#09090B]" />
            <div>
              <h3 className="text-sm font-semibold text-[#09090B]">White-Label Brokerage Branding</h3>
              <p className="text-xs text-[#71717A]">Custom styling for agent client reports and shared links.</p>
            </div>
          </div>

          <form onSubmit={handleSaveBranding} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[#09090B] mb-1.5">Brokerage Display Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-full px-4 py-2.5 text-xs text-[#09090B] focus:border-[#09090B] focus:bg-white focus:outline-none transition-all shadow-clean-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-[#09090B] mb-1.5">Custom Subdomain</label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-full px-4 py-2.5 text-xs text-[#09090B] focus:border-[#09090B] focus:bg-white focus:outline-none transition-all shadow-clean-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#09090B] mb-1.5">Brand Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-9 rounded-xl border border-[#E4E4E7] bg-white cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-[#F4F4F5] border border-[#E4E4E7] rounded-full px-3 py-2 text-xs font-mono text-[#09090B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#09090B] mb-1.5">AI Persona Tone</label>
                <select
                  value={aiPersona}
                  onChange={(e) => setAiPersona(e.target.value)}
                  className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-full px-3.5 py-2.5 text-xs text-[#09090B] focus:border-[#09090B] focus:outline-none"
                >
                  <option value="PROFESSIONAL">Professional &amp; Strict</option>
                  <option value="FRIENDLY">Warm &amp; Conversational</option>
                  <option value="INVESTOR">High-End Investor Focus</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {savedBranding && (
                <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                  <Check className="h-4 w-4" /> Branding settings saved!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2 rounded-full bg-[#09090B] hover:bg-black text-white text-xs font-medium shadow-clean-xs transition-all cursor-pointer active:scale-95"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* API Integration & Webhook Key */}
        <div className="bg-white border border-[#E4E4E7] rounded-3xl p-6 sm:p-7 shadow-clean-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 border-b border-[#E4E4E7] pb-4">
              <Code className="h-5 w-5 text-[#09090B]" />
              <div>
                <h3 className="text-sm font-semibold text-[#09090B]">Webhooks &amp; Lead Ingestion API</h3>
                <p className="text-xs text-[#71717A]">Connect Zillow, Realtor.com, or your agency website directly.</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-medium text-[#09090B] mb-1">Organization Webhook Secret</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F9FAFB] border border-[#E4E4E7] rounded-full px-4 py-2 font-mono text-xs text-[#09090B] truncate">
                    {webhookSecret}
                  </div>
                  <button
                    onClick={handleCopyWebhookSecret}
                    className="p-2.5 rounded-full border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#09090B] transition-colors cursor-pointer shadow-clean-xs"
                    title="Copy secret"
                  >
                    {copiedKey ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#09090B] mb-1">Embeddable Website Lead Capture Widget</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F9FAFB] border border-[#E4E4E7] rounded-2xl p-3 font-mono text-[11px] text-[#71717A] truncate">
                    {embedCodeSnippet}
                  </div>
                  <button
                    onClick={handleCopyEmbedSnippet}
                    className="p-2.5 rounded-full border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#09090B] transition-colors cursor-pointer shadow-clean-xs shrink-0"
                    title="Copy embed snippet"
                  >
                    {copiedSnippet ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E4E7] flex items-center justify-between text-xs text-[#71717A]">
            <span>Security Status: <strong>Enforced 256-bit TLS</strong></span>
            <span className="text-emerald-700 font-medium">99.98% SLA</span>
          </div>
        </div>
      </div>

      {/* ── Invite Modal ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E4E4E7] w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-[#09090B]">Invite Agent or Staff</h3>
            <p className="text-xs text-[#71717A]">Send an instant invitation link to join your brokerage workspace.</p>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#09090B] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="agent@brokerage.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-full px-4 py-2.5 text-xs text-[#09090B] focus:border-[#09090B] focus:bg-white focus:outline-none transition-all shadow-clean-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-[#09090B] mb-1">Role Permissions</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-full px-4 py-2.5 text-xs text-[#09090B] focus:border-[#09090B] focus:outline-none"
                >
                  <option value="AGENT">Real Estate Agent (View &amp; Edit Assigned Deals)</option>
                  <option value="BROKER_ADMIN">Broker Admin (Full Access + Financial Analytics)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E4E4E7]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-full border border-[#E4E4E7] text-[#71717A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInvite}
                  className="px-4 py-2 rounded-full bg-[#09090B] hover:bg-black text-white font-medium transition-all shadow-clean-xs cursor-pointer active:scale-95"
                >
                  {sendingInvite ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
