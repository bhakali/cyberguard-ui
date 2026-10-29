import { PersistedList } from './persisted.svelte.js';

const CHAIN_TEMPLATE = [
  { step: 1, role: 'hr' },
  { step: 2, role: 'exec' }
];

function buildChain() {
  return CHAIN_TEMPLATE.map((tpl) => ({
    step: tpl.step,
    role: tpl.role,
    approverName: null,
    status: 'pending',
    decidedAt: null
  }));
}

export const payrollRunsStore = new PersistedList('cyberguard_payroll_runs', []);

// Locks a point-in-time, deep-copied snapshot of the live payroll
// calculation into a new run record — so later edits to an employee's
// base pay never retroactively change a period that's already been run.
export function createPayrollRun(period, records) {
  const snapshot = records.map((r) => ({
    empId: r.emp.id,
    name: `${r.emp.firstName} ${r.emp.lastName}`,
    jobTitle: r.emp.jobTitle,
    bankName: r.emp.bankName,
    ...JSON.parse(JSON.stringify(r.pay))
  }));

  const totals = snapshot.reduce(
    (acc, s) => {
      acc.totalGross += s.grossTotal;
      acc.totalNet += s.netPay;
      acc.totalPaye += s.paye;
      acc.totalNapsa += s.napsaEmployee;
      acc.totalNhima += s.nhimaEmployee;
      return acc;
    },
    { totalGross: 0, totalNet: 0, totalPaye: 0, totalNapsa: 0, totalNhima: 0 }
  );

  const run = {
    id: Date.now(),
    period,
    status: 'Pending Approval',
    lockedAt: new Date().toISOString().split('T')[0],
    disbursedAt: null,
    currentStep: 1,
    approvalChain: buildChain(),
    snapshot,
    ...totals
  };

  payrollRunsStore.add(run);
  return run;
}
