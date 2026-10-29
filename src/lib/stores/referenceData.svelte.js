import { PersistedList, PersistedRecord } from './persisted.svelte.js';
import seedData from '../db-seed.json';

// Reference-data / configuration lookups for the HR portal.
// Each lookup is seeded from values already in use elsewhere in the app
// (employee records, policies, incidents, grievances, offboarding,
// training, engagement). These lists are standalone in this prototype
// phase — editing them here does not change the hardcoded options used
// by the existing feature pages.

export const REFERENCE_DATA_GROUPS = [
  {
    id: 'statutory',
    label: 'Statutory Settings',
    description: 'NAPSA, NHIMA and ZRA PAYE settings, maintained here as configuration reference.',
    custom: true
  },
  {
    id: 'org',
    label: 'Organizational Structure',
    description: 'Departments, cost centers, regions, sites, grades and contract types.',
    lookups: ['departments', 'costCenters', 'regions', 'sites', 'gradeLevels', 'jobTitles', 'contractTypes']
  },
  {
    id: 'payroll',
    label: 'Payroll & Banking',
    description: 'Bank list and leave entitlement types used on employee records.',
    lookups: ['banks', 'leaveTypes']
  },
  {
    id: 'workforce',
    label: 'Workforce Operations',
    description: 'Shift roster patterns used for guard and site scheduling.',
    lookups: ['shiftPatterns']
  },
  {
    id: 'caseMgmt',
    label: 'Case & Compliance Categories',
    description: 'Categories and severity levels used by policies, incidents, grievances and offboarding.',
    lookups: ['policyCategories', 'incidentCategories', 'incidentSeverities', 'grievanceCategories', 'grievanceSeverities', 'offboardingCategories']
  },
  {
    id: 'talent',
    label: 'Talent & Development',
    description: 'Qualification, skill, training and engagement categories.',
    lookups: ['qualificationCategories', 'skillProficiencyLevels', 'trainingCategories', 'engagementCategories']
  }
];

export const LOOKUP_DEFS = {
  departments: { label: 'Departments', columns: [] },
  costCenters: {
    label: 'Cost Centers',
    columns: [
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'department', label: 'Department', type: 'select', source: 'departments' }
    ]
  },
  regions: { label: 'Regions', columns: [] },
  sites: { label: 'Sites', columns: [] },
  gradeLevels: { label: 'Grade Levels', columns: [] },
  jobTitles: { label: 'Job Titles', columns: [] },
  contractTypes: { label: 'Contract Types', columns: [] },

  banks: { label: 'Banks', columns: [] },
  leaveTypes: {
    label: 'Leave Types',
    columns: [{ key: 'defaultDays', label: 'Default Entitlement (Days)', type: 'number' }]
  },

  shiftPatterns: { label: 'Shift Patterns', columns: [] },

  policyCategories: { label: 'Policy Categories', columns: [] },
  incidentCategories: { label: 'Incident Categories', columns: [] },
  incidentSeverities: { label: 'Incident Severity Levels', columns: [] },
  grievanceCategories: { label: 'Grievance Categories', columns: [] },
  grievanceSeverities: { label: 'Grievance Severity Levels', columns: [] },
  offboardingCategories: { label: 'Offboarding Categories', columns: [] },

  qualificationCategories: { label: 'Qualification Categories', columns: [] },
  skillProficiencyLevels: { label: 'Skill Proficiency Levels', columns: [] },
  trainingCategories: { label: 'Training Categories', columns: [] },
  engagementCategories: { label: 'Engagement Categories', columns: [] }
};

function seedOf(key, labels) {
  return labels.map((label, i) => ({ id: `${key}-${i + 1}`, label }));
}

const SEEDS = {
  departments: seedOf('departments', [
    'Executive',
    'Security Operations',
    'Administration & Facilities',
    'Human Resources',
    'Security Operations - North',
    'Security Operations - South'
  ]),
  costCenters: [
    { id: 'costCenters-1', label: 'CC-100-EXEC', code: 'CC-100-EXEC', department: 'Executive' },
    { id: 'costCenters-2', label: 'CC-200-OPS', code: 'CC-200-OPS', department: 'Security Operations' },
    { id: 'costCenters-3', label: 'CC-300-ADM', code: 'CC-300-ADM', department: 'Administration & Facilities' },
    { id: 'costCenters-4', label: 'CC-400-HR', code: 'CC-400-HR', department: 'Human Resources' },
    { id: 'costCenters-5', label: 'CC-210-NORTH', code: 'CC-210-NORTH', department: 'Security Operations - North' },
    { id: 'costCenters-6', label: 'CC-220-SOUTH', code: 'CC-220-SOUTH', department: 'Security Operations - South' },
    { id: 'costCenters-7', label: 'CC-212-AREA-CB', code: 'CC-212-AREA-CB', department: 'Security Operations - North' },
    { id: 'costCenters-8', label: 'CC-225-SHIFT', code: 'CC-225-SHIFT', department: 'Security Operations - South' },
    { id: 'costCenters-9', label: 'CC-215-MINE-KANS', code: 'CC-215-MINE-KANS', department: 'Security Operations - North' },
    { id: 'costCenters-10', label: 'CC-216-SUP-SITE', code: 'CC-216-SUP-SITE', department: 'Security Operations - North' },
    { id: 'costCenters-11', label: 'CC-218-GUARD-CB', code: 'CC-218-GUARD-CB', department: 'Security Operations - North' },
    { id: 'costCenters-12', label: 'CC-228-GUARD-LSK', code: 'CC-228-GUARD-LSK', department: 'Security Operations - South' }
  ],
  regions: seedOf('regions', [
    'Headquarters (Lusaka)',
    'National Operations',
    'Northern Region (Copperbelt / North-Western / Luapula)',
    'Southern Region (Lusaka / Southern / Western)',
    'Copperbelt Mining Belt',
    'Lusaka Central',
    'Kansanshi Mining Perimeter',
    'Copperbelt Industrial Hub',
    'Copperbelt District',
    'Lusaka Industrial Area'
  ]),
  sites: seedOf('sites', [
    'Corporate HQ - Lusaka',
    'National Ops Command Hub',
    'Copperbelt Regional HQ - Kitwe',
    'Southern Regional HQ - Lusaka',
    'Kitwe Industrial Area Cluster',
    'Lusaka Commercial Roster',
    'Kansanshi Copper Gate 1 & 2',
    'Konkola Mine Smelter Post',
    'KCM Open Pit Perimeter Post 4',
    'Lusaka Breweries Logistics Gate'
  ]),
  gradeLevels: seedOf('gradeLevels', [
    'Grade E1 (Executive)',
    'Grade D2 (Senior Director)',
    'Grade D1 (Department Head)',
    'Grade C3 (Regional Manager)',
    'Grade C1 (Area Manager)',
    'Grade B3 (Senior Coordinator)',
    'Grade B2 (Site Coordinator)',
    'Grade B1 (Site Supervisor)',
    'Grade A2 (Senior Guard)',
    'Grade A1 (Patrol Guard)'
  ]),
  jobTitles: seedOf('jobTitles', [
    'Managing Director',
    'Director Operations',
    'Director Admin',
    'Human Resource Manager',
    'Regional Security Manager – North',
    'Regional Security Manager - South',
    'Area Manager',
    'Shift Coordinator',
    'Site Coordinators',
    'Site Supervisor',
    'Guards'
  ]),
  contractTypes: seedOf('contractTypes', [
    'Permanent',
    'Fixed Contract (3 Years)',
    'Fixed Contract (2 Years)',
    'Fixed Contract (1 Year)',
    'Probation (3 Months)'
  ]),

  banks: seedOf('banks', [
    'Stanbic Bank Zambia',
    'Absa Bank Zambia',
    'Standard Chartered Zambia',
    'ZANACO Plc',
    'Absa Bank Kitwe',
    'FNB Zambia',
    'ZANACO Kitwe Branch',
    'Indo Zambia Bank',
    'Absa Solwezi',
    'ZANACO Chingola',
    'Atlas Mara Zambia'
  ]),
  leaveTypes: [
    { id: 'leaveTypes-1', label: 'Annual', defaultDays: 24 },
    { id: 'leaveTypes-2', label: 'Sick', defaultDays: 30 },
    { id: 'leaveTypes-3', label: 'Maternity', defaultDays: 120 },
    { id: 'leaveTypes-4', label: 'Paternity', defaultDays: 7 },
    { id: 'leaveTypes-5', label: 'Compassionate', defaultDays: 7 }
  ],

  shiftPatterns: seedOf('shiftPatterns', [
    'Standard Executive (Mon-Fri 08:00 - 17:00)',
    'Operations 24/7 Command Standby',
    'Standard (08:00 - 17:00)',
    'Regional Mobile Command',
    'Field Supervisory (Rotational)',
    'Shift Alpha: Day / Night 12hr Roster',
    'Mine Shift Roster (06:00 - 18:00)',
    'Site Day Shift (06:00 - 18:00)',
    '12hr Shift: 4 Days On / 2 Days Off',
    'Night Shift (18:00 - 06:00)'
  ]),

  policyCategories: seedOf('policyCategories', [
    'Code of Conduct',
    'Firearms SOP',
    'Leave Policy',
    'Data Protection',
    'Disciplinary Code'
  ]),
  incidentCategories: seedOf('incidentCategories', ['Security Breach', 'Equipment Fault', 'Medical']),
  incidentSeverities: seedOf('incidentSeverities', ['Low', 'Medium', 'High']),
  grievanceCategories: seedOf('grievanceCategories', ['Disciplinary', 'Grievance']),
  grievanceSeverities: seedOf('grievanceSeverities', ['Low', 'Gross Misconduct']),
  offboardingCategories: seedOf('offboardingCategories', [
    'Voluntary Resignation (30d Notice)',
    'Contract Expiry (End of 2-Yr Term)',
    'Summary Dismissal (Gross Misconduct)'
  ]),

  qualificationCategories: seedOf('qualificationCategories', [
    'Academic Degree',
    'Professional Accreditation & License',
    'Secondary Education',
    'Higher Diploma & Diploma',
    'Tactical & Security Certification',
    'Statutory & Firearms Competency',
    'Health, Safety & Medical (HSE)',
    'Technical & Vocational (TEVETA)'
  ]),
  skillProficiencyLevels: seedOf('skillProficiencyLevels', ['Novice', 'Competent', 'Proficient', 'Expert']),
  trainingCategories: seedOf('trainingCategories', [
    'Statutory & Firearms Competency',
    'Health, Safety & Medical (HSE)',
    'Tactical & Security Certification',
    'Technical & Vocational (TEVETA)',
    'Professional Accreditation & License'
  ]),
  engagementCategories: seedOf('engagementCategories', ['Safety', 'Training', 'Operations', 'Culture'])
};

export const referenceDataStores = Object.fromEntries(
  Object.keys(LOOKUP_DEFS).map((key) => [key, new PersistedList(`cyberguard_refdata_${key}`, SEEDS[key])])
);

// Statutory settings kept here as an editable configuration record, seeded
// from the same values cyberguard.statutoryConfig uses. Edits made on the
// Configuration screen are stored independently and are not read by
// calculatePayroll() — this is reference configuration only, not a live
// payroll input, in this prototype phase.
export const statutorySettingsStore = new PersistedRecord('cyberguard_refdata_statutory', {
  napsaRateEmployee: seedData.statutoryConfig.napsaRateEmployee,
  napsaRateEmployer: seedData.statutoryConfig.napsaRateEmployer,
  napsaCeiling: seedData.statutoryConfig.napsaCeiling,
  nhimaRateEmployee: seedData.statutoryConfig.nhimaRateEmployee,
  nhimaRateEmployer: seedData.statutoryConfig.nhimaRateEmployer
});

export const zraBandsStore = new PersistedList(
  'cyberguard_refdata_zraBands',
  seedData.statutoryConfig.zraBands.map((band, i) => ({ id: `zraBand-${i + 1}`, upTo: band.upTo, rate: band.rate }))
);

export function initReferenceData() {
  Object.values(referenceDataStores).forEach((store) => store.init());
  statutorySettingsStore.init();
  zraBandsStore.init();
}
