/**
 * Session token storage. The backend issues a JWT after Google sign-in; it is
 * kept in localStorage and sent as a Bearer token on every API request.
 */

const TOKEN_KEY = 'copilot.session';
const UNAUTHORIZED_EVENT = 'copilot:unauthorized';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable — session lasts for this page load only
  }
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Called by the API client when the backend rejects the session. */
export function notifyUnauthorized(): void {
  setToken(null);
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

export function onUnauthorized(handler: () => void): () => void {
  window.addEventListener(UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
}
