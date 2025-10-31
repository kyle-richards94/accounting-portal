// Hardcoded credentials for now
export const HARDCODED_USERNAME = 'admin'
export const HARDCODED_PASSWORD = 'admin123'

export interface Session {
  username: string;
  loggedIn: boolean;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const session = localStorage.getItem('session');
  if (!session) return false;
  
  try {
    const parsed = JSON.parse(session);
    return parsed.loggedIn === true;
  } catch {
    return false;
  }
}

export function setSession(username: string): void {
  if (typeof window === 'undefined') return;
  const session: Session = { username, loggedIn: true };
  localStorage.setItem('session', JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('session');
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('session');
  if (!session) return null;
  
  try {
    return JSON.parse(session) as Session;
  } catch {
    return null;
  }
}
