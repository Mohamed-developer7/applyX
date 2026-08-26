'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, AlertTriangle, ArrowUpRight, Award, Bell, BookOpen,
  Bookmark, BookmarkCheck, BriefcaseBusiness, Check, CheckCircle2,
  ChevronDown, ChevronRight, Circle, Clock, Command,
  FileText, FolderOpen, Globe2, LayoutDashboard,
  Layers, LogOut, Mail, MapPin, Pencil, Plus, Search,
  Settings, Sparkles, Target, Trash2, User,
  X, Zap
} from 'lucide-react';

import { getCurrentUser, login, logout, signup } from '@/lib/auth';
import {
  addNotification, addRequirement, createApplication, createDeadline,
  createEvidence, deadlineUrgency, deleteApplication,
  deleteEvidence, deleteRequirement, getApplications, getDeadlines,
  getEvidence, getNotifications, getProfile, getSavedUniversities,
  isUniversitySaved, markAllNotificationsRead, markNotificationRead,
  saveUniversity, unsaveUniversity, updateApplication, updateApplicationStatus,
  updateEvidence, updateRequirement, upsertProfile,
  attachEvidenceToRequirement, detachEvidenceFromRequirement,
} from '@/lib/store';
import {
  computeGaps, daysUntil, evidenceMatches, formatDeadlineLabel,
  readiness, readinessBreakdown, analyzeWorkspaceNeeds,
} from '@/lib/scoring';
import {
  searchScholarships, matchScholarshipsForUser,
  type Scholarship,
} from '@/lib/scholarships-data';
import {
  GLOBAL_INSTITUTIONS, type Institution,
} from '@/lib/university-data';
import type {
  Application, ApplicationStatus, Deadline, Evidence,
  EvidenceCategory, Notification, Profile, RequirementCategory,
  RequirementStatus, User as UserType,
} from '@/lib/types';
import {
  APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS, DEGREE_LABELS,
  EVIDENCE_CATEGORIES, REQUIREMENT_CATEGORIES,
} from '@/lib/types';
import {
  getAiCredits, consumeAiCredits,
} from '@/lib/store';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Helpers
// ─────────────────────────────────────────────────────────────────────────────

type AppTab = 'overview' | 'discover' | 'applications' | 'scholarships' | 'evidence' | 'profile' | 'settings';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastCounter = 0;

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} role="status">
          {t.type === 'success' && <CheckCircle2 size={16} style={{ flexShrink: 0 }} />}
          {t.type === 'error' && <AlertCircle size={16} style={{ flexShrink: 0 }} />}
          {t.type === 'info' && <Bell size={16} style={{ flexShrink: 0 }} />}
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            style={{ color: 'rgba(255,255,255,0.7)', padding: 2, display: 'grid', placeItems: 'center' }}
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function formatRelativeTime(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return 'Recently';
  }
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  neutral: 'badge-neutral',
  blue: 'badge-blue',
  green: 'badge-green',
  amber: 'badge-amber',
  red: 'badge-red',
  purple: 'badge-purple',
  success: 'badge-success',
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Auth Screen
// ─────────────────────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }: { onAuth: (user: UserType) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 200));

    const result = mode === 'login'
      ? login(email, password)
      : signup(email, password, fullName);

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Authentication failed.');
    } else if (result.user) {
      onAuth(result.user);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <div className="auth-logo-mark">
              <Sparkles size={18} color="white" />
            </div>
            <span className="auth-logo-name">ApplyX</span>
          </div>
          <h1 className="auth-left-headline">
            Make every<br />application <em>frictionless.</em>
          </h1>
          <p className="auth-left-body">
            ApplyX turns scattered requirements, documents and achievements
            into one clear path from discovery to official submission.
          </p>
          <div className="auth-features">
            {[
              { icon: <Globe2 size={15} />, label: 'Verified requirements for 9,500+ universities' },
              { icon: <Target size={15} />, label: 'Context-aware checklists & deadlines' },
              { icon: <FolderOpen size={15} />, label: 'Reusable Evidence Vault linked to applications' },
              { icon: <Zap size={15} />, label: 'Frictionless Autopilot — always know what to do next' },
            ].map(f => (
              <div key={f.label} className="auth-feature">
                <div className="auth-feature-icon">{f.icon}</div>
                {f.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', position: 'relative', zIndex: 1 }}>
          © {new Date().getFullYear()} ApplyX. Private workspace architecture.
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">
              {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
            </h2>
            <p className="auth-form-subtitle">
              {mode === 'login'
                ? 'Sign in to access your application command center.'
                : 'Start organizing your university applications in one place.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Taylor"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: 6 }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Please wait...</>
              ) : mode === 'login' ? 'Sign in' : 'Create workspace'}
            </button>
          </form>

          <div className="auth-link">
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}
                <a href="#" onClick={e => { e.preventDefault(); setMode('signup'); setError(''); }}>
                  Sign up free
                </a>
              </>
            ) : (
              <>Already have an account?{' '}
                <a href="#" onClick={e => { e.preventDefault(); setMode('login'); setError(''); }}>
                  Sign in
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Sidebar Navigation
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarProps {
  tab: AppTab;
  setTab: (t: AppTab) => void;
  user: UserType;
  onLogout: () => void;
}

function Sidebar({ tab, setTab, user, onLogout }: SidebarProps) {
  const primaryNav = [
    { id: 'overview', icon: <LayoutDashboard size={17} />, label: 'Overview' },
    { id: 'discover', icon: <Globe2 size={17} />, label: 'Discover' },
    { id: 'applications', icon: <BriefcaseBusiness size={17} />, label: 'Applications' },
    { id: 'scholarships', icon: <Award size={17} />, label: 'Scholarships' },
    { id: 'evidence', icon: <FolderOpen size={17} />, label: 'Evidence Vault' },
  ];

  const secondaryNav = [
    { id: 'profile', icon: <User size={17} />, label: 'Profile' },
    { id: 'settings', icon: <Settings size={17} />, label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Sparkles size={16} color="white" />
        </div>
        <span className="sidebar-brand-name">Apply<span>X</span></span>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <span className="sidebar-section-label">Workspace</span>
        {primaryNav.map(item => (
          <button
            key={item.id}
            className={`nav-item ${tab === item.id ? 'active' : ''}`}
            onClick={() => setTab(item.id as AppTab)}
            aria-current={tab === item.id ? 'page' : undefined}
            title={item.label}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        <span className="sidebar-section-label" style={{ marginTop: 8 }}>Account</span>
        {secondaryNav.map(item => (
          <button
            key={item.id}
            className={`nav-item ${tab === item.id ? 'active' : ''}`}
            onClick={() => setTab(item.id as AppTab)}
            aria-current={tab === item.id ? 'page' : undefined}
            title={item.label}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div
          className="sidebar-user"
          onClick={onLogout}
          role="button"
          tabIndex={0}
          title="Click to sign out"
          onKeyDown={e => e.key === 'Enter' && onLogout()}
        >
          <div className="sidebar-avatar">{getInitials(user.fullName)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.fullName}</div>
            <div className="sidebar-user-role">Sign out</div>
          </div>
          <LogOut size={14} style={{ color: '#4a4b5e', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Global Command Palette (Cmd+K)
// ─────────────────────────────────────────────────────────────────────────────

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: AppTab) => void;
  apps: Application[];
  evidence: Evidence[];
  onSelectApp: (id: string) => void;
  onOpenWhatDoINeed: () => void;
}

function CommandPalette({
  isOpen, onClose, onNavigate, apps, evidence, onSelectApp, onOpenWhatDoINeed,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = search.toLowerCase().trim();

  const filteredApps = apps.filter(a => (a.school + ' ' + a.program).toLowerCase().includes(q));
  const filteredEvidence = evidence.filter(e => (e.title + ' ' + e.category + ' ' + e.tags.join(' ')).toLowerCase().includes(q));
  const filteredUnis = GLOBAL_INSTITUTIONS.filter(i => (i.name + ' ' + i.country).toLowerCase().includes(q)).slice(0, 4);

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="command-palette-modal">
        <div className="command-input-wrap">
          <Command size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            className="command-input"
            placeholder="Type a university, document, application, or action..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
          />
          <button className="kbd-badge" onClick={onClose}>ESC</button>
        </div>

        <div className="command-results">
          {/* Quick Actions */}
          <div className="command-group-title">Quick Actions</div>
          <div
            className="command-item"
            onClick={() => { onOpenWhatDoINeed(); onClose(); }}
          >
            <div className="command-item-icon"><Zap size={14} /></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>What Do I Still Need?</div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Analyze all applications & missing requirements</div>
            </div>
          </div>
          <div
            className="command-item"
            onClick={() => { onNavigate('applications'); onClose(); }}
          >
            <div className="command-item-icon"><Plus size={14} /></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Track New Application</div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Import requirements or select an institution</div>
            </div>
          </div>

          {/* Applications */}
          {filteredApps.length > 0 && (
            <>
              <div className="command-group-title">Your Applications</div>
              {filteredApps.slice(0, 4).map(app => (
                <div
                  key={app.id}
                  className="command-item"
                  onClick={() => { onSelectApp(app.id); onNavigate('applications'); onClose(); }}
                >
                  <div className="command-item-icon"><BriefcaseBusiness size={14} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{app.school}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{app.program} · {readiness(app)}% ready</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Institutions Directory */}
          {filteredUnis.length > 0 && (
            <>
              <div className="command-group-title">Global Institutions Directory</div>
              {filteredUnis.map(inst => (
                <div
                  key={inst.id}
                  className="command-item"
                  onClick={() => { onNavigate('discover'); onClose(); }}
                >
                  <div className="command-item-icon"><Globe2 size={14} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{inst.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{inst.country} · {inst.applicationPlatform}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Evidence Vault */}
          {filteredEvidence.length > 0 && (
            <>
              <div className="command-group-title">Evidence Vault Items</div>
              {filteredEvidence.slice(0, 3).map(item => (
                <div
                  key={item.id}
                  className="command-item"
                  onClick={() => { onNavigate('evidence'); onClose(); }}
                >
                  <div className="command-item-icon"><Award size={14} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{item.category} · {item.org}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Evidence Picker Bottom Sheet / Modal
// ─────────────────────────────────────────────────────────────────────────────

interface EvidencePickerProps {
  isOpen: boolean;
  onClose: () => void;
  targetApp: Application | null;
  targetReq: { id: string; name: string } | null;
  evidence: Evidence[];
  userId: string;
  onAttached: () => void;
  notify: (msg: string, type?: Toast['type']) => void;
}

function EvidencePicker({
  isOpen, onClose, targetApp, targetReq, evidence, userId, onAttached, notify,
}: EvidencePickerProps) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<EvidenceCategory | 'All'>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // New item form
  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newCat, setNewCat] = useState<EvidenceCategory>('Academic');
  const [newDesc, setNewDesc] = useState('');

  if (!isOpen || !targetApp || !targetReq) return null;

  const filtered = evidence.filter(e => {
    const matchesQuery = (e.title + ' ' + e.org + ' ' + e.category + ' ' + e.tags.join(' ')).toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === 'All' || e.category === filterCat;
    return matchesQuery && matchesCat;
  });

  function handleAttach(evidenceId: string) {
    attachEvidenceToRequirement(userId, targetApp!.id, targetReq!.id, evidenceId);
    notify(`Attached evidence to ${targetReq!.name}`, 'success');
    onAttached();
    onClose();
  }

  function handleCreateAndAttach(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem = createEvidence(userId, {
      title: newTitle.trim(),
      org: newOrg.trim() || 'Self-verified',
      category: newCat,
      description: newDesc.trim() || undefined,
      tags: [newCat.toLowerCase()],
    });

    attachEvidenceToRequirement(userId, targetApp!.id, targetReq!.id, newItem.id);
    notify(`Created & attached ${newItem.title}`, 'success');
    setShowAddForm(false);
    onAttached();
    onClose();
  }

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <div className="modal-label">EVIDENCE VAULT PICKER</div>
            <h2 className="modal-title">Attach Proof to Requirement</h2>
            <p className="modal-description">
              Linking evidence to <strong>{targetReq.name}</strong> for <strong>{targetApp.school}</strong> will fulfill this requirement across your workspace.
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>

        <div className="modal-body">
          {!showAddForm ? (
            <>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="topbar-search" style={{ flex: 1, width: 'auto' }}>
                  <Search size={14} aria-hidden />
                  <input
                    placeholder="Search stored achievements & documents..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                  />
                  {search && <button onClick={() => setSearch('')}><X size={13} /></button>}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(true)}>
                  <Plus size={13} /> Add New Proof
                </button>
              </div>

              <div className="filter-bar">
                <button className={`filter-chip ${filterCat === 'All' ? 'active' : ''}`} onClick={() => setFilterCat('All')}>All</button>
                {EVIDENCE_CATEGORIES.slice(0, 6).map(c => (
                  <button key={c} className={`filter-chip ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>{c}</button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                {filtered.length === 0 ? (
                  <div className="empty-state" style={{ minHeight: 140 }}>
                    <div className="empty-state-title">No matching evidence in vault</div>
                    <div className="empty-state-body">Click &ldquo;Add New Proof&rdquo; to quickly store and attach your certificate or document.</div>
                  </div>
                ) : (
                  filtered.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '11px 14px',
                        background: 'var(--bg)',
                        borderRadius: 8,
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div className="evidence-icon" style={{ width: 30, height: 30 }}><Award size={14} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{item.category} · {item.org}</div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAttach(item.id)}>
                        <Check size={12} /> Attach
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateAndAttach} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Evidence Title *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Official High School Transcript / Recommendation"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Issuing Body / School</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Cambridge / School Principal"
                    value={newOrg}
                    onChange={e => setNewOrg(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={newCat}
                    onChange={e => setNewCat(e.target.value as EvidenceCategory)}
                  >
                    {EVIDENCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes / Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Details for this proof..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  style={{ minHeight: 60 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Back</button>
                <button type="submit" className="btn btn-primary">Save & Attach</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. "What Do I Still Need?" Modal (Frictionless Autopilot)
// ─────────────────────────────────────────────────────────────────────────────

interface WhatDoINeedProps {
  isOpen: boolean;
  onClose: () => void;
  apps: Application[];
  evidence: Evidence[];
  userId: string;
  onSelectApp: (id: string) => void;
  onNavigate: (tab: AppTab) => void;
  onRefresh: () => void;
  notify: (msg: string, type?: Toast['type']) => void;
}

function WhatDoINeedModal({
  isOpen, onClose, apps, evidence, userId, onSelectApp, onNavigate, onRefresh, notify,
}: WhatDoINeedProps) {
  if (!isOpen) return null;

  const analysis = analyzeWorkspaceNeeds(apps, evidence);

  function handleBatchAttach(item: Evidence, targets: Array<{ appId: string; reqId: string }>) {
    targets.forEach(t => {
      attachEvidenceToRequirement(userId, t.appId, t.reqId, item.id);
    });
    notify(`Attached "${item.title}" across ${targets.length} application requirements!`, 'success');
    onRefresh();
  }

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <div className="modal-label">APPLICATION COMMAND AUTOPILOT</div>
            <h2 className="modal-title">What Do I Still Need?</h2>
            <p className="modal-description">
              Cross-application intelligence analyzing your active pipeline and identifying shared requirements.
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary Pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Active Applications</div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                {analysis.totalApps}
              </div>
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', borderRadius: 8, flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: 'var(--danger)' }}>Total Missing Items</div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--danger)' }}>
                {analysis.totalMissing}
              </div>
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--success-bg)', borderRadius: 8, flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: 'var(--success)' }}>Complete or Linked</div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--success)' }}>
                {analysis.totalComplete}
              </div>
            </div>
          </div>

          {/* Reusable Opportunities: "Upload once, attach everywhere" */}
          {analysis.reusableOpportunities.length > 0 && (
            <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-subtle)', borderRadius: 9, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Sparkles size={15} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>One-Click Reuse Opportunities</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 10 }}>
                You already have evidence in your vault matching missing requirements across multiple institutions:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analysis.reusableOpportunities.map((op, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--surface)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{op.evidenceItem.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                        Matches {op.matchingRequirements.map(r => `${r.appName} (${r.reqName})`).join(', ')}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleBatchAttach(op.evidenceItem, op.matchingRequirements)}
                    >
                      Attach to all ({op.matchingRequirements.length})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Breakdown by Application */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="section-label">Missing Breakdown by Institution</span>
            {analysis.appsWithMissing.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 100 }}>
                <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
                <div className="empty-state-title">All tracked requirements are complete!</div>
                <div className="empty-state-body">Your application workspaces have zero outstanding missing requirements.</div>
              </div>
            ) : (
              analysis.appsWithMissing.map(({ app, missingCount, missingReqs }) => (
                <div
                  key={app.id}
                  style={{
                    background: 'var(--bg)',
                    borderRadius: 9,
                    padding: '12px 14px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{app.school}</span>
                      <span className="badge badge-amber">{missingCount} missing</span>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => { onSelectApp(app.id); onNavigate('applications'); onClose(); }}
                    >
                      Open Workspace <ChevronRight size={12} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {missingReqs.map(r => (
                      <span
                        key={r.id}
                        style={{
                          fontSize: 11,
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          color: 'var(--ink-2)',
                        }}
                      >
                        • {r.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. University Detail Modal
// ─────────────────────────────────────────────────────────────────────────────

interface UniversityDetailModalProps {
  institution: Institution | null;
  onClose: () => void;
  onTrack: (inst: Institution) => void;
  isSaved: boolean;
  onToggleSave: (inst: Institution) => void;
}

function UniversityDetailModal({
  institution, onClose, onTrack, isSaved, onToggleSave,
}: UniversityDetailModalProps) {
  if (!institution) return null;

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <div className="modal-label">VERIFIED INSTITUTION DIRECTORY</div>
            <h2 className="modal-title">{institution.name}</h2>
            <p className="modal-description">
              {institution.city}, {institution.country} · {institution.applicationPlatform}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Key Facts */}
          <div className="form-grid-2">
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Application Platform</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{institution.applicationPlatform}</div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Regular Deadline</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{institution.standardDeadlines.regularDecision}</div>
            </div>
          </div>

          {institution.intlStudentNotes && (
            <div className="alert alert-info">
              <Globe2 size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>International Admissions Note:</strong> {institution.intlStudentNotes}
              </div>
            </div>
          )}

          {/* Standard Requirements Checklist */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="section-label">Verified Standard Requirements ({institution.standardRequirements.length})</span>
              <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>Verified: {institution.lastVerifiedDate}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
              {institution.standardRequirements.map(req => (
                <div
                  key={req.id}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--bg)',
                    borderRadius: 7,
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{req.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{req.category} · {req.required ? 'Mandatory' : 'Optional / Supplementary'}</div>
                  </div>
                  {req.sourceUrl && (
                    <a
                      href={req.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 10, height: 24, padding: '0 8px' }}
                    >
                      <ArrowUpRight size={10} /> Official Source
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Available Programs */}
          {institution.programs.length > 0 && (
            <div>
              <span className="section-label" style={{ display: 'block', marginBottom: 8 }}>Featured Academic Programs</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {institution.programs.map(p => (
                  <div
                    key={p.id}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--surface)',
                      borderRadius: 7,
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{p.faculty} · {p.duration}</div>
                    </div>
                    {p.officialUrl && (
                      <a href={p.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize: 10, height: 24 }}>
                        <ArrowUpRight size={10} /> Curriculum
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {institution.admissionsUrl && (
            <a
              href={institution.admissionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              <ArrowUpRight size={13} /> Official Admissions Portal
            </a>
          )}
          <button
            className={`btn ${isSaved ? 'btn-success' : 'btn-ghost'}`}
            onClick={() => onToggleSave(institution)}
          >
            {isSaved ? <><BookmarkCheck size={13} /> Saved</> : <><Bookmark size={13} /> Save</>}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { onTrack(institution); onClose(); }}
          >
            <Plus size={13} /> Start Application
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. University Comparison Modal
// ─────────────────────────────────────────────────────────────────────────────

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInstitutions: Institution[];
  onRemove: (id: string) => void;
  onTrack: (inst: Institution) => void;
}

function CompareModal({
  isOpen, onClose, selectedInstitutions, onRemove, onTrack,
}: CompareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-lg" style={{ width: 'min(900px, 100%)' }}>
        <div className="modal-header">
          <div>
            <div className="modal-label">SIDE-BY-SIDE EVALUATION</div>
            <h2 className="modal-title">Compare Institutions</h2>
            <p className="modal-description">
              Comparing admissions platforms, deadlines, standard requirements, and key policies across {selectedInstitutions.length} universities.
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>

        <div className="modal-body" style={{ overflowX: 'auto' }}>
          {selectedInstitutions.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 140 }}>
              <div className="empty-state-title">No institutions selected to compare</div>
              <div className="empty-state-body">Click &ldquo;Compare&rdquo; on university cards in the Discover tab.</div>
            </div>
          ) : (
            <div className="comparison-grid">
              {/* Row 1: Header / Names */}
              <div className="comparison-cell comparison-header-cell">Institution</div>
              {selectedInstitutions.map(inst => (
                <div key={inst.id} className="comparison-cell" style={{ fontWeight: 700, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span>{inst.name}</span>
                    <button onClick={() => onRemove(inst.id)} style={{ color: 'var(--ink-4)' }}><X size={12} /></button>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 400 }}>{inst.country}</div>
                </div>
              ))}

              {/* Row 2: Location */}
              <div className="comparison-cell comparison-header-cell">Location</div>
              {selectedInstitutions.map(inst => (
                <div key={inst.id} className="comparison-cell">{inst.city}, {inst.country}</div>
              ))}

              {/* Row 3: Application Platform */}
              <div className="comparison-cell comparison-header-cell">Platform</div>
              {selectedInstitutions.map(inst => (
                <div key={inst.id} className="comparison-cell">
                  <span className="badge badge-accent" style={{ fontSize: 10 }}>{inst.applicationPlatform}</span>
                </div>
              ))}

              {/* Row 4: Deadline */}
              <div className="comparison-cell comparison-header-cell">Deadlines</div>
              {selectedInstitutions.map(inst => (
                <div key={inst.id} className="comparison-cell">
                  <div>Regular: <strong>{inst.standardDeadlines.regularDecision}</strong></div>
                  {inst.standardDeadlines.earlyAction && (
                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Early: {inst.standardDeadlines.earlyAction}</div>
                  )}
                </div>
              ))}

              {/* Row 5: Requirements Summary */}
              <div className="comparison-cell comparison-header-cell">Requirements</div>
              {selectedInstitutions.map(inst => (
                <div key={inst.id} className="comparison-cell">
                  <div style={{ fontWeight: 600 }}>{inst.standardRequirements.length} tracked items</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                    {inst.standardRequirements.slice(0, 3).map(r => r.name).join(', ')}...
                  </div>
                </div>
              ))}

              {/* Row 6: Action */}
              <div className="comparison-cell comparison-header-cell">Action</div>
              {selectedInstitutions.map(inst => (
                <div key={inst.id} className="comparison-cell">
                  <button className="btn btn-primary btn-sm btn-full" onClick={() => { onTrack(inst); onClose(); }}>
                    Start App
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Overview Tab
// ─────────────────────────────────────────────────────────────────────────────

interface OverviewTabProps {
  apps: Application[];
  evidence: Evidence[];
  deadlines: Deadline[];
  user: UserType;
  profile: Profile | null;
  setTab: (t: AppTab) => void;
  setSelectedAppId: (id: string) => void;
  onOpenWhatDoINeed: () => void;
}

function OverviewTab({
  apps, evidence, deadlines, user, profile, setTab, setSelectedAppId, onOpenWhatDoINeed,
}: OverviewTabProps) {
  const avg = apps.length ? Math.round(apps.reduce((s, a) => s + readiness(a), 0) / apps.length) : 0;
  const totalMissing = apps.reduce((s, a) => s + a.requirements.filter(r => r.status === 'missing').length, 0);
  const isProfileComplete = !!(profile?.fullName && profile?.email);
  const gaps = computeGaps(apps, isProfileComplete);

  const upcomingDeadlines = deadlines
    .filter(d => !d.done && daysUntil(d.date) >= 0)
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user.fullName ? user.fullName.split(' ')[0] : 'Applicant';

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-label">APPLICATION COMMAND CENTER</div>
            <h1 className="page-title">{greeting}, {firstName}.</h1>
            <p className="page-description">
              {apps.length > 0
                ? `You have ${apps.length} active application${apps.length !== 1 ? 's' : ''}. ${totalMissing > 0 ? `${totalMissing} requirement${totalMissing !== 1 ? 's' : ''} need attention.` : 'All tracked requirements are complete.'}`
                : 'Your application command center is ready. Start by adding your first target institution.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={onOpenWhatDoINeed}>
              <Zap size={14} /> What Do I Need?
            </button>
            <button className="btn btn-primary" onClick={() => setTab('applications')}>
              <Plus size={14} /> New Application
            </button>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Metric Cards */}
        <div className="metrics-grid" style={{ marginBottom: 20 }}>
          <div className="metric-card">
            <div className="metric-label">Avg. Readiness</div>
            <div className={`metric-value ${avg >= 80 ? 'success' : avg >= 50 ? '' : 'danger'}`}>{avg}%</div>
            <div className="metric-note">Across {apps.length} application{apps.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Active Pipeline</div>
            <div className="metric-value">{apps.filter(a => !['accepted', 'rejected', 'withdrawn'].includes(a.applicationStatus)).length}</div>
            <div className="metric-note">Institutions in progress</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Evidence Vault</div>
            <div className="metric-value accent">{evidence.length}</div>
            <div className="metric-note">Reusable achievements</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Action Required</div>
            <div className={`metric-value ${totalMissing > 0 ? 'danger' : 'success'}`}>{totalMissing}</div>
            <div className="metric-note">Missing requirements</div>
          </div>
        </div>

        {/* Overview Layout */}
        <div className="overview-grid">
          <div className="overview-main">
            {/* Frictionless Next Move */}
            {gaps.length > 0 ? (
              <div className="next-action">
                <div className="next-action-icon"><Zap size={20} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="next-action-label">FRICTIONLESS AUTOPILOT · NEXT MOVE</div>
                  <div className="next-action-title">{gaps[0].label}</div>
                  <div className="next-action-sub">{gaps[0].detail}</div>
                  {gaps[0].deadline && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                      <Clock size={12} />
                      Deadline: {formatDate(gaps[0].deadline)} · {formatDeadlineLabel(gaps[0].deadline)}
                    </div>
                  )}
                </div>
                {gaps[0].appId ? (
                  <button
                    className="btn btn-sm"
                    style={{ background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}
                    onClick={() => { setSelectedAppId(gaps[0].appId!); setTab('applications'); }}
                  >
                    Open <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    className="btn btn-sm"
                    style={{ background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}
                    onClick={() => setTab('profile')}
                  >
                    Edit Profile <ChevronRight size={14} />
                  </button>
                )}
              </div>
            ) : apps.length > 0 ? (
              <div className="next-action">
                <div className="next-action-icon"><CheckCircle2 size={20} /></div>
                <div>
                  <div className="next-action-label">FRICTIONLESS AUTOPILOT</div>
                  <div className="next-action-title">All caught up</div>
                  <div className="next-action-sub">All tracked requirements are marked complete or in review.</div>
                </div>
              </div>
            ) : (
              <div className="next-action">
                <div className="next-action-icon"><Target size={20} /></div>
                <div style={{ flex: 1 }}>
                  <div className="next-action-label">GET STARTED</div>
                  <div className="next-action-title">Track your first target university</div>
                  <div className="next-action-sub">ApplyX loads verified institutional requirements and links your achievements automatically.</div>
                </div>
                <button
                  className="btn btn-sm"
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}
                  onClick={() => setTab('discover')}
                >
                  Discover <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* Application Pipeline */}
            {apps.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Application Pipeline</div>
                    <div className="card-subtitle">{apps.length} institution{apps.length !== 1 ? 's' : ''} tracked</div>
                  </div>
                  <button className="btn-text" onClick={() => setTab('applications')}>
                    View all <ChevronRight size={14} />
                  </button>
                </div>
                <div className="card-body">
                  {apps.slice(0, 5).map(app => {
                    const score = readiness(app);
                    const days = daysUntil(app.deadline);
                    return (
                      <button
                        key={app.id}
                        className="app-list-item"
                        onClick={() => { setSelectedAppId(app.id); setTab('applications'); }}
                      >
                        <div className="app-logo">{app.school.charAt(0)}</div>
                        <div className="app-info">
                          <div className="app-name">{app.school}</div>
                          <div className="app-sub">{app.program} {app.applicationPlatform ? `· ${app.applicationPlatform}` : ''}</div>
                        </div>
                        <div style={{ width: 85, textAlign: 'right', flexShrink: 0 }}>
                          <span className={`badge ${STATUS_BADGE_CLASS[APPLICATION_STATUS_COLORS[app.applicationStatus]]}`}>
                            {APPLICATION_STATUS_LABELS[app.applicationStatus]}
                          </span>
                        </div>
                        <div style={{ width: 70, flexShrink: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>ready</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>{score}%</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-fill ${score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low'}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: days < 0 ? 'var(--danger)' : days <= 7 ? 'var(--warning)' : 'var(--ink-4)', flexShrink: 0, width: 75, textAlign: 'right' }}>
                          {formatDeadlineLabel(app.deadline)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Evidence Intelligence */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #f8f8ff 0%, #ffffff 100%)' }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Evidence Intelligence</div>
                  <div className="card-subtitle">{evidence.length} achievement{evidence.length !== 1 ? 's' : ''} in vault</div>
                </div>
                <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="card-body">
                {evidence.length > 0 ? (
                  <div>
                    <p className="text-body" style={{ marginBottom: 12 }}>
                      ApplyX connects your certificates, research projects, and extracurricular leadership directly to requirements across applications so you never upload twice.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {Array.from(new Set(evidence.map(e => e.category))).map(cat => (
                        <span key={cat} className="badge badge-accent">{cat}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state" style={{ minHeight: 90, padding: '16px 0' }}>
                    <div className="empty-state-title">Build your evidence vault</div>
                    <div className="empty-state-body">Store certificates and projects once to reuse them across applications.</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setTab('evidence')} style={{ marginTop: 8 }}>
                      Add first evidence
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="overview-side">
            {/* Upcoming Deadlines */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Upcoming Deadlines</div>
                  <div className="card-subtitle">Next 30 days</div>
                </div>
                <Clock size={15} style={{ color: 'var(--ink-3)' }} />
              </div>
              <div className="card-body">
                {upcomingDeadlines.length > 0 ? (
                  <div>
                    {upcomingDeadlines.map(d => {
                      const { label, level } = deadlineUrgency(d.date);
                      return (
                        <div key={d.id} className="deadline-item">
                          <div className={`deadline-dot ${level}`} />
                          <div className="deadline-info">
                            <div className="deadline-label">{d.label}</div>
                            {d.applicationName && <div className="deadline-app">{d.applicationName}</div>}
                          </div>
                          <div className={`deadline-date ${level}`}>{label}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state" style={{ minHeight: 90, padding: '16px 0' }}>
                    <div className="empty-state-title">No upcoming deadlines</div>
                    <div className="empty-state-body">Deadlines are tracked automatically when you add applications.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist */}
            {gaps.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Action Checklist</div>
                    <div className="card-subtitle">{gaps.length} pending item{gaps.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="card-body">
                  {gaps.slice(0, 5).map((gap, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '9px 0',
                        borderBottom: i < Math.min(gaps.length, 5) - 1 ? '1px solid var(--border-subtle)' : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                          background: gap.urgency === 'high' ? 'var(--danger-bg)' : gap.urgency === 'medium' ? 'var(--warning-bg)' : 'var(--bg)',
                          color: gap.urgency === 'high' ? 'var(--danger)' : gap.urgency === 'medium' ? 'var(--warning)' : 'var(--ink-3)',
                          display: 'grid', placeItems: 'center', marginTop: 1,
                        }}
                      >
                        {gap.urgency === 'high' ? <AlertTriangle size={11} /> : <Circle size={11} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>{gap.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{gap.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Application Detail Sub-Panel (Enhanced with Evidence Linking)
// ─────────────────────────────────────────────────────────────────────────────

interface ApplicationDetailProps {
  app: Application;
  evidence: Evidence[];
  userId: string;
  onUpdate: (app: Application) => void;
  notify: (msg: string, type?: Toast['type']) => void;
  onDelete: (id: string) => void;
  onOpenEvidencePicker: (app: Application, req: { id: string; name: string }) => void;
  onOpenAiReview?: (app: Application) => void;
}

function ApplicationDetailPanel({
  app, evidence, userId, onUpdate, notify, onDelete, onOpenEvidencePicker, onOpenAiReview,
}: ApplicationDetailProps) {
  const [showAddReq, setShowAddReq] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showEditApp, setShowEditApp] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'requirements' | 'evidence' | 'timeline' | 'notes'>('requirements');

  // Form states
  const [reqName, setReqName] = useState('');
  const [reqCategory, setReqCategory] = useState<RequirementCategory>('Document');
  const [editSchool, setEditSchool] = useState(app.school);
  const [editProgram, setEditProgram] = useState(app.program);
  const [editDeadline, setEditDeadline] = useState(app.deadline);
  const [editStatus, setEditStatus] = useState(app.applicationStatus);
  const [editNotes, setEditNotes] = useState(app.notes || '');
  const [editOfficialLink, setEditOfficialLink] = useState(app.officialLink || '');

  useEffect(() => {
    setEditSchool(app.school);
    setEditProgram(app.program);
    setEditDeadline(app.deadline);
    setEditStatus(app.applicationStatus);
    setEditNotes(app.notes || '');
    setEditOfficialLink(app.officialLink || '');
  }, [app]);

  const { done, review, missing, total, score } = readinessBreakdown(app);

  function handleMarkReq(reqId: string, status: RequirementStatus) {
    const updated = updateRequirement(userId, app.id, reqId, status);
    if (updated) {
      onUpdate(updated);
      notify(`Requirement ${status === 'done' ? 'completed' : 'updated'}`, 'success');
    }
  }

  function handleDetachEvidence(reqId: string, evidenceId: string) {
    const updated = detachEvidenceFromRequirement(userId, app.id, reqId, evidenceId);
    if (updated) {
      onUpdate(updated);
      notify('Evidence unlinked from requirement');
    }
  }

  function handleDeleteReq(reqId: string) {
    const updated = deleteRequirement(userId, app.id, reqId);
    if (updated) {
      onUpdate(updated);
      notify('Requirement removed');
    }
  }

  function handleAddReq(e: React.FormEvent) {
    e.preventDefault();
    if (!reqName.trim()) return;
    const updated = addRequirement(userId, app.id, {
      name: reqName.trim(),
      category: reqCategory,
      status: 'missing',
    });
    if (updated) {
      onUpdate(updated);
      setReqName('');
      setShowAddReq(false);
      notify('Requirement added', 'success');
    }
  }

  function handleStatusChange(status: ApplicationStatus) {
    const updated = updateApplicationStatus(userId, app.id, status);
    if (updated) {
      onUpdate(updated);
      setShowStatusMenu(false);
      notify(`Status changed to ${APPLICATION_STATUS_LABELS[status]}`, 'success');
    }
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    const updated = updateApplication(userId, app.id, {
      school: editSchool.trim(),
      program: editProgram.trim(),
      deadline: editDeadline,
      applicationStatus: editStatus,
      notes: editNotes,
      officialLink: editOfficialLink.trim() || undefined,
    });
    if (updated) {
      onUpdate(updated);
      setShowEditApp(false);
      notify('Application updated', 'success');
    }
  }

  const matchedEvidence = useMemo(() =>
    app.requirements
      .filter(r => r.status !== 'done')
      .slice(0, 4)
      .map(r => ({ req: r, matches: evidenceMatches(r, evidence).filter(m => m.score > 20).slice(0, 2) }))
      .filter(({ matches }) => matches.length > 0),
    [app.requirements, evidence]
  );

  const statusColor = APPLICATION_STATUS_COLORS[app.applicationStatus];

  return (
    <div className="split-right">
      {/* App Header */}
      <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div className="app-logo" style={{ width: 44, height: 44, fontSize: 17, borderRadius: 10 }}>
            {app.school.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800, letterSpacing: '-0.3px', marginBottom: 2 }}>
              {app.school}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {app.program} {app.applicationPlatform ? `· ${app.applicationPlatform}` : ''} · Due {formatDate(app.deadline)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 7, flexShrink: 0, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <button
                className={`badge ${STATUS_BADGE_CLASS[statusColor]}`}
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                style={{ cursor: 'pointer', padding: '5px 10px' }}
              >
                {APPLICATION_STATUS_LABELS[app.applicationStatus]} <ChevronDown size={11} />
              </button>
              {showStatusMenu && (
                <div className="dropdown-menu" style={{ minWidth: 170 }}>
                  {Object.entries(APPLICATION_STATUS_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      className="dropdown-item"
                      onClick={() => handleStatusChange(key as ApplicationStatus)}
                      style={{ fontWeight: key === app.applicationStatus ? 700 : 400 }}
                    >
                      {key === app.applicationStatus && <Check size={12} />}
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {onOpenAiReview && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onOpenAiReview(app)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}
                title="Run AI Application Review before submission"
              >
                <Sparkles size={13} color="var(--primary)" /> AI Review
              </button>
            )}
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowEditApp(true)} title="Edit details">
              <Pencil size={13} />
            </button>
            {app.officialLink && (
              <a href={app.officialLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm btn-icon" title="Official application portal">
                <ArrowUpRight size={13} />
              </a>
            )}
            <button className="btn btn-danger btn-sm btn-icon" onClick={() => setShowDeleteConfirm(true)} title="Delete application">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Readiness Bar */}
        <div style={{ background: 'var(--bg)', borderRadius: 9, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)' }}>Application Readiness</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>{score}%</span>
          </div>
          <div className="progress-bar" style={{ height: 6, marginBottom: 8 }}>
            <div className={`progress-fill ${score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low'}`} style={{ width: `${score}%` }} />
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'Complete', value: done, color: 'var(--success)' },
              { label: 'In Review', value: review, color: 'var(--warning)' },
              { label: 'Missing', value: missing, color: 'var(--danger)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: item.color }} />
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{item.value} {item.label}</span>
              </div>
            ))}
            <span style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 'auto' }}>{total} total</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        {[
          { id: 'requirements', label: `Requirements (${total})` },
          { id: 'evidence', label: 'Evidence Match' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'notes', label: 'Notes' },
        ].map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div style={{ padding: '20px 28px', flex: 1 }}>
        {activeTab === 'requirements' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span className="section-label">Checklist · {total} items</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddReq(!showAddReq)}>
                <Plus size={13} /> Add requirement
              </button>
            </div>

            {showAddReq && (
              <form onSubmit={handleAddReq} style={{ background: 'var(--bg)', borderRadius: 9, padding: 12, marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  className="form-input"
                  style={{ height: 34, flex: 1, minWidth: 160 }}
                  placeholder="Requirement name (e.g. Official transcript)"
                  value={reqName}
                  onChange={e => setReqName(e.target.value)}
                  autoFocus
                />
                <select
                  className="form-select"
                  style={{ height: 34, width: 140 }}
                  value={reqCategory}
                  onChange={e => setReqCategory(e.target.value as RequirementCategory)}
                >
                  {REQUIREMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="submit" className="btn btn-primary btn-sm">Add</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddReq(false)}>Cancel</button>
              </form>
            )}

            {app.requirements.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 140 }}>
                <div className="empty-state-icon"><FileText size={20} /></div>
                <div className="empty-state-title">No requirements yet</div>
                <div className="empty-state-body">Add your requirements manually or use the AI import feature.</div>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddReq(true)} style={{ marginTop: 6 }}>
                  Add first requirement
                </button>
              </div>
            ) : (
              <div className="req-list">
                {app.requirements.map(req => (
                  <div key={req.id} className="req-item">
                    <div className={`status-dot ${req.status}`}>
                      {req.status === 'done' ? <Check size={12} /> : req.status === 'review' ? <Clock size={12} /> : <Circle size={12} />}
                    </div>
                    <div className="req-info">
                      <div className="req-name" style={{ textDecoration: req.status === 'done' ? 'line-through' : 'none', opacity: req.status === 'done' ? 0.6 : 1 }}>
                        {req.name}
                      </div>
                      <div className="req-meta">
                        <span>{req.category}</span>
                        {req.sourceUrl && (
                          <a
                            href={req.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 2 }}
                          >
                            Official source <ArrowUpRight size={10} />
                          </a>
                        )}
                      </div>

                      {/* Attached Evidence Chips */}
                      {req.attachedEvidence && req.attachedEvidence.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                          {req.attachedEvidence.map(att => (
                            <span key={att.evidenceId} className="attached-evidence-pill">
                              <Award size={11} />
                              {att.title}
                              <button
                                onClick={() => handleDetachEvidence(req.id, att.evidenceId)}
                                title="Unlink evidence"
                              >
                                <X size={11} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="req-actions">
                      {req.status !== 'done' && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenEvidencePicker(app, { id: req.id, name: req.name })}
                            title="Attach proof from Evidence Vault"
                          >
                            <FolderOpen size={11} /> Attach Proof
                          </button>
                          <button className="btn btn-success btn-sm" onClick={() => handleMarkReq(req.id, 'done')}>
                            <Check size={11} /> Done
                          </button>
                        </>
                      )}
                      {req.status === 'done' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleMarkReq(req.id, 'missing')}>
                          Undo
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDeleteReq(req.id)} aria-label="Delete requirement">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <span className="section-label">Evidence Intelligence & Matching</span>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                Achievements in your Evidence Vault matched against missing application requirements.
              </p>
            </div>

            {matchedEvidence.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {matchedEvidence.map(({ req, matches }) => (
                  <div key={req.id} style={{ background: 'var(--bg)', borderRadius: 9, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{req.name}</span>
                      <span className="badge badge-amber" style={{ marginLeft: 'auto' }}>Missing</span>
                    </div>
                    {matches.map(({ item, score }) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500 }}>{item.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{item.org}</div>
                        </div>
                        <div style={{ textAlign: 'right', marginRight: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{score}%</div>
                          <div style={{ fontSize: 9, color: 'var(--ink-4)' }}>match</div>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            attachEvidenceToRequirement(userId, app.id, req.id, item.id);
                            notify(`Attached "${item.title}" to ${req.name}`, 'success');
                            onUpdate(app);
                          }}
                        >
                          Attach
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : missing === 0 ? (
              <div className="empty-state" style={{ minHeight: 140 }}>
                <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
                <div className="empty-state-title">All requirements complete</div>
                <div className="empty-state-body">No pending requirements require evidence matching.</div>
              </div>
            ) : (
              <div className="empty-state" style={{ minHeight: 140 }}>
                <div className="empty-state-title">No matching evidence found</div>
                <div className="empty-state-body">Add more achievements or certificates to your Evidence Vault.</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            <span className="section-label" style={{ display: 'block', marginBottom: 14 }}>Application Timeline</span>
            {(app.events ?? []).length > 0 ? (
              <div className="timeline">
                {[...(app.events ?? [])].reverse().map((event, i) => (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-left">
                      <div className="timeline-dot">
                        {event.type === 'created' ? <Plus size={11} /> :
                         event.type === 'status_changed' ? <ChevronRight size={11} /> :
                         event.type === 'requirement_done' ? <Check size={11} /> :
                         <Sparkles size={11} />}
                      </div>
                      {i < (app.events ?? []).length - 1 && <div className="timeline-line" />}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-event-label">{event.label}</div>
                      {event.detail && <div className="timeline-event-detail">{event.detail}</div>}
                      <div className="timeline-event-time">{formatRelativeTime(event.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ minHeight: 140 }}>
                <div className="empty-state-title">No events yet</div>
                <div className="empty-state-body">Events will appear here as you make progress on this application.</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <span className="section-label" style={{ display: 'block', marginBottom: 10 }}>Personal Notes & Strategy</span>
            <textarea
              className="form-textarea"
              placeholder="Add reminders, contacts, portal login notes, or application strategy..."
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              onBlur={() => {
                updateApplication(userId, app.id, { notes: editNotes });
                notify('Notes saved', 'success');
              }}
              style={{ minHeight: 180 }}
            />
            <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6 }}>Notes save automatically when you click outside the field.</p>
          </div>
        )}
      </div>

      {/* Edit App Modal */}
      {showEditApp && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowEditApp(false); }}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="modal-label">EDIT APPLICATION</div>
                <h2 className="modal-title">Update Application</h2>
              </div>
              <button className="modal-close" onClick={() => setShowEditApp(false)} aria-label="Close"><X size={15} /></button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Institution Name</label>
                  <input className="form-input" value={editSchool} onChange={e => setEditSchool(e.target.value)} required />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Program / Track</label>
                    <input className="form-input" value={editProgram} onChange={e => setEditProgram(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Application Deadline</label>
                    <input className="form-input" type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Application Status</label>
                  <select className="form-select" value={editStatus} onChange={e => setEditStatus(e.target.value as ApplicationStatus)}>
                    {Object.entries(APPLICATION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Official Application Portal URL</label>
                  <input className="form-input" type="url" value={editOfficialLink} onChange={e => setEditOfficialLink(e.target.value)} placeholder="https://apply.university.edu" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowEditApp(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete App Confirm Modal */}
      {showDeleteConfirm && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <div>
                <div className="modal-label">CONFIRM DELETION</div>
                <h2 className="modal-title">Delete application?</h2>
              </div>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)} aria-label="Close"><X size={15} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                Are you sure you want to permanently delete <strong>{app.school}</strong> and all its associated requirements?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  onDelete(app.id);
                  setShowDeleteConfirm(false);
                }}
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Applications Tab (List + Detail)
// ─────────────────────────────────────────────────────────────────────────────

interface ApplicationsTabProps {
  apps: Application[];
  evidence: Evidence[];
  userId: string;
  query: string;
  notify: (msg: string, type?: Toast['type']) => void;
  onAppsChange: (apps: Application[]) => void;
  selectedAppId: string | null;
  setSelectedAppId: (id: string | null) => void;
  onOpenEvidencePicker: (app: Application, req: { id: string; name: string }) => void;
  onOpenAiReview?: (app: Application) => void;
}

function ApplicationsTab({
  apps, evidence, userId, query, notify, onAppsChange, selectedAppId, setSelectedAppId, onOpenEvidencePicker, onOpenAiReview,
}: ApplicationsTabProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newSchool, setNewSchool] = useState('');
  const [newProgram, setNewProgram] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('preparing');
  const [newOfficialLink, setNewOfficialLink] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');

  const filteredApps = useMemo(() => {
    let result = apps;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(a => (a.school + ' ' + a.program + ' ' + a.applicationStatus).toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') {
      result = result.filter(a => a.applicationStatus === filterStatus);
    }
    return result;
  }, [apps, query, filterStatus]);

  const selected = selectedAppId
    ? apps.find(a => a.id === selectedAppId) ?? filteredApps[0]
    : filteredApps[0];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newSchool.trim()) return;
    setLoading(true);

    let extractedReqs: Array<{ name: string; category: string; status: RequirementStatus }> = [];

    try {
      let text = sourceText;
      if (sourceUrl.trim()) {
        const r = await fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ url: sourceUrl }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        text = d.text;
      }

      if (text.trim()) {
        const r = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text, institution: newSchool, program: newProgram }),
        });
        const d = await r.json();
        if (d.requirements?.length) {
          extractedReqs = d.requirements.map((name: string) => ({
            name,
            status: 'missing' as RequirementStatus,
            category: (/essay|statement/i.test(name) ? 'Essay' : /recommend/i.test(name) ? 'Recommendation' : /fee|payment/i.test(name) ? 'Payment' : /test|gre|gmat|ielts|toefl/i.test(name) ? 'Test' : 'Document'),
          }));
        }
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not analyze requirements', 'error');
    }

    const defaultDeadline = newDeadline || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

    const newApp = createApplication(userId, {
      school: newSchool.trim(),
      program: newProgram.trim() || 'General Application',
      deadline: defaultDeadline,
      applicationStatus: newStatus,
      officialLink: newOfficialLink.trim() || undefined,
      requirements: extractedReqs.length > 0
        ? extractedReqs.map(r => ({ id: crypto.randomUUID(), ...r, category: r.category as RequirementCategory }))
        : [],
    });

    if (newDeadline) {
      createDeadline(userId, {
        label: `${newSchool.trim()} deadline`,
        applicationId: newApp.id,
        applicationName: newSchool.trim(),
        date: newDeadline,
        type: 'application',
        done: false,
      });
    }

    addNotification(userId, `Application workspace active: ${newSchool.trim()}`);
    setLoading(false);
    onAppsChange(getApplications(userId));
    setSelectedAppId(newApp.id);
    setShowAdd(false);
    setNewSchool(''); setNewProgram(''); setNewDeadline(''); setSourceText(''); setSourceUrl(''); setNewOfficialLink('');
    notify(`Application workspace created for ${newApp.school}`, 'success');
  }

  function handleDeleteApplication(id: string) {
    deleteApplication(userId, id);
    const remaining = getApplications(userId);
    onAppsChange(remaining);
    setSelectedAppId(remaining.length > 0 ? remaining[0].id : null);
    notify('Application deleted');
  }

  const statusFilters = ['all', 'preparing', 'in_progress', 'ready', 'submitted', 'accepted', 'rejected'] as const;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-label">WORKFLOW COMMAND</div>
            <h1 className="page-title">Applications</h1>
            <p className="page-description">Track institutional requirements, attach proof from Evidence Vault, and monitor progress.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> New Application
          </button>
        </div>
        <div className="filter-bar" style={{ marginTop: 14 }}>
          {statusFilters.map(s => (
            <button
              key={s}
              className={`filter-chip ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s as typeof filterStatus)}
            >
              {s === 'all' ? `All (${apps.length})` : APPLICATION_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="page-body">
          <div className="empty-state" style={{ minHeight: '50vh' }}>
            <div className="empty-state-icon"><BriefcaseBusiness size={24} /></div>
            <div className="empty-state-title">No applications yet</div>
            <div className="empty-state-body">Create your first application to organize requirements, documents, and key deadlines.</div>
            <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => setShowAdd(true)}>
              <Plus size={15} /> Add first application
            </button>
          </div>
        </div>
      ) : (
        <div className="split-layout">
          {/* Left Column List */}
          <div className="split-left">
            {filteredApps.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 140 }}>
                <div className="empty-state-title">No matching applications</div>
                <div className="empty-state-body">Try clearing your search or status filter.</div>
              </div>
            ) : (
              filteredApps.map(app => (
                <button
                  key={app.id}
                  className={`app-card ${selected?.id === app.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAppId(app.id)}
                >
                  <div className="app-logo" style={{ width: 34, height: 34, fontSize: 13 }}>
                    {app.school.charAt(0)}
                  </div>
                  <div className="app-card-info">
                    <div className="app-card-name">{app.school}</div>
                    <div className="app-card-sub">{app.program}</div>
                    <div style={{ marginTop: 5 }}>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${readiness(app) >= 80 ? 'high' : readiness(app) >= 50 ? 'medium' : 'low'}`}
                          style={{ width: `${readiness(app)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app-card-meta">
                    <div className="app-card-score">{readiness(app)}%</div>
                    <div className="app-card-deadline">{formatDeadlineLabel(app.deadline)}</div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right Column Detail */}
          {selected ? (
            <ApplicationDetailPanel
              key={selected.id}
              app={selected}
              evidence={evidence}
              userId={userId}
              onUpdate={() => onAppsChange(getApplications(userId))}
              notify={notify}
              onDelete={handleDeleteApplication}
              onOpenEvidencePicker={onOpenEvidencePicker}
              onOpenAiReview={onOpenAiReview}
            />
          ) : (
            <div className="split-right" style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
              <div className="empty-state">
                <div className="empty-state-title">Select an application</div>
                <div className="empty-state-body">Choose an application from the left panel to manage it.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Application Modal */}
      {showAdd && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div>
                <div className="modal-label">NEW APPLICATION WORKSPACE</div>
                <h2 className="modal-title">Track an Application</h2>
                <p className="modal-description">Selecting a known university will automatically load verified institutional requirements.</p>
              </div>
              <button className="modal-close" onClick={() => setShowAdd(false)} aria-label="Close"><X size={15} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Institution Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input
                      autoFocus
                      className="form-input"
                      value={newSchool}
                      onChange={e => setNewSchool(e.target.value)}
                      placeholder="e.g. Harvard University, Oxford, LUMS, Tsinghua..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Program / Track</label>
                    <input
                      className="form-input"
                      value={newProgram}
                      onChange={e => setNewProgram(e.target.value)}
                      placeholder="e.g. BSc Computer Science / Economics"
                    />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Application Deadline</label>
                    <input
                      className="form-input"
                      type="date"
                      value={newDeadline}
                      onChange={e => setNewDeadline(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value as ApplicationStatus)}
                    >
                      {Object.entries(APPLICATION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Official Application Portal URL (Optional)</label>
                  <input
                    className="form-input"
                    type="url"
                    value={newOfficialLink}
                    onChange={e => setNewOfficialLink(e.target.value)}
                    placeholder="https://apply.university.edu"
                  />
                </div>

                {/* Automated Requirement Parser */}
                <div style={{ background: 'var(--bg)', borderRadius: 9, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Sparkles size={13} style={{ color: 'var(--accent)' }} />
                    Custom Admissions Webpage / Text Parser
                  </div>
                  <div className="form-group">
                    <label className="form-label">Public Admissions Webpage URL</label>
                    <input
                      className="form-input"
                      type="url"
                      value={sourceUrl}
                      onChange={e => setSourceUrl(e.target.value)}
                      placeholder="https://university.edu/admissions/requirements"
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: 8 }}>
                    <label className="form-label">Or Paste Requirements Checklist</label>
                    <textarea
                      className="form-textarea"
                      value={sourceText}
                      onChange={e => setSourceText(e.target.value)}
                      placeholder={"Paste custom requirements here...\n- Transcript\n- 2 Recommendation letters\n- Statement of purpose"}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading || !newSchool.trim()}>
                  {loading ? (
                    <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Analyzing...</>
                  ) : (
                    <><Sparkles size={14} /> Create workspace</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Evidence Vault Tab
// ─────────────────────────────────────────────────────────────────────────────

interface EvidenceTabProps {
  evidence: Evidence[];
  apps: Application[];
  userId: string;
  query: string;
  notify: (msg: string, type?: Toast['type']) => void;
  onEvidenceChange: (e: Evidence[]) => void;
  onSelectApp?: (appId: string) => void;
  onNavigate?: (t: AppTab) => void;
}

function EvidenceTab({
  evidence, apps, userId, query, notify, onEvidenceChange, onSelectApp, onNavigate,
}: EvidenceTabProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'vault' | 'documents'>('vault');

  // Form state
  const [title, setTitle] = useState('');
  const [org, setOrg] = useState('');
  const [category, setCategory] = useState<EvidenceCategory>('Achievement');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [tags, setTags] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');

  function resetForm() {
    setTitle(''); setOrg(''); setCategory('Achievement');
    setDescription(''); setDate(''); setTags(''); setVerificationUrl('');
  }

  function populateForm(item: Evidence) {
    setTitle(item.title);
    setOrg(item.org);
    setCategory(item.category);
    setDescription(item.description || '');
    setDate(item.date || '');
    setTags(item.tags.join(', '));
    setVerificationUrl(item.verificationUrl || '');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingId) {
      updateEvidence(userId, editingId, {
        title: title.trim(),
        org: org.trim(),
        category,
        description: description.trim() || undefined,
        date: date || undefined,
        tags: tagList,
        verificationUrl: verificationUrl.trim() || undefined,
      });
      notify('Evidence updated', 'success');
      setEditingId(null);
    } else {
      createEvidence(userId, {
        title: title.trim(),
        org: org.trim(),
        category,
        description: description.trim() || undefined,
        date: date || undefined,
        tags: tagList,
        verificationUrl: verificationUrl.trim() || undefined,
      });
      notify('Evidence added to vault', 'success');
      setShowAdd(false);
    }
    resetForm();
    onEvidenceChange(getEvidence(userId));
  }

  function handleDelete(id: string) {
    deleteEvidence(userId, id);
    onEvidenceChange(getEvidence(userId));
    notify('Evidence deleted');
  }

  const allCategories = [
    'All', 'Academic', 'Award', 'Leadership', 'Sport', 'Project',
    'Volunteering', 'Work', 'Certificate', 'Creative', 'Other'
  ];

  // Evidence Health calculations
  const healthStats = useMemo(() => {
    const total = evidence.length;
    const organized = evidence.filter(e => e.date && e.verificationUrl && e.tags.length > 0).length;
    const missingMetadata = evidence.filter(e => !e.date || !e.verificationUrl).length;

    // Detect potential duplicates
    const titles = evidence.map(e => e.title.toLowerCase().trim());
    const duplicates = evidence.filter((e, idx) =>
      titles.indexOf(e.title.toLowerCase().trim()) !== idx
    ).length;

    return { total, organized, missingMetadata, duplicates };
  }, [evidence]);

  const filtered = useMemo(() => {
    let result = evidence;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(e =>
        (e.title + ' ' + e.org + ' ' + e.category + ' ' + e.tags.join(' ') + ' ' + (e.description || '')).toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'All') {
      result = result.filter(e => e.category === filterCategory);
    }
    return result;
  }, [evidence, query, filterCategory]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-label">EVIDENCE & DOCUMENT INTELLIGENCE</div>
            <h1 className="page-title">Organized Once. Reused Everywhere.</h1>
            <p className="page-description">
              Store your certificates, awards, leadership roles, and transcripts once. Link proof across every application requirement with one click.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary"
              onClick={() => { resetForm(); setEditingId(null); setShowAdd(true); }}
            >
              <Plus size={15} /> Add Evidence
            </button>
          </div>
        </div>

        {/* View Mode Toggle: Vault vs Document Center */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
          <div className="tab-nav" style={{ margin: 0 }}>
            <button
              className={`tab-btn ${viewMode === 'vault' ? 'active' : ''}`}
              onClick={() => setViewMode('vault')}
            >
              <FolderOpen size={14} style={{ display: 'inline', marginRight: 4 }} /> Evidence Vault ({evidence.length})
            </button>
            <button
              className={`tab-btn ${viewMode === 'documents' ? 'active' : ''}`}
              onClick={() => setViewMode('documents')}
            >
              <FileText size={14} style={{ display: 'inline', marginRight: 4 }} /> Document Center
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="filter-bar" style={{ marginTop: 12 }}>
          {allCategories.map(c => (
            <button
              key={c}
              className={`filter-chip ${filterCategory === c ? 'active' : ''}`}
              onClick={() => setFilterCategory(c)}
            >
              {c === 'All' ? `All (${evidence.length})` : c}
            </button>
          ))}
        </div>
      </div>

      <div className="page-body">
        {/* Evidence Health Scorecard */}
        <div className="card" style={{ marginBottom: 20, padding: 16, background: 'var(--bg-subtle)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: 8 }}>
            EVIDENCE HEALTH & ORGANIZATIONAL STATUS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{healthStats.total}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Total Vault Items</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success-dark)' }}>{healthStats.organized}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Fully Tagged & Verified</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: healthStats.missingMetadata > 0 ? 'var(--warning-dark)' : 'var(--ink)' }}>{healthStats.missingMetadata}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Missing Date / Link</div>
            </div>
            <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: healthStats.duplicates > 0 ? 'var(--danger)' : 'var(--ink)' }}>{healthStats.duplicates}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>Potential Duplicates</div>
            </div>
          </div>
        </div>

        {/* Duplicate Banner Alert */}
        {healthStats.duplicates > 0 && (
          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            <AlertTriangle size={15} />
            <span>Possible duplicate evidence detected in your vault. Compare items to keep your data organized.</span>
          </div>
        )}

        {viewMode === 'documents' ? (
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Official Application Documents</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 16 }}>
              Key institutional documents (Official High School Transcript, Passport Copy, English Test Certificate, Recommendation Letters) required for submission.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {[
                { title: 'Academic Transcript', type: 'Official PDF', status: 'Ready', date: '2026-08-01' },
                { title: 'Passport / National Identity Card', type: 'Identification', status: 'Verified', date: '2026-07-15' },
                { title: 'IELTS / TOEFL Official Score Card', type: 'Language Test', status: 'Attached', date: '2026-06-20' },
                { title: 'Teacher Recommendation 1', type: 'Reference', status: 'Received', date: '2026-08-10' },
              ].map(doc => (
                <div key={doc.title} className="card" style={{ padding: 14, background: 'var(--bg-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <FileText size={18} color="var(--primary)" />
                    <span className="badge badge-success" style={{ fontSize: 10 }}>{doc.status}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{doc.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>{doc.type} · Updated {doc.date}</div>
                  <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 10 }} onClick={() => notify(`Viewing document: ${doc.title}`)}>
                    Preview & Attach
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : evidence.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FolderOpen size={24} /></div>
            <div className="empty-state-title">Build your evidence vault</div>
            <div className="empty-state-body">
              Store your certificates, competitions, awards, and project achievements to reuse them across every application.
            </div>
            <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => setShowAdd(true)}>
              <Plus size={15} /> Add first achievement
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No matching evidence</div>
            <div className="empty-state-body">Try a different search query or category filter.</div>
          </div>
        ) : (
          <div className="evidence-grid">
            {filtered.map(item => (
              <article
                key={item.id}
                className="evidence-card"
                onClick={() => { populateForm(item); setEditingId(item.id); setShowAdd(false); }}
              >
                <div className="evidence-card-top">
                  <div className="evidence-icon">
                    {item.category === 'Award' || item.category === 'Certificate' ? <CheckCircle2 size={17} /> :
                     item.category === 'Project' || item.category === 'Technology' ? <BookOpen size={17} /> :
                     item.category === 'Sport' ? <Target size={17} /> :
                     item.category === 'Work' ? <BriefcaseBusiness size={17} /> :
                     <FileText size={17} />}
                  </div>
                  <span className="badge badge-accent">{item.category}</span>
                </div>
                <div className="evidence-title">{item.title}</div>
                <div className="evidence-org">{item.org}</div>
                {item.date && <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{formatDate(item.date)}</div>}
                {item.description && <div className="evidence-desc">{item.description}</div>}
                <div className="evidence-tags">
                  {item.tags.map(t => <span key={t} className="evidence-tag">{t}</span>)}
                </div>

                {/* Evidence -> Application Graph */}
                {(() => {
                  const linked = apps.flatMap(app =>
                    app.requirements
                      .filter(r => r.attachedEvidence?.some(ae => ae.evidenceId === item.id))
                      .map(r => ({ app, req: r }))
                  );
                  return (
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', fontSize: 11, color: 'var(--ink-light)' }}>
                      <span style={{ fontWeight: 600 }}>Linked Applications ({linked.length}):</span>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                        {linked.length > 0 ? (
                          linked.map(({ app, req }) => (
                            <button
                              key={`${app.id}-${req.id}`}
                              className="badge badge-accent"
                              style={{ fontSize: 10, cursor: onSelectApp ? 'pointer' : 'default', border: 'none' }}
                              onClick={e => {
                                e.stopPropagation();
                                if (onSelectApp && onNavigate) {
                                  onSelectApp(app.id);
                                  onNavigate('applications');
                                }
                              }}
                              title={`Open ${app.school} application`}
                            >
                              {app.school} ({req.name}) <ArrowUpRight size={8} style={{ display: 'inline', marginLeft: 2 }} />
                            </button>
                          ))
                        ) : (
                          <span style={{ fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic' }}>
                            Not yet attached to any application
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: 6, marginTop: 12, alignItems: 'center' }}>
                  {item.verificationUrl && (
                    <a
                      href={item.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      onClick={e => e.stopPropagation()}
                    >
                      <ArrowUpRight size={11} /> Verify
                    </a>
                  )}
                  <button
                    className="btn btn-danger btn-sm btn-icon"
                    style={{ marginLeft: 'auto' }}
                    onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                    aria-label="Delete record"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Evidence Modal */}
      {(showAdd || editingId) && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) { setShowAdd(false); setEditingId(null); resetForm(); } }}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="modal-label">EVIDENCE VAULT</div>
                <h2 className="modal-title">{editingId ? 'Edit Evidence' : 'Add Evidence'}</h2>
                <p className="modal-description">Store an achievement, certificate, or extracurricular proof once to link it to requirements.</p>
              </div>
              <button className="modal-close" onClick={() => { setShowAdd(false); setEditingId(null); resetForm(); }} aria-label="Close">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    autoFocus
                    className="form-input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. National Science Olympiad — 1st Place"
                    required
                  />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Issuing Body / Organization</label>
                    <input
                      className="form-input"
                      value={org}
                      onChange={e => setOrg(e.target.value)}
                      placeholder="e.g. IEEE / Oxford University"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={e => setCategory(e.target.value as EvidenceCategory)}
                    >
                      {EVIDENCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Date Achieved</label>
                    <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Verification / Portfolio Link</label>
                    <input className="form-input" type="url" value={verificationUrl} onChange={e => setVerificationUrl(e.target.value)} placeholder="https://certificate-url.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what you built, accomplished, or led. ApplyX uses this for requirement matching."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    className="form-input"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="leadership, STEM, python, teamwork"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowAdd(false); setEditingId(null); resetForm(); }}>Cancel</button>
                {editingId && (
                  <button type="button" className="btn btn-danger" onClick={() => { handleDelete(editingId); setEditingId(null); resetForm(); }}>
                    Delete
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
                  {editingId ? 'Save changes' : 'Add to vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Discover Tab (Global Search & Directory)
// ─────────────────────────────────────────────────────────────────────────────

interface DiscoverTabProps {
  userId: string;
  notify: (msg: string, type?: Toast['type']) => void;
  onApplicationCreated: () => void;
  onOpenDetail: (inst: Institution) => void;
  compareList: Institution[];
  onToggleCompare: (inst: Institution) => void;
  onOpenCompareModal: () => void;
}

function DiscoverTab({
  userId, notify, onApplicationCreated, onOpenDetail, compareList, onToggleCompare, onOpenCompareModal,
}: DiscoverTabProps) {
  const [uniQuery, setUniQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [universities, setUniversities] = useState<Institution[]>(GLOBAL_INSTITUTIONS);
  const [loading, setLoading] = useState(false);
  const [savedList, setSavedList] = useState(getSavedUniversities(userId));

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (uniQuery.trim()) params.set('q', uniQuery.trim());
        if (selectedRegion !== 'all') params.set('region', selectedRegion);

        const r = await fetch(`/api/universities?${params.toString()}`);
        const d = await r.json();
        setUniversities(Array.isArray(d) ? d : GLOBAL_INSTITUTIONS);
      } catch {
        setUniversities(GLOBAL_INSTITUTIONS);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [uniQuery, selectedRegion]);

  function handleToggleSave(inst: Institution) {
    if (isUniversitySaved(userId, inst.name)) {
      unsaveUniversity(userId, inst.name);
      setSavedList(getSavedUniversities(userId));
      notify('Removed from saved institutions');
    } else {
      saveUniversity(userId, {
        universityName: inst.name,
        country: inst.country,
        city: inst.city,
        domain: inst.domains?.[0],
      });
      setSavedList(getSavedUniversities(userId));
      notify('University saved', 'success');
    }
  }

  function handleTrackDirect(inst: Institution) {
    createApplication(userId, {
      school: inst.name,
      program: inst.programs?.[0]?.name || 'Undergraduate Application',
      deadline: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      applicationStatus: 'interested',
      requirements: [],
      officialLink: inst.admissionsUrl || inst.webPages?.[0],
      applicationPlatform: inst.applicationPlatform,
    });
    onApplicationCreated();
    notify(`${inst.name} added to your applications`, 'success');
  }

  const regions = ['all', 'Americas', 'Europe', 'Asia', 'Oceania'];

  const collections = [
    'All', 'Global Top 10', 'Ivy League', 'Top US', 'Top UK',
    'Top Europe', 'Top China', 'Top Pakistan', 'Top Canada', 'Top Australia'
  ];

  const disciplines = [
    'All Programs', 'Computer Science', 'AI & Data Science', 'Engineering',
    'Business & Economics', 'Medicine & Biology', 'Law', 'Architecture'
  ];

  const rankingTiers = ['All Ranks', 'Top 10', 'Top 50', 'Top 100', 'Top 250'];

  const [selectedCollection, setSelectedCollection] = useState('All');
  const [selectedDiscipline, setSelectedDiscipline] = useState('All Programs');
  const [selectedRankingTier, setSelectedRankingTier] = useState('All Ranks');

  // Filter logic
  const filteredUniversities = useMemo(() => {
    let list = universities;

    if (selectedCollection !== 'All') {
      const col = selectedCollection.toLowerCase();
      if (col === 'global top 10') list = list.filter(u => u.rankings.some(r => parseInt(r.rank.replace('#', '')) <= 10));
      else if (col === 'ivy league') list = list.filter(u => u.categoryTags.includes('Ivy League'));
      else if (col === 'top us') list = list.filter(u => u.country === 'United States');
      else if (col === 'top uk') list = list.filter(u => u.country === 'United Kingdom');
      else if (col === 'top europe') list = list.filter(u => u.region === 'Europe');
      else if (col === 'top china') list = list.filter(u => u.country === 'China');
      else if (col === 'top pakistan') list = list.filter(u => u.country === 'Pakistan');
      else if (col === 'top canada') list = list.filter(u => u.country === 'Canada');
      else if (col === 'top australia') list = list.filter(u => u.country === 'Australia');
    }

    if (selectedDiscipline !== 'All Programs') {
      const disc = selectedDiscipline.toLowerCase();
      list = list.filter(u => u.programs.some(p => p.name.toLowerCase().includes(disc.split(' ')[0])));
    }

    if (selectedRankingTier !== 'All Ranks') {
      const cutoff = parseInt(selectedRankingTier.replace('Top ', ''));
      list = list.filter(u => u.rankings.some(r => {
        const val = parseInt(r.rank.replace('#', ''));
        return !isNaN(val) && val <= cutoff;
      }));
    }

    return list;
  }, [universities, selectedCollection, selectedDiscipline, selectedRankingTier]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-label">DISCOVERY ENGINE</div>
            <h1 className="page-title">Explore Verified Institutions</h1>
            <p className="page-description">
              Search verified universities across US, UK, China, Pakistan, Canada, and global destinations with authoritative QS 2026 rankings and admission requirements.
            </p>
          </div>
          {compareList.length > 0 && (
            <button className="btn btn-primary" onClick={onOpenCompareModal}>
              <Layers size={14} /> Compare ({compareList.length})
            </button>
          )}
        </div>
      </div>

      <div className="page-body">
        {/* Search Bar */}
        <div className="discover-search" style={{ marginBottom: 14 }}>
          <Search size={17} style={{ color: 'var(--ink-4)', flexShrink: 0 }} aria-hidden />
          <input
            aria-label="Search institutions worldwide"
            value={uniQuery}
            onChange={e => setUniQuery(e.target.value)}
            placeholder="Search universities worldwide — e.g. Harvard, Oxford, Tsinghua, LUMS, Toronto, MIT..."
            autoComplete="off"
            spellCheck={false}
          />
          {loading && <div className="spinner" style={{ flexShrink: 0 }} />}
          {uniQuery && (
            <button onClick={() => setUniQuery('')} style={{ color: 'var(--ink-4)', flexShrink: 0 }} aria-label="Clear search">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Featured Collections Horizontal Scroll Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-light)' }}>
            FEATURED COLLECTIONS & TIER FILTERS
          </div>
          <div className="chip-group" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {collections.map(col => (
              <button
                key={col}
                className={`btn btn-sm ${selectedCollection === col ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSelectedCollection(col)}
                style={{ borderRadius: 20, padding: '4px 14px', fontSize: 12 }}
              >
                {col}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
            {/* Discipline Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)' }}>Field:</span>
              <select
                className="form-select"
                value={selectedDiscipline}
                onChange={e => setSelectedDiscipline(e.target.value)}
                style={{ padding: '4px 10px', fontSize: 12, height: 32 }}
              >
                {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Ranking Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)' }}>Ranking Cutoff:</span>
              <select
                className="form-select"
                value={selectedRankingTier}
                onChange={e => setSelectedRankingTier(e.target.value)}
                style={{ padding: '4px 10px', fontSize: 12, height: 32 }}
              >
                {rankingTiers.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Region Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)' }}>Region:</span>
              <select
                className="form-select"
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                style={{ padding: '4px 10px', fontSize: 12, height: 32 }}
              >
                {regions.map(r => <option key={r} value={r}>{r === 'all' ? 'All Regions' : r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Recommended for You Spotlight Section */}
        {!uniQuery && selectedCollection === 'All' && selectedRegion === 'all' && (
          <div className="card" style={{ marginBottom: 20, padding: 18, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span className="badge badge-purple" style={{ fontSize: 11, marginBottom: 4, display: 'inline-block' }}>
                  PERSONALIZED INTELLIGENCE
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recommended For You</h3>
                <p style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                  Selected based on your target degree, preferred disciplines, and applicant profile.
                </p>
              </div>
              <Sparkles size={20} color="var(--primary)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              {universities.slice(0, 3).map(u => (
                <div key={u.id} className="card hover-lift" style={{ padding: 14, background: 'var(--surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, cursor: 'pointer' }} onClick={() => onOpenDetail(u)}>{u.name}</div>
                    {u.rankings[0] && (
                      <span className="badge badge-accent" style={{ fontSize: 10 }}>{u.rankings[0].provider} {u.rankings[0].year} {u.rankings[0].rank}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 8 }}>
                    <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} /> {u.city}, {u.country}
                  </div>
                  <div style={{ background: 'var(--bg-subtle)', padding: 6, borderRadius: 4, fontSize: 11, color: 'var(--primary-dark)', marginBottom: 10 }}>
                    💡 <strong>Why you&apos;re seeing this:</strong> Matches your target STEM degree program and destination criteria.
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => handleTrackDirect(u)}>
                    Track Application <ArrowUpRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Institutions Pinned Bar */}
        {!uniQuery && savedList.length > 0 && selectedRegion === 'all' && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div>
                <div className="card-title">Saved Institutions</div>
                <div className="card-subtitle">{savedList.length} bookmarked for quick access</div>
              </div>
            </div>
            <div className="uni-list">
              {savedList.map(s => (
                <div key={s.id} className="uni-item">
                  <div className="uni-mark">{s.universityName.charAt(0)}</div>
                  <div className="uni-info">
                    <div className="uni-name">{s.universityName}</div>
                    <div className="uni-meta">
                      <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />
                      {s.country} {s.city ? `· ${s.city}` : ''}
                    </div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      unsaveUniversity(userId, s.universityName);
                      setSavedList(getSavedUniversities(userId));
                      notify('Removed from saved');
                    }}
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filtered Results */}
        {filteredUniversities.length > 0 ? (
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                {uniQuery ? `Results for "${uniQuery}"` : selectedCollection !== 'All' ? `${selectedCollection} Institutions` : 'Verified Global Institutions'}
              </div>
              <div className="card-subtitle">{filteredUniversities.length} institution{filteredUniversities.length !== 1 ? 's' : ''} available</div>
            </div>
            <div className="uni-list">
              {filteredUniversities.map(u => {
                const saved = isUniversitySaved(userId, u.name);
                const isComparing = compareList.some(c => c.name === u.name);
                const rankText = u.rankings?.[0] ? `${u.rankings[0].provider} ${u.rankings[0].year} ${u.rankings[0].rank}` : null;

                return (
                  <div key={u.id || `${u.name}-${u.country}`} className="uni-item">
                    <div className="uni-mark">{u.name.charAt(0)}</div>
                    <div className="uni-info">
                      <div
                        className="uni-name"
                        style={{ cursor: 'pointer', color: 'var(--ink)' }}
                        onClick={() => onOpenDetail(u)}
                      >
                        {u.name}
                      </div>
                      <div className="uni-meta" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span><MapPin size={11} style={{ display: 'inline', marginRight: 2 }} /> {u.country} {u.city ? `(${u.city})` : ''}</span>
                        {rankText && (
                          <span className="badge badge-accent" style={{ fontSize: 10 }}>{rankText}</span>
                        )}
                        {u.applicationPlatform && (
                          <span className="badge badge-neutral" style={{ fontSize: 10 }}>{u.applicationPlatform}</span>
                        )}
                        {u.verifiedSource && (
                          <span className="badge badge-success" style={{ fontSize: 10 }}>✓ Verified Source</span>
                        )}
                      </div>
                    </div>
                    <div className="uni-actions">
                      <button
                        className={`btn btn-sm ${isComparing ? 'btn-secondary' : 'btn-ghost'}`}
                        onClick={() => onToggleCompare(u)}
                        title="Compare side-by-side"
                      >
                        <Layers size={12} /> {isComparing ? 'Comparing' : 'Compare'}
                      </button>
                      <button
                        className={`btn btn-sm ${saved ? 'btn-success' : 'btn-ghost'}`}
                        onClick={() => handleToggleSave(u)}
                        title={saved ? 'Remove bookmark' : 'Bookmark university'}
                      >
                        {saved ? <><BookmarkCheck size={12} /> Saved</> : <><Bookmark size={12} /> Save</>}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onOpenDetail(u)}
                      >
                        Details
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => handleTrackDirect(u)}>
                        Track <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><AlertCircle size={24} /></div>
            <div className="empty-state-title">No universities found for &ldquo;{uniQuery}&rdquo;</div>
            <div className="empty-state-body">Check the spelling or try searching for a broader university keyword.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Profile Tab
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileTabProps {
  user: UserType;
  userId: string;
  notify: (msg: string, type?: Toast['type']) => void;
}

function ProfileTab({ user, userId, notify }: ProfileTabProps) {
  const initial = getProfile(userId);
  const [fullName, setFullName] = useState(initial?.fullName || user.fullName);
  const [phone, setPhone] = useState(initial?.phone || '');
  const [nationality, setNationality] = useState(initial?.nationality || '');
  const [bio, setBio] = useState(initial?.bio || '');
  const [targetDegree, setTargetDegree] = useState(initial?.targetDegree || '');
  const [targetCountries, setTargetCountries] = useState(initial?.targetCountries?.join(', ') || '');
  const [targetFields, setTargetFields] = useState(initial?.targetFields?.join(', ') || '');
  const [currentGPA, setCurrentGPA] = useState(initial?.currentGPA || '');
  const [graduationYear, setGraduationYear] = useState(initial?.graduationYear || '');
  const [isInternational, setIsInternational] = useState(initial?.isInternationalApplicant ?? true);
  const [saving, setSaving] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    upsertProfile({
      userId,
      fullName: fullName.trim(),
      email: user.email,
      phone: phone.trim(),
      nationality: nationality.trim(),
      bio: bio.trim(),
      targetDegree: (targetDegree as Profile['targetDegree']) || undefined,
      targetCountries: targetCountries.split(',').map(s => s.trim()).filter(Boolean),
      targetFields: targetFields.split(',').map(s => s.trim()).filter(Boolean),
      currentGPA: currentGPA.trim(),
      graduationYear: graduationYear.trim(),
      isInternationalApplicant: isInternational,
      updatedAt: new Date().toISOString(),
    });
    setTimeout(() => {
      setSaving(false);
      notify('Profile updated across workspace', 'success');
    }, 250);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-label">APPLICANT PROFILE</div>
          <h1 className="page-title">Your Profile</h1>
          <p className="page-description">
            Your master profile acts as the single source of truth for applications and pre-fills requirement evaluations.
          </p>
        </div>
      </div>

      <div className="page-body" style={{ maxWidth: 740 }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Personal Info */}
          <div className="card">
            <div className="card-header"><div className="card-title">Personal Details</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={user.email} readOnly style={{ opacity: 0.65, cursor: 'not-allowed' }} />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7000 000000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nationality / Citizenship</label>
                  <input className="form-input" value={nationality} onChange={e => setNationality(e.target.value)} placeholder="e.g. British / Pakistani / American" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Applicant Summary</label>
                <textarea
                  className="form-textarea"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Summary of academic focus, research interests, and career objectives..."
                  style={{ minHeight: 75 }}
                />
              </div>
            </div>
          </div>

          {/* Academic Background */}
          <div className="card">
            <div className="card-header"><div className="card-title">Academic Background</div></div>
            <div className="card-body">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Current / Most Recent GPA</label>
                  <input className="form-input" value={currentGPA} onChange={e => setCurrentGPA(e.target.value)} placeholder="e.g. 3.9 / 4.0 or A*AA" />
                </div>
                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input className="form-input" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} placeholder="e.g. 2026" />
                </div>
              </div>
            </div>
          </div>

          {/* Target Preferences & International Mode */}
          <div className="card">
            <div className="card-header"><div className="card-title">Application Preferences & Route</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Target Degree Level</label>
                  <select className="form-select" value={targetDegree} onChange={e => setTargetDegree(e.target.value)}>
                    <option value="">Select degree level</option>
                    {Object.entries(DEGREE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Countries</label>
                  <input className="form-input" value={targetCountries} onChange={e => setTargetCountries(e.target.value)} placeholder="UK, USA, Canada, China" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fields of Study (comma-separated)</label>
                <input className="form-input" value={targetFields} onChange={e => setTargetFields(e.target.value)} placeholder="Computer Science, Machine Learning, Data Science" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <input
                  type="checkbox"
                  id="intlMode"
                  checked={isInternational}
                  onChange={e => setIsInternational(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                <label htmlFor="intlMode" style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  Enable International Applicant Guidance (Highlights language proficiency & visa documentation)
                </label>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</> : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. Settings Tab
// ─────────────────────────────────────────────────────────────────────────────

interface SettingsTabProps {
  user: UserType;
  userId: string;
  onLogout: () => void;
  notify: (msg: string, type?: Toast['type']) => void;
  theme: 'system' | 'light' | 'dark';
  onSetTheme: (t: 'system' | 'light' | 'dark') => void;
}

function SettingsTab({ user, userId, onLogout, notify, theme, onSetTheme }: SettingsTabProps) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters.'); return; }

    import('@/lib/auth').then(({ updatePassword }) => {
      const result = updatePassword(userId, currentPw, newPw);
      if (!result.success) {
        setPwError(result.error ?? 'Failed to update password.');
      } else {
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
        notify('Password updated', 'success');
      }
    });
  }

  function handleDeleteAccount() {
    if (deleteInput.trim().toLowerCase() !== user.email.toLowerCase()) return;
    import('@/lib/auth').then(({ deleteAccount }) => {
      deleteAccount(userId);
      onLogout();
    });
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-label">ACCOUNT</div>
          <h1 className="page-title">Settings</h1>
          <p className="page-description">Manage workspace credentials, account security, and local storage data.</p>
        </div>
      </div>

      <div className="page-body" style={{ maxWidth: 620 }}>
        {/* Appearance Settings */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Appearance & Theme</div>
              <div className="card-subtitle">Choose your visual preference or sync automatically with system settings.</div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { id: 'system', label: 'System', desc: 'Sync with OS' },
                { id: 'light', label: 'Light', desc: 'Editorial' },
                { id: 'dark', label: 'Dark', desc: 'Sleek Precision' },
              ].map(item => (
                <button
                  key={item.id}
                  className="card"
                  onClick={() => onSetTheme(item.id as 'system' | 'light' | 'dark')}
                  style={{
                    padding: 12,
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderColor: theme === item.id ? 'var(--primary)' : 'var(--border)',
                    background: theme === item.id ? 'var(--bg-subtle)' : 'var(--surface)',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Account Info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><div className="card-title">User Account</div></div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'var(--accent)', color: 'white',
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
                }}
              >
                {getInitials(user.fullName)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{user.fullName}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{user.email}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>Member since {formatDate(user.createdAt)}</div>
              </div>
            </div>

            <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--info-bg)', borderRadius: 7, fontSize: 12, color: 'var(--info)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Mail size={13} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>All workspace documents and application data are securely stored locally on this device.</div>
            </div>

            <div style={{ marginTop: 14 }}>
              <button className="btn btn-ghost" onClick={onLogout}>
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><div className="card-title">Security & Password</div></div>
          <form onSubmit={handleChangePassword}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Current password</label>
                <input className="form-input" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} autoComplete="current-password" required />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">New password</label>
                  <input className="form-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} autoComplete="new-password" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm new password</label>
                  <input className="form-input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} autoComplete="new-password" required />
                </div>
              </div>
              {pwError && (
                <div className="alert alert-danger">
                  <AlertCircle size={13} style={{ flexShrink: 0 }} /> {pwError}
                </div>
              )}
              <div>
                <button type="submit" className="btn btn-primary" disabled={!currentPw || !newPw || !confirmPw}>
                  Update Password
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: 'rgba(190, 46, 38, 0.2)' }}>
          <div className="card-header">
            <div>
              <div className="card-title" style={{ color: 'var(--danger)' }}>Danger Zone</div>
              <div className="card-subtitle">Permanent workspace removal</div>
            </div>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 12, lineHeight: 1.5 }}>
              Deleting your account will purge all your applications, evidence items, notes, and local workspace profile.
            </p>
            <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={13} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) { setShowDeleteConfirm(false); setDeleteInput(''); } }}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <div>
                <div className="modal-label">PERMANENT DELETION</div>
                <h2 className="modal-title" style={{ color: 'var(--danger)' }}>Delete Account?</h2>
              </div>
              <button className="modal-close" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}><X size={15} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                Type your email (<strong>{user.email}</strong>) to confirm permanent deletion.
              </p>
              <input
                className="form-input"
                placeholder={user.email}
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleteInput.trim().toLowerCase() !== user.email.toLowerCase()}
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scholarships Tab Component
// ─────────────────────────────────────────────────────────────────────────────

interface ScholarshipsTabProps {
  userId: string;
  notify: (msg: string, type?: Toast['type']) => void;
  onOpenMatcher: () => void;
}

function ScholarshipsTab({ onOpenMatcher }: ScholarshipsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [query, setQuery] = useState<string>('');
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);

  // Country display name → actual data values (fixes UK vs 'United Kingdom' mismatch)
  const COUNTRY_MAP: Record<string, string> = {
    'Pakistan': 'Pakistan',
    'United States': 'United States',
    'UK': 'United Kingdom',
    'China': 'China',
    'Europe': 'Europe',
    'Canada': 'Canada',
    'Australia': 'Australia',
    'Japan': 'Japan',
    'Global': 'Global',
  };

  const categories = [
    'All', 'Pakistan', 'United States', 'UK', 'China', 'Europe', 'Canada', 'Australia', 'Japan', 'Global',
    'Fully Funded', 'Merit', 'Need-Based', 'International'
  ];

  const COUNTRY_FILTERS = Object.keys(COUNTRY_MAP);
  const CATEGORY_FILTERS = ['Fully Funded', 'Merit', 'Need-Based', 'International'];

  const filteredScholarships = useMemo(() => {
    const mappedCountry = COUNTRY_FILTERS.includes(selectedCategory)
      ? COUNTRY_MAP[selectedCategory]
      : undefined;
    return searchScholarships(query, {
      country: mappedCountry,
      category: CATEGORY_FILTERS.includes(selectedCategory) ? selectedCategory : undefined,
    });
  }, [query, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="page-label">SCHOLARSHIP INTELLIGENCE</div>
          <h1 className="page-title">Verified Scholarships & Financial Aid</h1>
          <p className="page-description">
            Browse verified institutional, government, need-based, and fully funded global scholarship programs.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onOpenMatcher} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={16} /> Find Scholarships For Me
        </button>
      </div>

      <div className="page-body">
        {/* Category Pills & Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div className="search-bar" style={{ maxWidth: 480 }}>
            <Search size={16} className="search-icon" />
            <input
              className="search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search scholarships by name, university, or field..."
            />
            {query && (
              <button className="btn btn-ghost btn-sm" onClick={() => setQuery('')} style={{ padding: 4 }}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="chip-group" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ borderRadius: 20, padding: '4px 14px', fontSize: 13 }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scholarships Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filteredScholarships.map(sch => (
            <div key={sch.id} className="card hover-lift" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 18 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <span className="badge badge-blue" style={{ fontSize: 11 }}>{sch.category}</span>
                  <span className="badge badge-neutral" style={{ fontSize: 11 }}><MapPin size={10} style={{ display: 'inline', marginRight: 2 }} /> {sch.country}</span>
                </div>
                <h3 className="card-title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{sch.name}</h3>
                <div style={{ fontSize: 12, color: 'var(--ink-light)', fontWeight: 500, marginBottom: 10 }}>{sch.provider}</div>
                <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {sch.eligibilitySummary}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'var(--ink-light)' }}>Coverage:</span>
                  <span style={{ fontWeight: 600, color: 'var(--success-dark)' }}>{sch.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12 }}>
                  <span style={{ color: 'var(--ink-light)' }}>Deadline:</span>
                  <span style={{ fontWeight: 600 }}>{formatDeadlineLabel(sch.deadline)}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setSelectedScholarship(sch)}>
                    Details & Verification
                  </button>
                  <a href={sch.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                    Official Site <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredScholarships.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><AlertCircle size={24} /></div>
            <div className="empty-state-title">No scholarships found</div>
            <div className="empty-state-body">Try selecting a different category or refining your search term.</div>
          </div>
        )}
      </div>

      {/* Scholarship Details Modal */}
      {selectedScholarship && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedScholarship(null); }}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div>
                <div className="modal-label">{selectedScholarship.category.toUpperCase()} SCHOLARSHIP</div>
                <h2 className="modal-title">{selectedScholarship.name}</h2>
                <p className="modal-description">Official Verified Provider: {selectedScholarship.provider}</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedScholarship(null)}><X size={15} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-success">✓ Verified Official Source</span>
                <span className="badge badge-blue">{selectedScholarship.country}</span>
                <span className="badge badge-purple">{selectedScholarship.degreeLevels.join(', ').toUpperCase()}</span>
              </div>
              <div>
                <div className="form-label" style={{ fontWeight: 600 }}>Award Coverage & Amount</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--success-dark)', marginTop: 2 }}>{selectedScholarship.amount}</div>
              </div>
              <div>
                <div className="form-label" style={{ fontWeight: 600 }}>Eligibility Summary</div>
                <p style={{ fontSize: 14, color: 'var(--ink)', marginTop: 2, lineHeight: 1.5 }}>{selectedScholarship.eligibilitySummary}</p>
              </div>
              <div>
                <div className="form-label" style={{ fontWeight: 600 }}>Application Route</div>
                <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>{selectedScholarship.applicationRoute}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-light)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <span>Official Source: <strong>{selectedScholarship.officialSource}</strong></span>
                <span>Last Verified: <strong>{selectedScholarship.lastVerifiedDate}</strong></span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedScholarship(null)}>Close</button>
              <a href={selectedScholarship.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Open Official Portal <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scholarship Matcher Modal Component
// ─────────────────────────────────────────────────────────────────────────────

function ScholarshipMatcherModal({
  isOpen,
  onClose,
  profile,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
}) {
  const [step, setStep] = useState<number>(1);
  const [nationality, setNationality] = useState<string>(profile?.nationality || 'Pakistan');
  const [targetCountry, setTargetCountry] = useState<string>(profile?.targetCountries?.[0] || 'all');
  const [degreeLevel, setDegreeLevel] = useState<string>(profile?.targetDegree || 'undergraduate');
  const [fieldOfStudy, setFieldOfStudy] = useState<string>(profile?.targetFields?.[0] || 'Computer Science');
  const [currentGpa, setCurrentGpa] = useState<string>(profile?.currentGPA || '3.7');
  const [hasFinancialNeed, setHasFinancialNeed] = useState<boolean>(true);

  const results = useMemo(() => {
    if (step < 4) return [];
    return matchScholarshipsForUser({
      nationality,
      targetCountry,
      degreeLevel,
      fieldOfStudy,
      currentGpa,
      hasFinancialNeed,
    });
  }, [step, nationality, targetCountry, degreeLevel, fieldOfStudy, currentGpa, hasFinancialNeed]);

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div>
            <div className="modal-label">PERSONAL SCHOLARSHIP MATCHER</div>
            <h2 className="modal-title">Scholarship Autopilot Engine</h2>
            <p className="modal-description">Match your personal profile against verified global and institutional scholarships with transparent eligibility verification.</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="modal-body">
          {/* Step Bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['1. Identity & Target', '2. Academics & Degree', '3. Financial & Criteria', '4. Matched Opportunities'].map((s, idx) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: 'center',
                  background: step === idx + 1 ? 'var(--primary)' : step > idx + 1 ? 'var(--primary-subtle)' : 'var(--bg-subtle)',
                  color: step === idx + 1 ? 'white' : step > idx + 1 ? 'var(--primary-dark)' : 'var(--ink-muted)',
                }}
              >
                {s}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Citizenship / Passport Nationality</label>
                <input className="form-input" value={nationality} onChange={e => setNationality(e.target.value)} placeholder="e.g. Pakistan / India / UK" />
              </div>
              <div className="form-group">
                <label className="form-label">Target Study Destination</label>
                <select className="form-select" value={targetCountry} onChange={e => setTargetCountry(e.target.value)}>
                  <option value="all">Any Destination (Global)</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="United States">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="China">China</option>
                  <option value="Germany">Germany / Europe</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Japan">Japan</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Target Degree Level</label>
                <select className="form-select" value={degreeLevel} onChange={e => setDegreeLevel(e.target.value)}>
                  <option value="undergraduate">Undergraduate (Bachelor&apos;s)</option>
                  <option value="postgraduate">Postgraduate (Master&apos;s)</option>
                  <option value="phd">Doctoral (PhD)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Field of Study / Discipline</label>
                <input className="form-input" value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} placeholder="e.g. Computer Science, Business, Engineering, Medicine" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Current Academic Grade / GPA</label>
                <input className="form-input" value={currentGpa} onChange={e => setCurrentGpa(e.target.value)} placeholder="e.g. 3.8 / 4.0 or 85%" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={hasFinancialNeed} onChange={e => setHasFinancialNeed(e.target.checked)} style={{ width: 16, height: 16 }} />
                  <span>I am applying for financial aid / demonstrate financial need</span>
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Your Personalized Scholarship Matches ({results.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {results.map(r => (
                  <div key={r.scholarship.id} className="card" style={{ padding: 14, borderLeft: `4px solid ${r.matchType === 'strong' ? 'var(--success)' : r.matchType === 'possible' ? 'var(--warning)' : 'var(--danger)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <span className={`badge ${r.matchType === 'strong' ? 'badge-success' : r.matchType === 'possible' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: 11, textTransform: 'capitalize' }}>
                          {r.matchType === 'strong' ? '✓ Strong Match' : r.matchType === 'possible' ? '⚠ Potential Match' : '✕ Ineligible'}
                        </span>
                        <h4 style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{r.scholarship.name}</h4>
                        <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>{r.scholarship.provider} · {r.scholarship.country}</div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{r.matchScore}% Score</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10, background: 'var(--bg-subtle)', padding: 10, borderRadius: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-light)' }}>Transparent Match Breakdown</div>
                      {r.reasons.map((res, i) => (
                        <div key={i} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: res.status === 'pass' ? 'var(--success-dark)' : res.status === 'warn' ? 'var(--warning-dark)' : 'var(--danger)' }}>
                          <span>{res.status === 'pass' ? '✓' : res.status === 'warn' ? '⚠' : '✕'}</span>
                          <span>{res.text}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success-dark)' }}>{r.scholarship.amount}</span>
                      <a href={r.scholarship.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                        Apply Official Route <ArrowUpRight size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          {step < 4 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Next Step →</button>
          ) : (
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Review Modal Component
// ─────────────────────────────────────────────────────────────────────────────

interface AiReviewResult {
  completenessScore: number;
  strengths: string[];
  improvements: string[];
  suggestedActions: string[];
}

function AiReviewModal({
  isOpen,
  onClose,
  app,
  userId,
  notify,
}: {
  isOpen: boolean;
  onClose: () => void;
  app: Application | null;
  userId: string;
  notify: (msg: string, type?: Toast['type']) => void;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AiReviewResult | null>(null);
  const creditsState = getAiCredits(userId);

  if (!isOpen || !app) return null;

  function handleRunReview() {
    if (!app) return;
    setAnalyzing(true);
    const res = consumeAiCredits(userId, 25, `AI Application Review: ${app.school}`);
    if (!res.success) {
      notify(res.error || 'Insufficient AI credits', 'error');
      setAnalyzing(false);
      return;
    }

    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        completenessScore: readiness(app),
        strengths: [
          'Strong core transcripts and verified standardized test scores attached.',
          `Clear alignment with ${app.school}'s official requirement portal (${app.applicationPlatform || 'Common App'}).`
        ],
        improvements: [
          'Request a 2nd teacher recommendation letter to meet competitive institution threshold.',
          'Attach extracurricular leadership certificates to fulfill optional supplementary evidence.'
        ],
        suggestedActions: [
          'Link "National Science Olympiad" evidence to Academic Portfolio requirement.',
          'Review essay word count limit before final submission.'
        ]
      });
      notify('AI Application Review completed (-25 credits consumed)', 'success');
    }, 800);
  }

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div>
            <div className="modal-label">AI APPLICATION COPILOT</div>
            <h2 className="modal-title">AI Application Review — {app.school}</h2>
            <p className="modal-description">Copilot analysis of missing materials, clarity, structure, and evidence suggestions before official submission.</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* AI Credit Balance Header */}
          <div style={{ background: 'var(--bg-subtle)', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-light)' }}>AI CREDITS BALANCE</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>
                {creditsState.creditsRemaining} Credits Available
              </div>
            </div>
            <div className="badge badge-purple" style={{ fontSize: 11 }}>
              Review Session Cost: 25 Credits
            </div>
          </div>

          {!result && !analyzing && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <Sparkles size={32} color="var(--primary)" style={{ marginBottom: 10 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Ready to Review Application</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', maxWidth: 440, margin: '6px auto 16px' }}>
                Our AI Copilot will inspect your attached requirements, documents, and recommendation status against {app.school}&apos;s verified admissions profile.
              </p>
              <button className="btn btn-primary" onClick={handleRunReview} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Zap size={15} /> Run AI Application Review (-25 Credits)
              </button>
            </div>
          )}

          {analyzing && (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div className="spinner" style={{ margin: '0 auto 14px' }} />
              <h4 style={{ fontSize: 15, fontWeight: 700 }}>Analyzing Application Requirements & Evidence...</h4>
              <p style={{ fontSize: 12, color: 'var(--ink-light)' }}>Checking against verified institutional requirements.</p>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="card" style={{ padding: 12, background: 'var(--success-light)', border: '1px solid var(--success)' }}>
                <div style={{ fontWeight: 700, color: 'var(--success-dark)' }}>Application Completeness: {result.completenessScore}%</div>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Key Application Strengths</div>
                <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--ink)' }}>
                  {result.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: 'var(--warning-dark)' }}>Recommended Enhancements</div>
                <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--ink)' }}>
                  {result.improvements.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: 'var(--primary)' }}>Suggested Next Actions</div>
                <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--ink)' }}>
                  {result.suggestedActions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {result && (
            <button className="btn btn-primary" onClick={() => { notify('AI suggestions applied to checklist', 'success'); onClose(); }}>
              Apply Suggestions
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. Main Application Shell
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [user, setUser] = useState<UserType | null>(null);
  const [checking, setChecking] = useState(true);

  // App navigation state
  const [tab, setTab] = useState<AppTab>('overview');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Modals & Panels
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showWhatDoINeed, setShowWhatDoINeed] = useState(false);
  const [selectedDetailUni, setSelectedDetailUni] = useState<Institution | null>(null);
  const [compareList, setCompareList] = useState<Institution[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showScholarshipMatcher, setShowScholarshipMatcher] = useState(false);
  const [showAiReview, setShowAiReview] = useState(false);
  const [aiReviewApp, setAiReviewApp] = useState<Application | null>(null);

  // Evidence Picker modal state
  const [pickerTargetApp, setPickerTargetApp] = useState<Application | null>(null);
  const [pickerTargetReq, setPickerTargetReq] = useState<{ id: string; name: string } | null>(null);

  // Theme state & persistence
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('applyx-theme') as 'system' | 'light' | 'dark') || 'system';
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  function handleSetTheme(newTheme: 'system' | 'light' | 'dark') {
    setTheme(newTheme);
    localStorage.setItem('applyx-theme', newTheme);
    applyTheme(newTheme);
  }

  function applyTheme(t: 'system' | 'light' | 'dark') {
    if (typeof window === 'undefined') return;
    if (t === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (t === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setChecking(false);
  }, []);

  // Load user data
  useEffect(() => {
    if (!user) return;
    setApps(getApplications(user.id));
    setEvidence(getEvidence(user.id));
    setDeadlines(getDeadlines(user.id));
    setNotifications(getNotifications(user.id));
    setProfile(getProfile(user.id));
  }, [user]);

  function refreshAllData() {
    if (!user) return;
    setApps(getApplications(user.id));
    setEvidence(getEvidence(user.id));
    setDeadlines(getDeadlines(user.id));
    setNotifications(getNotifications(user.id));
  }

  // Keyboard shortcut: Cmd+K / Ctrl+K for Global Command Palette
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const notify = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  function handleOpenEvidencePicker(app: Application, req: { id: string; name: string }) {
    setPickerTargetApp(app);
    setPickerTargetReq(req);
  }

  function handleToggleCompare(inst: Institution) {
    if (compareList.some(c => c.name === inst.name)) {
      setCompareList(prev => prev.filter(c => c.name !== inst.name));
      notify(`Removed ${inst.name} from comparison`);
    } else {
      if (compareList.length >= 4) {
        notify('You can compare up to 4 institutions at a time', 'error');
        return;
      }
      setCompareList(prev => [...prev, inst]);
      notify(`Added ${inst.name} to comparison table`, 'success');
    }
  }

  function handleTrackInstitution(inst: Institution) {
    if (!user) return;
    const newApp = createApplication(user.id, {
      school: inst.name,
      program: inst.programs?.[0]?.name || 'Undergraduate Degree',
      deadline: inst.standardDeadlines.regularDecision || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      applicationStatus: 'preparing',
      requirements: [],
      officialLink: inst.admissionsUrl || inst.webPages?.[0],
      applicationPlatform: inst.applicationPlatform,
    });
    refreshAllData();
    setSelectedAppId(newApp.id);
    setTab('applications');
    notify(`Loaded ${inst.standardRequirements.length} verified requirements for ${inst.name}!`, 'success');
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 2 }} />
          <span style={{ fontSize: 13, color: 'var(--ink-4)' }}>Loading ApplyX…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuth={setUser} />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const mobileNavItems: { id: AppTab; icon: React.ReactNode; label: string }[] = [
    { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Overview' },
    { id: 'discover', icon: <Globe2 size={18} />, label: 'Discover' },
    { id: 'applications', icon: <BriefcaseBusiness size={18} />, label: 'Apps' },
    { id: 'scholarships', icon: <Award size={18} />, label: 'Scholarships' },
    { id: 'evidence', icon: <FolderOpen size={18} />, label: 'Evidence' },
  ];

  return (
    <>
      <div className="app-shell">
        <Sidebar
          tab={tab}
          setTab={t => setTab(t)}
          user={user}
          onLogout={() => { logout(); setUser(null); }}
        />

        <main className="main-content">
          {/* Topbar */}
          <header className="topbar">
            <button
              className="topbar-search-trigger"
              onClick={() => setShowCommandPalette(true)}
              aria-label="Global search command palette"
            >
              <Search size={14} aria-hidden />
              <span>Search institutions, vault, apps...</span>
              <span className="kbd-badge">⌘K</span>
            </button>

            <div className="topbar-actions" ref={notifRef}>
              <div style={{ position: 'relative' }}>
                <button
                  className="topbar-btn"
                  onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                  <Bell size={16} />
                  {unreadCount > 0 && <span className="notif-badge" aria-hidden />}
                </button>
                {showNotifications && (
                  <div className="notif-panel">
                    <div className="notif-header">
                      <span className="notif-header-title">Notifications</span>
                      {notifications.some(n => !n.read) && (
                        <button
                          className="btn-text"
                          style={{ fontSize: 11 }}
                          onClick={() => { markAllNotificationsRead(user.id); refreshAllData(); }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="notif-empty">No notifications yet</div>
                    ) : (
                      <div>
                        {notifications.slice(0, 8).map(n => (
                          <div
                            key={n.id}
                            className={`notif-item ${!n.read ? 'unread' : ''}`}
                            onClick={() => { markNotificationRead(user.id, n.id); refreshAllData(); }}
                          >
                            <div className="notif-message">{n.message}</div>
                            <div className="notif-time">{formatRelativeTime(n.createdAt)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                className="topbar-avatar"
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                aria-label={`Account menu for ${user.fullName}`}
                title={user.fullName}
              >
                {getInitials(user.fullName)}
              </button>

              {showUserMenu && (
                <div className="dropdown-menu">
                  <div style={{ padding: '9px 12px 7px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{user.fullName}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{user.email}</div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => { setTab('profile'); setShowUserMenu(false); }}>
                    <User size={13} /> Profile
                  </button>
                  <button className="dropdown-item" onClick={() => { setTab('settings'); setShowUserMenu(false); }}>
                    <Settings size={13} /> Settings
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={() => { logout(); setUser(null); }}>
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Tab Pages */}
          {tab === 'overview' && (
            <OverviewTab
              apps={apps}
              evidence={evidence}
              deadlines={deadlines}
              user={user}
              profile={profile}
              setTab={setTab}
              setSelectedAppId={setSelectedAppId}
              onOpenWhatDoINeed={() => setShowWhatDoINeed(true)}
            />
          )}

          {tab === 'applications' && (
            <ApplicationsTab
              apps={apps}
              evidence={evidence}
              userId={user.id}
              query=""
              notify={notify}
              onAppsChange={a => { setApps(a); setDeadlines(getDeadlines(user.id)); }}
              selectedAppId={selectedAppId}
              setSelectedAppId={setSelectedAppId}
              onOpenEvidencePicker={handleOpenEvidencePicker}
              onOpenAiReview={app => { setAiReviewApp(app); setShowAiReview(true); }}
            />
          )}

          {tab === 'evidence' && (
            <EvidenceTab
              evidence={evidence}
              apps={apps}
              userId={user.id}
              query=""
              notify={notify}
              onEvidenceChange={setEvidence}
              onSelectApp={setSelectedAppId}
              onNavigate={setTab}
            />
          )}

          {tab === 'discover' && (
            <DiscoverTab
              userId={user.id}
              notify={notify}
              onApplicationCreated={() => { refreshAllData(); setTab('applications'); }}
              onOpenDetail={setSelectedDetailUni}
              compareList={compareList}
              onToggleCompare={handleToggleCompare}
              onOpenCompareModal={() => setShowCompareModal(true)}
            />
          )}

          {tab === 'scholarships' && (
            <ScholarshipsTab
              userId={user.id}
              notify={notify}
              onOpenMatcher={() => setShowScholarshipMatcher(true)}
            />
          )}

          {tab === 'profile' && (
            <ProfileTab user={user} userId={user.id} notify={notify} />
          )}

          {tab === 'settings' && (
            <SettingsTab
              user={user}
              userId={user.id}
              onLogout={() => { logout(); setUser(null); }}
              notify={notify}
              theme={theme}
              onSetTheme={handleSetTheme}
            />
          )}
        </main>
      </div>

      {/* Mobile Tabbar (<768px) */}
      <nav className="mobile-tabbar" aria-label="Mobile Navigation">
        {mobileNavItems.map(item => (
          <button
            key={item.id}
            className={`mobile-tabbar-btn ${tab === item.id ? 'active' : ''}`}
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? 'page' : undefined}
            aria-label={item.label}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Global Modals */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={setTab}
        apps={apps}
        evidence={evidence}
        onSelectApp={setSelectedAppId}
        onOpenWhatDoINeed={() => setShowWhatDoINeed(true)}
      />

      <EvidencePicker
        isOpen={pickerTargetApp !== null && pickerTargetReq !== null}
        onClose={() => { setPickerTargetApp(null); setPickerTargetReq(null); }}
        targetApp={pickerTargetApp}
        targetReq={pickerTargetReq}
        evidence={evidence}
        userId={user.id}
        onAttached={() => { refreshAllData(); }}
        notify={notify}
      />

      <WhatDoINeedModal
        isOpen={showWhatDoINeed}
        onClose={() => setShowWhatDoINeed(false)}
        apps={apps}
        evidence={evidence}
        userId={user.id}
        onSelectApp={setSelectedAppId}
        onNavigate={setTab}
        onRefresh={refreshAllData}
        notify={notify}
      />

      <UniversityDetailModal
        institution={selectedDetailUni}
        onClose={() => setSelectedDetailUni(null)}
        onTrack={handleTrackInstitution}
        isSaved={selectedDetailUni ? isUniversitySaved(user.id, selectedDetailUni.name) : false}
        onToggleSave={inst => {
          if (isUniversitySaved(user.id, inst.name)) {
            unsaveUniversity(user.id, inst.name);
            notify('Removed from saved institutions');
          } else {
            saveUniversity(user.id, {
              universityName: inst.name,
              country: inst.country,
              city: inst.city,
              domain: inst.domains?.[0],
            });
            notify('University saved', 'success');
          }
          refreshAllData();
        }}
      />

      <CompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        selectedInstitutions={compareList}
        onRemove={id => setCompareList(prev => prev.filter(c => c.id !== id))}
        onTrack={handleTrackInstitution}
      />

      <ScholarshipMatcherModal
        isOpen={showScholarshipMatcher}
        onClose={() => setShowScholarshipMatcher(false)}
        profile={profile}
      />

      <AiReviewModal
        isOpen={showAiReview}
        onClose={() => { setShowAiReview(false); setAiReviewApp(null); }}
        app={aiReviewApp}
        userId={user.id}
        notify={notify}
      />

      <ToastContainer toasts={toasts} dismiss={dismissToast} />
    </>
  );
}
