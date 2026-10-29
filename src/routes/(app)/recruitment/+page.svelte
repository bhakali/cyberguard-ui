<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { recruitmentStore, newOnboardingChecklist } from '$lib/stores/recruitment.svelte.js';
  import { candidatesStore, STAGE_LABELS, nextStage } from '$lib/stores/candidates.svelte.js';
  import { requisitionsStore } from '$lib/stores/requisitions.svelte.js';
  import { can } from '$lib/rbac.js';
  import Pagination from '$lib/components/Pagination.svelte';
  import CandidateDossierModal from '$lib/components/CandidateDossierModal.svelte';

  let activeTab = $state('tab-ats');
  let onboardingPage = $state(1);
  const pageSize = 10;
  let isNewRequisitionModalOpen = $state(false);
  let isAddCandidateModalOpen = $state(false);
  let selectedDossierCandidate = $state(null);

  // New Requisition Form
  let reqTitle = $state('Armed Sentry Guard');
  let reqDept = $state('Security Operations - North');
  let reqSlots = $state(15);
  let reqStation = $state('Kansanshi Hub');
  let reqClosingDate = $state('2026-11-15');

  // New Candidate Form
  let candName = $state('');
  let candTargetRole = $state('Guards');
  let candRegion = $state('');
  let candNrc = $state('');
  let candBadgeLabel = $state('');
  let candNotes = $state('');
  let candRequisitionId = $state('');

  let openRequisitions = $derived(requisitionsStore.items.filter((r) => r.status === 'open'));

  let checklistInstances = $derived(recruitmentStore.items);
  let pagedChecklistInstances = $derived(
    checklistInstances.slice((onboardingPage - 1) * pageSize, onboardingPage * pageSize)
  );

  let sourcedCandidates = $derived(candidatesStore.items.filter(c => c.stage === 'sourced'));
  let vettingCandidates = $derived(candidatesStore.items.filter(c => c.stage === 'vetting'));
  let tacticalCandidates = $derived(candidatesStore.items.filter(c => c.stage === 'tactical'));
  let offerCandidates = $derived(candidatesStore.items.filter(c => c.stage === 'offer' || c.stage === 'hired'));
  let rejectedCandidates = $derived(candidatesStore.items.filter(c => c.stage === 'rejected'));

  // Candidate selected for the Offer Letter tab
  let selectedOfferCandidateId = $state(null);
  let selectedOfferCandidate = $derived(
    candidatesStore.items.find(c => c.id === selectedOfferCandidateId) || offerCandidates[0] || null
  );

  function toggleTask(instance, taskIdx) {
    const tasks = instance.tasks.map((t, i) => {
      if (i !== taskIdx) return t;
      const done = !t.done;
      return { ...t, done, status: done ? 'Completed' : 'In Progress' };
    });
    recruitmentStore.update(instance.id, { tasks });
    cyberguard.showToast(
      tasks[taskIdx].done ? 'Onboarding milestone marked completed!' : 'Milestone reopened',
      tasks[taskIdx].done ? 'success' : 'info'
    );
  }

  function handleCreateRequisition(e) {
    e.preventDefault();
    requisitionsStore.add({
      id: Date.now(),
      title: reqTitle,
      department: reqDept,
      slots: Number(reqSlots),
      slotsFilled: 0,
      station: reqStation,
      closingDate: reqClosingDate,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0]
    });
    isNewRequisitionModalOpen = false;
    cyberguard.showToast(`Published Requisition: ${reqSlots} slots for ${reqTitle} at ${reqStation}.`, 'success');
  }

  function handleCreateCandidate(e) {
    e.preventDefault();
    candidatesStore.add({
      id: Date.now(),
      name: candName,
      nrcLine: candNrc ? `NRC: ${candNrc}` : '',
      targetRole: candTargetRole,
      region: candRegion,
      appliedDate: 'Applied today',
      vettingNotes: candNotes,
      badgeLabel: candBadgeLabel || 'New Applicant',
      badgeClass: 'badge-neutral',
      stage: 'sourced',
      stageHistory: [{ stage: 'sourced', enteredAt: new Date().toISOString().split('T')[0] }],
      requisitionId: candRequisitionId ? Number(candRequisitionId) : null,
      offer: null
    });

    isAddCandidateModalOpen = false;
    cyberguard.showToast(`Added ${candName} to the Sourced / Applied pipeline.`, 'success');

    candName = '';
    candTargetRole = 'Guards';
    candRegion = '';
    candNrc = '';
    candBadgeLabel = '';
    candNotes = '';
    candRequisitionId = '';
  }

  function moveCandidateStage(candidate) {
    const next = nextStage(candidate.stage);
    if (!next) return;
    const history = [...candidate.stageHistory, { stage: next, enteredAt: new Date().toISOString().split('T')[0] }];
    candidatesStore.update(candidate.id, { stage: next, stageHistory: history });
    cyberguard.showToast(`${candidate.name} moved to ${STAGE_LABELS[next]}.`, 'success');
  }

  function rejectCandidate(candidate) {
    if (!confirm(`Mark ${candidate.name} as not progressing?`)) return;
    candidatesStore.update(candidate.id, { stage: 'rejected' });
    cyberguard.showToast(`${candidate.name} marked as not progressing.`, 'danger');
  }

  function markHired(candidate) {
    const [firstName, ...rest] = candidate.name.split(' ');
    const lastName = rest.join(' ') || 'Surname';
    const newId = `CG-00${100 + cyberguard.employees.length + 1}`;
    const newEmp = {
      id: newId,
      firstName,
      lastName,
      nationalId: candidate.nrcLine.replace('NRC: ', '') || 'Pending Capture',
      dob: '1995-01-01',
      gender: 'Male',
      phone: '+260 977 000 000',
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@CyberGuard.zm`,
      address: candidate.region || 'Lusaka, Zambia',
      nextOfKin: 'Pending HR Capture',
      jobTitle: candidate.targetRole.includes('Guard') ? 'Guards' : candidate.targetRole,
      department: 'Security Operations - North',
      costCenter: 'CC-NEW-HIRE',
      reportingTo: 'Site Supervisor',
      gradeLevel: 'Grade A1 (New Hire)',
      region: candidate.region || 'Lusaka',
      siteAssigned: candidate.region || 'Lusaka',
      contractType: 'Probation (3 Months)',
      probationMonths: 3,
      probationStatus: 'Active (In Progress)',
      joinDate: new Date().toISOString().split('T')[0],
      rehireHistory: 'No (First Appointment)',
      salaryGross: candidate.offer?.gross || 4500,
      basePay: candidate.offer?.gross || 4500,
      housingAllowance: 0,
      transportAllowance: 0,
      dangerPay: 0,
      napsaNo: 'NAP-' + Math.floor(1000000 + Math.random() * 9000000),
      nhimaNo: 'NHI-' + Math.floor(1000000 + Math.random() * 9000000),
      zraTpin: '100' + Math.floor(1000000 + Math.random() * 9000000),
      bankName: 'Zambia National Commercial Bank (ZANACO)',
      status: 'Active',
      shiftPattern: 'Standard Rotational Shift',
      qualifications: []
    };
    cyberguard.createEmployee(newEmp);
    recruitmentStore.add(newOnboardingChecklist(newEmp));

    const history = [...candidate.stageHistory, { stage: 'hired', enteredAt: new Date().toISOString().split('T')[0] }];
    candidatesStore.update(candidate.id, { stage: 'hired', stageHistory: history, empId: newEmp.id });

    cyberguard.showToast(`${candidate.name} hired as ${newEmp.jobTitle} (${newEmp.id}). Onboarding checklist created.`, 'success');
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Recruitment & Onboarding</title>
</svelte:head>

<Topbar title="Talent Sourcing, ATS Pipeline & Onboarding Checklists">
  {#snippet actions()}
    <button class="btn btn-primary btn-sm" onclick={() => isNewRequisitionModalOpen = true}>
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      Create Job Requisition
    </button>
  {/snippet}
</Topbar>

<main class="page-container">
  
  <div class="page-header">
    <div class="header-title-area">
      <h2>Recruitment Pipeline & New Hire Induction</h2>
      <p>From job posting requisition to applicant screening, background vetting, offer letter generation, and day-one onboarding</p>
    </div>
    <div class="header-actions">
      <div class="tabs-header" style="background: none; border-bottom: none; padding: 0;">
        <button class="tab-btn" class:active={activeTab === 'tab-ats'} onclick={() => activeTab = 'tab-ats'}>Applicant Tracking Pipeline</button>
        <button class="tab-btn" class:active={activeTab === 'tab-onboarding'} onclick={() => activeTab = 'tab-onboarding'}>New Hire Induction Checklist</button>
        <button class="tab-btn" class:active={activeTab === 'tab-offers'} onclick={() => activeTab = 'tab-offers'}>Offer Letter Templates</button>
      </div>
    </div>
  </div>

  <div class="tabs-container">
    
    <!-- TAB 1: KANBAN ATS PIPELINE -->
    {#if activeTab === 'tab-ats'}
      <div class="kanban-board">

        <!-- Column 1: Sourcing & Applications -->
        <div class="kanban-column">
          <div class="kanban-column-header">
            <span class="kanban-title"><span class="badge-dot" style="background: #94a3b8;"></span> Sourced / Applied</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="badge badge-neutral">{sourcedCandidates.length}</span>
              <button
                class="btn btn-secondary btn-sm"
                style="padding: 3px 7px;"
                title="Add Candidate"
                disabled={!can(cyberguard.activeRoleId, 'canApprove')}
                onclick={() => (isAddCandidateModalOpen = true)}
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
          </div>
          {#each sourcedCandidates as c (c.id)}
            <div class="kanban-card" onclick={() => (selectedDossierCandidate = c)}>
              <div style="font-weight: 700; font-size: 0.85rem; color: #fff;">{c.name}</div>
              <div style="font-size: 0.74rem; color: var(--accent-cyan);">{c.targetRole}{c.region ? ` • ${c.region}` : ''}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 6px;">{c.nrcLine}{c.nrcLine && c.vettingNotes ? ' • ' : ''}{c.vettingNotes}</div>
              <div style="margin-top: 8px;"><span class="badge {c.badgeClass}">{c.badgeLabel}</span></div>
              <div style="margin-top: 10px; display: flex; gap: 6px;" onclick={(e) => e.stopPropagation()}>
                <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick={() => moveCandidateStage(c)} disabled={!can(cyberguard.activeRoleId, 'canApprove')}>Move to Vetting →</button>
                <button class="btn btn-danger btn-sm" onclick={() => rejectCandidate(c)} disabled={!can(cyberguard.activeRoleId, 'canApprove')} title="Reject">&times;</button>
              </div>
            </div>
          {/each}
        </div>

        <!-- Column 2: Screening & Police Vetting -->
        <div class="kanban-column">
          <div class="kanban-column-header">
            <span class="kanban-title"><span class="badge-dot" style="background: #3b82f6;"></span> Vetting & Background</span>
            <span class="badge badge-primary">{vettingCandidates.length}</span>
          </div>
          {#each vettingCandidates as c (c.id)}
            <div class="kanban-card" onclick={() => (selectedDossierCandidate = c)}>
              <div style="font-weight: 700; font-size: 0.85rem; color: #fff;">{c.name}</div>
              <div style="font-size: 0.74rem; color: var(--accent-cyan);">{c.targetRole}{c.region ? ` • ${c.region}` : ''}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 6px;">{c.vettingNotes}</div>
              <div style="margin-top: 8px;"><span class="badge {c.badgeClass}">{c.badgeLabel}</span></div>
              <div style="margin-top: 10px; display: flex; gap: 6px;" onclick={(e) => e.stopPropagation()}>
                <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick={() => moveCandidateStage(c)} disabled={!can(cyberguard.activeRoleId, 'canApprove')}>Move to Tactical →</button>
                <button class="btn btn-danger btn-sm" onclick={() => rejectCandidate(c)} disabled={!can(cyberguard.activeRoleId, 'canApprove')} title="Reject">&times;</button>
              </div>
            </div>
          {/each}
        </div>

        <!-- Column 3: Physical & Firearms Assessment -->
        <div class="kanban-column">
          <div class="kanban-column-header">
            <span class="kanban-title"><span class="badge-dot" style="background: #f59e0b;"></span> Tactical & Interview</span>
            <span class="badge badge-warning">{tacticalCandidates.length}</span>
          </div>
          {#each tacticalCandidates as c (c.id)}
            <div class="kanban-card" onclick={() => (selectedDossierCandidate = c)}>
              <div style="font-weight: 700; font-size: 0.85rem; color: #fff;">{c.name}</div>
              <div style="font-size: 0.74rem; color: var(--accent-cyan);">{c.targetRole}{c.region ? ` • ${c.region}` : ''}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 6px;">{c.nrcLine}{c.nrcLine && c.vettingNotes ? ' • ' : ''}{c.vettingNotes}</div>
              <div style="margin-top: 8px;"><span class="badge {c.badgeClass}">{c.badgeLabel}</span></div>
              <div style="margin-top: 10px; display: flex; gap: 6px;" onclick={(e) => e.stopPropagation()}>
                <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick={() => moveCandidateStage(c)} disabled={!can(cyberguard.activeRoleId, 'canApprove')}>Move to Offer →</button>
                <button class="btn btn-danger btn-sm" onclick={() => rejectCandidate(c)} disabled={!can(cyberguard.activeRoleId, 'canApprove')} title="Reject">&times;</button>
              </div>
            </div>
          {/each}
        </div>

        <!-- Column 4: Offer Generation & Hired -->
        <div class="kanban-column">
          <div class="kanban-column-header">
            <span class="kanban-title"><span class="badge-dot" style="background: #10b981;"></span> Formal Offer & Hired</span>
            <span class="badge badge-success">{offerCandidates.length}</span>
          </div>
          {#each offerCandidates as c (c.id)}
            <div class="kanban-card" onclick={() => (selectedDossierCandidate = c)}>
              <div style="font-weight: 700; font-size: 0.85rem; color: #fff;">{c.name}</div>
              <div style="font-size: 0.74rem; color: var(--accent-cyan);">{c.targetRole}{c.region ? ` • ${c.region}` : ''}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 6px;">{c.vettingNotes}</div>
              <div style="margin-top: 8px;"><span class="badge {c.badgeClass}">{c.badgeLabel}</span></div>
              {#if c.stage === 'hired'}
                <div style="margin-top: 10px; font-size: 0.74rem; color: var(--success); font-weight: 700;">✓ Hired{c.empId ? ` (${c.empId})` : ''}</div>
              {:else}
                <div style="margin-top: 10px; display: flex; gap: 6px;" onclick={(e) => e.stopPropagation()}>
                  <button class="btn btn-primary btn-sm" style="flex: 1;" onclick={() => markHired(c)} disabled={!can(cyberguard.activeRoleId, 'canApprove')}>Mark Hired</button>
                  <button class="btn btn-danger btn-sm" onclick={() => rejectCandidate(c)} disabled={!can(cyberguard.activeRoleId, 'canApprove')} title="Reject">&times;</button>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Column 5: Not Progressing -->
        <div class="kanban-column">
          <div class="kanban-column-header">
            <span class="kanban-title"><span class="badge-dot" style="background: #ef4444;"></span> Not Progressing</span>
            <span class="badge badge-danger">{rejectedCandidates.length}</span>
          </div>
          {#each rejectedCandidates as c (c.id)}
            <div class="kanban-card" style="opacity: 0.65;" onclick={() => (selectedDossierCandidate = c)}>
              <div style="font-weight: 700; font-size: 0.85rem; color: #fff;">{c.name}</div>
              <div style="font-size: 0.74rem; color: var(--accent-cyan);">{c.targetRole}{c.region ? ` • ${c.region}` : ''}</div>
              <div style="margin-top: 8px;"><span class="badge badge-danger">Not Progressing</span></div>
            </div>
          {/each}
          {#if rejectedCandidates.length === 0}
            <div style="font-size: 0.78rem; color: var(--text-dim); text-align: center; padding: 20px 8px;">No rejected applicants</div>
          {/if}
        </div>

      </div>
    {/if}

    <!-- TAB 2: ONBOARDING CHECKLISTS -->
    {#if activeTab === 'tab-onboarding'}
      {#if checklistInstances.length === 0}
        <div class="card">
          <div class="card-body" style="text-align: center; padding: 40px; color: var(--text-muted);">
            No onboarding checklists yet. Mark a candidate as Hired in the Applicant Tracking Pipeline to spin one up.
          </div>
        </div>
      {/if}
      {#each pagedChecklistInstances as instance (instance.id)}
        {@const completedCount = instance.tasks.filter(t => t.done).length}
        <div class="card" style="margin-bottom: 18px;">
          <div class="card-header">
            <div>
              <div class="card-title">New Hire Induction & Statutory Checklist</div>
              <div class="card-subtitle">Personnel: {instance.empName} ({instance.jobTitle} - ID: {instance.empId})</div>
            </div>
            <span class="badge badge-primary">{completedCount} / {instance.tasks.length} Complete</span>
          </div>
          <div class="card-body">
            {#each instance.tasks as task, idx (task.id)}
              <div class="checklist-item" class:done={task.done} style="display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-bottom: 1px solid var(--border-subtle);">
                <input type="checkbox" checked={task.done} id="chk_{instance.id}_{task.id}" onchange={() => toggleTask(instance, idx)} style="width: 18px; height: 18px; accent-color: var(--primary);">
                <div style="flex: 1;">
                  <label for="chk_{instance.id}_{task.id}" style="font-weight: 600; font-size: 0.85rem; color: #fff; cursor: pointer; text-decoration: {task.done ? 'line-through' : 'none'}; opacity: {task.done ? '0.7' : '1'};">
                    {task.title}
                  </label>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">{task.desc}</div>
                </div>
                <span class="badge {task.done ? 'badge-success' : (task.status.includes('Pending') ? 'badge-warning' : 'badge-neutral')}">
                  {task.status}
                </span>
              </div>
            {/each}
          </div>
        </div>
      {/each}
      {#if checklistInstances.length > 0}
        <div class="card">
          <Pagination bind:currentPage={onboardingPage} totalItems={checklistInstances.length} {pageSize} />
        </div>
      {/if}
    {/if}

    <!-- TAB 3: OFFER LETTER TEMPLATES -->
    {#if activeTab === 'tab-offers'}
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Standardized Employment Contract & Offer Letter Templates</div>
            <div class="card-subtitle">Select a candidate currently at Offer or Hired stage to render their letter</div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <select class="form-control" style="min-width: 220px;" bind:value={selectedOfferCandidateId}>
              {#each offerCandidates as c (c.id)}
                <option value={c.id}>{c.name} ({STAGE_LABELS[c.stage]})</option>
              {/each}
            </select>
            <button class="btn btn-secondary btn-sm" onclick={() => cyberguard.showToast('Generated fresh Contract Template preview (PDF)', 'info')}>
              Preview Template
            </button>
          </div>
        </div>
        <div class="card-body">
          {#if !selectedOfferCandidate}
            <div style="text-align: center; padding: 32px; color: var(--text-muted);">No candidate at Offer or Hired stage yet — advance a candidate to Offer in the pipeline tab first.</div>
          {:else}
            <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 24px; border-radius: var(--radius-md); font-family: 'Courier New', Courier, monospace; font-size: 0.85rem; color: #e2e8f0; line-height: 1.6;">
              <div style="text-align: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
                <strong style="font-size: 1.1rem; color: #fff;">CYBERGUARD SECURITY & HR SERVICES LTD - EMPLOYMENT OFFER</strong><br>
                <span>Plot 42, Leopards Hill Road, Lusaka, Zambia • Tel: +260 211 889000</span>
              </div>
              <p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p><strong>To:</strong> {selectedOfferCandidate.name} (NRC No: {selectedOfferCandidate.nrcLine.replace('NRC: ', '') || 'Pending Capture'})</p>
              <p><strong>Position:</strong> {selectedOfferCandidate.targetRole}</p>
              <p><strong>Station:</strong> {selectedOfferCandidate.region || 'To Be Assigned'}</p>
              <br>
              <p><strong>1. Remuneration & Statutory Alignment:</strong></p>
              <p>Base Monthly Salary: ZMW {selectedOfferCandidate.offer?.gross?.toLocaleString() || '[Amount]'}</p>
              <p>Mandatory Statutory Deductions will apply in compliance with the Laws of Zambia:</p>
              <ul>
                <li>National Pension Scheme Authority (NAPSA) - 5% employee contribution (Capped).</li>
                <li>National Health Insurance Scheme (NHIMA) - 1% of basic pay.</li>
                <li>Zambia Revenue Authority (ZRA) - PAYE statutory tax bracket schedule.</li>
              </ul>
              <br>
              <p><strong>2. Probation & Lifecycle:</strong></p>
              <p>Initial probation of 3 Months with formal performance appraisal review prior to confirmation.</p>
              {#if selectedOfferCandidate.offer?.joiningDate}
                <p><strong>Joining Date:</strong> {selectedOfferCandidate.offer.joiningDate}</p>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {/if}

  </div>

</main>

<!-- MODAL: NEW JOB REQUISITION -->
{#if isNewRequisitionModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 550px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Create Operational Job Requisition</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            Initiate workforce intake with HR approval workflow
          </div>
        </div>
        <button class="modal-close" onclick={() => isNewRequisitionModalOpen = false}>&times;</button>
      </div>

      <form onsubmit={handleCreateRequisition}>
        <div class="modal-body">
          <div class="form-grid" style="grid-template-columns: 1fr;">
            <div class="form-group">
              <label class="form-label" for="reqTitle">Position / Designated Role</label>
              <input type="text" class="form-control" id="reqTitle" bind:value={reqTitle} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="reqDept">Department</label>
              <select class="form-control" id="reqDept" bind:value={reqDept}>
                <option value="Security Operations - North">Security Operations - North</option>
                <option value="Security Operations - South">Security Operations - South</option>
                <option value="Administration & Facilities">Administration & Facilities</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="reqSlots">Open Headcount Slots</label>
              <input type="number" class="form-control" id="reqSlots" bind:value={reqSlots} min="1" max="100" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="reqStation">Assigned Operational Hub / Site</label>
              <input type="text" class="form-control" id="reqStation" bind:value={reqStation} placeholder="e.g. Kansanshi Hub" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="reqClosing">Requisition Target Closing Date</label>
              <input type="date" class="form-control" id="reqClosing" bind:value={reqClosingDate} required>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isNewRequisitionModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Publish Requisition</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: ADD CANDIDATE -->
{#if isAddCandidateModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 550px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Add Candidate to Pipeline</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            Record a new applicant into the Sourced / Applied stage
          </div>
        </div>
        <button class="modal-close" onclick={() => isAddCandidateModalOpen = false}>&times;</button>
      </div>

      <form onsubmit={handleCreateCandidate}>
        <div class="modal-body">
          <div class="form-grid" style="grid-template-columns: 1fr;">
            <div class="form-group">
              <label class="form-label" for="candName">Full Name <span class="req">*</span></label>
              <input type="text" class="form-control" id="candName" bind:value={candName} placeholder="e.g. Chanda Mumba" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="candRole">Target Role <span class="req">*</span></label>
              <input type="text" class="form-control" id="candRole" bind:value={candTargetRole} placeholder="e.g. Guards" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="candRegion">Region</label>
              <input type="text" class="form-control" id="candRegion" bind:value={candRegion} placeholder="e.g. Copperbelt">
            </div>
            <div class="form-group">
              <label class="form-label" for="candNrc">National ID / Passport Number</label>
              <input type="text" class="form-control" id="candNrc" bind:value={candNrc} placeholder="e.g. 391820/11/1">
            </div>
            <div class="form-group">
              <label class="form-label" for="candBadge">Badge Label</label>
              <input type="text" class="form-control" id="candBadge" bind:value={candBadgeLabel} placeholder="e.g. Class 1 Firearms">
            </div>
            <div class="form-group">
              <label class="form-label" for="candReq">Link to Open Requisition</label>
              <select class="form-control" id="candReq" bind:value={candRequisitionId}>
                <option value="">Unlinked / General Pipeline</option>
                {#each openRequisitions as r (r.id)}
                  <option value={r.id}>{r.title} ({r.station})</option>
                {/each}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="candNotes">Notes</label>
              <textarea class="form-control" id="candNotes" bind:value={candNotes} rows="2" placeholder="e.g. Referred by Site Supervisor, 4 Yrs experience"></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isAddCandidateModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Add Candidate</button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if selectedDossierCandidate}
  <CandidateDossierModal
    candidate={selectedDossierCandidate}
    onClose={() => (selectedDossierCandidate = null)}
    onMove={moveCandidateStage}
    onReject={rejectCandidate}
    onMarkHired={markHired}
  />
{/if}

<style>
  .kanban-board {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
    overflow-x: auto;
  }

  .kanban-column {
    background: rgba(14, 23, 42, 0.7);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 480px;
  }

  .kanban-column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-subtle);
  }

  .kanban-title {
    font-size: 0.84rem;
    font-weight: 700;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .kanban-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 14px;
    cursor: pointer;
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-sm);
  }

  .kanban-card:hover {
    border-color: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .checklist-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    margin-bottom: 8px;
    transition: all var(--transition-fast);
  }

  .checklist-item.done {
    border-color: rgba(16, 185, 129, 0.3);
    background: rgba(16, 185, 129, 0.04);
  }

  .checklist-item input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: var(--success);
    cursor: pointer;
  }
</style>
