<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { canActOnStep } from '$lib/rbac.js';
  import { offboardingStore, deriveOffboardingStage, newOffboardingChain } from '$lib/stores/offboarding.svelte.js';
  import { getDocumentsFor } from '$lib/stores/documents.svelte.js';
  import DocumentsPanel from '$lib/components/DocumentsPanel.svelte';
  import ApprovalStepper from '$lib/components/ApprovalStepper.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  function currentStepRole(exitCase) {
    return exitCase.approvalChain[exitCase.currentStep - 1]?.role;
  }

  let currentPage = $state(1);
  const pageSize = 10;
  let pagedCases = $derived(
    offboardingStore.items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );

  let isExitModalOpen = $state(false);
  let isDocsModalOpen = $state(false);
  let activeDocsCase = $state(null);

  function openDocsModal(exitCase) {
    activeDocsCase = exitCase;
    isDocsModalOpen = true;
  }

  let exitEmployee = $state('');
  let exitReason = $state('Resignation');
  let exitDate = $state('2026-11-15');
  let noticePeriod = $state('30');
  let rehireRec = $state('Eligible');

  const reasonLabels = {
    Resignation: 'Voluntary Resignation',
    ContractExpiry: 'Fixed Contract Expiry',
    Retirement: 'Statutory Retirement',
    ProbationUnsuccessful: 'Unsuccessful Probation Termination',
    Dismissal: 'Disciplinary Dismissal'
  };

  const rehireMeta = {
    Eligible: { label: 'Eligible for Rehire', badge: 'badge-success', note: 'Positive reference on file' },
    Conditional: { label: 'Conditional Rehire', badge: 'badge-primary', note: 'Requires Senior Director Approval' },
    Blacklist: { label: 'Blacklisted / Ineligible', badge: 'badge-danger', note: 'Flagged in registry' }
  };

  function handleExitSubmit(e) {
    e.preventDefault();
    if (!exitEmployee) {
      cyberguard.showToast('Select an employee subject to initiate offboarding.', 'danger');
      return;
    }
    const rehire = rehireMeta[rehireRec];
    offboardingStore.add({
      id: Date.now(),
      name: exitEmployee,
      idLine: `Effective: ${exitDate}`,
      role: 'Field Personnel',
      category: `${reasonLabels[exitReason]} (${noticePeriod === 'PayInLieu' ? 'Pay in Lieu of Notice' : noticePeriod + ' Days Notice'})`,
      checklist: [
        { label: 'Armory: Pending', badge: 'badge-warning' },
        { label: 'IT Access: Pending', badge: 'badge-warning' },
        { label: 'Finance: Pending', badge: 'badge-warning' }
      ],
      duesAmount: 'Pending Calculation',
      duesColor: '#60a5fa',
      duesNote: 'Terminal dues under review',
      rehire: rehire.label,
      rehireBadge: rehire.badge,
      rehireNote: rehire.note,
      actionLabel: 'Area Sign-Off',
      actionClass: 'btn-secondary',
      stage: 'Pending Area Manager Clearance Review',
      currentStep: 1,
      approvalChain: newOffboardingChain()
    });
    isExitModalOpen = false;
    cyberguard.showToast('Offboarding procedure initiated. Automated notifications sent to Armory, IT, and Finance.', 'success');
  }

  function handleCaseAction(exitCase) {
    if (exitCase.actionLabel === 'Issue Cert') {
      cyberguard.showToast(`NAPSA Certificate of Service issued for ${exitCase.name}`, 'success');
    } else if (exitCase.actionLabel === 'Blacklist Audit') {
      cyberguard.showToast('Blacklist dossier updated with Police Notification', 'danger');
    } else {
      // Area Sign-Off / HR Sign-Off — advance one step in the clearance chain
      const chain = exitCase.approvalChain.map((s) => ({ ...s }));
      const stepIdx = exitCase.currentStep - 1;
      chain[stepIdx] = {
        ...chain[stepIdx],
        status: 'approved',
        approverName: chain[stepIdx].approverName || cyberguard.currentUser.name,
        decidedAt: new Date().toISOString().split('T')[0]
      };
      const patch = { approvalChain: chain, currentStep: exitCase.currentStep + 1 };
      Object.assign(patch, deriveOffboardingStage({ ...exitCase, ...patch }));
      offboardingStore.update(exitCase.id, patch);
      cyberguard.showToast(
        patch.stage === 'Cleared'
          ? `${exitCase.name}'s clearance is fully signed off.`
          : `${exitCase.name}'s clearance advanced to the next sign-off stage.`,
        'info'
      );
    }
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Offboarding & Clearance</title>
</svelte:head>

<Topbar title="Separation Workflows, Kit Surrender & Rehire Governance">
  {#snippet actions()}
    <button class="btn btn-danger btn-sm" onclick={() => isExitModalOpen = true}>
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
      Initiate Personnel Exit
    </button>
  {/snippet}
</Topbar>

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Employee Offboarding, Clearance & Rehire Registry</h2>
      <p>End-to-end separation protocol: equipment & arms handover, biometric deactivation, terminal dues calculation, and rehire status tracking</p>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Active Clearances</span>
        <div class="stat-icon amber"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
      </div>
      <div class="stat-val">{offboardingStore.items.filter(c => c.stage !== 'Cleared' && c.stage !== 'Blacklisted').length} Personnel</div>
      <div class="stat-footer"><span>{offboardingStore.items.length} Total Separation Records</span></div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Kit & Arms Recovery Rate</span>
        <div class="stat-icon emerald"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
      </div>
      <div class="stat-val">100%</div>
      <div class="stat-footer"><span class="badge badge-success">0 Weapon Breaches</span><span>All armaments surrendered</span></div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Rehire Eligibility Track</span>
        <div class="stat-icon cyan"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg></div>
      </div>
      <div class="stat-val">88% Eligible</div>
      <div class="stat-footer"><span>Honorable service certificates granted</span></div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">Separation Log & Departmental Clearance Checklist</div>
        <div class="card-subtitle">Tracks Armory, Facilities, IT Access, Finance terminal dues, and HR sign-offs</div>
      </div>
    </div>
    <div class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Exiting Employee</th>
            <th>Job Title & Station</th>
            <th>Exit Category</th>
            <th>Clearance Checklist</th>
            <th>Terminal Dues</th>
            <th>Rehire Classification</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          {#each pagedCases as c (c.id)}
            {@const inProgress = c.stage !== 'Cleared' && c.stage !== 'Blacklisted'}
            {@const stepRole = inProgress ? currentStepRole(c) : null}
            <tr>
              <td>
                <div style="font-weight: 700; color: #fff;">{c.name}</div>
                <div style="font-size: 0.72rem; color: var(--text-dim);">{c.idLine}</div>
              </td>
              <td>{c.role}</td>
              <td>{c.category}</td>
              <td>
                <div style="font-size: 0.74rem;">
                  {#each c.checklist as item}
                    <span class="badge {item.badge}">{item.label}</span>
                  {/each}
                </div>
              </td>
              <td>
                <div style="font-weight: 700; color: {c.duesColor};">{c.duesAmount}</div>
                <div style="font-size: 0.7rem; color: var(--text-dim);">{c.duesNote}</div>
              </td>
              <td>
                <span class="badge {c.rehireBadge}"><span class="badge-dot"></span> {c.rehire}</span>
                <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 2px;">{c.rehireNote}</div>
              </td>
              <td style="text-align: right;">
                <button class="btn btn-secondary btn-sm" onclick={() => openDocsModal(c)} title="Manage clearance documents">
                  Files
                  {#if getDocumentsFor('offboarding', c.id).length > 0}
                    <span class="badge badge-primary" style="margin-left: 4px; padding: 1px 6px; font-size: 0.65rem;">{getDocumentsFor('offboarding', c.id).length}</span>
                  {/if}
                </button>
                <button class="btn {c.actionClass} btn-sm" onclick={() => handleCaseAction(c)} disabled={inProgress && !canActOnStep(cyberguard.activeRoleId, stepRole)} title={inProgress && !canActOnStep(cyberguard.activeRoleId, stepRole) ? 'Your current role cannot sign off at this stage' : ''}>{c.actionLabel}</button>
              </td>
            </tr>
            {#if c.stage !== 'Blacklisted'}
              <tr style="background: transparent;">
                <td colspan="7" style="padding: 4px 16px 16px;">
                  <ApprovalStepper chain={c.approvalChain} currentStep={c.currentStep} />
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
    <Pagination bind:currentPage totalItems={offboardingStore.items.length} {pageSize} />
  </div>

</main>

{#if isExitModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div class="modal-title">Initiate Employee Offboarding Procedure</div>
        <button class="modal-close" onclick={() => isExitModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleExitSubmit}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="exitEmp">Employee Subject <span class="req">*</span></label>
            <select class="form-control" id="exitEmp" bind:value={exitEmployee} required>
              <option value="">Select Employee</option>
              {#each cyberguard.employees as e}
                <option value="{e.firstName} {e.lastName}">{e.firstName} {e.lastName} ({e.id})</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="exitReason">Separation Reason <span class="req">*</span></label>
            <select class="form-control" id="exitReason" bind:value={exitReason} required>
              <option value="Resignation">Voluntary Resignation</option>
              <option value="ContractExpiry">Fixed Contract Expiry</option>
              <option value="Retirement">Statutory Retirement</option>
              <option value="ProbationUnsuccessful">Unsuccessful Probation Termination</option>
              <option value="Dismissal">Disciplinary Dismissal</option>
            </select>
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="exitDate">Effective Exit Date <span class="req">*</span></label>
              <input type="date" class="form-control" id="exitDate" bind:value={exitDate} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="noticePeriod">Notice Period Served</label>
              <select class="form-control" id="noticePeriod" bind:value={noticePeriod}>
                <option value="30">30 Days Notice</option>
                <option value="14">14 Days (Probation)</option>
                <option value="PayInLieu">Pay in Lieu of Notice</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="rehireRec">Preliminary Rehire Recommendation</label>
            <select class="form-control" id="rehireRec" bind:value={rehireRec}>
              <option value="Eligible">Eligible for Future Rehire (Positive Reference)</option>
              <option value="Conditional">Conditional (Requires Senior Director Approval)</option>
              <option value="Blacklist">Ineligible / Blacklisted</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isExitModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Start Multi-Department Clearance</button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if isDocsModalOpen && activeDocsCase}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Clearance Documents</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            {activeDocsCase.name} • {activeDocsCase.idLine}
          </div>
        </div>
        <button class="modal-close" onclick={() => isDocsModalOpen = false}>&times;</button>
      </div>
      <div class="modal-body">
        <DocumentsPanel recordType="offboarding" recordId={activeDocsCase.id} />
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => isDocsModalOpen = false}>Close</button>
      </div>
    </div>
  </div>
{/if}
