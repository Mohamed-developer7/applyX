// ─────────────────────────────────────────────
// ApplyX — Intelligent Scoring & Gap Analysis
// Frictionless Multi-Application Autopilot Engine
// ─────────────────────────────────────────────

import type { Application, Evidence, Requirement } from './types';

// ─── Readiness score ──────────────────────────
export function readiness(app: Application): number {
  if (!app.requirements.length) return 0;
  const weights: Record<Requirement['status'], number> = {
    done: 1,
    review: 0.6,
    missing: 0,
    waived: 1,
  };
  const score = app.requirements.reduce((sum, r) => {
    // If requirement has attached evidence, treat as minimum 85% complete even before manual review
    if (r.attachedEvidence && r.attachedEvidence.length > 0 && r.status !== 'done') {
      return sum + 0.85;
    }
    return sum + weights[r.status];
  }, 0) / app.requirements.length;
  return Math.round(score * 100);
}

export function readinessBreakdown(app: Application) {
  const total = app.requirements.length;
  const done = app.requirements.filter(r => r.status === 'done' || r.status === 'waived').length;
  const review = app.requirements.filter(r => r.status === 'review').length;
  const missing = app.requirements.filter(r => r.status === 'missing' && (!r.attachedEvidence || r.attachedEvidence.length === 0)).length;
  return { total, done, review, missing, score: readiness(app) };
}

// ─── Keyword Tokenizer ────────────────────────
export function keywordTokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(x => x.length > 2)
  );
}

// ─── Evidence Matching ────────────────────────
export function evidenceMatches(requirement: Requirement, evidence: Evidence[]) {
  const req = keywordTokens(requirement.name + ' ' + (requirement.category || ''));
  return evidence
    .map(item => {
      const text = [item.title, item.org, item.category, item.description || '', ...item.tags].join(' ');
      const tokens = keywordTokens(text);
      let hits = 0;
      req.forEach(t => { if (tokens.has(t)) hits++; });

      const semanticBoost =
        /leadership|essay|statement|transcript|certificate|award|achievement|project|stem|math|research|sport|extracurricular/i.test(requirement.name) &&
        /leadership|transcript|certificate|award|achievement|project|stem|math|research|sport|extracurricular/i.test(text)
          ? 2 : 0;

      return {
        item,
        score: Math.min(100, Math.round(((hits + semanticBoost) / Math.max(2, req.size)) * 100)),
      };
    })
    .sort((a, b) => b.score - a.score);
}

// ─── Deadline Calculations ────────────────────
export function daysUntil(dateStr: string): number {
  if (!dateStr) return 999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDeadlineLabel(dateStr: string): string {
  if (!dateStr) return 'No deadline';
  const days = daysUntil(dateStr);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `${days} days left`;
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

// ─── Requirement Parser (Local Fallback) ──────
export function parseRequirements(text: string): string[] {
  const lines = text
    .split(/\r?\n|[•·]/)
    .map(x => x.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(Boolean);

  const hints = /(transcript|statement|essay|recommend|resume|cv|portfolio|fee|passport|photo|test|interview|demo|evidence|certificate|reference|cover letter|writing sample|gre|gmat|ielts|toefl|sat|act|supplemental)/i;
  const picked = lines.filter(x => hints.test(x) && x.length < 160);
  const unique = Array.from(new Set(picked));
  return unique.slice(0, 12).map(x => x.replace(/[:.]+$/, ''));
}

// ─── Gap Analysis & "What Do I Still Need?" ────
export interface ApplicationGap {
  type: 'missing_requirement' | 'incomplete_profile' | 'upcoming_deadline' | 'no_requirements' | 'reusable_evidence';
  label: string;
  detail: string;
  urgency: 'high' | 'medium' | 'low';
  appId?: string;
  appName?: string;
  reqId?: string;
  deadline?: string;
  suggestedEvidenceId?: string;
}

export function computeGaps(apps: Application[], profileComplete: boolean): ApplicationGap[] {
  const gaps: ApplicationGap[] = [];

  if (!profileComplete) {
    gaps.push({
      type: 'incomplete_profile',
      label: 'Complete applicant profile',
      detail: 'Personal, academic, and country preferences help pre-fill requirements.',
      urgency: 'medium',
    });
  }

  const activeApps = apps.filter(a =>
    !['accepted', 'rejected', 'withdrawn', 'submitted'].includes(a.applicationStatus)
  );

  for (const app of activeApps) {
    if (!app.requirements.length) {
      gaps.push({
        type: 'no_requirements',
        label: `Set up checklist for ${app.school}`,
        detail: 'No application requirements tracked yet.',
        urgency: 'medium',
        appId: app.id,
        appName: app.school,
      });
      continue;
    }

    const missing = app.requirements.filter(r => r.status === 'missing' && (!r.attachedEvidence || r.attachedEvidence.length === 0));
    const days = daysUntil(app.deadline);

    for (const req of missing.slice(0, 2)) {
      gaps.push({
        type: 'missing_requirement',
        label: req.name,
        detail: `Required for ${app.school} — ${app.program}`,
        urgency: days <= 7 ? 'high' : days <= 30 ? 'medium' : 'low',
        appId: app.id,
        appName: app.school,
        reqId: req.id,
        deadline: app.deadline,
      });
    }
  }

  return gaps.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.urgency] - order[b.urgency];
  });
}

// ─── Workspace-Wide Multi-Application Analysis ─
export interface WorkspaceAnalysis {
  totalApps: number;
  totalMissing: number;
  totalComplete: number;
  appsWithMissing: Array<{
    app: Application;
    missingCount: number;
    missingReqs: Requirement[];
  }>;
  commonMissingTypes: Array<{
    category: string;
    count: number;
    applicableApps: string[];
  }>;
  reusableOpportunities: Array<{
    evidenceItem: Evidence;
    matchingRequirements: Array<{
      appId: string;
      appName: string;
      reqId: string;
      reqName: string;
    }>;
  }>;
}

export function analyzeWorkspaceNeeds(apps: Application[], evidence: Evidence[]): WorkspaceAnalysis {
  const activeApps = apps.filter(a => !['accepted', 'rejected', 'withdrawn', 'submitted'].includes(a.applicationStatus));
  let totalMissing = 0;
  let totalComplete = 0;

  const appsWithMissing: WorkspaceAnalysis['appsWithMissing'] = [];
  const categoryCounts: Record<string, { count: number; apps: Set<string> }> = {};

  for (const app of activeApps) {
    const missingReqs = app.requirements.filter(r => r.status === 'missing' && (!r.attachedEvidence || r.attachedEvidence.length === 0));
    const completeReqs = app.requirements.filter(r => r.status === 'done' || (r.attachedEvidence && r.attachedEvidence.length > 0));
    totalMissing += missingReqs.length;
    totalComplete += completeReqs.length;

    if (missingReqs.length > 0) {
      appsWithMissing.push({
        app,
        missingCount: missingReqs.length,
        missingReqs,
      });

      missingReqs.forEach(r => {
        const cat = r.category || 'Document';
        if (!categoryCounts[cat]) {
          categoryCounts[cat] = { count: 0, apps: new Set() };
        }
        categoryCounts[cat].count++;
        categoryCounts[cat].apps.add(app.school);
      });
    }
  }

  const commonMissingTypes = Object.entries(categoryCounts)
    .map(([category, data]) => ({
      category,
      count: data.count,
      applicableApps: Array.from(data.apps),
    }))
    .sort((a, b) => b.count - a.count);

  // Identify reusable evidence opportunities
  const reusableOpportunities: WorkspaceAnalysis['reusableOpportunities'] = [];

  for (const item of evidence) {
    const matchedTargets: Array<{ appId: string; appName: string; reqId: string; reqName: string }> = [];

    for (const app of activeApps) {
      for (const req of app.requirements) {
        if (req.status !== 'done' && (!req.attachedEvidence || !req.attachedEvidence.some(a => a.evidenceId === item.id))) {
          const match = evidenceMatches(req, [item])[0];
          if (match && match.score >= 50) {
            matchedTargets.push({
              appId: app.id,
              appName: app.school,
              reqId: req.id,
              reqName: req.name,
            });
          }
        }
      }
    }

    if (matchedTargets.length > 0) {
      reusableOpportunities.push({
        evidenceItem: item,
        matchingRequirements: matchedTargets,
      });
    }
  }

  return {
    totalApps: activeApps.length,
    totalMissing,
    totalComplete,
    appsWithMissing,
    commonMissingTypes,
    reusableOpportunities,
  };
}
