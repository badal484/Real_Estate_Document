import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  Clock,
  Lock,
  Mail,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env['VITE_GOOGLE_CLIENT_ID'];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Precision Clause Extraction',
    body: 'Upload any standard purchase agreement. Ingestion engine parses binding contingency clauses with page citations.',
  },
  {
    icon: Clock,
    title: 'Deterministic Deadline Math',
    body: 'Calendar & business-day calculation rules compute expiration timestamps with jurisdiction awareness.',
  },
  {
    icon: Mail,
    title: 'Resend Enterprise Alerts',
    body: 'Automated email reminders dispatched at T-3, T-1, and day-of expiration to protect earnest money deposits.',
  },
];

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Could not load Google Sign-In')));
    if (!existing) {
      script.src = GSI_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(
    CLIENT_ID ? null : 'VITE_GOOGLE_CLIENT_ID is not configured.',
  );
  const [signingIn, setSigningIn] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/upload';

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async ({ credential }) => {
            setSigningIn(true);
            setError(null);
            try {
              await signInWithGoogle(credential);
              navigate(from, { replace: true });
            } catch (err) {
              setError((err as Error).message);
              setSigningIn(false);
            }
          },
        });
        setReady(true);
      })
      .catch((err: Error) => !cancelled && setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [signInWithGoogle, navigate, from]);

  useEffect(() => {
    if (!ready || signingIn || !buttonRef.current || !window.google) return;
    buttonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: Math.min(360, buttonRef.current.clientWidth || 360),
    });
  }, [ready, signingIn]);

  return (
    <div className="relative flex min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Ambient background lighting */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[700px] w-[700px] rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-emerald-500/12 blur-3xl" />
      </div>

      {/* ── Brand Showcase Side Panel ───────────────────────────────────────── */}
      <aside className="relative hidden w-[48%] overflow-hidden bg-slate-900/40 text-slate-100 lg:flex lg:flex-col lg:justify-between lg:p-14 border-r border-slate-800/80 backdrop-blur-2xl z-10">
        <div className="relative flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">
                Contingency Copilot
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                2026 AI Verified SaaS
              </span>
            </div>
          </Link>
          <Badge variant="neutral" className="bg-slate-900/80 border-slate-700 text-slate-300 text-[10px]">
            <ShieldCheck className="h-3 w-3 text-emerald-400 mr-1" /> SOC2 Compliant
          </Badge>
        </div>

        <div className="relative max-w-lg space-y-8 my-auto py-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero-Hallucination Legal Extraction Engine</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
              Autonomous contingency surveillance for modern brokerage teams.
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Transform unstructured purchase agreements into binding milestone timelines, automated Resend email alerts, and citation-backed contract intelligence.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md hover:bg-white/[0.06] transition-all">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sky-400 border border-white/10 mt-0.5">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-100">{title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-800/80">
          <span>AES-256 Document Security</span>
          <span>Resend Enterprise Infrastructure</span>
        </div>
      </aside>

      {/* ── Auth Form Center Box ────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8 relative z-10">
        <div className="w-full max-w-md space-y-6">
          
          {/* Mobile Header */}
          <div className="flex flex-col items-center text-center lg:hidden mb-2">
            <Link to="/" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl ring-1 ring-white/20 mb-2">
              <Building2 className="h-6 w-6 text-sky-400" />
            </Link>
            <h2 className="text-xl font-extrabold text-white">Contingency Copilot</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real Estate Transaction Compliance</p>
          </div>

          {/* Main Auth Card */}
          <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-8 shadow-2xl backdrop-blur-2xl text-white space-y-6">
            
            <div className="space-y-1.5 text-center">
              <Badge variant="neutral" className="bg-slate-900/80 border-slate-700 text-slate-300 text-[10px] mb-2 px-2.5 py-0.5">
                <Lock className="h-3 w-3 text-emerald-400 mr-1.5 inline" /> Secure Agent Workspace Access
              </Badge>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Sign in to your account
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                Access active transaction portfolios, review extracted contract deadlines, and monitor Resend alerts.
              </p>
            </div>

            {/* Google OAuth Render Container */}
            <div className="flex min-h-[48px] justify-center items-center py-2">
              {signingIn ? (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                  <span>Authenticating secure session...</span>
                </div>
              ) : ready ? (
                <div ref={buttonRef} className="flex w-full justify-center" />
              ) : (
                !error && (
                  <div className="h-11 w-full animate-pulse rounded-xl bg-white/10 flex items-center justify-center text-xs text-slate-300">
                    Initializing Google SSO...
                  </div>
                )
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/20 p-3 text-xs text-rose-200">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="border-t border-white/10 pt-4 space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Auto-provisioned Agent Workspace profile</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                By signing in, you accept brokerage legal compliance terms and AES-256 data protection guidelines.
              </p>
            </div>

          </div>

          {/* Quick Footer Navigation */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home Page</Link>
            <span>&bull;</span>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <span>&bull;</span>
            <Link to="/security" className="hover:text-white transition-colors">Security</Link>
          </div>

        </div>
      </main>
    </div>
  );
}
