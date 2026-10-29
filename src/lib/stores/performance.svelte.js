import { PersistedList } from './persisted.svelte.js';

const seedAppraisals = [
  {
    id: 1,
    empId: 'CG-00111',
    name: 'Kelvin Musonda',
    role: 'Guards • KCM Post 4',
    manager: 'Brian Bwalya (Site Sup)',
    cycleId: 1,
    vigilance: 4.8,
    incidentResponse: 4.5,
    discipline: 5.0,
    equipmentCare: 4.9,
    overall: 4.75,
    statusBadge: 'badge-success',
    statusLabel: 'Recommended for Promotion',
    growthPlan: 'Advanced Tactical Armed Escort Training',
    actionLabel: 'View Rubric',
    selfReview: null,
    acknowledgment: null
  },
  {
    id: 2,
    empId: 'CG-00112',
    name: 'Moses Sakala',
    role: 'Guards • Lusaka Breweries',
    manager: 'David Lungu (Shift Coord)',
    cycleId: 1,
    vigilance: 3.8,
    incidentResponse: 3.5,
    discipline: 4.0,
    equipmentCare: 3.7,
    overall: 3.75,
    statusBadge: 'badge-primary',
    statusLabel: 'Meets Expectations',
    growthPlan: 'Confirmed to Permanent Fixed Contract',
    actionLabel: 'Certificate',
    selfReview: null,
    acknowledgment: null
  },
  {
    id: 3,
    empId: 'CG-00107',
    name: 'Joseph Phiri',
    role: 'Area Manager • Copperbelt',
    manager: 'Kennedy Tembo (RSM-N)',
    cycleId: 1,
    vigilance: 4.6,
    incidentResponse: 4.8,
    discipline: 4.7,
    equipmentCare: 4.7,
    overall: 4.7,
    statusBadge: 'badge-success',
    statusLabel: 'Recommended for Promotion',
    growthPlan: 'Eligible for Annual Executive Bonus (Target SLA Met 99.2%)',
    actionLabel: 'View Report',
    selfReview: null,
    acknowledgment: null
  }
];

export const performanceStore = new PersistedList('cyberguard_performance_appraisals', seedAppraisals);
