import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  IconBell,
  IconBuilding,
  IconCheckCircle,
  IconClipboardList,
  IconExclamationTriangle,
  IconSparkles,
  IconSpinner,
} from '@/components/icons';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env['VITE_GOOGLE_CLIENT_ID'];

type Mode = 'signin' | 'signup';

const COPY: Record<Mode, { title: string; subtitle: string; buttonText: 'continue_with' | 'signup_with' }> = {
  signin: {
    title: 'Welcome back',
    subtitle: 'Sign in to review deals and upcoming contingency deadlines.',
    buttonText: 'continue_with',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Your Google account is all you need to start tracking purchase-agreement deadlines.',
    buttonText: 'signup_with',
  },
};

const FEATURES = [
  {
    icon: IconSparkles,
    title: 'AI clause extraction',
    body: 'Upload a purchase agreement and every contingency is pulled out with its source text.',
  },
  {
    icon: IconClipboardList,
    title: 'Deadlines you can verify',
    body: 'Calendar and business-day math is computed for you, then confirmed by you.',
  },
  {
    icon: IconBell,
    title: 'Alerts before it matters',
    body: 'Email and SMS reminders so no inspection or financing window slips by.',
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
  const [mode, setMode] = useState<Mode>('signin');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(
    CLIENT_ID ? null : 'VITE_GOOGLE_CLIENT_ID is not configured.',
  );
  const [signingIn, setSigningIn] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/upload';

  // Load the Google script and register the credential callback once.
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

  // (Re)render the button whenever the tab changes so its label matches.
  useEffect(() => {
    if (!ready || signingIn || !buttonRef.current || !window.google) return;
    buttonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text: COPY[mode].buttonText,
      shape: 'rectangular',
      // Google caps the button at 400px; fit it to the card on narrow screens.
      width: Math.min(400, buttonRef.current.clientWidth),
    });
  }, [ready, mode, signingIn]);

  const copy = COPY[mode];

  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Brand panel ───────────────────────────────────────────────────── */}
      <aside className="relative hidden w-[46%] overflow-hidden bg-brand-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl"
        />

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
            <IconBuilding className="h-5 w-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">Contingency Copilot</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Never miss a contingency deadline again.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-200">
            The deadline copilot for real-estate agents, built on the contract itself.
          </p>

          <ul className="mt-10 space-y-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-[18px] w-[18px] text-brand-100" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-brand-200">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-300">
          Contract documents are stored privately and served through expiring links.
        </p>
      </aside>

      {/* ── Auth panel ────────────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 text-white">
              <IconBuilding className="h-5 w-5" />
            </span>
            <span className="text-base font-semibold tracking-tight text-slate-900">Contingency Copilot</span>
          </div>

          <div className="card p-6 sm:p-8">
            <div
              role="tablist"
              aria-label="Account"
              className="mb-7 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-medium"
            >
              {(['signin', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  type="button"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  className={`rounded-md py-1.5 transition-all ${
                    mode === m
                      ? 'bg-white text-slate-900 shadow-soft'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {m === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <h1 className="text-xl font-semibold text-slate-900">{copy.title}</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{copy.subtitle}</p>

            <div className="mt-7 flex min-h-[44px] justify-center">
              {signingIn ? (
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <IconSpinner className="h-4 w-4 animate-spin text-brand-600" />
                  {mode === 'signin' ? 'Signing you in…' : 'Creating your account…'}
                </span>
              ) : ready ? (
                <div ref={buttonRef} className="flex w-full justify-center" />
              ) : (
                !error && <div className="h-11 w-full animate-pulse rounded-md bg-slate-100" />
              )}
            </div>

            {error && (
              <p className="banner-error mt-5">
                <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            {mode === 'signup' && (
              <ul className="mt-7 space-y-2 border-t border-slate-100 pt-6 text-sm text-slate-600">
                {['AI extraction on every contract', 'Deadlines you confirm before alerts go out', 'Full audit trail of every change'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <IconCheckCircle className="h-4 w-4 text-emerald-600" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === 'signin' ? 'New to Contingency Copilot? ' : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="font-semibold text-brand-700 hover:text-brand-900"
            >
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
