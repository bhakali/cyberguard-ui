import { PersistedList } from './persisted.svelte.js';

const STEP_LABELS = {
  area: 'Area Manager Review',
  hr: 'Operations Final Review'
};

const ACTION_LABELS = {
  area: 'Complete Review',
  hr: 'Close Incident'
};

const OUTCOME_LABELS = {
  resolved: 'Resolved',
  escalated: 'Escalated for Disciplinary Action',
  closed_no_action: 'Closed — No Action'
};

const DEFAULT_CHAIN_TEMPLATE = [
  { step: 1, role: 'area' },
  { step: 2, role: 'hr' }
];

function buildChain(overrides = []) {
  return DEFAULT_CHAIN_TEMPLATE.map((tpl, idx) => ({
    step: tpl.step,
    role: tpl.role,
    approverName: overrides[idx]?.approverName ?? null,
    status: overrides[idx]?.status ?? 'pending',
    decidedAt: overrides[idx]?.decidedAt ?? null
  }));
}

// Recomputes stage/actionLabel from approvalChain + currentStep, mirroring
// deriveGrievanceStatus / deriveOffboardingStage.
export function deriveIncidentStatus(item) {
  const chain = item.approvalChain;

  if (item.currentStep > chain.length) {
    return {
      stage: OUTCOME_LABELS[item.outcome] || 'Resolved',
      actionLabel: 'View Case File',
      actionClass: 'btn-secondary'
    };
  }

  const current = chain[item.currentStep - 1];
  return {
    stage: `Pending ${STEP_LABELS[current.role] || current.role}`,
    actionLabel: ACTION_LABELS[current.role] || 'Advance',
    actionClass: current.role === 'hr' ? 'btn-primary' : 'btn-secondary'
  };
}

const seedIncidents = [
  {
    id: 1,
    empId: 'CG-00111',
    empName: 'Kelvin Musonda',
    reportedBy: 'Kelvin Musonda (Guards)',
    post: 'KCM Open Pit Perimeter Post 4',
    category: 'Security Breach',
    severity: 'High',
    description: 'Unidentified vehicle attempted to bypass the perimeter checkpoint at night. Access denied, incident logged with Control Room.',
    occurredAt: '2026-10-18',
    filedAt: '2026-10-18',
    outcome: 'pending',
    currentStep: 2,
    approvalChain: buildChain([
      { approverName: 'Joseph Phiri', status: 'approved', decidedAt: '2026-10-19' }
    ])
  },
  {
    id: 2,
    empId: 'CG-00112',
    empName: 'Moses Sakala',
    reportedBy: 'Moses Sakala (Guards)',
    post: 'Lusaka Breweries Logistics Gate',
    category: 'Equipment Fault',
    severity: 'Medium',
    description: 'Hand-held radio unit failed mid-shift. Backup radio issued from Control Room within 20 minutes.',
    occurredAt: '2026-10-10',
    filedAt: '2026-10-10',
    outcome: 'resolved',
    currentStep: 3,
    approvalChain: buildChain([
      { approverName: 'Mutale Kangwa', status: 'approved', decidedAt: '2026-10-11' },
      { approverName: 'Patrick Banda', status: 'approved', decidedAt: '2026-10-12' }
    ])
  },
  {
    id: 3,
    empId: 'CG-00110',
    empName: 'Brian Bwalya',
    reportedBy: 'Brian Bwalya (Site Supervisor)',
    post: 'Konkola Mine Smelter Post',
    category: 'Medical',
    severity: 'Low',
    description: 'Contractor on site reported minor dehydration during a heat spell. First aid administered on-site, contractor cleared to continue.',
    occurredAt: '2026-10-24',
    filedAt: '2026-10-24',
    outcome: 'pending',
    currentStep: 1,
    approvalChain: buildChain()
  }
];

export const incidentsStore = new PersistedList('cyberguard_incidents', seedIncidents);

export function newIncidentChain() {
  return buildChain();
}

// Defensive normalization for any previously-persisted record saved
// before approvalChain existed.
export function normalizeIncidentChains() {
  incidentsStore.items.forEach((item) => {
    if (!item.approvalChain) {
      const resolved = item.outcome && item.outcome !== 'pending';
      item.approvalChain = buildChain(resolved ? [{ status: 'approved' }, { status: 'approved' }] : []);
      item.currentStep = resolved ? 3 : 1;
    }
  });
  incidentsStore.save();
}
