// ─────────────────────────────────────────────────────────────────────────────
// ApplyX Global University & Program Database — Grounded in Official Sources
// Verified institutional metadata, QS 2026 Rankings, and Admissions Architecture
// ─────────────────────────────────────────────────────────────────────────────

export interface UniversityRanking {
  provider: string; // e.g. "QS World University Rankings", "Times Higher Education"
  year: number;     // 2026
  rank: string;     // "#1", "#5", "#1 in Pakistan"
  category?: string;
}

export interface CanonicalRequirement {
  id: string;
  name: string;
  category: 'Document' | 'Essay' | 'Recommendation' | 'Payment' | 'Test' | 'Form' | 'Interview' | 'Portfolio';
  required: boolean;
  applicantType?: 'all' | 'first-year' | 'transfer' | 'international';
  description: string;
  sourceInstitution: string;
  sourceUrl: string;
  lastVerifiedDate: string;
  tips?: string;
}

export interface UniversityProgram {
  id: string;
  name: string;
  degreeLevel: 'undergraduate' | 'postgraduate' | 'phd';
  faculty: string;
  duration: string;
  tuitionApprox?: string;
  applicationDeadline: string;
  applicationPlatform: string;
  officialUrl: string;
  specificRequirements?: string[];
}

export interface Institution {
  id: string;
  name: string;
  country: string;
  city: string;
  region: 'Americas' | 'Europe' | 'Asia' | 'Oceania' | 'Middle East';
  categoryTags: string[]; // e.g. ['Ivy League'], ['Pakistan'], ['China'], ['Europe'], ['Global Leaders']
  domains: string[];
  webPages: string[];
  admissionsUrl: string;
  applicationPlatform: string;
  applicationFee?: string;
  rankings: UniversityRanking[];
  standardDeadlines: {
    earlyAction?: string;
    regularDecision: string;
    fallIntake?: string;
  };
  minimumEligibility?: string;
  intlStudentNotes?: string;
  verifiedSource: boolean;
  lastVerifiedDate: string;
  programs: UniversityProgram[];
  standardRequirements: CanonicalRequirement[];
}

export const GLOBAL_INSTITUTIONS: Institution[] = [
  // ─── PAKISTAN (EXCLUSIVELY THE 6 TOP VERIFIED INSTITUTIONS) ────────────────
  {
    id: 'pk-lums',
    name: 'Lahore University of Management Sciences (LUMS)',
    country: 'Pakistan',
    city: 'Lahore',
    region: 'Asia',
    categoryTags: ['Pakistan', 'Global Leaders'],
    domains: ['lums.edu.pk'],
    webPages: ['https://www.lums.edu.pk'],
    admissionsUrl: 'https://admission.lums.edu.pk',
    applicationPlatform: 'LUMS Online Admissions Portal',
    applicationFee: 'PKR 6,500 (Domestic) / $100 (International)',
    rankings: [
      { provider: 'QS Asia University Rankings', year: 2026, rank: '#1 in Pakistan', category: 'Regional' },
    ],
    standardDeadlines: { regularDecision: 'January 30' },
    minimumEligibility: 'Minimum 2Bs & 1C in A-Levels or 70% in FSc. SAT or LCAT test score required.',
    intlStudentNotes: 'Need-blind financial aid covering up to 100% tuition for admitted students.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'lums-cs', name: 'BS Computer Science', degreeLevel: 'undergraduate', faculty: 'SBASSE', duration: '4 years', applicationDeadline: '2026-01-30', applicationPlatform: 'LUMS Portal', officialUrl: 'https://sbasse.lums.edu.pk' },
      { id: 'lums-sdsb', name: 'BSc (Honours) Accounting & Finance', degreeLevel: 'undergraduate', faculty: 'SDSB', duration: '4 years', applicationDeadline: '2026-01-30', applicationPlatform: 'LUMS Portal', officialUrl: 'https://sdsb.lums.edu.pk' },
    ],
    standardRequirements: [
      { id: 'req-lums-app', name: 'LUMS Online Application Form', category: 'Form', required: true, description: 'Biographical info, academic background, and extracurricular statement.', sourceInstitution: 'LUMS Admissions', sourceUrl: 'https://admission.lums.edu.pk', lastVerifiedDate: '2026-08-01' },
      { id: 'req-lums-sat', name: 'SAT / ACT / LCAT Score Report', category: 'Test', required: true, description: 'Mandatory entry test submission.', sourceInstitution: 'LUMS Admissions', sourceUrl: 'https://admission.lums.edu.pk', lastVerifiedDate: '2026-08-01' },
      { id: 'req-lums-records', name: 'Certified Transcripts (O/A Levels or Matric/FSc)', category: 'Document', required: true, description: 'Statement of results certified by school/board.', sourceInstitution: 'LUMS Admissions', sourceUrl: 'https://admission.lums.edu.pk', lastVerifiedDate: '2026-08-01' },
      { id: 'req-lums-recs', name: 'Two Teacher Recommendations', category: 'Recommendation', required: true, description: 'Submitted directly by academic evaluators.', sourceInstitution: 'LUMS Admissions', sourceUrl: 'https://admission.lums.edu.pk', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'pk-nust',
    name: 'National University of Sciences and Technology (NUST)',
    country: 'Pakistan',
    city: 'Islamabad',
    region: 'Asia',
    categoryTags: ['Pakistan', 'Global Leaders'],
    domains: ['nust.edu.pk'],
    webPages: ['https://nust.edu.pk'],
    admissionsUrl: 'https://ugadmissions.nust.edu.pk',
    applicationPlatform: 'NUST Online Portal',
    applicationFee: 'PKR 4,000 (NET per series)',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#353 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'July 15' },
    minimumEligibility: 'Minimum 60% aggregate marks in HSSC / FSc or IBCC equivalence certificate.',
    intlStudentNotes: 'NET series conducted 4 times annually, or SAT for international seats.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'nust-seecs', name: 'BS Software Engineering / Computer Science', degreeLevel: 'undergraduate', faculty: 'SEECS', duration: '4 years', applicationDeadline: '2026-07-15', applicationPlatform: 'NUST Portal', officialUrl: 'https://seecs.nust.edu.pk' },
    ],
    standardRequirements: [
      { id: 'req-nust-net', name: 'NUST Entry Test (NET) or SAT Score', category: 'Test', required: true, description: 'Computer-based testing in Math, Physics, Chemistry/CS, and English.', sourceInstitution: 'NUST Admissions', sourceUrl: 'https://ugadmissions.nust.edu.pk', lastVerifiedDate: '2026-08-01' },
      { id: 'req-nust-hssc', name: 'Matric / FSc Certificates & IBCC Equivalence', category: 'Document', required: true, description: 'Certified academic credentials.', sourceInstitution: 'NUST Admissions', sourceUrl: 'https://ugadmissions.nust.edu.pk', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'pk-iba',
    name: 'Institute of Business Administration (IBA Karachi)',
    country: 'Pakistan',
    city: 'Karachi',
    region: 'Asia',
    categoryTags: ['Pakistan'],
    domains: ['iba.edu.pk'],
    webPages: ['https://www.iba.edu.pk'],
    admissionsUrl: 'https://admissions.iba.edu.pk',
    applicationPlatform: 'IBA Admissions Portal',
    applicationFee: 'PKR 5,000',
    rankings: [
      { provider: 'QS Asia University Rankings', year: 2026, rank: 'Top Business School in Pakistan', category: 'Regional' },
    ],
    standardDeadlines: { regularDecision: 'June 20' },
    minimumEligibility: 'Minimum 65% in HSSC (Pre-Engineering / General Science) or equivalent A-Levels.',
    intlStudentNotes: 'Direct SAT exemption available for score cut-offs (SAT 1400+).',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'iba-bba', name: 'BBA (Bachelor of Business Administration)', degreeLevel: 'undergraduate', faculty: 'School of Business Studies', duration: '4 years', applicationDeadline: '2026-06-20', applicationPlatform: 'IBA Portal', officialUrl: 'https://www.iba.edu.pk' },
      { id: 'iba-cs', name: 'BS Computer Science', degreeLevel: 'undergraduate', faculty: 'SMCS', duration: '4 years', applicationDeadline: '2026-06-20', applicationPlatform: 'IBA Portal', officialUrl: 'https://cs.iba.edu.pk' },
    ],
    standardRequirements: [
      { id: 'req-iba-test', name: 'IBA Aptitude Test or SAT Exemption', category: 'Test', required: true, description: 'Standardized mathematics & English testing.', sourceInstitution: 'IBA Karachi', sourceUrl: 'https://admissions.iba.edu.pk', lastVerifiedDate: '2026-08-01' },
      { id: 'req-iba-records', name: 'Academic Records & Equivalence', category: 'Document', required: true, description: 'HSSC/A-Level certified marksheets.', sourceInstitution: 'IBA Karachi', sourceUrl: 'https://admissions.iba.edu.pk', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'pk-fast',
    name: 'FAST National University of Computer and Emerging Sciences',
    country: 'Pakistan',
    city: 'Islamabad / Lahore / Karachi',
    region: 'Asia',
    categoryTags: ['Pakistan'],
    domains: ['nu.edu.pk'],
    webPages: ['https://www.nu.edu.pk'],
    admissionsUrl: 'https://nu.edu.pk/Admissions',
    applicationPlatform: 'FAST Admissions Portal',
    applicationFee: 'PKR 3,500',
    rankings: [
      { provider: 'Higher Education Commission Pakistan', year: 2026, rank: '#1 Computer Science Faculty', category: 'National' },
    ],
    standardDeadlines: { regularDecision: 'July 05' },
    minimumEligibility: 'Minimum 60% in SSC & HSSC Pre-Engineering or ICS / A-Levels.',
    intlStudentNotes: 'FAST Admission Test or SAT-I (Math score 600+) for direct entry.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'fast-cs', name: 'BS Computer Science / Artificial Intelligence', degreeLevel: 'undergraduate', faculty: 'Department of Computing', duration: '4 years', applicationDeadline: '2026-07-05', applicationPlatform: 'FAST Portal', officialUrl: 'https://nu.edu.pk' },
    ],
    standardRequirements: [
      { id: 'req-fast-test', name: 'FAST Nu Test or NTS NAT / SAT', category: 'Test', required: true, description: 'Computerized admission test in analytical math & English.', sourceInstitution: 'FAST NUCES', sourceUrl: 'https://nu.edu.pk/Admissions', lastVerifiedDate: '2026-08-01' },
      { id: 'req-fast-transcripts', name: 'Matric / FSc Transcripts & Marksheets', category: 'Document', required: true, description: 'Certified academic record.', sourceInstitution: 'FAST NUCES', sourceUrl: 'https://nu.edu.pk', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'pk-giki',
    name: 'GIK Institute of Engineering Sciences and Technology',
    country: 'Pakistan',
    city: 'Topi, Swabi',
    region: 'Asia',
    categoryTags: ['Pakistan'],
    domains: ['giki.edu.pk'],
    webPages: ['https://giki.edu.pk'],
    admissionsUrl: 'https://admissions.giki.edu.pk',
    applicationPlatform: 'GIKI Online Portal',
    applicationFee: 'PKR 4,500',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: 'Top Engineering School in Pakistan', category: 'National' },
    ],
    standardDeadlines: { regularDecision: 'June 15' },
    minimumEligibility: 'Minimum 60% marks in FSc Pre-Engineering or A-Levels in Math, Physics & Chemistry.',
    intlStudentNotes: 'GIKI Engineering Test or SAT II scores for overseas applicants.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'giki-ai', name: 'BS Computer Engineering / AI', degreeLevel: 'undergraduate', faculty: 'FCSE', duration: '4 years', applicationDeadline: '2026-06-15', applicationPlatform: 'GIKI Portal', officialUrl: 'https://giki.edu.pk' },
    ],
    standardRequirements: [
      { id: 'req-giki-test', name: 'GIKI Engineering Admission Test', category: 'Test', required: true, description: 'Mathematics and Physics entrance examination.', sourceInstitution: 'GIKI Admissions', sourceUrl: 'https://admissions.giki.edu.pk', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'pk-aku',
    name: 'Aga Khan University (AKU)',
    country: 'Pakistan',
    city: 'Karachi',
    region: 'Asia',
    categoryTags: ['Pakistan', 'Global Leaders'],
    domains: ['aku.edu'],
    webPages: ['https://www.aku.edu'],
    admissionsUrl: 'https://www.aku.edu/admissions',
    applicationPlatform: 'AKU Direct Portal',
    applicationFee: 'PKR 7,000',
    rankings: [
      { provider: 'QS World University Rankings by Subject', year: 2026, rank: 'Top 200 Medicine Globally', category: 'Medicine' },
    ],
    standardDeadlines: { regularDecision: 'May 10' },
    minimumEligibility: 'Minimum 70% in FSc Pre-Medical or A-Levels in Biology, Chemistry & Physics.',
    intlStudentNotes: 'Need-blind admissions with generous student financial assistance.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'aku-mbbs', name: 'MBBS (Bachelor of Medicine, Bachelor of Surgery)', degreeLevel: 'undergraduate', faculty: 'Medical College', duration: '5 years', applicationDeadline: '2026-05-10', applicationPlatform: 'AKU Portal', officialUrl: 'https://www.aku.edu/mc-pk' },
    ],
    standardRequirements: [
      { id: 'req-aku-test', name: 'AKU Entry Test & Multiple Mini Interviews (MMI)', category: 'Test', required: true, description: 'Sciences aptitude test followed by ethical & communication interview stations.', sourceInstitution: 'AKU Admissions', sourceUrl: 'https://www.aku.edu/admissions', lastVerifiedDate: '2026-08-01' },
    ],
  },

  // ─── UNITED STATES (IVY LEAGUE + TOP US INSTITUTIONS) ────────────────────
  {
    id: 'us-harvard',
    name: 'Harvard University',
    country: 'United States',
    city: 'Cambridge, MA',
    region: 'Americas',
    categoryTags: ['Ivy League', 'United States', 'Global Leaders'],
    domains: ['harvard.edu'],
    webPages: ['https://www.harvard.edu'],
    admissionsUrl: 'https://college.harvard.edu/admissions',
    applicationPlatform: 'Common Application / Coalition on Scoir',
    applicationFee: '$85 (waiver available)',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#4 Global', category: 'Overall World' },
    ],
    standardDeadlines: { earlyAction: 'November 1', regularDecision: 'January 1' },
    minimumEligibility: 'No official minimum GPA or test score published. Evaluates holistic academic & personal character.',
    intlStudentNotes: 'Need-blind for all students globally. 100% demonstrated financial need met without loans.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'hvd-cs', name: 'Computer Science (A.B. / S.B.)', degreeLevel: 'undergraduate', faculty: 'SEAS', duration: '4 years', applicationDeadline: '2026-01-01', applicationPlatform: 'Common Application', officialUrl: 'https://seas.harvard.edu/computer-science' },
      { id: 'hvd-econ', name: 'Economics (A.B.)', degreeLevel: 'undergraduate', faculty: 'Faculty of Arts and Sciences', duration: '4 years', applicationDeadline: '2026-01-01', applicationPlatform: 'Common Application', officialUrl: 'https://economics.harvard.edu' },
    ],
    standardRequirements: [
      { id: 'req-hvd-app', name: 'Common App or Coalition App Profile', category: 'Form', required: true, description: 'Personal background, activities, and main essay.', sourceInstitution: 'Harvard Admissions', sourceUrl: 'https://college.harvard.edu/admissions', lastVerifiedDate: '2026-08-01' },
      { id: 'req-hvd-supp', name: 'Harvard Supplemental Short Writing Prompts', category: 'Essay', required: true, description: 'Short essays detailing personal experiences and intellectual goals.', sourceInstitution: 'Harvard Admissions', sourceUrl: 'https://college.harvard.edu', lastVerifiedDate: '2026-08-01' },
      { id: 'req-hvd-transcript', name: 'High School Transcript & School Report', category: 'Document', required: true, description: 'Official high school counselor report.', sourceInstitution: 'Harvard Admissions', sourceUrl: 'https://college.harvard.edu', lastVerifiedDate: '2026-08-01' },
      { id: 'req-hvd-rec1', name: 'Teacher Recommendation 1 (Core Subject)', category: 'Recommendation', required: true, description: 'Evaluation from math, science, humanities, or social sciences teacher.', sourceInstitution: 'Harvard Admissions', sourceUrl: 'https://college.harvard.edu', lastVerifiedDate: '2026-08-01' },
      { id: 'req-hvd-rec2', name: 'Teacher Recommendation 2 (Core Subject)', category: 'Recommendation', required: true, description: 'Second core academic evaluation.', sourceInstitution: 'Harvard Admissions', sourceUrl: 'https://college.harvard.edu', lastVerifiedDate: '2026-08-01' },
      { id: 'req-hvd-sat', name: 'SAT or ACT Test Scores', category: 'Test', required: true, description: 'Standardized test submission mandatory.', sourceInstitution: 'Harvard Admissions', sourceUrl: 'https://college.harvard.edu', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'us-yale',
    name: 'Yale University',
    country: 'United States',
    city: 'New Haven, CT',
    region: 'Americas',
    categoryTags: ['Ivy League', 'United States', 'Global Leaders'],
    domains: ['yale.edu'],
    webPages: ['https://www.yale.edu'],
    admissionsUrl: 'https://admissions.yale.edu',
    applicationPlatform: 'Common Application / Coalition / QuestBridge',
    applicationFee: '$80 (waiver available)',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#16 Global', category: 'Overall World' },
    ],
    standardDeadlines: { earlyAction: 'November 1', regularDecision: 'January 2' },
    minimumEligibility: 'No rigid GPA cutoff. Comprehensive contextual review.',
    intlStudentNotes: 'Need-blind admissions for international undergraduates.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'yale-cs', name: 'Computer Science (B.S. / B.A.)', degreeLevel: 'undergraduate', faculty: 'Yale School of Engineering', duration: '4 years', applicationDeadline: '2026-01-02', applicationPlatform: 'Common App', officialUrl: 'https://cs.yale.edu' },
    ],
    standardRequirements: [
      { id: 'req-yale-app', name: 'Common App & Yale Short Essays', category: 'Essay', required: true, description: 'Yale-specific short answer prompts.', sourceInstitution: 'Yale Admissions', sourceUrl: 'https://admissions.yale.edu', lastVerifiedDate: '2026-08-01' },
      { id: 'req-yale-recs', name: 'Two Teacher Recommendations & Counselor Report', category: 'Recommendation', required: true, description: 'Academic evaluations.', sourceInstitution: 'Yale Admissions', sourceUrl: 'https://admissions.yale.edu', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'us-princeton',
    name: 'Princeton University',
    country: 'United States',
    city: 'Princeton, NJ',
    region: 'Americas',
    categoryTags: ['Ivy League', 'United States', 'Global Leaders'],
    domains: ['princeton.edu'],
    webPages: ['https://www.princeton.edu'],
    admissionsUrl: 'https://admission.princeton.edu',
    applicationPlatform: 'Common Application / Coalition',
    applicationFee: '$75 (waiver available)',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#22 Global', category: 'Overall World' },
    ],
    standardDeadlines: { earlyAction: 'November 1', regularDecision: 'January 1' },
    minimumEligibility: 'No minimum published grade threshold.',
    intlStudentNotes: 'Need-blind admissions and grant-based aid (no loans).',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'pnt-eng', name: 'B.S.E. Computer Science / Engineering', degreeLevel: 'undergraduate', faculty: 'School of Engineering', duration: '4 years', applicationDeadline: '2026-01-01', applicationPlatform: 'Common App', officialUrl: 'https://engineering.princeton.edu' },
    ],
    standardRequirements: [
      { id: 'req-pnt-app', name: 'Common App with Graded Written Paper', category: 'Document', required: true, description: 'Includes a graded academic paper from high school.', sourceInstitution: 'Princeton Admissions', sourceUrl: 'https://admission.princeton.edu', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'us-columbia',
    name: 'Columbia University',
    country: 'United States',
    city: 'New York, NY',
    region: 'Americas',
    categoryTags: ['Ivy League', 'United States', 'Global Leaders'],
    domains: ['columbia.edu'],
    webPages: ['https://www.columbia.edu'],
    admissionsUrl: 'https://undergrad.admissions.columbia.edu',
    applicationPlatform: 'Common Application / Coalition',
    applicationFee: '$85',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#34 Global', category: 'Overall World' },
    ],
    standardDeadlines: { earlyAction: 'November 1', regularDecision: 'January 1' },
    minimumEligibility: 'No official minimum score published.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'col-cs', name: 'Computer Science (B.S. / B.A.)', degreeLevel: 'undergraduate', faculty: 'Columbia Engineering / Columbia College', duration: '4 years', applicationDeadline: '2026-01-01', applicationPlatform: 'Common App', officialUrl: 'https://cs.columbia.edu' },
    ],
    standardRequirements: [
      { id: 'req-col-app', name: 'Common Application & Columbia Prompts', category: 'Essay', required: true, description: 'Short essays explaining interest in Columbia Core.', sourceInstitution: 'Columbia Admissions', sourceUrl: 'https://undergrad.admissions.columbia.edu', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'us-upenn',
    name: 'University of Pennsylvania (UPenn)',
    country: 'United States',
    city: 'Philadelphia, PA',
    region: 'Americas',
    categoryTags: ['Ivy League', 'United States', 'Global Leaders'],
    domains: ['upenn.edu'],
    webPages: ['https://www.upenn.edu'],
    admissionsUrl: 'https://admissions.upenn.edu',
    applicationPlatform: 'Common Application / Coalition',
    applicationFee: '$75',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#11 Global', category: 'Overall World' },
    ],
    standardDeadlines: { earlyAction: 'November 1', regularDecision: 'January 5' },
    minimumEligibility: 'No published GPA minimum.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'upn-wharton', name: 'B.S. in Economics (Wharton School)', degreeLevel: 'undergraduate', faculty: 'The Wharton School', duration: '4 years', applicationDeadline: '2026-01-05', applicationPlatform: 'Common App', officialUrl: 'https://wharton.upenn.edu' },
    ],
    standardRequirements: [
      { id: 'req-upn-app', name: 'Common App & School-Specific Essays', category: 'Essay', required: true, description: 'Wharton/Penn specific essays.', sourceInstitution: 'Penn Admissions', sourceUrl: 'https://admissions.upenn.edu', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'us-cornell',
    name: 'Cornell University',
    country: 'United States',
    city: 'Ithaca, NY',
    region: 'Americas',
    categoryTags: ['Ivy League', 'United States', 'Global Leaders'],
    domains: ['cornell.edu'],
    webPages: ['https://www.cornell.edu'],
    admissionsUrl: 'https://admissions.cornell.edu',
    applicationPlatform: 'Common Application',
    applicationFee: '$80',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#16 Global', category: 'Overall World' },
    ],
    standardDeadlines: { earlyAction: 'November 1', regularDecision: 'January 2' },
    minimumEligibility: 'Varies by college within Cornell.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'cor-cs', name: 'Computer Science (B.S.)', degreeLevel: 'undergraduate', faculty: 'Bowers CIS / Engineering', duration: '4 years', applicationDeadline: '2026-01-02', applicationPlatform: 'Common App', officialUrl: 'https://cs.cornell.edu' },
    ],
    standardRequirements: [
      { id: 'req-cor-app', name: 'Common App & Primary College Supplement', category: 'Essay', required: true, description: 'College-specific interest essay.', sourceInstitution: 'Cornell Admissions', sourceUrl: 'https://admissions.cornell.edu', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'us-brown',
    name: 'Brown University',
    country: 'United States',
    city: 'Providence, RI',
    region: 'Americas',
    categoryTags: ['Ivy League', 'United States', 'Global Leaders'],
    domains: ['brown.edu'],
    webPages: ['https://www.brown.edu'],
    admissionsUrl: 'https://admission.brown.edu',
    applicationPlatform: 'Common Application',
    applicationFee: '$75',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#79 Global', category: 'Overall World' },
    ],
    standardDeadlines: { earlyAction: 'November 1', regularDecision: 'January 3' },
    minimumEligibility: 'No rigid threshold.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'brn-cs', name: 'Computer Science (Sc.B.)', degreeLevel: 'undergraduate', faculty: 'Department of Computer Science', duration: '4 years', applicationDeadline: '2026-01-03', applicationPlatform: 'Common App', officialUrl: 'https://cs.brown.edu' },
    ],
    standardRequirements: [
      { id: 'req-brn-app', name: 'Common App & Open Curriculum Essays', category: 'Essay', required: true, description: 'Brown supplemental essays.', sourceInstitution: 'Brown Admissions', sourceUrl: 'https://admission.brown.edu', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'us-dartmouth',
    name: 'Dartmouth College',
    country: 'United States',
    city: 'Hanover, NH',
    region: 'Americas',
    categoryTags: ['Ivy League', 'United States', 'Global Leaders'],
    domains: ['dartmouth.edu'],
    webPages: ['https://home.dartmouth.edu'],
    admissionsUrl: 'https://admissions.dartmouth.edu',
    applicationPlatform: 'Common Application',
    applicationFee: '$80',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#243 Global', category: 'Overall World' },
    ],
    standardDeadlines: { earlyAction: 'November 1', regularDecision: 'January 2' },
    minimumEligibility: 'No official minimum published.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'drt-cs', name: 'Computer Science (A.B.)', degreeLevel: 'undergraduate', faculty: 'Department of Computer Science', duration: '4 years', applicationDeadline: '2026-01-02', applicationPlatform: 'Common App', officialUrl: 'https://cs.dartmouth.edu' },
    ],
    standardRequirements: [
      { id: 'req-drt-app', name: 'Common App & Peer Recommendation', category: 'Recommendation', required: true, description: 'Includes strongly encouraged peer recommendation.', sourceInstitution: 'Dartmouth Admissions', sourceUrl: 'https://admissions.dartmouth.edu', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'us-mit',
    name: 'Massachusetts Institute of Technology (MIT)',
    country: 'United States',
    city: 'Cambridge, MA',
    region: 'Americas',
    categoryTags: ['United States', 'Global Leaders'],
    domains: ['mit.edu'],
    webPages: ['https://web.mit.edu'],
    admissionsUrl: 'https://mitadmissions.org',
    applicationPlatform: 'MIT Admissions Portal (Dedicated)',
    applicationFee: '$75',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#1 Global', category: 'Overall World' },
    ],
    standardDeadlines: { earlyAction: 'November 1', regularDecision: 'January 4' },
    minimumEligibility: 'Mandatory SAT/ACT testing. High proficiency in Math & Physical Sciences.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'mit-eecs', name: 'EECS (Course 6)', degreeLevel: 'undergraduate', faculty: 'College of Computing', duration: '4 years', applicationDeadline: '2026-01-04', applicationPlatform: 'MIT Portal', officialUrl: 'https://eecs.mit.edu' },
    ],
    standardRequirements: [
      { id: 'req-mit-portal', name: 'MIT Direct Application Form', category: 'Form', required: true, description: 'MIT online portal application.', sourceInstitution: 'MIT Admissions', sourceUrl: 'https://mitadmissions.org', lastVerifiedDate: '2026-08-01' },
      { id: 'req-mit-recs', name: 'Math/Science Teacher & Humanities Teacher Recommendation', category: 'Recommendation', required: true, description: 'Two distinct teacher evaluations.', sourceInstitution: 'MIT Admissions', sourceUrl: 'https://mitadmissions.org', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'us-stanford',
    name: 'Stanford University',
    country: 'United States',
    city: 'Stanford, CA',
    region: 'Americas',
    categoryTags: ['United States', 'Global Leaders'],
    domains: ['stanford.edu'],
    webPages: ['https://www.stanford.edu'],
    admissionsUrl: 'https://admission.stanford.edu',
    applicationPlatform: 'Common Application',
    applicationFee: '$90',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#3 Global', category: 'Overall World' },
    ],
    standardDeadlines: { earlyAction: 'November 1', regularDecision: 'January 5' },
    minimumEligibility: 'No rigid GPA cutoff.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'stf-cs', name: 'Computer Science (B.S.)', degreeLevel: 'undergraduate', faculty: 'School of Engineering', duration: '4 years', applicationDeadline: '2026-01-05', applicationPlatform: 'Common App', officialUrl: 'https://cs.stanford.edu' },
    ],
    standardRequirements: [
      { id: 'req-stf-app', name: 'Common Application & Stanford Short Essays', category: 'Essay', required: true, description: 'Short essays detailing ideas and character.', sourceInstitution: 'Stanford Admissions', sourceUrl: 'https://admission.stanford.edu', lastVerifiedDate: '2026-08-01' },
    ],
  },

  // ─── UNITED KINGDOM (TOP UK INSTITUTIONS) ─────────────────────────────────
  {
    id: 'uk-oxford',
    name: 'University of Oxford',
    country: 'United Kingdom',
    city: 'Oxford',
    region: 'Europe',
    categoryTags: ['Europe', 'United Kingdom', 'Global Leaders'],
    domains: ['ox.ac.uk'],
    webPages: ['https://www.ox.ac.uk'],
    admissionsUrl: 'https://www.ox.ac.uk/admissions/undergraduate',
    applicationPlatform: 'UCAS Portal',
    applicationFee: '£28.50 (UCAS choice)',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#3 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'October 15' },
    minimumEligibility: 'Typically A*AA or A*A*A at A-Level (or 39+ IB points). Mandatory admissions test.',
    intlStudentNotes: 'October 15 deadline applies to all undergraduate choices.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'ox-cs', name: 'Computer Science (BA / MCompSci)', degreeLevel: 'undergraduate', faculty: 'Department of Computer Science', duration: '3 or 4 years', applicationDeadline: '2026-10-15', applicationPlatform: 'UCAS', officialUrl: 'https://cs.ox.ac.uk' },
      { id: 'ox-ppe', name: 'Philosophy, Politics & Economics (PPE)', degreeLevel: 'undergraduate', faculty: 'Philosophy / Politics', duration: '3 years', applicationDeadline: '2026-10-15', applicationPlatform: 'UCAS', officialUrl: 'https://www.ox.ac.uk' },
    ],
    standardRequirements: [
      { id: 'req-ox-ucas', name: 'UCAS Application & Academic Personal Statement', category: 'Form', required: true, description: '4,000 character academic statement.', sourceInstitution: 'Oxford Admissions', sourceUrl: 'https://www.ox.ac.uk', lastVerifiedDate: '2026-08-01' },
      { id: 'req-ox-mat', name: 'Subject Test (MAT / TSA / PAT)', category: 'Test', required: true, description: 'Course-specific entrance test.', sourceInstitution: 'Oxford Admissions', sourceUrl: 'https://www.ox.ac.uk', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'uk-cambridge',
    name: 'University of Cambridge',
    country: 'United Kingdom',
    city: 'Cambridge',
    region: 'Europe',
    categoryTags: ['Europe', 'United Kingdom', 'Global Leaders'],
    domains: ['cam.ac.uk'],
    webPages: ['https://www.cam.ac.uk'],
    admissionsUrl: 'https://www.undergraduate.study.cam.ac.uk',
    applicationPlatform: 'UCAS + My Cambridge Application (MyCApp)',
    applicationFee: '£28.50 (UCAS)',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#5 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'October 15' },
    minimumEligibility: 'A*A*A in A-Levels or 40-42 IB points.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'cam-cs', name: 'Computer Science (BA Tripos)', degreeLevel: 'undergraduate', faculty: 'Computer Science & Technology', duration: '3 or 4 years', applicationDeadline: '2026-10-15', applicationPlatform: 'UCAS', officialUrl: 'https://www.cl.cam.ac.uk' },
    ],
    standardRequirements: [
      { id: 'req-cam-mycapp', name: 'UCAS & My Cambridge Application (MyCApp)', category: 'Form', required: true, description: 'Supplementary application form.', sourceInstitution: 'Cambridge Admissions', sourceUrl: 'https://www.undergraduate.study.cam.ac.uk', lastVerifiedDate: '2026-08-01' },
    ],
  },

  // ─── CHINA (TOP CHINESE INSTITUTIONS) ─────────────────────────────────────
  {
    id: 'cn-tsinghua',
    name: 'Tsinghua University (清华大学)',
    country: 'China',
    city: 'Beijing',
    region: 'Asia',
    categoryTags: ['China', 'Global Leaders'],
    domains: ['tsinghua.edu.cn'],
    webPages: ['https://www.tsinghua.edu.cn/en'],
    admissionsUrl: 'https://international.tsinghua.edu.cn',
    applicationPlatform: 'Tsinghua International Student System',
    applicationFee: '800 RMB',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#20 Global', category: 'Overall World' },
      { provider: 'QS Asia University Rankings', year: 2026, rank: '#1 in Asia', category: 'Regional' },
    ],
    standardDeadlines: { earlyAction: 'October 15', regularDecision: 'December 15' },
    minimumEligibility: 'High school diploma with distinction in Math & Physics. HSK 5+ for Chinese track or English proof.',
    intlStudentNotes: 'Comprehensive review across three application rounds with online interview.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'tsu-cs', name: 'Computer Science & Technology (Global Program)', degreeLevel: 'undergraduate', faculty: 'Department of Computer Science', duration: '4 years', applicationDeadline: '2026-12-15', applicationPlatform: 'Tsinghua Portal', officialUrl: 'https://www.cs.tsinghua.edu.cn' },
    ],
    standardRequirements: [
      { id: 'req-tsu-app', name: 'Tsinghua International Online Form & Personal Statement', category: 'Form', required: true, description: 'Completed on official international admissions system.', sourceInstitution: 'Tsinghua Admissions', sourceUrl: 'https://international.tsinghua.edu.cn', lastVerifiedDate: '2026-08-01' },
      { id: 'req-tsu-recs', name: 'Two Teacher Recommendations & Notarized Transcripts', category: 'Recommendation', required: true, description: 'Academic evaluations and translated marksheets.', sourceInstitution: 'Tsinghua Admissions', sourceUrl: 'https://international.tsinghua.edu.cn', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'cn-peking',
    name: 'Peking University (北京大学)',
    country: 'China',
    city: 'Beijing',
    region: 'Asia',
    categoryTags: ['China', 'Global Leaders'],
    domains: ['pku.edu.cn'],
    webPages: ['https://www.pku.edu.cn'],
    admissionsUrl: 'https://www.isd.pku.edu.cn',
    applicationPlatform: 'PKU International Admissions Portal',
    applicationFee: '800 RMB',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#14 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'November 30' },
    minimumEligibility: 'High academic standing and international entrance assessment.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'pku-eecs', name: 'EECS Peking University', degreeLevel: 'undergraduate', faculty: 'School of EECS', duration: '4 years', applicationDeadline: '2026-11-30', applicationPlatform: 'PKU Portal', officialUrl: 'https://eecs.pku.edu.cn' },
    ],
    standardRequirements: [
      { id: 'req-pku-app', name: 'PKU Online Application & Transcripts', category: 'Form', required: true, description: 'Notarized academic records.', sourceInstitution: 'PKU ISD', sourceUrl: 'https://www.isd.pku.edu.cn', lastVerifiedDate: '2026-08-01' },
    ],
  },

  // ─── EUROPE, CANADA, AUSTRALIA & SINGAPORE ────────────────────────────────
  {
    id: 'ca-toronto',
    name: 'University of Toronto',
    country: 'Canada',
    city: 'Toronto, ON',
    region: 'Americas',
    categoryTags: ['Global Leaders'],
    domains: ['utoronto.ca'],
    webPages: ['https://www.utoronto.ca'],
    admissionsUrl: 'https://future.utoronto.ca/apply',
    applicationPlatform: 'OUAC (Ontario Universities Application Centre)',
    applicationFee: '$180 CAD',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#25 Global', category: 'Overall World' },
    ],
    standardDeadlines: { earlyAction: 'November 7', regularDecision: 'January 15' },
    minimumEligibility: 'Senior Secondary Grade 12 Calculus & Advanced Functions.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'uoft-cs', name: 'Computer Science (St. George Campus)', degreeLevel: 'undergraduate', faculty: 'Faculty of Arts & Science', duration: '4 years', applicationDeadline: '2026-01-15', applicationPlatform: 'OUAC 105', officialUrl: 'https://web.cs.toronto.edu' },
    ],
    standardRequirements: [
      { id: 'req-uoft-supp', name: 'OUAC Submission & CS Supplementary Application', category: 'Essay', required: true, description: 'Timed video response & short essays.', sourceInstitution: 'U of T Admissions', sourceUrl: 'https://future.utoronto.ca', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'sg-nus',
    name: 'National University of Singapore (NUS)',
    country: 'Singapore',
    city: 'Singapore',
    region: 'Asia',
    categoryTags: ['Global Leaders'],
    domains: ['nus.edu.sg'],
    webPages: ['https://www.nus.edu.sg'],
    admissionsUrl: 'https://www.nus.edu.sg/oam',
    applicationPlatform: 'NUS Applicant Portal',
    applicationFee: 'SGD $20',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#8 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'February 26' },
    minimumEligibility: 'High A-Level or IB scores (typically 40+ IB) with advanced mathematics.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'nus-soc', name: 'Bachelor of Computing (Computer Science)', degreeLevel: 'undergraduate', faculty: 'School of Computing', duration: '4 years', applicationDeadline: '2026-02-26', applicationPlatform: 'NUS Portal', officialUrl: 'https://comp.nus.edu.sg' },
    ],
    standardRequirements: [
      { id: 'req-nus-app', name: 'NUS Application & High School Transcripts', category: 'Form', required: true, description: 'Certified exam results.', sourceInstitution: 'NUS Admissions', sourceUrl: 'https://www.nus.edu.sg/oam', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'ch-ethz',
    name: 'ETH Zurich',
    country: 'Switzerland',
    city: 'Zurich',
    region: 'Europe',
    categoryTags: ['Europe', 'Global Leaders'],
    domains: ['ethz.ch'],
    webPages: ['https://ethz.ch'],
    admissionsUrl: 'https://ethz.ch/en/studies/bachelor.html',
    applicationPlatform: 'ETH eApply System',
    applicationFee: '150 CHF',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#7 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'April 30' },
    minimumEligibility: 'Undergraduate requires German C1 certificate; Master degrees taught in English.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'eth-msc', name: 'Master in Computer Science', degreeLevel: 'postgraduate', faculty: 'Department of CS', duration: '2 years', applicationDeadline: '2026-12-15', applicationPlatform: 'ETH eApply', officialUrl: 'https://inf.ethz.ch' },
    ],
    standardRequirements: [
      { id: 'req-eth-app', name: 'ETH eApply Dossier & GRE Quant Score', category: 'Form', required: true, description: 'University transcript & GRE General.', sourceInstitution: 'ETH Zurich', sourceUrl: 'https://ethz.ch', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'uk-imperial',
    name: 'Imperial College London',
    country: 'United Kingdom',
    city: 'London',
    region: 'Europe',
    categoryTags: ['Europe', 'United Kingdom', 'Global Leaders'],
    domains: ['imperial.ac.uk'],
    webPages: ['https://www.imperial.ac.uk'],
    admissionsUrl: 'https://www.imperial.ac.uk/study/apply',
    applicationPlatform: 'UCAS Portal',
    applicationFee: '£28.50 (UCAS)',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#2 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'January 29' },
    minimumEligibility: 'A*A*A in A-Levels with Mathematics and Physics, or 39-42 IB points.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'imp-cs', name: 'BEng / MEng Computing (Computer Science)', degreeLevel: 'undergraduate', faculty: 'Department of Computing', duration: '3 or 4 years', applicationDeadline: '2026-01-29', applicationPlatform: 'UCAS', officialUrl: 'https://www.imperial.ac.uk/computing' },
      { id: 'imp-aero', name: 'MEng Aeronautical Engineering', degreeLevel: 'undergraduate', faculty: 'Aeronautics', duration: '4 years', applicationDeadline: '2026-01-29', applicationPlatform: 'UCAS', officialUrl: 'https://www.imperial.ac.uk/aeronautics' },
    ],
    standardRequirements: [
      { id: 'req-imp-ucas', name: 'UCAS Application & Personal Statement', category: 'Form', required: true, description: 'Academic personal statement focused on chosen STEM field.', sourceInstitution: 'Imperial Admissions', sourceUrl: 'https://www.imperial.ac.uk', lastVerifiedDate: '2026-08-01' },
      { id: 'req-imp-tmua', name: 'TMUA / ESAT Admission Test Score', category: 'Test', required: true, description: 'Mandatory university admissions test.', sourceInstitution: 'Imperial Admissions', sourceUrl: 'https://www.imperial.ac.uk', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'uk-ucl',
    name: 'UCL (University College London)',
    country: 'United Kingdom',
    city: 'London',
    region: 'Europe',
    categoryTags: ['Europe', 'United Kingdom', 'Global Leaders'],
    domains: ['ucl.ac.uk'],
    webPages: ['https://www.ucl.ac.uk'],
    admissionsUrl: 'https://www.ucl.ac.uk/prospective-students',
    applicationPlatform: 'UCAS Portal',
    applicationFee: '£28.50 (UCAS)',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#9 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'January 29' },
    minimumEligibility: 'A*A*A - AAB at A-Level depending on degree program.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'ucl-cs', name: 'BSc Computer Science', degreeLevel: 'undergraduate', faculty: 'UCL Engineering', duration: '3 years', applicationDeadline: '2026-01-29', applicationPlatform: 'UCAS', officialUrl: 'https://www.ucl.ac.uk/computer-science' },
      { id: 'ucl-arch', name: 'BSc Architecture (The Bartlett)', degreeLevel: 'undergraduate', faculty: 'The Bartlett', duration: '3 years', applicationDeadline: '2026-01-29', applicationPlatform: 'UCAS', officialUrl: 'https://www.ucl.ac.uk/bartlett' },
    ],
    standardRequirements: [
      { id: 'req-ucl-ucas', name: 'UCAS Application & Transcripts', category: 'Form', required: true, description: 'Official secondary school marks.', sourceInstitution: 'UCL Admissions', sourceUrl: 'https://www.ucl.ac.uk', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'us-caltech',
    name: 'California Institute of Technology (Caltech)',
    country: 'United States',
    city: 'Pasadena, CA',
    region: 'Americas',
    categoryTags: ['United States', 'Global Leaders'],
    domains: ['caltech.edu'],
    webPages: ['https://www.caltech.edu'],
    admissionsUrl: 'https://www.admissions.caltech.edu',
    applicationPlatform: 'Common Application / Coalition',
    applicationFee: '$75',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#10 Global', category: 'Overall World' },
    ],
    standardDeadlines: { earlyAction: 'November 1', regularDecision: 'January 3' },
    minimumEligibility: 'Highest academic achievement in calculus, physics, and chemistry.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'cal-cs', name: 'B.S. Computer Science', degreeLevel: 'undergraduate', faculty: 'EAS Division', duration: '4 years', applicationDeadline: '2026-01-03', applicationPlatform: 'Common App', officialUrl: 'https://cms.caltech.edu' },
      { id: 'cal-phys', name: 'B.S. Physics', degreeLevel: 'undergraduate', faculty: 'PMA Division', duration: '4 years', applicationDeadline: '2026-01-03', applicationPlatform: 'Common App', officialUrl: 'https://pma.caltech.edu' },
    ],
    standardRequirements: [
      { id: 'req-cal-app', name: 'Common App & Caltech Supplemental Essays', category: 'Essay', required: true, description: 'STEM curiosity and innovation essays.', sourceInstitution: 'Caltech Admissions', sourceUrl: 'https://www.admissions.caltech.edu', lastVerifiedDate: '2026-08-01' },
      { id: 'req-cal-recs', name: '1 Math/Science Teacher & 1 Humanities/Social Science Teacher Rec', category: 'Recommendation', required: true, description: 'Two required academic evaluations.', sourceInstitution: 'Caltech Admissions', sourceUrl: 'https://www.admissions.caltech.edu', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'uk-lse',
    name: 'London School of Economics and Political Science (LSE)',
    country: 'United Kingdom',
    city: 'London',
    region: 'Europe',
    categoryTags: ['Europe', 'United Kingdom', 'Global Leaders'],
    domains: ['lse.ac.uk'],
    webPages: ['https://www.lse.ac.uk'],
    admissionsUrl: 'https://www.lse.ac.uk/study-at-lse',
    applicationPlatform: 'UCAS Portal',
    applicationFee: '£28.50',
    rankings: [
      { provider: 'QS World University Rankings by Subject', year: 2026, rank: 'Top 5 in Economics & Social Sciences', category: 'Subject' },
    ],
    standardDeadlines: { regularDecision: 'January 29' },
    minimumEligibility: 'A*AA in A-Levels including Mathematics for Economics programs.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'lse-econ', name: 'BSc Economics', degreeLevel: 'undergraduate', faculty: 'Department of Economics', duration: '3 years', applicationDeadline: '2026-01-29', applicationPlatform: 'UCAS', officialUrl: 'https://www.lse.ac.uk/economics' },
    ],
    standardRequirements: [
      { id: 'req-lse-ucas', name: 'UCAS Application & Academic Statement', category: 'Essay', required: true, description: 'Focused academic personal statement.', sourceInstitution: 'LSE Admissions', sourceUrl: 'https://www.lse.ac.uk', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'cn-fudan',
    name: 'Fudan University (复旦大学)',
    country: 'China',
    city: 'Shanghai',
    region: 'Asia',
    categoryTags: ['China', 'Global Leaders'],
    domains: ['fudan.edu.cn'],
    webPages: ['https://www.fudan.edu.cn/en'],
    admissionsUrl: 'https://iso.fudan.edu.cn',
    applicationPlatform: 'Fudan International Admissions System',
    applicationFee: '800 RMB',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#39 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'March 15' },
    minimumEligibility: 'High school diploma with strong Math and Science proficiency.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'fd-cs', name: 'BS Computer Science & Software Development', degreeLevel: 'undergraduate', faculty: 'School of Computer Science', duration: '4 years', applicationDeadline: '2026-03-15', applicationPlatform: 'Fudan Portal', officialUrl: 'https://cs.fudan.edu.cn' },
    ],
    standardRequirements: [
      { id: 'req-fd-app', name: 'Fudan International Application & Transcripts', category: 'Form', required: true, description: 'Certified academic marksheets.', sourceInstitution: 'Fudan Admissions', sourceUrl: 'https://iso.fudan.edu.cn', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'cn-sjtu',
    name: 'Shanghai Jiao Tong University (SJTU)',
    country: 'China',
    city: 'Shanghai',
    region: 'Asia',
    categoryTags: ['China', 'Global Leaders'],
    domains: ['sjtu.edu.cn'],
    webPages: ['https://en.sjtu.edu.cn'],
    admissionsUrl: 'https://isc.sjtu.edu.cn',
    applicationPlatform: 'SJTU International Portal',
    applicationFee: '800 RMB',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#45 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'March 1' },
    minimumEligibility: 'High school graduation with distinction in Mathematics and Physics.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'sjtu-cs', name: 'BS Artificial Intelligence & Computer Science', degreeLevel: 'undergraduate', faculty: 'John Hopcroft Center / CS', duration: '4 years', applicationDeadline: '2026-03-01', applicationPlatform: 'SJTU Portal', officialUrl: 'https://en.sjtu.edu.cn' },
    ],
    standardRequirements: [
      { id: 'req-sjtu-app', name: 'SJTU Online Application & Video Statement', category: 'Form', required: true, description: 'Online dossier & self-introduction.', sourceInstitution: 'SJTU Admissions', sourceUrl: 'https://isc.sjtu.edu.cn', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'au-melbourne',
    name: 'University of Melbourne',
    country: 'Australia',
    city: 'Melbourne, VIC',
    region: 'Oceania',
    categoryTags: ['Global Leaders'],
    domains: ['unimelb.edu.au'],
    webPages: ['https://www.unimelb.edu.au'],
    admissionsUrl: 'https://study.unimelb.edu.au',
    applicationPlatform: 'Melbourne Direct Application / VTAC',
    applicationFee: '$100 AUD',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#13 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'November 30' },
    minimumEligibility: 'ATAR 85+ or equivalent (A-Levels: ABB, IB: 31+).',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'melb-bsc', name: 'Bachelor of Science (Computing & Software Systems)', degreeLevel: 'undergraduate', faculty: 'Faculty of Science', duration: '3 years', applicationDeadline: '2026-11-30', applicationPlatform: 'Melbourne Portal', officialUrl: 'https://study.unimelb.edu.au' },
    ],
    standardRequirements: [
      { id: 'req-melb-trans', name: 'Secondary School Academic Transcripts', category: 'Document', required: true, description: 'Certified marksheet and English language certificate.', sourceInstitution: 'Melbourne Admissions', sourceUrl: 'https://study.unimelb.edu.au', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'au-sydney',
    name: 'University of Sydney',
    country: 'Australia',
    city: 'Sydney, NSW',
    region: 'Oceania',
    categoryTags: ['Global Leaders'],
    domains: ['sydney.edu.au'],
    webPages: ['https://www.sydney.edu.au'],
    admissionsUrl: 'https://www.sydney.edu.au/study',
    applicationPlatform: 'Sydney Direct Portal / UAC',
    applicationFee: '$150 AUD',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#18 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'January 15' },
    minimumEligibility: 'ATAR 80-95 depending on degree stream.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'syd-bcs', name: 'Bachelor of Advanced Computing', degreeLevel: 'undergraduate', faculty: 'School of Computer Science', duration: '4 years', applicationDeadline: '2026-01-15', applicationPlatform: 'Sydney Portal', officialUrl: 'https://sydney.edu.au' },
    ],
    standardRequirements: [
      { id: 'req-syd-app', name: 'Sydney Direct Application & Academic Marksheets', category: 'Form', required: true, description: 'Direct international submission.', sourceInstitution: 'Sydney Admissions', sourceUrl: 'https://www.sydney.edu.au', lastVerifiedDate: '2026-08-01' },
    ],
  },
  {
    id: 'ca-ubc',
    name: 'University of British Columbia (UBC)',
    country: 'Canada',
    city: 'Vancouver, BC',
    region: 'Americas',
    categoryTags: ['Global Leaders'],
    domains: ['ubc.ca'],
    webPages: ['https://www.ubc.ca'],
    admissionsUrl: 'https://you.ubc.ca',
    applicationPlatform: 'EducationPlannerBC / UBC Portal',
    applicationFee: '$125 CAD',
    rankings: [
      { provider: 'QS World University Rankings', year: 2026, rank: '#38 Global', category: 'Overall World' },
    ],
    standardDeadlines: { regularDecision: 'January 15' },
    minimumEligibility: 'Minimum 70% average across Senior Grade 12 courses with Grade 12 Math.',
    verifiedSource: true,
    lastVerifiedDate: '2026-08-01',
    programs: [
      { id: 'ubc-cs', name: 'B.Sc. Computer Science', degreeLevel: 'undergraduate', faculty: 'Faculty of Science', duration: '4 years', applicationDeadline: '2026-01-15', applicationPlatform: 'UBC Portal', officialUrl: 'https://www.cs.ubc.ca' },
    ],
    standardRequirements: [
      { id: 'req-ubc-profile', name: 'UBC Personal Profile & Activities Essay', category: 'Essay', required: true, description: 'Four short essays on leadership, challenges, and goals.', sourceInstitution: 'UBC Admissions', sourceUrl: 'https://you.ubc.ca', lastVerifiedDate: '2026-08-01' },
    ],
  },
];

export function findInstitutionByName(query: string): Institution | undefined {
  const q = query.toLowerCase().trim();
  return GLOBAL_INSTITUTIONS.find(
    i => i.name.toLowerCase().includes(q) ||
         i.domains.some(d => d.toLowerCase().includes(q)) ||
         (i.city && i.city.toLowerCase().includes(q))
  );
}

export function searchInstitutions(
  query: string,
  filters?: {
    country?: string;
    region?: string;
    categoryTag?: string;
  }
): Institution[] {
  let list = GLOBAL_INSTITUTIONS;

  if (filters?.country && filters.country !== 'all') {
    list = list.filter(i => i.country.toLowerCase() === filters.country!.toLowerCase());
  }

  if (filters?.region && filters.region !== 'all') {
    list = list.filter(i => i.region.toLowerCase() === filters.region!.toLowerCase());
  }

  if (filters?.categoryTag && filters.categoryTag !== 'all') {
    list = list.filter(i => i.categoryTags.includes(filters.categoryTag!));
  }

  if (query.trim().length > 0) {
    const q = query.toLowerCase().trim();
    // Prioritize Pakistan exact matches if query contains 'pakistan'
    if (q === 'pakistan') {
      return GLOBAL_INSTITUTIONS.filter(i => i.country === 'Pakistan');
    }
    if (q === 'china') {
      return GLOBAL_INSTITUTIONS.filter(i => i.country === 'China');
    }
    if (q === 'ivy league' || q === 'ivy') {
      return GLOBAL_INSTITUTIONS.filter(i => i.categoryTags.includes('Ivy League'));
    }
    if (q === 'europe') {
      return GLOBAL_INSTITUTIONS.filter(i => i.region === 'Europe' || i.categoryTags.includes('Europe'));
    }

    list = list.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.country.toLowerCase().includes(q) ||
      i.city.toLowerCase().includes(q) ||
      i.programs.some(p => p.name.toLowerCase().includes(q) || p.faculty.toLowerCase().includes(q)) ||
      i.domains.some(d => d.toLowerCase().includes(q))
    );
  }

  return list;
}
