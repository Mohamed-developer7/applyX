// ─────────────────────────────────────────────
// ApplyX — Production Type System & Data Models
// ─────────────────────────────────────────────

export type RequirementStatus = 'done' | 'missing' | 'review' | 'waived';

export type ApplicationStatus =
  | 'researching'
  | 'interested'
  | 'preparing'
  | 'in_progress'
  | 'ready'
  | 'submitted'
  | 'under_review'
  | 'interview'
  | 'accepted'
  | 'rejected'
  | 'waitlisted'
  | 'withdrawn';

export type EvidenceCategory =
  | 'Academic'
  | 'Achievement'
  | 'Award'
  | 'Certificate'
  | 'Competition'
  | 'Leadership'
  | 'Project'
  | 'Publication'
  | 'Research'
  | 'Sport'
  | 'Technology'
  | 'Volunteering'
  | 'Work'
  | 'Other';

export type RequirementCategory =
  | 'Document'
  | 'Essay'
  | 'Recommendation'
  | 'Payment'
  | 'Test'
  | 'Interview'
  | 'Project'
  | 'Evidence'
  | 'Form'
  | 'Portfolio'
  | 'Other';

export type DegreeLevel = 'undergraduate' | 'postgraduate' | 'phd' | 'diploma' | 'certificate' | 'other';

export type EssayStatus = 'not_started' | 'draft' | 'review' | 'final';

export type RecommendationStatus = 'not_requested' | 'requested' | 'received' | 'attached';

// ─── User & Auth ───────────────────────────────
export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: string;
}

// ─── Profile ──────────────────────────────────
export interface Profile {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  nationality?: string;
  dateOfBirth?: string;
  bio?: string;
  targetDegree?: DegreeLevel;
  targetCountries?: string[];
  targetFields?: string[];
  currentGPA?: string;
  graduationYear?: string;
  isInternationalApplicant?: boolean;
  languages?: ProfileLanguage[];
  updatedAt: string;
}

export interface ProfileLanguage {
  language: string;
  level: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
}

// ─── Attached Evidence Reference ──────────────
export interface AttachedEvidence {
  evidenceId: string;
  title: string;
  category: EvidenceCategory;
  attachedAt: string;
}

// ─── Requirement (Instance) ───────────────────
export interface Requirement {
  id: string;
  name: string;
  status: RequirementStatus;
  category: RequirementCategory;
  required?: boolean;
  dueDate?: string;
  notes?: string;
  sourceUrl?: string;
  sourceInstitution?: string;
  lastVerifiedDate?: string;
  attachedEvidence?: AttachedEvidence[];
}

// ─── Essay Item ───────────────────────────────
export interface ApplicationEssay {
  id: string;
  applicationId: string;
  title: string;
  prompt?: string;
  wordCountLimit?: number;
  currentWordCount?: number;
  status: EssayStatus;
  content?: string;
  updatedAt: string;
}

// ─── Recommendation Item ──────────────────────
export interface ApplicationRecommendation {
  id: string;
  applicationId: string;
  recommenderName: string;
  recommenderRole: string; // e.g. Math Teacher, Research Supervisor
  recommenderEmail?: string;
  status: RecommendationStatus;
  requestedDate?: string;
  receivedDate?: string;
  reminderDate?: string;
  notes?: string;
}

// ─── Application ──────────────────────────────
export interface Application {
  id: string;
  userId: string;
  school: string;
  program: string;
  country?: string;
  degree?: DegreeLevel;
  applicationStatus: ApplicationStatus;
  deadline: string;
  sourceUrl?: string;
  requirements: Requirement[];
  essays?: ApplicationEssay[];
  recommendations?: ApplicationRecommendation[];
  notes?: string;
  tuitionFee?: string;
  scholarshipAvailable?: boolean;
  officialLink?: string;
  applicationPlatform?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  events?: ApplicationEvent[];
}

export interface ApplicationEvent {
  id: string;
  type: 'created' | 'status_changed' | 'requirement_done' | 'evidence_attached' | 'note_added' | 'document_uploaded' | 'deadline_added' | 'saved' | 'submitted';
  label: string;
  detail?: string;
  timestamp: string;
}

// ─── Evidence Vault Item ───────────────────────
export interface Evidence {
  id: string;
  userId: string;
  title: string;
  org: string;
  category: EvidenceCategory;
  tags: string[];
  description?: string;
  date?: string;
  verificationUrl?: string;
  fileRef?: string;
  linkedApplicationIds?: string[];
  linkedRequirementIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── University (Discovery & External) ────────
export interface University {
  name: string;
  country: string;
  domains: string[];
  web_pages: string[];
  alphaTwoCode?: string;
  stateProvince?: string | null;
  city?: string;
  applicationPlatform?: string;
  verifiedSource?: boolean;
  lastVerifiedDate?: string;
}

// ─── Deadline / Task ──────────────────────────
export interface Deadline {
  id: string;
  userId: string;
  label: string;
  applicationId?: string;
  applicationName?: string;
  date: string;
  type: 'application' | 'scholarship' | 'document' | 'test' | 'recommendation' | 'custom';
  done: boolean;
  createdAt: string;
}

// ─── Saved University / Program ───────────────
export interface SavedUniversity {
  id: string;
  userId: string;
  universityName: string;
  country: string;
  city?: string;
  domain?: string;
  savedAt: string;
  notes?: string;
}

// ─── Notification ─────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

// ─── AI Credits & Entitlement ──────────────────
export interface AiCreditState {
  creditsRemaining: number;
  totalCredits: number;
  sessionsUsed: number;
  history: { id: string; action: string; creditsUsed: number; date: string }[];
}

// ─── Task Item ────────────────────────────────
export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  applicationId?: string;
  applicationName?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  category: 'document' | 'essay' | 'recommendation' | 'test' | 'submission' | 'custom';
  completed: boolean;
  notes?: string;
  createdAt: string;
}

// ─── Complete App Store ───────────────────────
export interface AppStore {
  users: User[];
  sessions: Session[];
  profiles: Profile[];
  applications: Application[];
  evidence: Evidence[];
  deadlines: Deadline[];
  savedUniversities: SavedUniversity[];
  notifications: Notification[];
  aiCredits?: Record<string, AiCreditState>;
  tasks?: TaskItem[];
}

// ─── UI Constants ─────────────────────────────
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  researching: 'Researching',
  interested: 'Interested',
  preparing: 'Preparing',
  in_progress: 'In Progress',
  ready: 'Ready to Submit',
  submitted: 'Submitted',
  under_review: 'Under Review',
  interview: 'Interview',
  accepted: 'Accepted',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
  withdrawn: 'Withdrawn',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  researching: 'neutral',
  interested: 'blue',
  preparing: 'amber',
  in_progress: 'purple',
  ready: 'green',
  submitted: 'green',
  under_review: 'blue',
  interview: 'purple',
  accepted: 'success',
  rejected: 'red',
  waitlisted: 'amber',
  withdrawn: 'neutral',
};

export const DEGREE_LABELS: Record<DegreeLevel, string> = {
  undergraduate: 'Undergraduate',
  postgraduate: 'Postgraduate (Master’s)',
  phd: 'Doctoral (PhD)',
  diploma: 'Diploma',
  certificate: 'Certificate',
  other: 'Other',
};

export const EVIDENCE_CATEGORIES: EvidenceCategory[] = [
  'Academic',
  'Achievement',
  'Award',
  'Certificate',
  'Competition',
  'Leadership',
  'Project',
  'Publication',
  'Research',
  'Sport',
  'Technology',
  'Volunteering',
  'Work',
  'Other',
];

export const REQUIREMENT_CATEGORIES: RequirementCategory[] = [
  'Document',
  'Essay',
  'Recommendation',
  'Payment',
  'Test',
  'Interview',
  'Project',
  'Evidence',
  'Form',
  'Portfolio',
  'Other',
];
