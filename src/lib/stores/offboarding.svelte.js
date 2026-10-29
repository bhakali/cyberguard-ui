import { PersistedList } from './persisted.svelte.js';

const STEP_LABELS = {
  area: 'Area Manager Clearance Review',
  hr: 'Finance & HR Final Sign-off'
};

const ACTION_LABELS = {
  area: 'Area Sign-Off',
  hr: 'HR Sign-Off'
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

// Recomputes stage/actionLabel/actionClass from approvalChain + currentStep.
// Only applies to the normal clearance path (Cleared / in-progress sign-off) —
// disciplinary terminal cases (Blacklisted) are left untouched, see below.
export function deriveOffboardingStage(item) {
  const chain = item.approvalChain;

  if (item.currentStep > chain.length) {
    return {
      stage: 'Cleared',
      actionLabel: 'Issue Cert',
      actionClass: 'btn-secondary',
      checklist: item.checklist.map((c) => ({
        ...c,
        label: c.label.replace(/Pending.*/i, 'Signed Off'),
        badge: 'badge-success'
      }))
    };
  }

  const current = chain[item.currentStep - 1];
  return {
    stage: `Pending ${STEP_LABELS[current.role] || current.role}`,
    actionLabel: ACTION_LABELS[current.role] || 'Sign-Off',
    actionClass: 'btn-secondary',
    checklist: item.checklist
  };
}

const seedExitCases = [
  {
    id: 1,
    name: 'Chilufya Musenge',
    idLine: 'ID: CG-00088 • NRC: 291820/66/1',
    role: 'Guards • Konkola Smelter Post',
    category: 'Voluntary Resignation (30d Notice)',
    checklist: [
      { label: 'Arms Store: Cleared', badge: 'badge-success' },
      { label: 'Kit: Returned', badge: 'badge-success' },
      { label: 'RFID: Deactivated', badge: 'badge-success' }
    ],
    duesAmount: 'ZMW 14,200.00',
    duesColor: '#34d399',
    duesNote: 'Accrued leave + severance',
    rehire: 'Eligible for Rehire',
    rehireBadge: 'badge-success',
    rehireNote: 'Clean conduct, honorable exit',
    actionLabel: 'Issue Cert',
    actionClass: 'btn-secondary',
    stage: 'Cleared',
    currentStep: 3,
    approvalChain: buildChain([
      { approverName: 'Joseph Phiri', status: 'approved', decidedAt: '2026-10-02' },
      { approverName: 'Mutale Kangwa', status: 'approved', decidedAt: '2026-10-04' }
    ])
  },
  {
    id: 2,
    name: 'Jackson Phiri',
    idLine: 'ID: CG-00094 • NRC: 381920/11/1',
    role: 'Site Supervisor • Lusaka Depot',
    category: 'Contract Expiry (End of 2-Yr Term)',
    checklist: [
      { label: 'Arms: Surrendered', badge: 'badge-success' },
      { label: 'Finance: Pending Sign-off', badge: 'badge-warning' }
    ],
    duesAmount: 'ZMW 28,400.00',
    duesColor: '#fbbf24',
    duesNote: 'Gratuity calculation in review',
    rehire: 'Rehire Recommended',
    rehireBadge: 'badge-primary',
    rehireNote: 'Priority candidate for upcoming area roles',
    actionLabel: 'HR Sign-Off',
    actionClass: 'btn-secondary',
    stage: 'Pending Finance & HR Final Sign-off',
    currentStep: 2,
    approvalChain: buildChain([
      { approverName: 'Joseph Phiri', status: 'approved', decidedAt: '2026-10-18' }
    ])
  },
  {
    id: 3,
    name: 'Derrick Chanda',
    idLine: 'ID: CG-00072 • NRC: 401928/67/1',
    role: 'Guards • Chingola Gate',
    category: 'Summary Dismissal (Gross Misconduct)',
    checklist: [
      { label: 'Disciplinary Hearing #42', badge: 'badge-danger' },
      { label: 'All Access Revoked', badge: 'badge-success' }
    ],
    duesAmount: 'ZMW 2,100.00',
    duesColor: '#f87171',
    duesNote: 'Statutory earned days only',
    rehire: 'Blacklisted / Ineligible',
    rehireBadge: 'badge-danger',
    rehireNote: 'Site abandonment & weapon negligence',
    actionLabel: 'Blacklist Audit',
    actionClass: 'btn-danger',
    stage: 'Blacklisted',
    // Disciplinary dismissal is a separate terminal path, not the normal
    // clearance approval chain — no stepper is rendered for this case
    // (see offboarding/+page.svelte), this shape is kept only so every
    // record has a consistent approvalChain/currentStep field.
    currentStep: 3,
    approvalChain: buildChain([
      { approverName: 'Joseph Phiri', status: 'approved', decidedAt: '2026-09-28' },
      { approverName: 'Mutale Kangwa', status: 'approved', decidedAt: '2026-09-29' }
    ])
  }
];

export const offboardingStore = new PersistedList('cyberguard_offboarding_cases', seedExitCases);

export function newOffboardingChain() {
  return buildChain();
}

// Defensive normalization for any previously-persisted record saved
// before approvalChain existed.
export function normalizeOffboardingChains() {
  offboardingStore.items.forEach((item) => {
    if (!item.approvalChain) {
      const cleared = item.stage === 'Cleared' || item.stage === 'Blacklisted';
      item.approvalChain = buildChain(
        cleared ? [{ status: 'approved' }, { status: 'approved' }] : []
      );
      item.currentStep = cleared ? 3 : 1;
    }
  });
  offboardingStore.save();
}
