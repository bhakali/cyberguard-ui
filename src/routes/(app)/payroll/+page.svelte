<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard, formatZMW } from '$lib/cyberguard.svelte.js';
  import { can, canActOnStep } from '$lib/rbac.js';
  import { payrollRunsStore, createPayrollRun } from '$lib/stores/payrollRuns.svelte.js';
  import ApprovalStepper from '$lib/components/ApprovalStepper.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  let selectedEmpForPayslip = $state(null);
  let isPayslipModalOpen = $state(false);
  let currentPage = $state(1);
  const pageSize = 10;

  let latestRun = $derived(payrollRunsStore.items[0] || null);
  let activeRun = $derived(latestRun && latestRun.status !== 'Disbursed' ? latestRun : null);

  function getOtHours(emp) {
    if (emp.jobTitle === "Guards") return 12;
    if (emp.jobTitle === "Site Supervisor") return 8;
    if (emp.jobTitle === "Shift Coordinator") return 6;
    return 0;
  }

  let payrollRecords = $derived(
    cyberguard.employees.map(emp => {
      const otHours = getOtHours(emp);
      const pay = cyberguard.calculatePayroll(emp, otHours);
      return {
        emp,
        pay
      };
    })
  );

  let pagedPayrollRecords = $derived(
    payrollRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );

  let activePayslipData = $derived.by(() => {
    if (!selectedEmpForPayslip) return null;
    const otHours = getOtHours(selectedEmpForPayslip);
    const pay = cyberguard.calculatePayroll(selectedEmpForPayslip, otHours);
    return {
      emp: selectedEmpForPayslip,
      pay
    };
  });

  function openPayslip(emp) {
    selectedEmpForPayslip = emp;
    isPayslipModalOpen = true;
  }

  function currentPeriodLabel() {
    return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  function runAndLockPeriod() {
    const period = currentPeriodLabel();
    createPayrollRun(period, payrollRecords);
    cyberguard.showToast(`Payroll run locked for ${period}. Awaiting approval.`, 'success');
  }

  function currentStepRole(run) {
    return run.approvalChain[run.currentStep - 1]?.role;
  }

  function advanceRunApproval(run) {
    const chain = run.approvalChain.map((s) => ({ ...s }));
    const stepIdx = run.currentStep - 1;
    chain[stepIdx] = {
      ...chain[stepIdx],
      status: 'approved',
      approverName: chain[stepIdx].approverName || cyberguard.currentUser.name,
      decidedAt: new Date().toISOString().split('T')[0]
    };
    const nextStep = run.currentStep + 1;
    const patch = { approvalChain: chain, currentStep: nextStep };
    if (nextStep > chain.length) {
      patch.status = 'Approved';
    }
    payrollRunsStore.update(run.id, patch);
    cyberguard.showToast(
      patch.status === 'Approved'
        ? `Payroll run for ${run.period} is fully approved and ready to disburse.`
        : `Payroll run for ${run.period} advanced to the next approval stage.`,
      'success'
    );
  }

  function disburseRun(run) {
    payrollRunsStore.update(run.id, {
      status: 'Disbursed',
      disbursedAt: new Date().toISOString().split('T')[0]
    });
    cyberguard.showToast(`Payroll for ${run.period} disbursed to Stanbic/Absa/ZANACO Bank Batch EFT.`, 'success');
  }

  function exportSchedule() {
    cyberguard.showToast('Exporting ZRA e-Tax CSV Schedule & NAPSA Returns Form', 'info');
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Payroll & Statutory (ZRA/NAPSA)</title>
</svelte:head>

<Topbar title="Statutory Compensation (ZRA PAYE, NAPSA & NHIMA)">
  {#snippet actions()}
    {#if !activeRun}
      <button class="btn btn-primary btn-sm" onclick={runAndLockPeriod}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>
        Run &amp; Lock Current Period
      </button>
    {:else if activeRun.status === 'Pending Approval'}
      <button class="btn btn-primary btn-sm" onclick={() => advanceRunApproval(activeRun)} disabled={!canActOnStep(cyberguard.activeRoleId, currentStepRole(activeRun))} title={canActOnStep(cyberguard.activeRoleId, currentStepRole(activeRun)) ? '' : 'Your current role cannot approve at this stage'}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        Approve Run (Step {activeRun.currentStep} of {activeRun.approvalChain.length})
      </button>
    {:else if activeRun.status === 'Approved'}
      <button class="btn btn-primary btn-sm" onclick={() => disburseRun(activeRun)} disabled={!can(cyberguard.activeRoleId, 'canEditPay')} title={can(cyberguard.activeRoleId, 'canEditPay') ? '' : 'Your current role cannot disburse payroll'}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        Disburse Payroll
      </button>
    {/if}
  {/snippet}
</Topbar>

<main class="page-container">
  
  <div class="page-header">
    <div class="header-title-area">
      <h2>Monthly Payroll Run & Statutory Reconciliation</h2>
      <p>Salary structures, overtime calculations, housing/transport allowances, and Zambian statutory deductions (NAPSA 5%, NHIMA 1%, ZRA PAYE)</p>
    </div>
    <div class="header-actions">
      <a href="/payroll/history" class="btn btn-secondary">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Run History
      </a>
      <button class="btn btn-secondary" onclick={exportSchedule}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        Export Statutory Schedule
      </button>
    </div>
  </div>

  {#if activeRun}
    <div class="card" style="margin-bottom: 24px;">
      <div class="card-header">
        <div>
          <div class="card-title">Payroll Run In Progress — {activeRun.period}</div>
          <div class="card-subtitle">
            Locked {activeRun.lockedAt} • {formatZMW(activeRun.totalNet)} total net pay across {activeRun.snapshot.length} employees
          </div>
        </div>
        <span class="badge {activeRun.status === 'Approved' ? 'badge-success' : 'badge-warning'}">
          <span class="badge-dot"></span> {activeRun.status}
        </span>
      </div>
      <div class="card-body">
        <ApprovalStepper chain={activeRun.approvalChain} currentStep={activeRun.currentStep} />
      </div>
    </div>
  {/if}

  <!-- Statutory Metrics Summary -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Total Gross Payroll Liability</span>
        <div class="stat-icon cyan"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
      </div>
      <div class="stat-val">ZMW 4,845,200</div>
      <div class="stat-footer"><span>Includes base, overtime & allowances</span></div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">ZRA PAYE Tax Withheld</span>
        <div class="stat-icon emerald"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
      </div>
      <div class="stat-val">ZMW 812,400</div>
      <div class="stat-footer"><span class="badge badge-success">e-Tax Ready</span><span>Due by 10th of next month</span></div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">NAPSA Social Security (5% + 5%)</span>
        <div class="stat-icon amber"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
      </div>
      <div class="stat-val">ZMW 412,800</div>
      <div class="stat-footer"><span>Employee 5% + Employer 5% Match</span></div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">NHIMA Health (1% + 1%)</span>
        <div class="stat-icon rose"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg></div>
      </div>
      <div class="stat-val">ZMW 82,560</div>
      <div class="stat-footer"><span>100% Workforce Health Scheme Enrolled</span></div>
    </div>
  </div>

  <!-- Master Payroll Table -->
  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">Employee Compensation &amp; Deductions Run Sheet <span class="badge badge-accent" style="margin-left: 6px; font-size: 0.65rem;">Live Draft</span></div>
        <div class="card-subtitle">Recalculated in real time from current employee records — lock a period above to snapshot it into a formal run</div>
      </div>
      <div style="font-size: 0.76rem; color: var(--accent-cyan);">
        Formula: Net = Gross - (ZRA PAYE + NAPSA + NHIMA)
      </div>
    </div>

    <div class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Employee & Role</th>
            <th>Base Pay</th>
            <th>Allowances</th>
            <th>Overtime</th>
            <th>Gross Total</th>
            <th>NAPSA (5%)</th>
            <th>NHIMA (1%)</th>
            <th>ZRA PAYE</th>
            <th>Total Deductions</th>
            <th>Net Payout</th>
            <th style="text-align: right;">Payslip</th>
          </tr>
        </thead>
        <tbody>
          {#each pagedPayrollRecords as item (item.emp.id)}
            <tr>
              <td>
                <div style="font-weight: 700; color: #fff;">{item.emp.firstName} {item.emp.lastName}</div>
                <div style="font-size: 0.72rem; color: var(--text-dim);">{item.emp.jobTitle} • {item.emp.nationalId}</div>
              </td>
              <td>{formatZMW(item.pay.basePay)}</td>
              <td>{formatZMW(item.pay.housingAllowance + item.pay.transportAllowance + item.pay.dangerPay)}</td>
              <td>
                {#if item.pay.overtimeHours > 0}
                  {item.pay.overtimeHours}h ({formatZMW(item.pay.overtimePay)})
                {:else}
                  -
                {/if}
              </td>
              <td style="font-weight: 700; color: #93c5fd;">{formatZMW(item.pay.grossTotal)}</td>
              <td>{formatZMW(item.pay.napsaEmployee)}</td>
              <td>{formatZMW(item.pay.nhimaEmployee)}</td>
              <td style="color: #fbbf24;">{formatZMW(item.pay.paye)}</td>
              <td style="color: #f87171;">{formatZMW(item.pay.totalDeductions)}</td>
              <td style="font-weight: 800; color: #34d399;">{formatZMW(item.pay.netPay)}</td>
              <td style="text-align: right;">
                <button class="btn btn-secondary btn-sm" onclick={() => openPayslip(item.emp)}>
                  View Payslip
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <Pagination bind:currentPage totalItems={payrollRecords.length} {pageSize} />
  </div>

</main>

<!-- INTERACTIVE PAYSLIP MODAL -->
{#if isPayslipModalOpen && activePayslipData}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 760px;">
      <div class="modal-header">
        <div class="modal-title">Employee Advice Payslip</div>
        <button class="modal-close" onclick={() => isPayslipModalOpen = false}>&times;</button>
      </div>
      <div class="modal-body" style="background: #e2e8f0; padding: 24px; color: #0f172a;">
        
        <div class="payslip-sheet" style="background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div class="payslip-header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 16px;">
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 2px;">CYBERGUARD SECURITY & HR SERVICES LTD</h2>
              <div style="font-size: 0.78rem; color: #475569;">Plot 42 Leopards Hill Rd, Lusaka, Zambia • ZRA TPIN: 1002938472</div>
              <div style="font-size: 0.78rem; color: #475569;">NAPSA Employer No: 881920 • NHIMA No: NH-ZM-1029</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.1rem; font-weight: 800; color: #2563eb;">PAYSLIP ADVICE</div>
              <div style="font-size: 0.78rem; color: #475569;">Pay Period: October 2026</div>
              <div style="font-size: 0.78rem; color: #475569;">Disbursement: 25-Oct-2026</div>
            </div>
          </div>

          <!-- Employee Header Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 0.8rem; background: #f8fafc; padding: 14px; border-radius: 6px; border: 1px solid #e2e8f0; color: #1e293b;">
            <div>
              <div><strong>Employee Name:</strong> {activePayslipData.emp.firstName} {activePayslipData.emp.lastName}</div>
              <div><strong>Employee ID:</strong> {activePayslipData.emp.id}</div>
              <div><strong>Designation:</strong> {activePayslipData.emp.jobTitle} ({activePayslipData.emp.gradeLevel})</div>
              <div><strong>Cost Center:</strong> {activePayslipData.emp.costCenter}</div>
            </div>
            <div>
              <div><strong>National ID (NRC):</strong> {activePayslipData.emp.nationalId}</div>
              <div><strong>ZRA TPIN:</strong> {activePayslipData.emp.zraTpin}</div>
              <div><strong>NAPSA No:</strong> {activePayslipData.emp.napsaNo}</div>
              <div><strong>Bank & Branch:</strong> {activePayslipData.emp.bankName}</div>
            </div>
          </div>

          <!-- Earnings vs Deductions Table -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            
            <!-- Earnings -->
            <div>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; color: #1e293b;">
                <thead>
                  <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
                    <th style="padding: 6px 0;">Earnings Description</th>
                    <th style="text-align: right; padding: 6px 0;">Amount (ZMW)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0;">Basic Salary</td><td style="text-align: right; padding: 6px 0;">{formatZMW(activePayslipData.pay.basePay)}</td></tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0;">Housing Allowance</td><td style="text-align: right; padding: 6px 0;">{formatZMW(activePayslipData.pay.housingAllowance)}</td></tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0;">Transport Allowance</td><td style="text-align: right; padding: 6px 0;">{formatZMW(activePayslipData.pay.transportAllowance)}</td></tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0;">Danger / Hardship Pay</td><td style="text-align: right; padding: 6px 0;">{formatZMW(activePayslipData.pay.dangerPay)}</td></tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0;">Overtime Pay (Approved)</td><td style="text-align: right; padding: 6px 0;">{formatZMW(activePayslipData.pay.overtimePay)}</td></tr>
                  <tr style="font-weight: 700; background: #f8fafc; border-top: 2px solid #cbd5e1;">
                    <td style="padding: 8px 0;">Total Gross Earnings</td>
                    <td style="text-align: right; padding: 8px 0;">{formatZMW(activePayslipData.pay.grossTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Deductions -->
            <div>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; color: #1e293b;">
                <thead>
                  <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
                    <th style="padding: 6px 0;">Statutory Deductions</th>
                    <th style="text-align: right; padding: 6px 0;">Amount (ZMW)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0;">ZRA PAYE Tax (Bands)</td><td style="text-align: right; padding: 6px 0; color: #b45309;">{formatZMW(activePayslipData.pay.paye)}</td></tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0;">NAPSA Pension (5%)</td><td style="text-align: right; padding: 6px 0;">{formatZMW(activePayslipData.pay.napsaEmployee)}</td></tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0;">NHIMA Health Scheme (1%)</td><td style="text-align: right; padding: 6px 0;">{formatZMW(activePayslipData.pay.nhimaEmployee)}</td></tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0;">Loan / Uniform Deduction</td><td style="text-align: right; padding: 6px 0;">ZMW 0.00</td></tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0;">Union Contribution</td><td style="text-align: right; padding: 6px 0;">ZMW 0.00</td></tr>
                  <tr style="font-weight: 700; background: #f8fafc; border-top: 2px solid #cbd5e1;">
                    <td style="padding: 8px 0;">Total Deductions</td>
                    <td style="text-align: right; padding: 8px 0; color: #dc2626;">{formatZMW(activePayslipData.pay.totalDeductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          <!-- Net Pay Box -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #0f172a; padding: 18px 20px; border-radius: 8px; color: #fff;">
            <div>
              <div style="font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">NET SALARY PAYABLE TO BANK ACCOUNT:</div>
              <div style="font-size: 0.82rem; color: #93c5fd;">Direct Deposit to {activePayslipData.emp.bankName}</div>
            </div>
            <div style="font-size: 1.6rem; font-weight: 800; color: #34d399;">{formatZMW(activePayslipData.pay.netPay)}</div>
          </div>

          <!-- Employer Statutory Contribution Note -->
          <div style="margin-top: 14px; font-size: 0.72rem; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 10px; display: flex; justify-content: space-between;">
            <div>Employer Statutory Contribution: NAPSA 5% Match: <strong>{formatZMW(activePayslipData.pay.napsaEmployer)}</strong> | NHIMA 1% Match: <strong>{formatZMW(activePayslipData.pay.nhimaEmployer)}</strong></div>
            <div>Computer Generated Advice • Authentic Document</div>
          </div>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => isPayslipModalOpen = false}>Close</button>
        <button class="btn btn-primary" onclick={() => cyberguard.showToast('Payslip downloaded as official encrypted PDF document', 'success')}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Download PDF Payslip
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .payslip-sheet {
    background: #ffffff;
    color: #0f172a;
    border-radius: var(--radius-lg);
    padding: 32px;
    font-family: 'Inter', -apple-system, sans-serif;
    box-shadow: var(--shadow-lg);
  }

  .payslip-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 16px;
    margin-bottom: 20px;
  }

  .payslip-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
    font-size: 0.85rem;
  }

  .payslip-table th {
    background: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
    text-align: left;
  }

  .payslip-table td {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    color: #334155;
  }

  .payslip-net-box {
    background: #0f172a;
    color: #ffffff;
    padding: 16px 20px;
    border-radius: var(--radius-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
  }
</style>
