<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { grievancesStore, deriveGrievanceStatus, newGrievanceChain } from '$lib/stores/grievances.svelte.js';
  import { offboardingStore, newOffboardingChain } from '$lib/stores/offboarding.svelte.js';
  import { getDocumentsFor } from '$lib/stores/documents.svelte.js';
  import { canActOnStep } from '$lib/rbac.js';
  import ApprovalStepper from '$lib/components/ApprovalStepper.svelte';
  import DocumentsPanel from '$lib/components/DocumentsPanel.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  let currentPage = $state(1);
  const pageSize = 10;
  let pagedCases = $derived(
    grievancesStore.items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );

  let isFileCaseModalOpen = $state(false);
  let isOutcomeModalOpen = $state(false);
  let isDocsModalOpen = $state(false);
  let activeCase = $state(null);

  // File New Case form
  let caseEmpId = $state('');
  let caseRaisedBy = $state('');
  let caseCategory = $state('Grievance');
  let caseSeverity = $state('Low');
  let caseDescription = $state('');

  // Outcome determination form
  let outcomeChoice = $state('resolved_no_action');

  function currentStepRole(item) {
    return item.approvalChain[item.currentStep - 1]?.role;
  }

  function isFinalStep(item) {
    return item.currentStep === item.approvalChain.length;
  }

  function openFileCaseModal() {
    caseEmpId = '';
    caseRaisedBy = '';
    caseCategory = 'Grievance';
    caseSeverity = 'Low';
    caseDescription = '';
    isFileCaseModalOpen = true;
  }

  function handleFileCase(e) {
    e.preventDefault();
    const emp = cyberguard.employees.find(emp => emp.id === caseEmpId);
    if (!emp) {
      cyberguard.showToast('Select the employee this case concerns.', 'danger');
      return;
    }
    grievancesStore.add({
      id: Date.now(),
      empId: emp.id,
      empName: `${emp.firstName} ${emp.lastName}`,
      raisedBy: caseRaisedBy || cyberguard.currentUser.name,
      category: caseCategory,
      severity: caseSeverity,
      description: caseDescription,
      filedAt: new Date().toISOString().split('T')[0],
      outcome: 'pending',
      linkedOffboardingCaseId: null,
      currentStep: 1,
      approvalChain: newGrievanceChain()
    });
    isFileCaseModalOpen = false;
    cyberguard.showToast(`${caseCategory} case filed for ${emp.firstName} ${emp.lastName}.`, 'success');
  }

  function advanceCase(item) {
    const chain = item.approvalChain.map((s) => ({ ...s }));
    const stepIdx = item.currentStep - 1;
    chain[stepIdx] = {
      ...chain[stepIdx],
      status: 'approved',
      approverName: chain[stepIdx].approverName || cyberguard.currentUser.name,
      decidedAt: new Date().toISOString().split('T')[0]
    };
    const patch = { approvalChain: chain, currentStep: item.currentStep + 1 };
    Object.assign(patch, deriveGrievanceStatus({ ...item, ...patch }));
    grievancesStore.update(item.id, patch);
    cyberguard.showToast(`${item.empName}'s case advanced to the next review stage.`, 'info');
  }

  function openOutcomeModal(item) {
    activeCase = item;
    outcomeChoice = 'resolved_no_action';
    isOutcomeModalOpen = true;
  }

  function createLinkedOffboardingCase(grievanceCase, emp) {
    const newCase = {
      id: Date.now(),
      name: `${emp.firstName} ${emp.lastName}`,
      idLine: `ID: ${emp.id} • NRC: ${emp.nationalId}`,
      role: `${emp.jobTitle} • ${emp.siteAssigned}`,
      category: `Summary Dismissal (${grievanceCase.severity})`,
      checklist: [
        { label: 'Armory: Pending', badge: 'badge-warning' },
        { label: 'IT Access: Pending', badge: 'badge-warning' },
        { label: 'Finance: Pending', badge: 'badge-warning' }
      ],
      duesAmount: 'Pending Calculation',
      duesColor: '#60a5fa',
      duesNote: 'Terminal dues under review',
      rehire: 'Blacklisted / Ineligible',
      rehireBadge: 'badge-danger',
      rehireNote: grievanceCase.description,
      actionLabel: 'Area Sign-Off',
      actionClass: 'btn-secondary',
      stage: 'Pending Area Manager Clearance Review',
      currentStep: 1,
      approvalChain: newOffboardingChain()
    };
    offboardingStore.add(newCase);
    return newCase;
  }

  function submitOutcome(e) {
    e.preventDefault();
    const item = activeCase;
    const chain = item.approvalChain.map((s) => ({ ...s }));
    const stepIdx = item.currentStep - 1;
    chain[stepIdx] = {
      ...chain[stepIdx],
      status: 'approved',
      approverName: chain[stepIdx].approverName || cyberguard.currentUser.name,
      decidedAt: new Date().toISOString().split('T')[0]
    };
    const patch = { approvalChain: chain, currentStep: item.currentStep + 1, outcome: outcomeChoice };
    Object.assign(patch, deriveGrievanceStatus({ ...item, ...patch }));

    let linkedOffboardingCaseId = null;
    if (outcomeChoice === 'dismissal') {
      const emp = cyberguard.employees.find(e => e.id === item.empId);
      if (emp) {
        const created = createLinkedOffboardingCase(item, emp);
        linkedOffboardingCaseId = created.id;
      }
    }
    patch.linkedOffboardingCaseId = linkedOffboardingCaseId;

    grievancesStore.update(item.id, patch);
    isOutcomeModalOpen = false;
    cyberguard.showToast(
      outcomeChoice === 'dismissal'
        ? `Case resolved: ${item.empName} dismissed. Offboarding clearance case created.`
        : `Case resolved for ${item.empName}: ${patch.stage}.`,
      'success'
    );
  }

  function openDocsModal(item) {
    activeCase = item;
    isDocsModalOpen = true;
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Grievance & Disciplinary Cases</title>
</svelte:head>

<Topbar title="Grievance & Disciplinary Case Management">
  {#snippet actions()}
    <button class="btn btn-primary btn-sm" onclick={openFileCaseModal}>
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      File New Case
    </button>
  {/snippet}
</Topbar>

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Grievance & Disciplinary Case Registry</h2>
      <p>Investigation and sign-off chain for employee grievances and disciplinary matters, from filing through to resolution</p>
    </div>
    <div class="header-actions">
      <a href="/compliance" class="btn btn-secondary">
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Back to Compliance
      </a>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">Case Log</div>
        <div class="card-subtitle">Chain: Filed → Area Manager Investigation → HR Final Determination</div>
      </div>
    </div>
    <div class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Category / Severity</th>
            <th>Description</th>
            <th>Filed</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          {#if grievancesStore.items.length === 0}
            <tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">No grievance or disciplinary cases on file.</td></tr>
          {:else}
            {#each pagedCases as c (c.id)}
              {@const resolved = c.currentStep > c.approvalChain.length}
              {@const stepRole = resolved ? null : currentStepRole(c)}
              {@const derived = deriveGrievanceStatus(c)}
              <tr>
                <td>
                  <strong>{c.empName}</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">{c.empId} • Raised by {c.raisedBy}</div>
                </td>
                <td>
                  <span class="badge {c.category === 'Disciplinary' ? 'badge-danger' : 'badge-warning'}">{c.category}</span>
                  <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 3px;">{c.severity}</div>
                </td>
                <td style="max-width: 280px; font-size: 0.82rem; color: var(--text-muted);">{c.description}</td>
                <td style="font-size: 0.8rem;">{c.filedAt}</td>
                <td>
                  <span class="badge {resolved ? (c.outcome === 'dismissal' ? 'badge-danger' : 'badge-success') : 'badge-warning'}">
                    {derived.stage}
                  </span>
                  {#if c.linkedOffboardingCaseId}
                    <div style="font-size: 0.72rem; margin-top: 3px;"><a href="/offboarding" style="color: var(--accent-cyan);">View Linked Exit Case →</a></div>
                  {/if}
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-secondary btn-sm" onclick={() => openDocsModal(c)} title="Manage case evidence">
                    Files
                    {#if getDocumentsFor('grievance', c.id).length > 0}
                      <span class="badge badge-primary" style="margin-left: 4px; padding: 1px 6px; font-size: 0.65rem;">{getDocumentsFor('grievance', c.id).length}</span>
                    {/if}
                  </button>
                  {#if resolved}
                    <button class="btn btn-secondary btn-sm" onclick={() => cyberguard.showToast(`Case file for ${c.empName} opened.`, 'info')}>{derived.actionLabel}</button>
                  {:else if isFinalStep(c)}
                    <button class="btn {derived.actionClass} btn-sm" onclick={() => openOutcomeModal(c)} disabled={!canActOnStep(cyberguard.activeRoleId, stepRole)} title={canActOnStep(cyberguard.activeRoleId, stepRole) ? '' : 'Your current role cannot determine the outcome at this stage'}>{derived.actionLabel}</button>
                  {:else}
                    <button class="btn {derived.actionClass} btn-sm" onclick={() => advanceCase(c)} disabled={!canActOnStep(cyberguard.activeRoleId, stepRole)} title={canActOnStep(cyberguard.activeRoleId, stepRole) ? '' : 'Your current role cannot act at this stage'}>{derived.actionLabel}</button>
                  {/if}
                </td>
              </tr>
              <tr style="background: transparent;">
                <td colspan="6" style="padding: 4px 16px 16px;">
                  <ApprovalStepper chain={c.approvalChain} currentStep={c.currentStep} />
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
    <Pagination bind:currentPage totalItems={grievancesStore.items.length} {pageSize} />
  </div>

</main>

<!-- MODAL: FILE NEW CASE -->
{#if isFileCaseModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div class="modal-title">File Grievance / Disciplinary Case</div>
        <button class="modal-close" onclick={() => isFileCaseModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleFileCase}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="caseEmp">Employee Subject <span class="req">*</span></label>
            <select class="form-control" id="caseEmp" bind:value={caseEmpId} required>
              <option value="">Select Employee</option>
              {#each cyberguard.employees as e}
                <option value={e.id}>{e.firstName} {e.lastName} ({e.jobTitle} - {e.id})</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="caseRaisedBy">Raised By</label>
            <input type="text" class="form-control" id="caseRaisedBy" bind:value={caseRaisedBy} placeholder="e.g. Site Supervisor name">
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="caseCategory">Case Category <span class="req">*</span></label>
              <select class="form-control" id="caseCategory" bind:value={caseCategory} required>
                <option value="Grievance">Grievance</option>
                <option value="Disciplinary">Disciplinary</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="caseSeverity">Severity <span class="req">*</span></label>
              <select class="form-control" id="caseSeverity" bind:value={caseSeverity} required>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Gross Misconduct">Gross Misconduct</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="caseDescription">Case Description <span class="req">*</span></label>
            <textarea class="form-control" id="caseDescription" bind:value={caseDescription} rows="4" placeholder="Describe the incident or grievance in detail" required></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isFileCaseModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">File Case</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: DETERMINE OUTCOME -->
{#if isOutcomeModalOpen && activeCase}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 550px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Determine Case Outcome</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            {activeCase.empName} • {activeCase.category} ({activeCase.severity})
          </div>
        </div>
        <button class="modal-close" onclick={() => isOutcomeModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={submitOutcome}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="outcomeChoice">Final Determination <span class="req">*</span></label>
            <select class="form-control" id="outcomeChoice" bind:value={outcomeChoice} required>
              <option value="resolved_no_action">Resolved — No Action Required</option>
              <option value="warning_issued">Resolved — Formal Warning Issued</option>
              <option value="dismissal">Resolved — Summary Dismissal</option>
            </select>
            {#if outcomeChoice === 'dismissal'}
              <div class="form-hint" style="color: var(--danger);">This will automatically create a linked offboarding clearance case for {activeCase.empName}.</div>
            {/if}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isOutcomeModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Confirm Determination</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: CASE EVIDENCE DOCUMENTS -->
{#if isDocsModalOpen && activeCase}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Case Evidence & Documents</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            {activeCase.empName} • Filed {activeCase.filedAt}
          </div>
        </div>
        <button class="modal-close" onclick={() => isDocsModalOpen = false}>&times;</button>
      </div>
      <div class="modal-body">
        <DocumentsPanel recordType="grievance" recordId={activeCase.id} />
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => isDocsModalOpen = false}>Close</button>
      </div>
    </div>
  </div>
{/if}
