<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { policiesStore, acknowledgmentsStore, hasAcknowledged, acknowledgePolicy } from '$lib/stores/policies.svelte.js';
  import Pagination from '$lib/components/Pagination.svelte';

  let currentPage = $state(1);
  const pageSize = 10;
  let pagedPolicies = $derived(
    policiesStore.items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );

  let isUploadModalOpen = $state(false);
  let isAckOnBehalfModalOpen = $state(false);
  let activePolicy = $state(null);

  // Upload form
  let policyTitle = $state('');
  let policyCategory = $state('Code of Conduct');
  let policyVersion = $state('v1.0');
  let policyEffectiveDate = $state(new Date().toISOString().split('T')[0]);
  let policyRequiresAck = $state(true);
  let policyFileInputEl = $state(null);
  let policyFileName = $state('');
  let policyFileSize = $state('');

  // Acknowledge-on-behalf form
  let ackOnBehalfEmpId = $state('');

  function coverageCount(policyId) {
    return acknowledgmentsStore.items.filter((a) => a.policyId === policyId).length;
  }

  function formatFileSize(bytes) {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handlePolicyFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    policyFileName = file.name;
    policyFileSize = formatFileSize(file.size);
  }

  function openUploadModal() {
    policyTitle = '';
    policyCategory = 'Code of Conduct';
    policyVersion = 'v1.0';
    policyEffectiveDate = new Date().toISOString().split('T')[0];
    policyRequiresAck = true;
    policyFileName = '';
    policyFileSize = '';
    isUploadModalOpen = true;
  }

  function handleUploadPolicy(e) {
    e.preventDefault();
    if (!policyFileName) {
      cyberguard.showToast('Attach a policy document file.', 'danger');
      return;
    }
    policiesStore.add({
      id: Date.now(),
      title: policyTitle,
      category: policyCategory,
      version: policyVersion,
      effectiveDate: policyEffectiveDate,
      fileName: policyFileName,
      sizeLabel: policyFileSize,
      uploadedBy: cyberguard.currentUser.name,
      uploadedAt: new Date().toISOString().split('T')[0],
      requiresAcknowledgment: policyRequiresAck
    });
    isUploadModalOpen = false;
    cyberguard.showToast(`"${policyTitle}" added to the policy library.`, 'success');
  }

  function acknowledgeAsSelf(policy) {
    const emp = cyberguard.employees.find((e) => e.id === cyberguard.loggedInEmployeeId);
    if (!emp) return;
    acknowledgePolicy(policy.id, emp);
    cyberguard.showToast(`You acknowledged "${policy.title}".`, 'success');
  }

  function openAckOnBehalfModal(policy) {
    activePolicy = policy;
    ackOnBehalfEmpId = '';
    isAckOnBehalfModalOpen = true;
  }

  function submitAckOnBehalf(e) {
    e.preventDefault();
    const emp = cyberguard.employees.find((emp) => emp.id === ackOnBehalfEmpId);
    if (!emp) {
      cyberguard.showToast('Select an employee to acknowledge on behalf of.', 'danger');
      return;
    }
    acknowledgePolicy(activePolicy.id, emp);
    isAckOnBehalfModalOpen = false;
    cyberguard.showToast(`Recorded acknowledgment for ${emp.firstName} ${emp.lastName}.`, 'success');
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Policy Library</title>
</svelte:head>

<Topbar title="Policy Library & Acknowledgment Tracking">
  {#snippet actions()}
    <button class="btn btn-primary btn-sm" onclick={openUploadModal}>
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      Add Policy
    </button>
  {/snippet}
</Topbar>

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Company Policy Library</h2>
      <p>Canonical copies of company-wide policies with per-employee acknowledgment tracking</p>
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
        <div class="card-title">Policy Catalog</div>
        <div class="card-subtitle">{policiesStore.items.length} policies on file across {cyberguard.employees.length} employees</div>
      </div>
    </div>
    <div class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Policy</th>
            <th>Category</th>
            <th>Version / Effective</th>
            <th>Document</th>
            <th>Acknowledgment Coverage</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          {#each pagedPolicies as p (p.id)}
            {@const covered = coverageCount(p.id)}
            {@const total = cyberguard.employees.length}
            {@const selfAcked = cyberguard.loggedInEmployeeId ? hasAcknowledged(p.id, cyberguard.loggedInEmployeeId) : false}
            <tr>
              <td style="font-weight: 600; color: var(--text-main);">{p.title}</td>
              <td><span class="badge badge-secondary">{p.category}</span></td>
              <td style="font-size: 0.82rem;">{p.version} • {p.effectiveDate}</td>
              <td style="font-size: 0.8rem; color: var(--text-muted);">{p.fileName} <span style="color: var(--text-dim);">({p.sizeLabel})</span></td>
              <td>
                {#if p.requiresAcknowledgment}
                  <span class="badge {covered === total ? 'badge-success' : 'badge-warning'}">{covered} / {total} Acknowledged</span>
                {:else}
                  <span class="badge badge-neutral">Not Required</span>
                {/if}
              </td>
              <td style="text-align: right;">
                {#if !p.requiresAcknowledgment}
                  <span style="font-size: 0.78rem; color: var(--text-dim);">—</span>
                {:else if cyberguard.loggedInEmployeeId}
                  {#if selfAcked}
                    <span class="badge badge-success" style="font-size: 0.7rem;">Acknowledged</span>
                  {:else}
                    <button class="btn btn-primary btn-sm" onclick={() => acknowledgeAsSelf(p)}>Acknowledge</button>
                  {/if}
                {:else}
                  <button class="btn btn-secondary btn-sm" onclick={() => openAckOnBehalfModal(p)}>Acknowledge on Behalf of...</button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <Pagination bind:currentPage totalItems={policiesStore.items.length} {pageSize} />
  </div>

</main>

<!-- MODAL: ADD POLICY -->
{#if isUploadModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div class="modal-title">Add Policy Document</div>
        <button class="modal-close" onclick={() => isUploadModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleUploadPolicy}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="policyTitle">Policy Title <span class="req">*</span></label>
            <input type="text" class="form-control" id="policyTitle" bind:value={policyTitle} required>
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="policyCategory">Category <span class="req">*</span></label>
              <select class="form-control" id="policyCategory" bind:value={policyCategory} required>
                <option value="Code of Conduct">Code of Conduct</option>
                <option value="Firearms SOP">Firearms SOP</option>
                <option value="Leave Policy">Leave Policy</option>
                <option value="Data Protection">Data Protection</option>
                <option value="Disciplinary Code">Disciplinary Code</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="policyVersion">Version <span class="req">*</span></label>
              <input type="text" class="form-control" id="policyVersion" bind:value={policyVersion} required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="policyEffective">Effective Date <span class="req">*</span></label>
            <input type="date" class="form-control" id="policyEffective" bind:value={policyEffectiveDate} required>
          </div>
          <div class="form-group">
            <label class="form-label" for="policyFile">Policy Document <span class="req">*</span></label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button type="button" class="btn btn-secondary btn-sm" onclick={() => policyFileInputEl.click()}>Choose File</button>
              <span style="font-size: 0.82rem; color: var(--text-muted);">{policyFileName || 'No file selected'}</span>
            </div>
            <input bind:this={policyFileInputEl} type="file" id="policyFile" style="display: none;" onchange={handlePolicyFileSelected}>
          </div>
          <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="policyRequiresAck" bind:checked={policyRequiresAck} style="width: 16px; height: 16px; accent-color: var(--primary);">
            <label for="policyRequiresAck" style="margin: 0; font-size: 0.85rem; color: var(--text-main); cursor: pointer;">Requires employee acknowledgment</label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isUploadModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Add to Library</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: ACKNOWLEDGE ON BEHALF -->
{#if isAckOnBehalfModalOpen && activePolicy}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 500px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Acknowledge on Behalf of Employee</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">{activePolicy.title}</div>
        </div>
        <button class="modal-close" onclick={() => isAckOnBehalfModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={submitAckOnBehalf}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="ackEmp">Employee <span class="req">*</span></label>
            <select class="form-control" id="ackEmp" bind:value={ackOnBehalfEmpId} required>
              <option value="">Select Employee</option>
              {#each cyberguard.employees as e}
                <option value={e.id}>{e.firstName} {e.lastName} ({e.jobTitle} - {e.id})</option>
              {/each}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isAckOnBehalfModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Record Acknowledgment</button>
        </div>
      </form>
    </div>
  </div>
{/if}
