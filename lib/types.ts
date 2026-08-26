export type RequirementStatus = 'done' | 'missing' | 'review';
export type Requirement = { id: number; name: string; status: RequirementStatus; category?: string; evidenceIds?: number[]; due?: string };
export type Evidence = { id: number; title: string; org: string; category: string; tags: string[]; description?: string };
export type Application = { id: number; school: string; program: string; deadline: string; sourceUrl?: string; requirements: Requirement[]; notes?: string };
export type University = { name: string; country: string; domains: string[]; web_pages: string[] };
