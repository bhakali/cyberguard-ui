<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { formatZMW } from '$lib/cyberguard.svelte.js';
  import { payrollRunsStore } from '$lib/stores/payrollRuns.svelte.js';
  import ApprovalStepper from '$lib/components/ApprovalStepper.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  let isBreakdownOpen = $state(false);
  let activeRunDetail = $state(null);
  let currentPage = $state(1);
  const pageSize = 10;
  let pagedRuns = $derived(
    payrollRunsStore.items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );

  function openBreakdown(run) {
    activeRunDetail = run;
    isBreakdownOpen = true;
  }

  function statusBadgeClass(status) {
    if (status === 'Disbursed') return 'badge-success';
    if (status === 'Approved') return 'badge-primary';
    return 'badge-warning';
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Payroll Run History</title>
</svelte:head>

<Topbar title="Payroll Run History" />

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Locked Payroll Run History</h2>
      <p>Every payroll period, once locked, is frozen as a point-in-time snapshot — later edits to an employee's pay never change a historical run</p>
    </div>
    <div class="header-actions">
      <a href="/payroll" class="btn btn-secondary">
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Back to Current Payroll
      </a>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">Pay Periods</div>
        <div class="card-subtitle">{payrollRunsStore.items.length} run{payrollRunsStore.items.length === 1 ? '' : 's'} on record</div>
      </div>
    </div>
    <div class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Status</th>
            <th>Approval Progress</th>
            <th>Employees</th>
            <th>Total Net Pay</th>
            <th>Locked</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          {#if payrollRunsStore.items.length === 0}
            <tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">No payroll periods have been run yet. Lock the current period from the Payroll page to start building history.</td></tr>
          {:else}
            {#each pagedRuns as run (run.id)}
              <tr>
                <td><strong>{run.period}</strong></td>
                <td><span class="badge {statusBadgeClass(run.status)}"><span class="badge-dot"></span> {run.status}</span></td>
                <td style="min-width: 260px;">
                  <ApprovalStepper chain={run.approvalChain} currentStep={run.currentStep} />
                </td>
                <td>{run.snapshot.length}</td>
                <td style="font-weight: 700; color: #34d399;">{formatZMW(run.totalNet)}</td>
                <td style="font-size: 0.8rem; color: var(--text-dim);">
                  {run.lockedAt}
                  {#if run.disbursedAt}
                    <div>Disbursed {run.disbursedAt}</div>
                  {/if}
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-secondary btn-sm" onclick={() => openBreakdown(run)}>View Breakdown</button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
    <Pagination bind:currentPage totalItems={payrollRunsStore.items.length} {pageSize} />
  </div>

</main>

{#if isBreakdownOpen && activeRunDetail}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 820px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">{activeRunDetail.period} — Locked Snapshot</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            Locked {activeRunDetail.lockedAt} • Status: {activeRunDetail.status}
          </div>
        </div>
        <button class="modal-close" onclick={() => isBreakdownOpen = false}>&times;</button>
      </div>
      <div class="modal-body">
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Gross</th>
                <th>ZRA PAYE</th>
                <th>NAPSA</th>
                <th>NHIMA</th>
                <th>Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {#each activeRunDetail.snapshot as s (s.empId)}
                <tr>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">{s.name}</div>
                    <div style="font-size: 0.72rem; color: var(--text-dim);">{s.jobTitle} • {s.empId}</div>
                  </td>
                  <td>{formatZMW(s.grossTotal)}</td>
                  <td style="color: var(--warning);">{formatZMW(s.paye)}</td>
                  <td>{formatZMW(s.napsaEmployee)}</td>
                  <td>{formatZMW(s.nhimaEmployee)}</td>
                  <td style="font-weight: 700; color: var(--success);">{formatZMW(s.netPay)}</td>
                </tr>
              {/each}
            </tbody>
            <tfoot>
              <tr style="font-weight: 700;">
                <td>Totals</td>
                <td>{formatZMW(activeRunDetail.totalGross)}</td>
                <td style="color: var(--warning);">{formatZMW(activeRunDetail.totalPaye)}</td>
                <td>{formatZMW(activeRunDetail.totalNapsa)}</td>
                <td>{formatZMW(activeRunDetail.totalNhima)}</td>
                <td style="color: var(--success);">{formatZMW(activeRunDetail.totalNet)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => isBreakdownOpen = false}>Close</button>
      </div>
    </div>
  </div>
{/if}
