import { useState } from 'react';
import {
  Building2,
  Users,
  UserPlus,
  Shield,
  Zap,
  CheckCircle2,
  Bot,
  Mail,
  Key,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  FileText,
  MessageSquare,
  BadgeAlert,
  Loader2,
  Trash2,
  Palette,
  Globe,
  Sliders,
  ExternalLink,
  Code,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

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
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
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
    <div className="space-y-8 pb-12">
      {/* ── B2B Header Card ── */}
      <div className="card p-8 rounded-2xl relative overflow-hidden bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> B2B Enterprise Workspace
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
                4 / 10 Agent Seats Used
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              {orgName}
            </h1>
            <p className="text-xs text-slate-500 max-w-xl">
              Manage team members, white-label agency branding, AI persona tone, and custom CRM webhook integrations.
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary self-start md:self-auto"
          >
            <UserPlus className="h-4 w-4" /> Invite Team Member
          </button>
        </div>
      </div>

      {/* ── 2-Column Section: White-Label Branding & AI Persona ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* White-Label Branding Form */}
        <div className="card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-600" /> White-Label Agency Branding
            </h2>
            <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Custom Branding
            </span>
          </div>

          <form onSubmit={handleSaveBranding} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brokerage Company Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="input-base font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Custom Subdomain</label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-slate-100 text-slate-500 rounded-l-xl border border-r-0 border-slate-200 font-mono text-[11px]">
                  https://
                </span>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-r-xl border border-slate-200 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <span className="font-mono text-slate-700 font-bold">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Auto-Pilot Budget ($)</label>
                <input
                  type="number"
                  value={maxAutoBudget}
                  onChange={(e) => setMaxAutoBudget(e.target.value)}
                  className="input-base font-mono"
                  placeholder="e.g. 2,500,000"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
            >
              {savedBranding ? <Check className="h-4 w-4 text-emerald-400" /> : <Sparkles className="h-4 w-4 text-sky-400" />}
              {savedBranding ? 'Branding Saved!' : 'Save Branding Preferences'}
            </button>
          </form>
        </div>

        {/* AI Persona & Tone Configurator */}
        <div className="card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-600" /> AI Tone &amp; Persona Selector
            </h2>
            <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Persona
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Customize how your AI Assistant speaks to prospective buyers across WhatsApp, Live Chat, and Email.
          </p>

          <div className="space-y-2.5 text-xs">
            <label
              onClick={() => setAiPersona('PROFESSIONAL')}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                aiPersona === 'PROFESSIONAL'
                  ? 'border-indigo-600 bg-indigo-50/50 text-slate-900 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div>
                <p className="font-bold text-slate-900">🌟 Warm &amp; Professional (Recommended)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Polite, helpful, consultative. Great for standard buyer inquiries.</p>
              </div>
              <input type="radio" checked={aiPersona === 'PROFESSIONAL'} readOnly className="h-4 w-4 text-indigo-600" />
            </label>

            <label
              onClick={() => setAiPersona('LUXURY')}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                aiPersona === 'LUXURY'
                  ? 'border-indigo-600 bg-indigo-50/50 text-slate-900 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div>
                <p className="font-bold text-slate-900">💎 Luxury &amp; Exclusive</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Refined, discreet, high-end vocabulary for luxury estates ($2M+).</p>
              </div>
              <input type="radio" checked={aiPersona === 'LUXURY'} readOnly className="h-4 w-4 text-indigo-600" />
            </label>

            <label
              onClick={() => setAiPersona('INVESTOR')}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                aiPersona === 'INVESTOR'
                  ? 'border-indigo-600 bg-indigo-50/50 text-slate-900 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div>
                <p className="font-bold text-slate-900">⚡ Direct &amp; Energetic (Investor Focus)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Concise, metrics-driven, fast responses tailored for flippers and REIT investors.</p>
              </div>
              <input type="radio" checked={aiPersona === 'INVESTOR'} readOnly className="h-4 w-4 text-indigo-600" />
            </label>
          </div>
        </div>
      </div>

      {/* ── Integration Hub & Embed Code Snippet Card ── */}
      <div className="card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code className="h-5 w-5 text-indigo-600" /> 1-Click Integrations &amp; Website Widget Embed
            </h2>
            <p className="text-xs text-slate-500">
              Copy this embed script to add the AI Live Chat Assistant directly to your brokerage website, or connect Zillow and WhatsApp.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">Website Live Chat Embed Snippet:</label>
          <div className="flex items-center gap-3 bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto">
            <span className="flex-1 truncate">{embedCodeSnippet}</span>
            <button
              onClick={handleCopyEmbedSnippet}
              className="btn-primary text-xs py-1.5 shrink-0"
            >
              {copiedSnippet ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedSnippet ? 'Copied Code!' : 'Copy Snippet'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Team Members Table ── */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" /> Organization Team Members
            </h2>
            <p className="text-xs text-slate-500">Agents and administrators belonging to your brokerage organization.</p>
          </div>
          <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Multi-Tenant Isolated Workspace
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Member Name</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    {member.name}
                  </td>
                  <td className="py-4 px-6 text-slate-600">{member.email}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        member.role === 'BROKER_ADMIN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {member.role === 'BROKER_ADMIN' ? 'Broker Admin' : 'Agent'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        member.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500">{member.joinedAt}</td>
                  <td className="py-4 px-6 text-right">
                    {member.role !== 'BROKER_ADMIN' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove Team Member"
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

      {/* ── Webhook & API Key Settings Card ── */}
      <div className="card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-600" /> Organization Webhook &amp; Integration Keys
            </h2>
            <p className="text-xs text-slate-500">
              Use this secret key to connect your website forms, WhatsApp Cloud API, Zillow, or Facebook Webhooks directly to your AI Lead Management workspace.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 font-mono text-xs">
          <span className="flex-1 truncate">{webhookSecret}</span>
          <button
            onClick={handleCopyWebhookSecret}
            className="btn-primary text-xs py-1.5 shrink-0"
          >
            {copiedKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedKey ? 'Copied Key!' : 'Copy Secret'}
          </button>
        </div>
      </div>

      {/* ── Invite Modal ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-xl space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" /> Invite Agent to Organization
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agent Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="agent@brokerage.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Organization Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="input-base"
                >
                  <option value="AGENT">Agent (Standard Seat)</option>
                  <option value="BROKER_ADMIN">Broker Admin (Full Access)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInvite}
                  className="btn-primary"
                >
                  {sendingInvite && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Send Email Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
