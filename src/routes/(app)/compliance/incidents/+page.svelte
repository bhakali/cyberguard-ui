<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { incidentsStore, deriveIncidentStatus, newIncidentChain } from '$lib/stores/incidents.svelte.js';
  import { getDocumentsFor } from '$lib/stores/documents.svelte.js';
  import { canActOnStep } from '$lib/rbac.js';
  import ApprovalStepper from '$lib/components/ApprovalStepper.svelte';
  import DocumentsPanel from '$lib/components/DocumentsPanel.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  let currentPage = $state(1);
  const pageSize = 10;
  let pagedIncidents = $derived(
    incidentsStore.items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );

  let isFileReportModalOpen = $state(false);
  let isOutcomeModalOpen = $state(false);
  let isDocsModalOpen = $state(false);
  let activeIncident = $state(null);

  // File New Report form
  let reportEmpId = $state('');
  let reportPost = $state('');
  let reportCategory = $state('Security Breach');
  let reportSeverity = $state('Low');
  let reportDescription = $state('');
  let reportOccurredAt = $state(new Date().toISOString().split('T')[0]);

  // Outcome determination form
  let outcomeChoice = $state('resolved');

  function currentStepRole(item) {
    return item.approvalChain[item.currentStep - 1]?.role;
  }

  function isFinalStep(item) {
    return item.currentStep === item.approvalChain.length;
  }

  function openFileReportModal() {
    reportEmpId = '';
    reportPost = '';
    reportCategory = 'Security Breach';
    reportSeverity = 'Low';
    reportDescription = '';
    reportOccurredAt = new Date().toISOString().split('T')[0];
    isFileReportModalOpen = true;
  }

  function handleFileReport(e) {
    e.preventDefault();
    const emp = cyberguard.employees.find(emp => emp.id === reportEmpId);
    if (!emp) {
      cyberguard.showToast('Select the employee reporting this incident.', 'danger');
      return;
    }
    incidentsStore.add({
      id: Date.now(),
      empId: emp.id,
      empName: `${emp.firstName} ${emp.lastName}`,
      reportedBy: `${emp.firstName} ${emp.lastName} (${emp.jobTitle})`,
      post: reportPost || emp.siteAssigned,
      category: reportCategory,
      severity: reportSeverity,
      description: reportDescription,
      occurredAt: reportOccurredAt,
      filedAt: new Date().toISOString().split('T')[0],
      outcome: 'pending',
      currentStep: 1,
      approvalChain: newIncidentChain()
    });
    isFileReportModalOpen = false;
    cyberguard.showToast(`${reportCategory} incident filed for ${reportPost || emp.siteAssigned}.`, 'success');
  }

  function advanceIncident(item) {
    const chain = item.approvalChain.map((s) => ({ ...s }));
    const stepIdx = item.currentStep - 1;
    chain[stepIdx] = {
      ...chain[stepIdx],
      status: 'approved',
      approverName: chain[stepIdx].approverName || cyberguard.currentUser.name,
      decidedAt: new Date().toISOString().split('T')[0]
    };
    const patch = { approvalChain: chain, currentStep: item.currentStep + 1 };
    Object.assign(patch, deriveIncidentStatus({ ...item, ...patch }));
    incidentsStore.update(item.id, patch);
    cyberguard.showToast(`Incident at ${item.post} advanced to the next review stage.`, 'info');
  }

  function openOutcomeModal(item) {
    activeIncident = item;
    outcomeChoice = 'resolved';
    isOutcomeModalOpen = true;
  }

  function submitOutcome(e) {
    e.preventDefault();
    const item = activeIncident;
    const chain = item.approvalChain.map((s) => ({ ...s }));
    const stepIdx = item.currentStep - 1;
    chain[stepIdx] = {
      ...chain[stepIdx],
      status: 'approved',
      approverName: chain[stepIdx].approverName || cyberguard.currentUser.name,
      decidedAt: new Date().toISOString().split('T')[0]
    };
    const patch = { approvalChain: chain, currentStep: item.currentStep + 1, outcome: outcomeChoice };
    Object.assign(patch, deriveIncidentStatus({ ...item, ...patch }));
    incidentsStore.update(item.id, patch);
    isOutcomeModalOpen = false;
    cyberguard.showToast(`Incident at ${item.post} closed: ${patch.stage}.`, 'success');
  }

  function openDocsModal(item) {
    activeIncident = item;
    isDocsModalOpen = true;
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Incident &amp; Safety Reports</title>
</svelte:head>

<Topbar title="Incident &amp; Safety Report Management">
  {#snippet actions()}
    <button class="btn btn-primary btn-sm" onclick={openFileReportModal}>
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      Report Incident
    </button>
  {/snippet}
</Topbar>

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Incident &amp; Patrol Safety Registry</h2>
      <p>Field-reported security, safety and equipment incidents, from filing through to review and closure</p>
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
        <div class="card-title">Incident Log</div>
        <div class="card-subtitle">Chain: Filed → Area Manager Review → Operations Final Review</div>
      </div>
    </div>
    <div class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Reported By / Post</th>
            <th>Category / Severity</th>
            <th>Description</th>
            <th>Occurred</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          {#if incidentsStore.items.length === 0}
            <tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">No incidents on file.</td></tr>
          {:else}
            {#each pagedIncidents as c (c.id)}
              {@const resolved = c.currentStep > c.approvalChain.length}
              {@const stepRole = resolved ? null : currentStepRole(c)}
              {@const derived = deriveIncidentStatus(c)}
              <tr>
                <td>
                  <strong>{c.post}</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">Reported by {c.reportedBy}</div>
                </td>
                <td>
                  <span class="badge {c.severity === 'Critical' || c.severity === 'High' ? 'badge-danger' : c.severity === 'Medium' ? 'badge-warning' : 'badge-secondary'}">{c.category}</span>
                  <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 3px;">{c.severity}</div>
                </td>
                <td style="max-width: 280px; font-size: 0.82rem; color: var(--text-muted);">{c.description}</td>
                <td style="font-size: 0.8rem;">{c.occurredAt}</td>
                <td>
                  <span class="badge {resolved ? (c.outcome === 'escalated' ? 'badge-danger' : 'badge-success') : 'badge-warning'}">
                    {derived.stage}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-secondary btn-sm" onclick={() => openDocsModal(c)} title="Manage incident evidence">
                    Files
                    {#if getDocumentsFor('incident', c.id).length > 0}
                      <span class="badge badge-primary" style="margin-left: 4px; padding: 1px 6px; font-size: 0.65rem;">{getDocumentsFor('incident', c.id).length}</span>
                    {/if}
                  </button>
                  {#if resolved}
                    <button class="btn btn-secondary btn-sm" onclick={() => cyberguard.showToast(`Incident file for ${c.post} opened.`, 'info')}>{derived.actionLabel}</button>
                  {:else if isFinalStep(c)}
                    <button class="btn {derived.actionClass} btn-sm" onclick={() => openOutcomeModal(c)} disabled={!canActOnStep(cyberguard.activeRoleId, stepRole)} title={canActOnStep(cyberguard.activeRoleId, stepRole) ? '' : 'Your current role cannot close this incident at this stage'}>{derived.actionLabel}</button>
                  {:else}
                    <button class="btn {derived.actionClass} btn-sm" onclick={() => advanceIncident(c)} disabled={!canActOnStep(cyberguard.activeRoleId, stepRole)} title={canActOnStep(cyberguard.activeRoleId, stepRole) ? '' : 'Your current role cannot act at this stage'}>{derived.actionLabel}</button>
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
    <Pagination bind:currentPage totalItems={incidentsStore.items.length} {pageSize} />
  </div>

</main>

<!-- MODAL: FILE INCIDENT REPORT -->
{#if isFileReportModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div class="modal-title">Report Incident</div>
        <button class="modal-close" onclick={() => isFileReportModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleFileReport}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="reportEmp">Reporting Employee <span class="req">*</span></label>
            <select class="form-control" id="reportEmp" bind:value={reportEmpId} required>
              <option value="">Select Employee</option>
              {#each cyberguard.employees as e}
                <option value={e.id}>{e.firstName} {e.lastName} ({e.jobTitle} - {e.id})</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="reportPost">Site Post</label>
            <input type="text" class="form-control" id="reportPost" bind:value={reportPost} placeholder="Defaults to the reporting employee's assigned site">
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="reportCategory">Category <span class="req">*</span></label>
              <select class="form-control" id="reportCategory" bind:value={reportCategory} required>
                <option value="Security Breach">Security Breach</option>
                <option value="Equipment Fault">Equipment Fault</option>
                <option value="Medical">Medical</option>
                <option value="Altercation">Altercation</option>
                <option value="Theft">Theft</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="reportSeverity">Severity <span class="req">*</span></label>
              <select class="form-control" id="reportSeverity" bind:value={reportSeverity} required>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="reportOccurred">Date Occurred <span class="req">*</span></label>
            <input type="date" class="form-control" id="reportOccurred" bind:value={reportOccurredAt} required>
          </div>
          <div class="form-group">
            <label class="form-label" for="reportDescription">Incident Description <span class="req">*</span></label>
            <textarea class="form-control" id="reportDescription" bind:value={reportDescription} rows="4" placeholder="Describe what happened" required></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isFileReportModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">File Report</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: DETERMINE OUTCOME -->
{#if isOutcomeModalOpen && activeIncident}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 550px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Close Incident</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            {activeIncident.post} • {activeIncident.category} ({activeIncident.severity})
          </div>
        </div>
        <button class="modal-close" onclick={() => isOutcomeModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={submitOutcome}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="outcomeChoice">Final Determination <span class="req">*</span></label>
            <select class="form-control" id="outcomeChoice" bind:value={outcomeChoice} required>
              <option value="resolved">Resolved</option>
              <option value="closed_no_action">Closed — No Action</option>
              <option value="escalated">Escalate for Disciplinary Action</option>
            </select>
            {#if outcomeChoice === 'escalated'}
              <div class="form-hint" style="color: var(--danger);">File a linked Grievance &amp; Disciplinary case separately if formal action is warranted.</div>
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

<!-- MODAL: INCIDENT EVIDENCE DOCUMENTS -->
{#if isDocsModalOpen && activeIncident}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Incident Evidence &amp; Documents</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            {activeIncident.post} • Filed {activeIncident.filedAt}
          </div>
        </div>
        <button class="modal-close" onclick={() => isDocsModalOpen = false}>&times;</button>
      </div>
      <div class="modal-body">
        <DocumentsPanel recordType="incident" recordId={activeIncident.id} />
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => isDocsModalOpen = false}>Close</button>
      </div>
    </div>
  </div>
{/if}
