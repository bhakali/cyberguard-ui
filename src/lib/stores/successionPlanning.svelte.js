import { PersistedList } from './persisted.svelte.js';

export const SKILL_CATALOG = [
  'Firearms Handling',
  'Defensive Tactics',
  'First Aid/CPR',
  'Radio Communication Protocol',
  'Access Control Systems',
  'Report Writing',
  'K9 Handling',
  'CCTV/Surveillance Monitoring',
  'Crowd Control',
  'Vehicle Patrol'
];

export const PROFICIENCY_LEVELS = ['Novice', 'Competent', 'Proficient', 'Expert'];

const seedBench = [
  {
    id: 1,
    roleTitle: 'Director Operations',
    incumbentEmpId: 'CG-00102',
    incumbentName: 'Patrick Banda',
    successors: [
      { empId: 'CG-00105', empName: 'Kennedy Tembo', readiness: 'ready_1_2_yrs' },
      { empId: 'CG-00106', empName: 'Grace Mwanza', readiness: 'developing' }
    ],
    riskLevel: 'Medium'
  },
  {
    id: 2,
    roleTitle: 'Regional Security Manager – North',
    incumbentEmpId: 'CG-00105',
    incumbentName: 'Kennedy Tembo',
    successors: [
      { empId: 'CG-00107', empName: 'Joseph Phiri', readiness: 'ready_now' }
    ],
    riskLevel: 'Low'
  },
  {
    id: 3,
    roleTitle: 'Site Supervisor',
    incumbentEmpId: 'CG-00110',
    incumbentName: 'Brian Bwalya',
    successors: [
      { empId: 'CG-00111', empName: 'Kelvin Musonda', readiness: 'ready_1_2_yrs' },
      { empId: 'CG-00112', empName: 'Moses Sakala', readiness: 'developing' }
    ],
    riskLevel: 'High'
  }
];

export const successionStore = new PersistedList('cyberguard_succession_bench', seedBench);

export const READINESS_LABELS = {
  ready_now: 'Ready Now',
  ready_1_2_yrs: 'Ready in 1–2 Yrs',
  developing: 'Developing'
};

export const READINESS_BADGE = {
  ready_now: 'badge-success',
  ready_1_2_yrs: 'badge-warning',
  developing: 'badge-secondary'
};
