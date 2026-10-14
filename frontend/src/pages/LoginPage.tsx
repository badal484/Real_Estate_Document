import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';
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
    body: 'Upload any standard purchase agreement. Ingestion engine parses binding contingency clauses with verbatim page citations.',
  },
  {
    icon: Clock,
    title: 'Deterministic Deadline Math',
    body: 'Calendar & business-day calculation rules compute expiration timestamps with state jurisdiction awareness.',
  },
  {
    icon: Mail,
    title: 'Automated Brokerage Alerts',
    body: 'Multi-channel email & SMS reminders dispatched at T-3, T-1, and day-of expiration to protect earnest money deposits.',
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
  const { signInWithGoogle, signInAsDemoAgent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [demoLoginEnabled, setDemoLoginEnabled] = useState(false);
  const [error, setError] = useState<string | null>(
    CLIENT_ID ? null : 'VITE_GOOGLE_CLIENT_ID is not configured.',
  );
  const [signingIn, setSigningIn] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const inviteToken = searchParams.get('invite') || searchParams.get('invitation') || undefined;

  const from = (location.state as { from?: string } | null)?.from ?? '/upload';

  useEffect(() => {
    authApi
      .getConfig()
      .then((cfg) => setDemoLoginEnabled(Boolean(cfg.demoLoginEnabled)))
      .catch(() => setDemoLoginEnabled(false));
  }, []);

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
              await signInWithGoogle(credential, inviteToken);
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
  }, [signInWithGoogle, navigate, from, inviteToken]);

  const handleDemoLogin = async () => {
    setSigningIn(true);
    setError(null);
    try {
      await signInAsDemoAgent();
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setSigningIn(false);
    }
  };

  useEffect(() => {
    if (!ready || signingIn || !buttonRef.current || !window.google) return;
    buttonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: Math.min(360, buttonRef.current.clientWidth || 360),
    });
  }, [ready, signingIn]);

  return (
    <div className="relative flex min-h-screen bg-[#FBFBFC] text-[#09090B] overflow-hidden font-sans">
      {/* Subtle clean atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-zinc-200/40 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-[450px] w-[450px] rounded-full bg-zinc-200/30 blur-3xl" />
      </div>

      {/* ── Brand Showcase Side Panel ───────────────────────────────────────── */}
      <aside className="relative hidden w-[48%] overflow-hidden bg-white text-[#09090B] lg:flex lg:flex-col lg:justify-between lg:p-14 border-r border-[#E4E4E7] z-10">
        <div className="relative flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#09090B] text-white shadow-clean-sm group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-[#09090B] block">
                Contingency Copilot
              </span>
              <span className="text-[10px] text-[#71717A]">
                Brokerage Escrow Suite
              </span>
            </div>
          </Link>
          <Badge variant="neutral" className="text-[10px] rounded-full px-3 py-1 bg-zinc-100 text-zinc-700 border border-[#E4E4E7]">
            <ShieldCheck className="h-3 w-3 text-emerald-600 mr-1 inline" /> SOC2 Compliant
          </Badge>
        </div>

        <div className="relative max-w-lg space-y-7 my-auto py-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Zero-Hallucination Legal Extraction Engine</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#09090B] sm:text-4xl leading-tight">
              Autonomous contingency surveillance for modern brokerage teams.
            </h2>
            <p className="text-sm leading-relaxed text-[#71717A]">
              Transform unstructured purchase agreements into binding milestone timelines, automated multi-channel alerts, and citation-backed contract intelligence.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] shadow-clean-xs hover:border-zinc-400 transition-all">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#09090B] border border-[#E4E4E7] shadow-clean-xs mt-0.5">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#09090B]">{title}</h4>
                  <p className="text-xs text-[#71717A] leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between text-xs text-[#71717A] pt-6 border-t border-[#E4E4E7] font-mono">
          <span>AES-256 Document Vault</span>
          <span>E&amp;O Compliance Insured</span>
        </div>
      </aside>

      {/* ── Auth Form Center Box ────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header */}
          <div className="flex flex-col items-center text-center lg:hidden mb-2">
            <Link to="/" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#09090B] text-white shadow-clean-md mb-2">
              <Building2 className="h-6 w-6 text-white" />
            </Link>
            <h2 className="text-xl font-bold text-[#09090B]">Contingency Copilot</h2>
            <p className="text-xs text-[#71717A] mt-0.5">Real Estate Transaction Compliance</p>
          </div>

          {/* Main Auth Card */}
          <div className="relative overflow-hidden rounded-3xl border border-[#E4E4E7] bg-white p-8 shadow-clean-md text-[#09090B] space-y-6">
            <div className="space-y-1.5 text-center">
              <Badge variant="neutral" className="text-[10px] mb-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 border border-[#E4E4E7]">
                <Lock className="h-3 w-3 text-zinc-700 mr-1.5 inline" /> Secure Agent Workspace Access
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight text-[#09090B]">
                Sign in to your account
              </h1>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Access active transaction portfolios, review extracted contract deadlines, and monitor automated alerts.
              </p>
            </div>

            {inviteToken && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-900">
                <UserCheck className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                <div className="space-y-0.5 text-left">
                  <span className="font-semibold text-blue-950 block">Workspace Invitation Active</span>
                  <span className="text-[11px] text-blue-700 block">
                    Signing in with Google will automatically bind your account to the inviting organization.
                  </span>
                </div>
              </div>
            )}

            {/* Google OAuth Render Container */}
            <div className="flex min-h-[48px] w-full flex-col justify-center items-center py-2 overflow-hidden">
              {signingIn && (
                <div className="flex items-center justify-center gap-2 rounded-full bg-zinc-100 border border-[#E4E4E7] px-4 py-2.5 text-xs font-medium text-[#09090B] w-full">
                  <Loader2 className="h-4 w-4 animate-spin text-[#09090B] shrink-0" />
                  <span className="truncate">Authenticating secure session...</span>
                </div>
              )}
              <div
                ref={buttonRef}
                className={`flex w-full justify-center overflow-hidden transition-all ${
                  signingIn ? 'hidden' : 'block'
                }`}
              />
              {!ready && !signingIn && !error && (
                <div className="h-11 w-full animate-pulse rounded-full bg-zinc-100 flex items-center justify-center text-xs text-[#71717A]">
                  Initializing Google SSO...
                </div>
              )}
            </div>

            {demoLoginEnabled && (
              <div className="space-y-3 pt-1">
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-[#E4E4E7]" />
                  <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-[#71717A] font-semibold">
                    Sandbox Testing
                  </span>
                  <div className="flex-grow border-t border-[#E4E4E7]" />
                </div>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={signingIn}
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-[#E4E4E7] bg-[#F4F4F5] hover:bg-zinc-200 px-4 py-2.5 text-xs font-semibold text-[#09090B] transition-all shadow-clean-xs disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Enter Demo Sandbox (Advisor Role)</span>
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="border-t border-[#E4E4E7] pt-4 space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-[11px] text-[#71717A]">
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Auto-provisioned Agent Workspace profile</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                By signing in, you accept brokerage legal compliance terms and AES-256 data protection guidelines.
              </p>
            </div>
          </div>

          {/* Quick Footer Navigation */}
          <div className="flex items-center justify-center gap-4 text-xs text-[#71717A]">
            <Link to="/" className="hover:text-[#09090B] transition-colors">Home Page</Link>
            <span>&bull;</span>
            <Link to="/pricing" className="hover:text-[#09090B] transition-colors">Pricing</Link>
            <span>&bull;</span>
            <Link to="/security" className="hover:text-[#09090B] transition-colors">Security</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
