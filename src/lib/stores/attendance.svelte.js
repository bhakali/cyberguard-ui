import { PersistedList } from './persisted.svelte.js';

const STEP_LABELS = {
  site_sup: 'Site Supervisor Review',
  area: 'Area Manager Review',
  hr: 'HR Manager Final Stage'
};

const DEFAULT_CHAIN_TEMPLATE = [
  { step: 1, role: 'site_sup' },
  { step: 2, role: 'area' },
  { step: 3, role: 'hr' }
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

// Recomputes the human-readable status/subStatus/badgeClass/isDecided
// fields from approvalChain + currentStep, so existing badge-rendering
// markup keeps working unchanged while the chain becomes the source of truth.
export function deriveLeaveStatus(item) {
  const chain = item.approvalChain;
  const rejectedStep = chain.find((s) => s.status === 'rejected');

  if (rejectedStep) {
    return {
      status: 'Rejected (Operational Shortage)',
      subStatus: `${STEP_LABELS[rejectedStep.role] || rejectedStep.role} rejected by ${rejectedStep.approverName || 'reviewer'}`,
      badgeClass: 'badge-danger',
      isDecided: true
    };
  }

  if (item.currentStep > chain.length) {
    const last = chain[chain.length - 1];
    return {
      status: 'Fully Approved (HR Sign-off)',
      subStatus: `Authorization issued by ${last.approverName || 'HR Manager'}`,
      badgeClass: 'badge-success',
      isDecided: true
    };
  }

  const current = chain[item.currentStep - 1];
  const previouslyApproved = chain
    .slice(0, item.currentStep - 1)
    .filter((s) => s.status === 'approved');
  const lastApproved = previouslyApproved[previouslyApproved.length - 1];

  return {
    status: STEP_LABELS[current.role] || current.role,
    subStatus: lastApproved
      ? `${STEP_LABELS[lastApproved.role] || lastApproved.role} approved by ${lastApproved.approverName || 'reviewer'}`
      : 'New Submission',
    badgeClass: 'badge-warning',
    isDecided: false
  };
}

function withDerivedStatus(item) {
  return { ...item, ...deriveLeaveStatus(item) };
}

const seedLeaveQueue = [
  withDerivedStatus({
    id: 1,
    empId: 'CG-00111',
    name: 'Kelvin Musonda',
    title: 'Guards • Kansanshi Post',
    type: 'Annual Leave',
    duration: '5 Days (24 Oct - 29 Oct 2026)',
    durationDays: 5,
    reason: 'Family harvest • Relief Guard: Moses Sakala',
    currentStep: 2,
    approvalChain: buildChain([
      { approverName: 'Brian Bwalya', status: 'approved', decidedAt: '2026-10-20' }
    ])
  }),
  withDerivedStatus({
    id: 2,
    empId: 'CG-00109',
    name: 'Mary Chilufya',
    title: 'Site Coordinators • Kansanshi',
    type: 'Sick Leave',
    duration: '3 Days (17 Oct - 19 Oct 2026)',
    durationDays: 3,
    reason: 'Medical treatment • Solwezi General Hospital Cert',
    currentStep: 3,
    approvalChain: buildChain([
      { approverName: 'Site Supervisor', status: 'approved', decidedAt: '2026-10-16' },
      { approverName: 'Joseph Phiri', status: 'approved', decidedAt: '2026-10-17' }
    ])
  })
];

export const attendanceStore = new PersistedList('cyberguard_leave_queue', seedLeaveQueue);

export function newLeaveChain() {
  return buildChain();
}

// Defensive normalization: back-fills approvalChain/currentStep on any
// previously-persisted record saved before this shape existed, so an
// old localStorage snapshot doesn't break the stepper UI.
export function normalizeAttendanceChains() {
  attendanceStore.items.forEach((item) => {
    if (!item.approvalChain) {
      item.approvalChain = buildChain();
      item.currentStep = item.isDecided ? item.approvalChain.length + 1 : 1;
      Object.assign(item, deriveLeaveStatus(item));
    }
  });
  attendanceStore.save();
}
