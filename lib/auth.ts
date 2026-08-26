// ─────────────────────────────────────────────
// ApplyX — Local Auth System
// Real signup/login/logout/session management
// ─────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import { User, Session } from './types';
import { getStore, setStore } from './store';

const SESSION_KEY = 'applyx-session-v1';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Password hashing (simple but functional) ─
// In production this would be bcrypt on the server.
// Here we use a deterministic hash for local demo.
function hashPassword(password: string): string {
  let hash = 0;
  const str = password + 'applyx-salt-2026';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
}

// ─── Session storage ──────────────────────────
function saveSession(session: Session) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

// ─── Auth operations ──────────────────────────

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  session?: Session;
}

export function signup(email: string, password: string, fullName: string): AuthResult {
  const store = getStore();

  const emailTrim = email.trim().toLowerCase();
  if (!emailTrim || !emailTrim.includes('@')) {
    return { success: false, error: 'Enter a valid email address.' };
  }
  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }
  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: 'Enter your full name.' };
  }

  const existing = store.users.find(u => u.email === emailTrim);
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const user: User = {
    id: uuidv4(),
    email: emailTrim,
    fullName: fullName.trim(),
    createdAt: new Date().toISOString(),
  };

  // Store with password hash (not the type, separately)
  const userRecord = { ...user, passwordHash: hashPassword(password) };

  const session: Session = {
    userId: user.id,
    token: uuidv4(),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  };

  setStore({
    ...store,
    users: [...store.users, userRecord as unknown as User],
    sessions: [...store.sessions, session],
    profiles: [...store.profiles, {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      updatedAt: new Date().toISOString(),
    }],
  });

  saveSession(session);
  return { success: true, user, session };
}

export function login(email: string, password: string): AuthResult {
  const store = getStore();
  const emailTrim = email.trim().toLowerCase();

  if (!emailTrim || !password) {
    return { success: false, error: 'Enter your email and password.' };
  }

  const userRecord = (store.users as unknown as Array<User & { passwordHash?: string }>)
    .find(u => u.email === emailTrim);

  if (!userRecord) {
    return { success: false, error: 'No account found with this email.' };
  }

  if (userRecord.passwordHash !== hashPassword(password)) {
    return { success: false, error: 'Incorrect password.' };
  }

  const user: User = {
    id: userRecord.id,
    email: userRecord.email,
    fullName: userRecord.fullName,
    createdAt: userRecord.createdAt,
  };

  const session: Session = {
    userId: user.id,
    token: uuidv4(),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  };

  setStore({
    ...store,
    sessions: [...store.sessions.filter(s => s.userId !== user.id), session],
  });

  saveSession(session);
  return { success: true, user, session };
}

export function logout() {
  clearSession();
}

export function getCurrentSession(): Session | null {
  return loadSession();
}

export function getCurrentUser(): User | null {
  const session = loadSession();
  if (!session) return null;

  const store = getStore();
  const userRecord = (store.users as unknown as Array<User & { passwordHash?: string }>)
    .find(u => u.id === session.userId);

  if (!userRecord) {
    clearSession();
    return null;
  }

  return {
    id: userRecord.id,
    email: userRecord.email,
    fullName: userRecord.fullName,
    createdAt: userRecord.createdAt,
  };
}

export function updatePassword(userId: string, currentPassword: string, newPassword: string): AuthResult {
  const store = getStore();
  const userRecord = (store.users as unknown as Array<User & { passwordHash?: string }>)
    .find(u => u.id === userId);

  if (!userRecord) return { success: false, error: 'User not found.' };
  if (userRecord.passwordHash !== hashPassword(currentPassword)) {
    return { success: false, error: 'Current password is incorrect.' };
  }
  if (newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters.' };
  }

  const updatedUsers = store.users.map(u =>
    u.id === userId
      ? { ...u, passwordHash: hashPassword(newPassword) } as unknown as User
      : u
  );

  setStore({ ...store, users: updatedUsers });
  return { success: true };
}

export function deleteAccount(userId: string): void {
  const store = getStore();
  setStore({
    ...store,
    users: store.users.filter(u => u.id !== userId),
    profiles: store.profiles.filter(p => p.userId !== userId),
    applications: store.applications.filter(a => a.userId !== userId),
    evidence: store.evidence.filter(e => e.userId !== userId),
    deadlines: store.deadlines.filter(d => d.userId !== userId),
    savedUniversities: store.savedUniversities.filter(s => s.userId !== userId),
    sessions: store.sessions.filter(s => s.userId !== userId),
  });
  clearSession();
}
