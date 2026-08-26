// ─────────────────────────────────────────────────────────────────────────────
// ApplyX Global & Institutional Verified Scholarship Database
// Grounded in official scholarship bodies & university financial aid portals
// ─────────────────────────────────────────────────────────────────────────────

import type { DegreeLevel } from './types';

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  country: string;
  eligibleCountries: string[]; // ['all'] or ['Pakistan', 'India', etc.]
  degreeLevels: DegreeLevel[];
  category: 'Fully Funded' | 'University' | 'Government' | 'Merit' | 'Need-Based' | 'International';
  field?: string;
  eligibilitySummary: string;
  deadline: string;
  amount: string;
  applicationRoute: string;
  officialSource: string;
  officialUrl: string;
  lastVerifiedDate: string;
  minGPA?: string;
}

export const GLOBAL_SCHOLARSHIPS: Scholarship[] = [
  // ─── PAKISTAN PRIORITY SCHOLARSHIPS ───────────────────────────────────────
  {
    id: 'sch-lums-aid',
    name: 'LUMS Financial Aid & Merit Scholarships',
    provider: 'Lahore University of Management Sciences',
    country: 'Pakistan',
    eligibleCountries: ['all', 'Pakistan'],
    degreeLevels: ['undergraduate'],
    category: 'Need-Based',
    field: 'All Disciplines',
    eligibilitySummary: 'Granted strictly on demonstrated financial need. Covers up to 100% of tuition, hostel, and living expenses.',
    deadline: '2026-02-15',
    amount: 'Up to 100% tuition & accommodation coverage',
    applicationRoute: 'Submitted directly within the LUMS Online Admissions Portal',
    officialSource: 'LUMS Office of Financial Aid',
    officialUrl: 'https://financial-aid.lums.edu.pk',
    lastVerifiedDate: '2026-08-01',
    minGPA: '3.0 / 70%',
  },
  {
    id: 'sch-nust-aid',
    name: 'NUST Need-Based Scholarship & Endowment Fund',
    provider: 'National University of Sciences and Technology (NUST)',
    country: 'Pakistan',
    eligibleCountries: ['Pakistan'],
    degreeLevels: ['undergraduate'],
    category: 'Need-Based',
    field: 'Engineering, Computing, Business & Sciences',
    eligibilitySummary: 'Assesses family income, dependents, and financial hardship for enrolled undergraduate students.',
    deadline: '2026-07-30',
    amount: 'Partial to full tuition waiver + monthly stipend',
    applicationRoute: 'NUST Financial Aid Form upon NET registration',
    officialSource: 'NUST Financial Aid Office',
    officialUrl: 'https://nust.edu.pk/admissions/scholarships/',
    lastVerifiedDate: '2026-08-01',
  },
  {
    id: 'sch-iba-nthp',
    name: 'IBA National Talent Hunt Program (NTHP)',
    provider: 'IBA Karachi',
    country: 'Pakistan',
    eligibleCountries: ['Pakistan'],
    degreeLevels: ['undergraduate'],
    category: 'Fully Funded',
    field: 'Business Administration, Computer Science, Economics',
    eligibilitySummary: 'Fully funded scholarship for meritorious and deserving students from provincial high schools across Pakistan.',
    deadline: '2026-03-31',
    amount: '100% tuition, lodging, books & stipend',
    applicationRoute: 'IBA NTHP dedicated portal',
    officialSource: 'IBA NTHP Secretariat',
    officialUrl: 'https://nthp.iba.edu.pk',
    lastVerifiedDate: '2026-08-01',
  },
  {
    id: 'sch-giki-fa',
    name: 'GIKI Financial Assistance & Alumni Scholarships',
    provider: 'GIK Institute',
    country: 'Pakistan',
    eligibleCountries: ['Pakistan'],
    degreeLevels: ['undergraduate'],
    category: 'Need-Based',
    field: 'Engineering & Computer Science',
    eligibilitySummary: 'Need-based tuition grants and interest-free loans provided through alumni donations and university funds.',
    deadline: '2026-06-30',
    amount: '25% to 100% tuition waiver',
    applicationRoute: 'GIKI Admission Portal Financial Aid section',
    officialSource: 'GIKI Financial Aid Committee',
    officialUrl: 'https://giki.edu.pk/admissions/scholarships/',
    lastVerifiedDate: '2026-08-01',
  },
  {
    id: 'sch-aku-aid',
    name: 'Aga Khan University Patient & Student Assistance Program',
    provider: 'Aga Khan University (AKU)',
    country: 'Pakistan',
    eligibleCountries: ['all', 'Pakistan'],
    degreeLevels: ['undergraduate'],
    category: 'Need-Based',
    field: 'Medicine (MBBS), Nursing, Education',
    eligibilitySummary: 'Need-blind evaluation ensuring no admitted student is turned away due to inability to pay.',
    deadline: '2026-05-15',
    amount: 'Up to 100% tuition & grant assistance',
    applicationRoute: 'AKU Financial Assistance Office',
    officialSource: 'AKU Financial Aid Department',
    officialUrl: 'https://www.aku.edu/admissions/fees-and-funding/',
    lastVerifiedDate: '2026-08-01',
  },
  {
    id: 'sch-fast-aid',
    name: 'FAST-NUCES Financial Assistance & Study Loans',
    provider: 'FAST National University of Computer and Emerging Sciences',
    country: 'Pakistan',
    eligibleCountries: ['Pakistan'],
    degreeLevels: ['undergraduate'],
    category: 'Need-Based',
    field: 'Computer Science, Software Engineering, AI',
    eligibilitySummary: 'Assists students with financial constraints through Ihsan Trust interest-free Qarz-e-Hasna loans and HEC scholarships.',
    deadline: '2026-07-20',
    amount: 'Tuition waiver & interest-free study loan',
    applicationRoute: 'FAST Campus Financial Aid Desk',
    officialSource: 'FAST NUCES Financial Aid',
    officialUrl: 'https://nu.edu.pk/Admissions/FinancialAssistance',
    lastVerifiedDate: '2026-08-01',
  },

  // ─── UNITED STATES SCHOLARSHIPS ───────────────────────────────────────────
  {
    id: 'sch-harvard-fai',
    name: 'Harvard Financial Aid Initiative (HFAI)',
    provider: 'Harvard University',
    country: 'United States',
    eligibleCountries: ['all'],
    degreeLevels: ['undergraduate'],
    category: 'Need-Based',
    field: 'All Disciplines',
    eligibilitySummary: '100% need-based aid for domestic and international students. Free tuition for families earning under $85,000/year.',
    deadline: '2026-02-01',
    amount: 'Full tuition, room, board, and travel allowance',
    applicationRoute: 'CSS Profile & IDOC submission',
    officialSource: 'Harvard College Financial Aid Office',
    officialUrl: 'https://college.harvard.edu/financial-aid',
    lastVerifiedDate: '2026-08-01',
  },
  {
    id: 'sch-princeton-aid',
    name: 'Princeton Need-Blind Financial Aid',
    provider: 'Princeton University',
    country: 'United States',
    eligibleCountries: ['all'],
    degreeLevels: ['undergraduate'],
    category: 'Need-Based',
    field: 'All Disciplines',
    eligibilitySummary: '100% need-based grant (no loans required). Covers full tuition and room & board for families earning under $100,000.',
    deadline: '2026-02-01',
    amount: '100% demonstrated financial need met',
    applicationRoute: 'Princeton Financial Aid Application (PFAA)',
    officialSource: 'Princeton Undergraduate Financial Aid',
    officialUrl: 'https://admission.princeton.edu/cost-aid',
    lastVerifiedDate: '2026-08-01',
  },

  // ─── UNITED KINGDOM SCHOLARSHIPS ──────────────────────────────────────────
  {
    id: 'sch-chevening',
    name: 'Chevening Award (UK Government Scholarship)',
    provider: 'UK Foreign, Commonwealth & Development Office (FCDO)',
    country: 'United Kingdom',
    eligibleCountries: ['all'],
    degreeLevels: ['postgraduate'],
    category: 'Fully Funded',
    field: 'All Master’s Disciplines',
    eligibilitySummary: 'Fully-funded one-year Master’s degree in the UK for outstanding emerging leaders worldwide with 2+ years work experience.',
    deadline: '2026-11-03',
    amount: 'Full tuition, monthly living stipend, return flights, visa fees',
    applicationRoute: 'Online Chevening Application Portal',
    officialSource: 'Chevening Secretariat',
    officialUrl: 'https://www.chevening.org',
    lastVerifiedDate: '2026-08-01',
  },
  {
    id: 'sch-oxford-reach',
    name: 'Reach Oxford Scholarship for Developing Nations',
    provider: 'University of Oxford',
    country: 'United Kingdom',
    eligibleCountries: ['all'],
    degreeLevels: ['undergraduate'],
    category: 'Fully Funded',
    field: 'All subjects except Medicine',
    eligibilitySummary: 'Offered to students from low-income countries who cannot study for a degree in their home country due to financial or political reasons.',
    deadline: '2026-02-05',
    amount: 'Course fees, grant for living costs, and one return flight per year',
    applicationRoute: 'Oxford Undergraduate Scholarship Application Form',
    officialSource: 'University of Oxford Student Fees and Funding',
    officialUrl: 'https://www.ox.ac.uk/admissions/undergraduate/fees-and-funding/oxford-support/reach-oxford-scholarship',
    lastVerifiedDate: '2026-08-01',
  },

  // ─── CHINA SCHOLARSHIPS ───────────────────────────────────────────────────
  {
    id: 'sch-csc-chinese-gov',
    name: 'Chinese Government Scholarship (CSC Bilateral & Chinese University Program)',
    provider: 'China Scholarship Council (CSC) / Ministry of Education China',
    country: 'China',
    eligibleCountries: ['all'],
    degreeLevels: ['undergraduate', 'postgraduate', 'phd'],
    category: 'Fully Funded',
    field: 'All Majors',
    eligibilitySummary: 'Covers full tuition, comprehensive medical insurance, university accommodation, and monthly living allowance (2,500 - 3,500 RMB).',
    deadline: '2026-03-31',
    amount: 'Tuition waiver + free accommodation + monthly stipend',
    applicationRoute: 'CSC Online Application System (Type A or Type B)',
    officialSource: 'China Scholarship Council',
    officialUrl: 'https://www.campuschina.org',
    lastVerifiedDate: '2026-08-01',
  },
  {
    id: 'sch-tsinghua-schwarzman',
    name: 'Schwarzman Scholars at Tsinghua University',
    provider: 'Tsinghua University & Schwarzman Foundation',
    country: 'China',
    eligibleCountries: ['all'],
    degreeLevels: ['postgraduate'],
    category: 'Fully Funded',
    field: 'Global Affairs, Public Policy, Economics, International Relations',
    eligibilitySummary: 'Fully funded one-year Master’s degree in Global Affairs at Tsinghua University in Beijing designed for future world leaders.',
    deadline: '2026-09-20',
    amount: 'Tuition, room & board, travel, laptop, health insurance, stipend',
    applicationRoute: 'Schwarzman Scholars Online Portal',
    officialSource: 'Schwarzman Scholars Program',
    officialUrl: 'https://www.schwarzmanscholars.org',
    lastVerifiedDate: '2026-08-01',
  },

  // ─── GERMANY & EUROPE SCHOLARSHIPS ────────────────────────────────────────
  {
    id: 'sch-daad-master',
    name: 'DAAD Development-Related Postgraduate Courses (EPOS)',
    provider: 'German Academic Exchange Service (DAAD)',
    country: 'Germany',
    eligibleCountries: ['all'],
    degreeLevels: ['postgraduate'],
    category: 'Fully Funded',
    field: 'Engineering, Economics, Environment, Agriculture, Public Health',
    eligibilitySummary: 'Supports foreign graduates from developing countries with at least two years of professional experience.',
    deadline: '2026-09-30',
    amount: '934 EUR monthly stipend + travel allowance + health insurance',
    applicationRoute: 'DAAD Portal & Direct University Submission',
    officialSource: 'DAAD Information Centre',
    officialUrl: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
    lastVerifiedDate: '2026-08-01',
  },
  {
    id: 'sch-erasmus-mundus',
    name: 'Erasmus Mundus Joint Master Degrees (EMJMD)',
    provider: 'European Commission',
    country: 'Europe',
    eligibleCountries: ['all'],
    degreeLevels: ['postgraduate'],
    category: 'Fully Funded',
    field: 'Multi-Disciplinary Consortiums',
    eligibilitySummary: 'Study in at least 2 European countries. Includes participation costs, travel, allowance, and insurance.',
    deadline: '2026-01-15',
    amount: 'Full tuition + 1,400 EUR monthly stipend',
    applicationRoute: 'EMJMD Consortium Direct Portals',
    officialSource: 'European Education and Culture Executive Agency',
    officialUrl: 'https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters',
    lastVerifiedDate: '2026-08-01',
  },

  // ─── SINGAPORE & JAPAN SCHOLARSHIPS ───────────────────────────────────────
  {
    id: 'sch-singa',
    name: 'Singapore International Graduate Award (SINGA)',
    provider: 'A*STAR, NUS, NTU & SUTD Singapore',
    country: 'Singapore',
    eligibleCountries: ['all'],
    degreeLevels: ['phd'],
    category: 'Fully Funded',
    field: 'Biomedical Sciences, Computing, Physical Science & Engineering',
    eligibilitySummary: '4-year PhD research training in Singapore for international graduates with strong academic passion.',
    deadline: '2026-06-01',
    amount: 'Full tuition + SGD $2,700-$3,200 monthly stipend + airfare & settling-in grant',
    applicationRoute: 'A*STAR SINGA Application Portal',
    officialSource: 'Agency for Science, Technology and Research (A*STAR)',
    officialUrl: 'https://www.a-star.edu.sg/Scholarships/for-graduate-studies/singapore-international-graduate-award-singa',
    lastVerifiedDate: '2026-08-01',
  },
  {
    id: 'sch-mext-japan',
    name: 'MEXT Japanese Government Embassy Scholarship',
    provider: 'Ministry of Education, Culture, Sports, Science and Technology (MEXT)',
    country: 'Japan',
    eligibleCountries: ['all'],
    degreeLevels: ['undergraduate', 'postgraduate'],
    category: 'Fully Funded',
    field: 'All Major Disciplines',
    eligibilitySummary: 'Covers full university tuition, round-trip airfare, Japanese language training, and monthly stipend.',
    deadline: '2026-05-31',
    amount: '117,000 - 144,000 JPY monthly + tuition waiver + round flights',
    applicationRoute: 'Japanese Embassy in applicant’s home country',
    officialSource: 'MEXT Japan Ministry',
    officialUrl: 'https://www.studyinjapan.go.jp/en/planning/scholarship/',
    lastVerifiedDate: '2026-08-01',
  },
];

export function searchScholarships(
  query: string,
  filters?: {
    country?: string;
    category?: string;
    degreeLevel?: string;
  }
): Scholarship[] {
  let list = GLOBAL_SCHOLARSHIPS;

  if (filters?.country && filters.country !== 'all') {
    const c = filters.country.toLowerCase();
    // Handle 'Europe' as a special region filter
    if (c === 'europe') {
      const europeanCountries = ['united kingdom', 'germany', 'france', 'netherlands', 'switzerland', 'italy', 'spain', 'sweden', 'norway', 'denmark', 'europe'];
      list = list.filter(s =>
        europeanCountries.some(ec => s.country.toLowerCase().includes(ec)) ||
        s.eligibleCountries.some(ec => ec.toLowerCase() === 'all' || europeanCountries.some(eu => ec.toLowerCase().includes(eu)))
      );
    } else if (c === 'global') {
      // Global = scholarships open to 'all' countries
      list = list.filter(s =>
        s.eligibleCountries.some(ec => ec.toLowerCase() === 'all') ||
        s.country.toLowerCase() === 'global'
      );
    } else {
      list = list.filter(s =>
        s.country.toLowerCase() === c ||
        s.eligibleCountries.some(ec => ec.toLowerCase() === 'all' || ec.toLowerCase() === c)
      );
    }
  }

  if (filters?.category && filters.category !== 'all') {
    list = list.filter(s => s.category.toLowerCase() === filters.category!.toLowerCase());
  }

  if (query.trim().length > 0) {
    const q = query.toLowerCase().trim();
    list = list.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.provider.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q) ||
      (s.field && s.field.toLowerCase().includes(q)) ||
      s.eligibilitySummary.toLowerCase().includes(q)
    );
  }

  return list;
}

export interface ScholarshipMatchResult {
  scholarship: Scholarship;
  matchType: 'strong' | 'possible' | 'ineligible';
  matchScore: number; // 0 - 100
  reasons: { status: 'pass' | 'warn' | 'fail'; text: string }[];
}

export function matchScholarshipsForUser(input: {
  nationality?: string;
  targetCountry?: string;
  degreeLevel?: string;
  fieldOfStudy?: string;
  currentGpa?: string;
  hasFinancialNeed?: boolean;
}): ScholarshipMatchResult[] {
  return GLOBAL_SCHOLARSHIPS.map(sch => {
    const reasons: { status: 'pass' | 'warn' | 'fail'; text: string }[] = [];
    let passCount = 0;
    let failCount = 0;
    let warnCount = 0;

    // 1. Nationality check
    const userNation = (input.nationality || 'Pakistan').toLowerCase();
    const isNationEligible =
      sch.eligibleCountries.some(c => c.toLowerCase() === 'all' || c.toLowerCase() === userNation);

    if (isNationEligible) {
      reasons.push({ status: 'pass', text: `Country / Nationality eligible (${userNation.toUpperCase()})` });
      passCount++;
    } else {
      reasons.push({ status: 'fail', text: `Requires residency/nationality in ${sch.eligibleCountries.join(', ')}` });
      failCount++;
    }

    // 2. Target Country check
    if (input.targetCountry && input.targetCountry !== 'all') {
      if (sch.country.toLowerCase() === input.targetCountry.toLowerCase() || sch.country === 'Global') {
        reasons.push({ status: 'pass', text: `Destination matches target (${sch.country})` });
        passCount++;
      } else {
        reasons.push({ status: 'warn', text: `Scholarship is tenable in ${sch.country}` });
        warnCount++;
      }
    }

    // 3. Degree Level check
    const targetDeg = (input.degreeLevel || 'undergraduate').toLowerCase();
    const isDegEligible = sch.degreeLevels.some(d => d.toLowerCase() === targetDeg || d === 'other');
    if (isDegEligible) {
      reasons.push({ status: 'pass', text: `Degree level matches (${targetDeg.toUpperCase()})` });
      passCount++;
    } else {
      reasons.push({ status: 'fail', text: `Targeted at ${sch.degreeLevels.join(', ').toUpperCase()} degrees only` });
      failCount++;
    }

    // 4. Financial Need alignment
    if (sch.category === 'Need-Based' || sch.category === 'Fully Funded') {
      if (input.hasFinancialNeed) {
        reasons.push({ status: 'pass', text: 'Aligned with demonstrated financial need requirement' });
        passCount++;
      } else {
        reasons.push({ status: 'warn', text: 'Requires financial hardship documentation' });
        warnCount++;
      }
    }

    // 5. Academic GPA requirement
    if (sch.minGPA) {
      reasons.push({ status: 'warn', text: `Academic threshold: ${sch.minGPA} required` });
      warnCount++;
    } else {
      reasons.push({ status: 'pass', text: 'No rigid GPA cutoff specified' });
      passCount++;
    }

    // Determine final match status
    let matchType: 'strong' | 'possible' | 'ineligible' = 'possible';
    if (failCount > 0) {
      matchType = 'ineligible';
    } else if (passCount >= 3 && warnCount <= 1) {
      matchType = 'strong';
    } else {
      matchType = 'possible';
    }

    const matchScore = Math.max(0, Math.min(100, Math.round(((passCount * 25) + (warnCount * 10)) - (failCount * 40))));

    return {
      scholarship: sch,
      matchType,
      matchScore,
      reasons,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
