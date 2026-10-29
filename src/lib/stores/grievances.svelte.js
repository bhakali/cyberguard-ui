import { PersistedList } from './persisted.svelte.js';

const STEP_LABELS = {
  area: 'Area Manager Investigation',
  hr: 'HR Final Determination'
};

const ACTION_LABELS = {
  area: 'Complete Investigation',
  hr: 'Determine Outcome'
};

const OUTCOME_LABELS = {
  resolved_no_action: 'Resolved — No Action',
  warning_issued: 'Resolved — Warning Issued',
  dismissal: 'Resolved — Dismissal'
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
// deriveOffboardingStage. Once the chain completes, stage reflects the
// outcome chosen at the final (HR) sign-off.
export function deriveGrievanceStatus(item) {
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

const seedCases = [
  {
    id: 1,
    empId: 'CG-00072',
    empName: 'Derrick Chanda',
    raisedBy: 'Brian Bwalya (Site Supervisor)',
    category: 'Disciplinary',
    severity: 'Gross Misconduct',
    description: 'Site abandonment during active shift and weapon handling negligence at Chingola Gate.',
    filedAt: '2026-09-25',
    outcome: 'dismissal',
    linkedOffboardingCaseId: 3,
    currentStep: 3,
    approvalChain: buildChain([
      { approverName: 'Joseph Phiri', status: 'approved', decidedAt: '2026-09-28' },
      { approverName: 'Mutale Kangwa', status: 'approved', decidedAt: '2026-09-29' }
    ])
  },
  {
    id: 2,
    empId: 'CG-00112',
    empName: 'Moses Sakala',
    raisedBy: 'David Lungu (Shift Coordinator)',
    category: 'Grievance',
    severity: 'Low',
    description: 'Employee raised a concern about delayed overtime payment for October shift coverage.',
    filedAt: '2026-10-22',
    outcome: 'pending',
    linkedOffboardingCaseId: null,
    currentStep: 1,
    approvalChain: buildChain()
  }
];

export const grievancesStore = new PersistedList('cyberguard_grievances', seedCases);

export function newGrievanceChain() {
  return buildChain();
}

// Defensive normalization for any previously-persisted record saved
// before approvalChain existed.
export function normalizeGrievanceChains() {
  grievancesStore.items.forEach((item) => {
    if (!item.approvalChain) {
      const resolved = item.outcome && item.outcome !== 'pending';
      item.approvalChain = buildChain(resolved ? [{ status: 'approved' }, { status: 'approved' }] : []);
      item.currentStep = resolved ? 3 : 1;
    }
  });
  grievancesStore.save();
}
