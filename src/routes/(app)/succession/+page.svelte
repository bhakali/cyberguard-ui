<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import {
    SKILL_CATALOG,
    PROFICIENCY_LEVELS,
    successionStore,
    READINESS_LABELS,
    READINESS_BADGE
  } from '$lib/stores/successionPlanning.svelte.js';
  import { can } from '$lib/rbac.js';
  import Pagination from '$lib/components/Pagination.svelte';

  let activeTab = $state('tab-skills');

  let skillsPage = $state(1);
  let benchPage = $state(1);
  const pageSize = 10;
  let pagedEmployees = $derived(
    cyberguard.employees.slice((skillsPage - 1) * pageSize, skillsPage * pageSize)
  );
  let pagedBench = $derived(
    successionStore.items.slice((benchPage - 1) * pageSize, benchPage * pageSize)
  );

  let isSkillModalOpen = $state(false);
  let isSuccessorModalOpen = $state(false);
  let activeEmp = $state(null);
  let activeBenchRole = $state(null);

  // Add/Update Skill form
  let skillEmpId = $state('');
  let skillName = $state(SKILL_CATALOG[0]);
  let skillProficiency = $state('Novice');

  // Add Successor form
  let successorEmpId = $state('');
  let successorReadiness = $state('developing');

  function proficiencyBadgeClass(level) {
    if (level === 'Expert') return 'badge-success';
    if (level === 'Proficient') return 'badge-primary';
    if (level === 'Competent') return 'badge-warning';
    return 'badge-secondary';
  }

  function openSkillModal(emp) {
    activeEmp = emp;
    skillEmpId = emp ? emp.id : '';
    skillName = SKILL_CATALOG[0];
    skillProficiency = 'Novice';
    isSkillModalOpen = true;
  }

  function handleAddSkill(e) {
    e.preventDefault();
    const emp = cyberguard.employees.find((x) => x.id === skillEmpId);
    if (!emp) {
      cyberguard.showToast('Select an employee.', 'danger');
      return;
    }
    cyberguard.addSkill(emp.id, { skillName, proficiency: skillProficiency });
    isSkillModalOpen = false;
    cyberguard.showToast(`${skillName} (${skillProficiency}) recorded for ${emp.firstName} ${emp.lastName}.`, 'success');
  }

  function openSuccessorModal(benchRole) {
    activeBenchRole = benchRole;
    successorEmpId = '';
    successorReadiness = 'developing';
    isSuccessorModalOpen = true;
  }

  function handleAddSuccessor(e) {
    e.preventDefault();
    const emp = cyberguard.employees.find((x) => x.id === successorEmpId);
    if (!emp) {
      cyberguard.showToast('Select an employee.', 'danger');
      return;
    }
    const successors = [
      ...activeBenchRole.successors,
      { empId: emp.id, empName: `${emp.firstName} ${emp.lastName}`, readiness: successorReadiness }
    ];
    successionStore.update(activeBenchRole.id, { successors });
    isSuccessorModalOpen = false;
    cyberguard.showToast(`${emp.firstName} ${emp.lastName} added as a successor for ${activeBenchRole.roleTitle}.`, 'success');
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Succession Planning &amp; Skills Matrix</title>
</svelte:head>

<Topbar title="Succession Planning &amp; Skills Matrix" />

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Workforce Capability &amp; Succession Bench</h2>
      <p>Skills inventory across the workforce and readiness tracking for critical-role succession</p>
    </div>
    <div class="header-actions">
      <div class="tabs-header" style="background: none; border-bottom: none; padding: 0;">
        <button class="tab-btn" class:active={activeTab === 'tab-skills'} onclick={() => activeTab = 'tab-skills'}>Skills Matrix</button>
        <button class="tab-btn" class:active={activeTab === 'tab-bench'} onclick={() => activeTab = 'tab-bench'}>Succession Bench</button>
      </div>
    </div>
  </div>

  <div class="tabs-container">

    {#if activeTab === 'tab-skills'}
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Employee Skills Inventory</div>
            <div class="card-subtitle">Assessed proficiency across the CyberGuard skill catalog</div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Job Title</th>
                <th>Assessed Skills</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              {#each pagedEmployees as emp (emp.id)}
                <tr>
                  <td>
                    <strong>{emp.firstName} {emp.lastName}</strong>
                    <div style="font-size: 0.72rem; color: var(--text-dim);">{emp.id}</div>
                  </td>
                  <td style="font-size: 0.82rem;">{emp.jobTitle}</td>
                  <td>
                    {#if (emp.skills || []).length === 0}
                      <span style="font-size: 0.78rem; color: var(--text-dim);">No skills assessed yet</span>
                    {:else}
                      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        {#each emp.skills as s (s.id)}
                          <span class="badge {proficiencyBadgeClass(s.proficiency)}" style="font-size: 0.68rem;" title="Assessed {s.assessedAt} by {s.assessedBy}">{s.skillName} • {s.proficiency}</span>
                        {/each}
                      </div>
                    {/if}
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary btn-sm" onclick={() => openSkillModal(emp)} disabled={!can(cyberguard.activeRoleId, 'canApprove')}>Add/Update Skill</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <Pagination bind:currentPage={skillsPage} totalItems={cyberguard.employees.length} {pageSize} />
      </div>
    {/if}

    {#if activeTab === 'tab-bench'}
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Critical Role Succession Bench</div>
            <div class="card-subtitle">Readiness of identified successors for business-critical roles</div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Critical Role</th>
                <th>Incumbent</th>
                <th>Successors</th>
                <th>Risk Level</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              {#if successionStore.items.length === 0}
                <tr><td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted);">No critical roles tracked yet.</td></tr>
              {:else}
                {#each pagedBench as b (b.id)}
                  <tr>
                    <td><strong>{b.roleTitle}</strong></td>
                    <td style="font-size: 0.84rem;">{b.incumbentName}<div style="font-size: 0.72rem; color: var(--text-dim);">{b.incumbentEmpId}</div></td>
                    <td>
                      {#if b.successors.length === 0}
                        <span style="font-size: 0.78rem; color: var(--text-dim);">No successors identified</span>
                      {:else}
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                          {#each b.successors as s}
                            <div style="font-size: 0.82rem;">
                              {s.empName}
                              <span class="badge {READINESS_BADGE[s.readiness]}" style="font-size: 0.65rem; margin-left: 4px;">{READINESS_LABELS[s.readiness]}</span>
                            </div>
                          {/each}
                        </div>
                      {/if}
                    </td>
                    <td>
                      <span class="badge {b.riskLevel === 'High' ? 'badge-danger' : b.riskLevel === 'Medium' ? 'badge-warning' : 'badge-success'}">{b.riskLevel}</span>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary btn-sm" onclick={() => openSuccessorModal(b)} disabled={!can(cyberguard.activeRoleId, 'canApprove')}>Add Successor</button>
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
        <Pagination bind:currentPage={benchPage} totalItems={successionStore.items.length} {pageSize} />
      </div>
    {/if}

  </div>

</main>

<!-- MODAL: ADD/UPDATE SKILL -->
{#if isSkillModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 500px;">
      <div class="modal-header">
        <div class="modal-title">Add / Update Skill Assessment</div>
        <button class="modal-close" onclick={() => isSkillModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleAddSkill}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="skillEmp">Employee <span class="req">*</span></label>
            <select class="form-control" id="skillEmp" bind:value={skillEmpId} required>
              <option value="">Select Employee</option>
              {#each cyberguard.employees as e}
                <option value={e.id}>{e.firstName} {e.lastName} ({e.jobTitle} - {e.id})</option>
              {/each}
            </select>
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="skillName">Skill <span class="req">*</span></label>
              <select class="form-control" id="skillName" bind:value={skillName} required>
                {#each SKILL_CATALOG as s}
                  <option value={s}>{s}</option>
                {/each}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="skillProficiency">Proficiency <span class="req">*</span></label>
              <select class="form-control" id="skillProficiency" bind:value={skillProficiency} required>
                {#each PROFICIENCY_LEVELS as p}
                  <option value={p}>{p}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isSkillModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Save Assessment</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: ADD SUCCESSOR -->
{#if isSuccessorModalOpen && activeBenchRole}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 500px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Add Successor</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">{activeBenchRole.roleTitle}</div>
        </div>
        <button class="modal-close" onclick={() => isSuccessorModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleAddSuccessor}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="successorEmp">Employee <span class="req">*</span></label>
            <select class="form-control" id="successorEmp" bind:value={successorEmpId} required>
              <option value="">Select Employee</option>
              {#each cyberguard.employees as e}
                <option value={e.id}>{e.firstName} {e.lastName} ({e.jobTitle} - {e.id})</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="successorReadiness">Readiness <span class="req">*</span></label>
            <select class="form-control" id="successorReadiness" bind:value={successorReadiness} required>
              <option value="ready_now">Ready Now</option>
              <option value="ready_1_2_yrs">Ready in 1–2 Yrs</option>
              <option value="developing">Developing</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isSuccessorModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Add Successor</button>
        </div>
      </form>
    </div>
  </div>
{/if}
