import { Application, Evidence, Requirement } from './types';

export function readiness(app: Application) {
  if (!app.requirements.length) return 0;
  const weights: Record<Requirement['status'], number> = { done: 1, review: 0.55, missing: 0 };
  const score = app.requirements.reduce((sum, r) => sum + weights[r.status], 0) / app.requirements.length;
  return Math.round(score * 100);
}

export function keywordTokens(value: string) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(x => x.length > 2));
}

export function evidenceMatches(requirement: Requirement, evidence: Evidence[]) {
  const req = keywordTokens(requirement.name + ' ' + (requirement.category || ''));
  return evidence.map(item => {
    const text = [item.title, item.org, item.category, item.description || '', ...item.tags].join(' ');
    const tokens = keywordTokens(text);
    let hits = 0;
    req.forEach(t => { if (tokens.has(t)) hits++; });
    const semanticBoost = /leadership|essay|achievement|project|technology|stem|teamwork|experience/i.test(requirement.name) && /leadership|technology|stem|teamwork|project/i.test(text) ? 1 : 0;
    return { item, score: Math.min(100, Math.round(((hits + semanticBoost) / Math.max(2, req.size)) * 100)) };
  }).sort((a,b)=>b.score-a.score);
}

export function nextAction(apps: Application[]) {
  const ranked = apps.flatMap(app => app.requirements.filter(r => r.status !== 'done').map(r => ({app,r})))
    .sort((a,b) => {
      const score = (r: Requirement) => r.status === 'missing' ? 2 : 1;
      return score(b.r) - score(a.r);
    });
  if (!ranked.length) return { label:'Review your submitted applications', app:'All applications' };
  return { label:`Complete ${ranked[0].r.name}`, app:ranked[0].app.school };
}

export function parseRequirements(text: string): string[] {
  const lines = text.split(/\r?\n|[•·]/).map(x => x.replace(/^[-*\d.)\s]+/, '').trim()).filter(Boolean);
  const hints = /(transcript|statement|essay|recommend|resume|cv|portfolio|fee|passport|photo|test|interview|demo|evidence|certificate|reference|cover letter)/i;
  const picked = lines.filter(x => hints.test(x) && x.length < 140);
  const unique = Array.from(new Set(picked));
  return unique.slice(0, 10).map(x => x.replace(/[:.]+$/, ''));
}
