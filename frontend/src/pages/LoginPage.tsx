import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  Clock,
  Lock,
  Mail,
  ArrowRight,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="flex min-h-screen bg-background">
      {/* ── Brand Showcase Panel ───────────────────────────────────────────── */}
      <aside className="relative hidden w-[48%] overflow-hidden bg-slate-950 text-slate-100 lg:flex lg:flex-col lg:justify-between lg:p-14 border-r border-slate-800">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white block">
              Contingency Deadline Copilot
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Enterprise Real Estate SaaS
            </span>
          </div>
        </div>

        <div className="relative max-w-lg space-y-8 my-auto py-12">
          <div className="space-y-3">
            <Badge variant="neutral" className="bg-slate-900 border-slate-700 text-slate-300 text-[11px] gap-1.5 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero-Hallucination Legal Grounding</span>
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight">
              Autonomous contingency surveillance for modern brokerage teams.
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Transform unstructured purchase agreements into binding milestone timelines, automated notifications, and citation-backed contract intelligence.
            </p>
          </div>

          <div className="space-y-5 pt-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3.5 group">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-primary mt-0.5">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-200">{title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-900">
          <span>SOC2 Type II &bull; 256-bit Document Encryption</span>
          <span>Resend Enterprise Infrastructure</span>
        </div>
      </aside>

      {/* ── Auth Form Panel ────────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center bg-muted/20 px-4 py-12 sm:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center text-center lg:hidden mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-2">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Contingency Copilot</h2>
            <p className="text-xs text-muted-foreground">Real Estate Transaction Compliance</p>
          </div>

          <Card className="border-border/80 shadow-md">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-1.5 text-center">
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Sign in to your account
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Access your brokerage transaction portfolio, review extracted contract deadlines, and monitor alerts.
                </p>
              </div>

              <div className="flex min-h-[44px] justify-center items-center py-2">
                {signingIn ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Authenticating secure session...</span>
                  </div>
                ) : ready ? (
                  <div ref={buttonRef} className="flex w-full justify-center" />
                ) : (
                  !error && (
                    <div className="h-10 w-full animate-pulse rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      Initializing Google Sign-In...
                    </div>
                  )
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="border-t border-border/60 pt-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Protected by Google Identity OAuth 2.0</span>
                </div>
                <p className="text-center text-[11px] text-muted-foreground/80 leading-relaxed">
                  New agent or coordinator? Your workspace profile is provisioned automatically upon your first Google Sign-In.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
