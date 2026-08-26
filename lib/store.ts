// ─────────────────────────────────────────────
// ApplyX — Unified Data Store & CRUD Operations
// Requirement ↔ Evidence Relationships & Cross-Application Linking
// ─────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import type {
  AiCreditState,
  AppStore,
  Application,
  ApplicationEvent,
  ApplicationStatus,
  Deadline,
  Evidence,
  Notification,
  Profile,
  Requirement,
  RequirementStatus,
  SavedUniversity,
} from './types';
import { findInstitutionByName } from './university-data';

const STORE_KEY = 'applyx-store-v1';

const EMPTY_STORE: AppStore = {
  users: [],
  sessions: [],
  profiles: [],
  applications: [],
  evidence: [],
  deadlines: [],
  savedUniversities: [],
  notifications: [],
};

// ─── Store Read / Write ─────────────────────────
export function getStore(): AppStore {
  if (typeof window === 'undefined') return EMPTY_STORE;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return EMPTY_STORE;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_STORE, ...parsed };
  } catch {
    return EMPTY_STORE;
  }
}

export function setStore(store: AppStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

// ─── Profile CRUD ─────────────────────────────
export function getProfile(userId: string): Profile | null {
  const store = getStore();
  return store.profiles.find(p => p.userId === userId) ?? null;
}

export function upsertProfile(profile: Profile): void {
  const store = getStore();
  const existing = store.profiles.findIndex(p => p.userId === profile.userId);
  const updated = existing >= 0
    ? store.profiles.map((p, i) => i === existing ? { ...p, ...profile, updatedAt: new Date().toISOString() } : p)
    : [...store.profiles, { ...profile, updatedAt: new Date().toISOString() }];
  setStore({ ...store, profiles: updated });
}

// ─── Application CRUD ─────────────────────────
export function getApplications(userId: string): Application[] {
  const store = getStore();
  return store.applications
    .filter(a => a.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getApplication(userId: string, appId: string): Application | null {
  const store = getStore();
  return store.applications.find(a => a.id === appId && a.userId === userId) ?? null;
}

export function createApplication(
  userId: string,
  data: Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'events'>
): Application {
  const store = getStore();
  const now = new Date().toISOString();

  // If user didn't provide custom requirements, look up canonical institutional requirements!
  let requirements = data.requirements || [];
  let officialPlatform = data.applicationPlatform;
  let officialLink = data.officialLink;

  if (requirements.length === 0) {
    const matchedInst = findInstitutionByName(data.school);
    if (matchedInst) {
      if (!officialPlatform) officialPlatform = matchedInst.applicationPlatform;
      if (!officialLink) officialLink = matchedInst.admissionsUrl;
      requirements = matchedInst.standardRequirements.map(canon => ({
        id: uuidv4(),
        name: canon.name,
        category: canon.category,
        status: 'missing',
        required: canon.required,
        sourceUrl: canon.sourceUrl,
        sourceInstitution: canon.sourceInstitution,
        lastVerifiedDate: canon.lastVerifiedDate,
        notes: canon.description,
      }));
    }
  }

  const app: Application = {
    ...data,
    id: uuidv4(),
    userId,
    requirements,
    applicationPlatform: officialPlatform,
    officialLink,
    applicationStatus: data.applicationStatus || 'preparing',
    createdAt: now,
    updatedAt: now,
    events: [{
      id: uuidv4(),
      type: 'created',
      label: 'Application workspace created',
      detail: `${data.school} — ${data.program}`,
      timestamp: now,
    }],
  };

  setStore({ ...store, applications: [app, ...store.applications] });
  return app;
}

export function updateApplication(userId: string, appId: string, data: Partial<Application>): Application | null {
  const store = getStore();
  const idx = store.applications.findIndex(a => a.id === appId && a.userId === userId);
  if (idx < 0) return null;

  const updated = {
    ...store.applications[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const apps = store.applications.map((a, i) => i === idx ? updated : a);
  setStore({ ...store, applications: apps });
  return updated;
}

export function deleteApplication(userId: string, appId: string): void {
  const store = getStore();
  setStore({
    ...store,
    applications: store.applications.filter(a => !(a.id === appId && a.userId === userId)),
    deadlines: store.deadlines.filter(d => !(d.applicationId === appId && d.userId === userId)),
  });
}

export function updateApplicationStatus(userId: string, appId: string, status: ApplicationStatus): Application | null {
  const store = getStore();
  const app = store.applications.find(a => a.id === appId && a.userId === userId);
  if (!app) return null;

  const event: ApplicationEvent = {
    id: uuidv4(),
    type: 'status_changed',
    label: 'Status updated',
    detail: `Changed to ${status.replace('_', ' ')}`,
    timestamp: new Date().toISOString(),
  };

  return updateApplication(userId, appId, {
    applicationStatus: status,
    events: [...(app.events ?? []), event],
  });
}

// ─── Requirement CRUD & Evidence Attachment ────
export function updateRequirement(
  userId: string,
  appId: string,
  reqId: string,
  status: RequirementStatus
): Application | null {
  const store = getStore();
  const app = store.applications.find(a => a.id === appId && a.userId === userId);
  if (!app) return null;

  const req = app.requirements.find(r => r.id === reqId);
  if (!req) return null;

  const updatedReqs = app.requirements.map(r =>
    r.id === reqId ? { ...r, status } : r
  );

  const event: ApplicationEvent = {
    id: uuidv4(),
    type: 'requirement_done',
    label: status === 'done' ? 'Requirement completed' : 'Requirement status updated',
    detail: req.name,
    timestamp: new Date().toISOString(),
  };

  return updateApplication(userId, appId, {
    requirements: updatedReqs,
    events: [...(app.events ?? []), event],
  });
}

export function attachEvidenceToRequirement(
  userId: string,
  appId: string,
  reqId: string,
  evidenceId: string
): Application | null {
  const store = getStore();
  const app = store.applications.find(a => a.id === appId && a.userId === userId);
  const evidenceItem = store.evidence.find(e => e.id === evidenceId && e.userId === userId);
  if (!app || !evidenceItem) return null;

  const req = app.requirements.find(r => r.id === reqId);
  if (!req) return null;

  const currentAttachments = req.attachedEvidence || [];
  if (currentAttachments.some(a => a.evidenceId === evidenceId)) {
    return app; // already attached
  }

  const newAttachment = {
    evidenceId,
    title: evidenceItem.title,
    category: evidenceItem.category,
    attachedAt: new Date().toISOString(),
  };

  const updatedReqs = app.requirements.map(r =>
    r.id === reqId
      ? {
          ...r,
          status: 'done' as RequirementStatus,
          attachedEvidence: [...(r.attachedEvidence || []), newAttachment],
        }
      : r
  );

  const updatedEvidence = store.evidence.map(e =>
    e.id === evidenceId
      ? {
          ...e,
          linkedApplicationIds: Array.from(new Set([...(e.linkedApplicationIds || []), appId])),
          linkedRequirementIds: Array.from(new Set([...(e.linkedRequirementIds || []), reqId])),
        }
      : e
  );

  const event: ApplicationEvent = {
    id: uuidv4(),
    type: 'evidence_attached',
    label: 'Evidence attached to requirement',
    detail: `${evidenceItem.title} → ${req.name}`,
    timestamp: new Date().toISOString(),
  };

  setStore({ ...store, evidence: updatedEvidence });

  return updateApplication(userId, appId, {
    requirements: updatedReqs,
    events: [...(app.events ?? []), event],
  });
}

export function detachEvidenceFromRequirement(
  userId: string,
  appId: string,
  reqId: string,
  evidenceId: string
): Application | null {
  const store = getStore();
  const app = store.applications.find(a => a.id === appId && a.userId === userId);
  if (!app) return null;

  const updatedReqs = app.requirements.map(r => {
    if (r.id === reqId) {
      const remaining = (r.attachedEvidence || []).filter(a => a.evidenceId !== evidenceId);
      return {
        ...r,
        status: (remaining.length === 0 ? 'missing' : r.status) as RequirementStatus,
        attachedEvidence: remaining,
      };
    }
    return r;
  });

  return updateApplication(userId, appId, { requirements: updatedReqs });
}

export function addRequirement(userId: string, appId: string, req: Omit<Requirement, 'id'>): Application | null {
  const store = getStore();
  const app = store.applications.find(a => a.id === appId && a.userId === userId);
  if (!app) return null;

  const newReq: Requirement = { ...req, id: uuidv4() };
  return updateApplication(userId, appId, {
    requirements: [...app.requirements, newReq],
  });
}

export function deleteRequirement(userId: string, appId: string, reqId: string): Application | null {
  const store = getStore();
  const app = store.applications.find(a => a.id === appId && a.userId === userId);
  if (!app) return null;

  return updateApplication(userId, appId, {
    requirements: app.requirements.filter(r => r.id !== reqId),
  });
}

// ─── Evidence CRUD ────────────────────────────
export function getEvidence(userId: string): Evidence[] {
  const store = getStore();
  return store.evidence
    .filter(e => e.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function createEvidence(
  userId: string,
  data: Omit<Evidence, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Evidence {
  const store = getStore();
  const now = new Date().toISOString();
  const item: Evidence = {
    ...data,
    id: uuidv4(),
    userId,
    createdAt: now,
    updatedAt: now,
  };
  setStore({ ...store, evidence: [item, ...store.evidence] });
  return item;
}

export function updateEvidence(userId: string, evidenceId: string, data: Partial<Evidence>): Evidence | null {
  const store = getStore();
  const idx = store.evidence.findIndex(e => e.id === evidenceId && e.userId === userId);
  if (idx < 0) return null;

  const updated = {
    ...store.evidence[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  setStore({
    ...store,
    evidence: store.evidence.map((e, i) => i === idx ? updated : e),
  });

  return updated;
}

export function deleteEvidence(userId: string, evidenceId: string): void {
  const store = getStore();
  const updatedApps = store.applications.map(app => ({
    ...app,
    requirements: app.requirements.map(req => ({
      ...req,
      attachedEvidence: (req.attachedEvidence || []).filter(a => a.evidenceId !== evidenceId),
    })),
  }));

  setStore({
    ...store,
    applications: updatedApps,
    evidence: store.evidence.filter(e => !(e.id === evidenceId && e.userId === userId)),
  });
}

// ─── Deadlines CRUD ───────────────────────────
export function getDeadlines(userId: string): Deadline[] {
  const store = getStore();
  return store.deadlines
    .filter(d => d.userId === userId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function createDeadline(userId: string, data: Omit<Deadline, 'id' | 'userId' | 'createdAt'>): Deadline {
  const store = getStore();
  const deadline: Deadline = {
    ...data,
    id: uuidv4(),
    userId,
    createdAt: new Date().toISOString(),
  };
  setStore({ ...store, deadlines: [deadline, ...store.deadlines] });
  return deadline;
}

export function deleteDeadline(userId: string, deadlineId: string): void {
  const store = getStore();
  setStore({
    ...store,
    deadlines: store.deadlines.filter(d => !(d.id === deadlineId && d.userId === userId)),
  });
}

// ─── Saved Universities ───────────────────────
export function getSavedUniversities(userId: string): SavedUniversity[] {
  const store = getStore();
  return store.savedUniversities
    .filter(s => s.userId === userId)
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export function saveUniversity(userId: string, data: Omit<SavedUniversity, 'id' | 'userId' | 'savedAt'>): SavedUniversity {
  const store = getStore();
  const existing = store.savedUniversities.find(
    s => s.userId === userId && s.universityName === data.universityName
  );
  if (existing) return existing;

  const saved: SavedUniversity = {
    ...data,
    id: uuidv4(),
    userId,
    savedAt: new Date().toISOString(),
  };
  setStore({ ...store, savedUniversities: [saved, ...store.savedUniversities] });
  return saved;
}

export function unsaveUniversity(userId: string, universityName: string): void {
  const store = getStore();
  setStore({
    ...store,
    savedUniversities: store.savedUniversities.filter(
      s => !(s.userId === userId && s.universityName === universityName)
    ),
  });
}

export function isUniversitySaved(userId: string, universityName: string): boolean {
  const store = getStore();
  return store.savedUniversities.some(
    s => s.userId === userId && s.universityName === universityName
  );
}

// ─── Notifications ────────────────────────────
export function getNotifications(userId: string): Notification[] {
  const store = getStore();
  return store.notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addNotification(userId: string, message: string, link?: string): void {
  const store = getStore();
  const notification: Notification = {
    id: uuidv4(),
    userId,
    message,
    read: false,
    link,
    createdAt: new Date().toISOString(),
  };
  setStore({ ...store, notifications: [notification, ...store.notifications] });
}

export function markNotificationRead(userId: string, notifId: string): void {
  const store = getStore();
  setStore({
    ...store,
    notifications: store.notifications.map(n =>
      n.id === notifId && n.userId === userId ? { ...n, read: true } : n
    ),
  });
}

export function markAllNotificationsRead(userId: string): void {
  const store = getStore();
  setStore({
    ...store,
    notifications: store.notifications.map(n =>
      n.userId === userId ? { ...n, read: true } : n
    ),
  });
}

// ─── Deadline Urgency ─────────────────────────
export function deadlineUrgency(dateStr: string): { label: string; level: 'overdue' | 'critical' | 'soon' | 'upcoming' | 'future' } {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, level: 'overdue' };
  if (diffDays === 0) return { label: 'Due today', level: 'critical' };
  if (diffDays === 1) return { label: 'Due tomorrow', level: 'critical' };
  if (diffDays <= 7) return { label: `${diffDays} days left`, level: 'soon' };
  if (diffDays <= 30) return { label: `${diffDays} days left`, level: 'upcoming' };
  return { label: new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), level: 'future' };
}

// ─── AI Credits & Entitlement ──────────────────
export function getAiCredits(userId: string): AiCreditState {
  const store = getStore();
  const userCredits = store.aiCredits?.[userId];
  if (userCredits) return userCredits;

  const defaultState: AiCreditState = {
    creditsRemaining: 50,
    totalCredits: 50,
    sessionsUsed: 0,
    history: [],
  };
  setStore({
    ...store,
    aiCredits: {
      ...(store.aiCredits || {}),
      [userId]: defaultState,
    },
  });
  return defaultState;
}

export function consumeAiCredits(
  userId: string,
  amount: number,
  actionName: string
): { success: boolean; creditsRemaining: number; error?: string } {
  const current = getAiCredits(userId);
  if (current.creditsRemaining < amount) {
    return {
      success: false,
      creditsRemaining: current.creditsRemaining,
      error: `Insufficient AI credits (${current.creditsRemaining} available, ${amount} required). Upgrade or wait for refill.`,
    };
  }

  const updated: AiCreditState = {
    ...current,
    creditsRemaining: current.creditsRemaining - amount,
    sessionsUsed: current.sessionsUsed + 1,
    history: [
      {
        id: uuidv4(),
        action: actionName,
        creditsUsed: amount,
        date: new Date().toISOString(),
      },
      ...current.history,
    ],
  };

  const store = getStore();
  setStore({
    ...store,
    aiCredits: {
      ...(store.aiCredits || {}),
      [userId]: updated,
    },
  });

  return { success: true, creditsRemaining: updated.creditsRemaining };
}

// ─── Batch Reusable Evidence Attachment ────────
export function batchAttachEvidenceToApplications(
  userId: string,
  evidenceId: string,
  requirementKeyword: string
): { attachedCount: number; appNames: string[] } {
  const store = getStore();
  const ev = store.evidence.find(e => e.id === evidenceId && e.userId === userId);
  if (!ev) return { attachedCount: 0, appNames: [] };

  const keyword = requirementKeyword.toLowerCase();
  const userApps = store.applications.filter(a => a.userId === userId);
  const updatedAppNames: string[] = [];
  let totalCount = 0;

  const updatedApps = userApps.map(app => {
    let appModified = false;
    const updatedReqs = app.requirements.map(req => {
      if (req.name.toLowerCase().includes(keyword) || req.category.toLowerCase().includes(keyword)) {
        const alreadyAttached = req.attachedEvidence?.some(a => a.evidenceId === evidenceId);
        if (!alreadyAttached) {
          appModified = true;
          totalCount++;
          const attachedItem = {
            evidenceId: ev.id,
            title: ev.title,
            category: ev.category,
            attachedAt: new Date().toISOString(),
          };
          return {
            ...req,
            status: req.status === 'missing' ? 'review' as RequirementStatus : req.status,
            attachedEvidence: [...(req.attachedEvidence || []), attachedItem],
          };
        }
      }
      return req;
    });

    if (appModified) {
      updatedAppNames.push(app.school);
      return {
        ...app,
        requirements: updatedReqs,
        updatedAt: new Date().toISOString(),
      };
    }
    return app;
  });

  setStore({
    ...store,
    applications: store.applications.map(a => updatedApps.find(u => u.id === a.id) || a),
  });

  return { attachedCount: totalCount, appNames: updatedAppNames };
}
