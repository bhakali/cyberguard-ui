<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { attendanceStore, deriveLeaveStatus, newLeaveChain } from '$lib/stores/attendance.svelte.js';
  import { rosterStore, SHIFT_PATTERNS } from '$lib/stores/roster.svelte.js';
  import { checkpointsStore, patrolLogsStore } from '$lib/stores/patrols.svelte.js';
  import { can, canActOnStep } from '$lib/rbac.js';
  import ApprovalStepper from '$lib/components/ApprovalStepper.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { generateMockAttendanceHistory, computeHoursWorked } from '$lib/utils/mockAttendance.js';

  let activeTab = $state('tab-roster');
  let isLeaveModalOpen = $state(false);

  const pageSize = 10;
  let rosterPage = $state(1);
  let balancesPage = $state(1);
  let leavePage = $state(1);
  let patrolPage = $state(1);

  // Roster builder
  let selectedDate = $state(new Date().toISOString().split('T')[0]);
  let isAssignModalOpen = $state(false);
  let assignTargetPost = $state('');
  let assignTargetShift = $state('');
  let assignEmpIds = $state(new Set());
  let assignFilterText = $state('');
  let assignTargetAssignmentId = $state(null);

  let posts = $derived([...new Set(cyberguard.employees.map(e => e.siteAssigned).filter(Boolean))].sort());
  let assignmentsForDate = $derived(rosterStore.items.filter(a => a.date === selectedDate));
  let assignedOfficersForDate = $derived(assignmentsForDate.filter(a => a.status === 'assigned'));

  // Officer Attendance History lookup
  let selectedRegisterEmpId = $state('');
  let selectedRegisterEmp = $derived(
    cyberguard.employees.find(e => e.id === selectedRegisterEmpId) || null
  );
  let registerHistory = $derived(generateMockAttendanceHistory(selectedRegisterEmp, 14));
  let pagedPosts = $derived(posts.slice((rosterPage - 1) * pageSize, rosterPage * pageSize));
  let employeesWithBalances = $derived(cyberguard.employees.filter(emp => emp.leaveBalances));
  let pagedBalanceEmployees = $derived(
    employeesWithBalances.slice((balancesPage - 1) * pageSize, balancesPage * pageSize)
  );
  let pagedCheckpoints = $derived(
    checkpointsStore.items.slice((patrolPage - 1) * pageSize, patrolPage * pageSize)
  );

  function findAssignments(post, shiftPattern) {
    return assignmentsForDate.filter(a => a.post === post && a.shiftPattern === shiftPattern && a.status === 'assigned');
  }

  function findOpenBroadcast(post, shiftPattern) {
    return assignmentsForDate.find(a => a.post === post && a.shiftPattern === shiftPattern && a.status === 'open');
  }

  let assignedForTargetSlot = $derived(findAssignments(assignTargetPost, assignTargetShift));
  let assignedIdsForTargetSlot = $derived(new Set(assignedForTargetSlot.map(a => a.empId)));

  let availableEmployeesForAssign = $derived(
    cyberguard.employees.filter(e => {
      if (assignedIdsForTargetSlot.has(e.id)) return false;
      if (!assignFilterText.trim()) return true;
      const q = assignFilterText.toLowerCase();
      return `${e.firstName} ${e.lastName} ${e.jobTitle} ${e.id}`.toLowerCase().includes(q);
    })
  );

  function toggleAssignEmp(empId) {
    const next = new Set(assignEmpIds);
    if (next.has(empId)) next.delete(empId);
    else next.add(empId);
    assignEmpIds = next;
  }

  function openAssignModal(post, shiftPattern, openBroadcast = null) {
    assignTargetPost = post;
    assignTargetShift = shiftPattern;
    assignEmpIds = new Set();
    assignFilterText = '';
    assignTargetAssignmentId = openBroadcast ? openBroadcast.id : null;
    isAssignModalOpen = true;
  }

  function submitAssignment(e) {
    e.preventDefault();
    if (assignEmpIds.size === 0) {
      cyberguard.showToast('Select at least one officer to assign to this post.', 'danger');
      return;
    }

    if (assignTargetAssignmentId) {
      rosterStore.remove(assignTargetAssignmentId);
    }

    let count = 0;
    [...assignEmpIds].forEach((empId, i) => {
      const emp = cyberguard.employees.find(e => e.id === empId);
      if (!emp) return;
      rosterStore.add({
        id: Date.now() + i,
        date: selectedDate,
        post: assignTargetPost,
        shiftPattern: assignTargetShift,
        empId: emp.id,
        empName: `${emp.firstName} ${emp.lastName}`,
        status: 'assigned'
      });
      count++;
    });

    isAssignModalOpen = false;
    cyberguard.showToast(`${count} officer${count === 1 ? '' : 's'} assigned to ${assignTargetPost} (${assignTargetShift}).`, 'success');
  }

  function unassign(assignment) {
    rosterStore.remove(assignment.id);
    cyberguard.showToast(`${assignment.empName} unassigned from ${assignment.post}.`, 'info');
  }

  function clockIn(assignment) {
    const time = new Date().toTimeString().slice(0, 5);
    rosterStore.update(assignment.id, { clockIn: time, clockInBy: cyberguard.currentUser.name });
    cyberguard.showToast(`${assignment.empName} clocked in at ${time}.`, 'success');
  }

  function clockOut(assignment) {
    const time = new Date().toTimeString().slice(0, 5);
    rosterStore.update(assignment.id, { clockOut: time, clockOutBy: cyberguard.currentUser.name });
    cyberguard.showToast(`${assignment.empName} clocked out at ${time}.`, 'success');
  }

  function broadcastOpenShift(post, shiftPattern) {
    rosterStore.add({
      id: Date.now(),
      date: selectedDate,
      post,
      shiftPattern,
      empId: null,
      empName: null,
      status: 'open',
      broadcastedAt: new Date().toISOString().split('T')[0]
    });
    cyberguard.showToast(`${post} (${shiftPattern}) broadcast as an open shift.`, 'info');
  }

  function cancelBroadcast(assignment) {
    rosterStore.remove(assignment.id);
    cyberguard.showToast('Open shift broadcast cancelled.', 'info');
  }

  function latestPatrolLog(post, checkpoint) {
    return patrolLogsStore.items
      .filter(l => l.post === post && l.checkpoint === checkpoint)
      .sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt))[0];
  }

  // Leave Form
  let leaveEmp = $state('CG-00111');
  let leaveCategory = $state('Annual');
  let leaveStart = $state('2026-11-01');
  let leaveEnd = $state('2026-11-06');
  let reliefCover = $state('Relief Guard Enock Banda');
  let leaveReason = $state('Scheduled annual vacation and family rest.');

  let leaveQueue = $derived(attendanceStore.items);
  let pagedLeaveQueue = $derived(
    leaveQueue.slice((leavePage - 1) * pageSize, leavePage * pageSize)
  );

  function currentStepRole(item) {
    return item.approvalChain[item.currentStep - 1]?.role;
  }

  function approveLeave(item) {
    const chain = item.approvalChain.map((s) => ({ ...s }));
    const stepIdx = item.currentStep - 1;
    chain[stepIdx] = {
      ...chain[stepIdx],
      status: 'approved',
      approverName: chain[stepIdx].approverName || cyberguard.currentUser.name,
      decidedAt: new Date().toISOString().split('T')[0]
    };
    const patch = { approvalChain: chain, currentStep: item.currentStep + 1 };
    Object.assign(patch, deriveLeaveStatus({ ...item, ...patch }));
    attendanceStore.update(item.id, patch);

    if (patch.isDecided && patch.badgeClass === 'badge-success' && item.empId && item.durationDays) {
      const leaveKey = item.type.replace(' Leave', '').toLowerCase();
      cyberguard.deductLeaveBalance(item.empId, leaveKey, item.durationDays);
    }

    cyberguard.showToast(
      patch.isDecided
        ? `Leave request for ${item.name} is now FULLY APPROVED.`
        : `Leave request for ${item.name} advanced to the next approval stage.`,
      'success'
    );
  }

  function rejectLeave(item) {
    const chain = item.approvalChain.map((s) => ({ ...s }));
    const stepIdx = item.currentStep - 1;
    chain[stepIdx] = {
      ...chain[stepIdx],
      status: 'rejected',
      approverName: chain[stepIdx].approverName || cyberguard.currentUser.name,
      decidedAt: new Date().toISOString().split('T')[0]
    };
    const patch = { approvalChain: chain };
    Object.assign(patch, deriveLeaveStatus({ ...item, ...patch }));
    attendanceStore.update(item.id, patch);
    cyberguard.showToast(`Leave request for ${item.name} REJECTED due to deployment requirements.`, "danger");
  }

  function handleLeaveSubmit(e) {
    e.preventDefault();
    const emp = cyberguard.employees.find(emp => emp.id === leaveEmp);
    const durationDays = Math.round((new Date(leaveEnd) - new Date(leaveStart)) / 86400000) + 1;
    const newItem = {
      id: Date.now(),
      empId: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      title: `${emp.jobTitle} • Field Post`,
      type: `${leaveCategory} Leave`,
      duration: `${leaveStart} to ${leaveEnd}`,
      durationDays,
      reason: `${leaveReason} • Cover: ${reliefCover}`,
      currentStep: 1,
      approvalChain: newLeaveChain()
    };
    Object.assign(newItem, deriveLeaveStatus(newItem));
    attendanceStore.add(newItem);
    isLeaveModalOpen = false;
    cyberguard.showToast(`Leave application submitted for ${newItem.name} to approval chain.`, "success");
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Time, Shifts & Attendance</title>
</svelte:head>

<Topbar title="Shift Roster, Biometric Logs & Leave Approvals">
  {#snippet actions()}
    <button class="btn btn-primary btn-sm" onclick={() => isLeaveModalOpen = true}>
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      Apply for Leave
    </button>
  {/snippet}
</Topbar>

<main class="page-container">
  
  <div class="page-header">
    <div class="header-title-area">
      <h2>Time, Attendance & Shift Management</h2>
      <p>12-hour shift rosters, biometric geofenced clock-in logs, overtime hours calculation, and multi-tier leave approval chains</p>
    </div>
    <div class="header-actions">
      <div class="tabs-header" style="background: none; border-bottom: none; padding: 0;">
        <button class="tab-btn" class:active={activeTab === 'tab-roster'} onclick={() => activeTab = 'tab-roster'}>Live Shift Roster & Clock-Ins</button>
        <button class="tab-btn" class:active={activeTab === 'tab-leave'} onclick={() => activeTab = 'tab-leave'}>Leave Management & Approval Chains</button>
        <button class="tab-btn" class:active={activeTab === 'tab-attendance-register'} onclick={() => activeTab = 'tab-attendance-register'}>Attendance Register</button>
        <!--
        <button class="tab-btn" class:active={activeTab === 'tab-policies'} onclick={() => activeTab = 'tab-policies'}>Shift Patterns & Policies</button>
        <button class="tab-btn" class:active={activeTab === 'tab-patrol'} onclick={() => activeTab = 'tab-patrol'}>Patrol Checkpoint Compliance</button>
        -->
      </div>
    </div>
  </div>

  <!-- Metric Summary Cards -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Shift Fulfillment Rate</span>
        <div class="stat-icon emerald"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
      </div>
      <div class="stat-val">98.4%</div>
      <div class="stat-footer"><span class="stat-trend up">↑ 0.6%</span><span>1,180 of 1,200 guards on post</span></div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Overtime Hours (MTD)</span>
        <div class="stat-icon cyan"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
      </div>
      <div class="stat-val">4,210 Hrs</div>
      <div class="stat-footer"><span>Payable at 1.5x / 2.0x rates</span></div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Pending Leave Approvals</span>
        <div class="stat-icon amber"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg></div>
      </div>
      <div class="stat-val">{leaveQueue.filter(l => !l.isDecided).length} In Chain</div>
      <div class="stat-footer"><span>Area Mgr & HR Review Stages</span></div>
    </div>
  </div>

  <div class="tabs-container">
    
    <!-- TAB 1: SHIFT ROSTER BUILDER -->
    {#if activeTab === 'tab-roster'}
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Post & Shift Deployment Roster</div>
            <div class="card-subtitle">Assign guards to posts per shift pattern — click an open slot to deploy coverage</div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label class="form-label" for="rosterDate" style="margin: 0;">Date</label>
            <input type="date" class="form-control" id="rosterDate" bind:value={selectedDate} style="width: 165px;">
          </div>
        </div>
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Site Post & Hub</th>
                {#each SHIFT_PATTERNS as pattern}
                  <th>{pattern}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each pagedPosts as post (post)}
                <tr>
                  <td style="font-weight: 700; color: #fff;">{post}</td>
                  {#each SHIFT_PATTERNS as pattern}
                    {@const assigned = findAssignments(post, pattern)}
                    {@const openBroadcast = findOpenBroadcast(post, pattern)}
                    <td>
                      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        {#if assigned.length > 0}
                          <span class="badge badge-success" style="font-size: 0.72rem;">
                            <span class="badge-dot"></span> {assigned.length} Assigned
                          </span>
                        {/if}
                        {#if openBroadcast}
                          <span class="badge badge-warning" style="font-size: 0.68rem;" title="Broadcast {openBroadcast.broadcastedAt}">Open — Awaiting Pickup</span>
                        {/if}
                        <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick={() => openAssignModal(post, pattern, openBroadcast)} disabled={!can(cyberguard.activeRoleId, 'canApprove')}>Roster</button>
                        {#if openBroadcast}
                          <button class="btn btn-secondary btn-sm" onclick={() => cancelBroadcast(openBroadcast)} disabled={!can(cyberguard.activeRoleId, 'canApprove')} title="Cancel broadcast">&times;</button>
                        {:else}
                          <button class="btn btn-secondary btn-sm" onclick={() => broadcastOpenShift(post, pattern)} disabled={!can(cyberguard.activeRoleId, 'canApprove')} title="Broadcast this slot for self-service pickup">Broadcast</button>
                        {/if}
                      </div>
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <Pagination bind:currentPage={rosterPage} totalItems={posts.length} {pageSize} />
      </div>
    {/if}

    <!-- TAB 2: LEAVE MANAGEMENT & APPROVAL CHAIN -->
    {#if activeTab === 'tab-leave'}
      <div>
        <!-- Leave Types & Balances Overview -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div class="card" style="margin-bottom: 0; padding: 18px;">
            <div style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700;">ANNUAL LEAVE</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #fff; margin: 4px 0;">24 Days / Year</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">Accrues 2 days per active month</div>
          </div>

          <div class="card" style="margin-bottom: 0; padding: 18px;">
            <div style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700;">SICK LEAVE (PAID)</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #34d399; margin: 4px 0;">30 Days / Year</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">Requires registered medical cert</div>
          </div>

          <div class="card" style="margin-bottom: 0; padding: 18px;">
            <div style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700;">MATERNITY / PATERNITY</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #60a5fa; margin: 4px 0;">120 Days / 7 Days</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">Zambian Employment Code Act aligned</div>
          </div>

          <div class="card" style="margin-bottom: 0; padding: 18px;">
            <div style="font-size: 0.76rem; color: var(--text-muted); font-weight: 700;">COMPASSIONATE LEAVE</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #fbbf24; margin: 4px 0;">7 Days / Occurrence</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">Immediate family bereavement</div>
          </div>
        </div>

        <!-- Approval Queue -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Leave Approval Workflow Queue</div>
              <div class="card-subtitle">Chain: Staff Request → Site Supervisor → Area Manager → HR Manager</div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration & Dates</th>
                  <th>Reason / Cover Guard</th>
                  <th>Approval Chain Status</th>
                  <th style="text-align: right;">Action Decision</th>
                </tr>
              </thead>
              <tbody>
                {#each pagedLeaveQueue as item (item.id)}
                  <tr style="background: {item.isDecided ? (item.badgeClass.includes('success') ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)') : 'transparent'};">
                    <td>
                      <strong>{item.name}</strong>
                      <div style="font-size: 0.72rem; color: var(--text-dim);">{item.title}</div>
                    </td>
                    <td><span class="badge badge-primary">{item.type}</span></td>
                    <td>{item.duration}</td>
                    <td>{item.reason}</td>
                    <td>
                      <span class="badge {item.badgeClass}"><span class="badge-dot"></span> {item.status}</span>
                      <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 2px;">{item.subStatus}</div>
                    </td>
                    <td style="text-align: right;">
                      {#if !item.isDecided}
                        <button class="btn btn-primary btn-sm" onclick={() => approveLeave(item)} disabled={!canActOnStep(cyberguard.activeRoleId, currentStepRole(item))} title={canActOnStep(cyberguard.activeRoleId, currentStepRole(item)) ? '' : 'Your current role cannot approve at this stage'}>Approve</button>
                        <button class="btn btn-danger btn-sm" onclick={() => rejectLeave(item)} disabled={!canActOnStep(cyberguard.activeRoleId, currentStepRole(item))} title={canActOnStep(cyberguard.activeRoleId, currentStepRole(item)) ? '' : 'Your current role cannot approve at this stage'}>Reject</button>
                      {:else}
                        <span style="font-size: 0.76rem; color: var(--text-dim);">Action Decided</span>
                      {/if}
                    </td>
                  </tr>
                  <tr style="background: transparent;">
                    <td colspan="6" style="padding: 4px 16px 16px;">
                      <ApprovalStepper chain={item.approvalChain} currentStep={item.currentStep} />
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <Pagination bind:currentPage={leavePage} totalItems={leaveQueue.length} {pageSize} />
        </div>

        <!-- Per-Employee Leave Balance Ledger -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Employee Leave Balance Ledger</div>
              <div class="card-subtitle">Remaining days per employee, debited automatically when a leave request reaches full approval</div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Annual</th>
                  <th>Sick</th>
                  <th>Maternity</th>
                  <th>Paternity</th>
                  <th>Compassionate</th>
                </tr>
              </thead>
              <tbody>
                {#each pagedBalanceEmployees as emp (emp.id)}
                  <tr>
                    <td>
                      <strong>{emp.firstName} {emp.lastName}</strong>
                      <div style="font-size: 0.72rem; color: var(--text-dim);">{emp.jobTitle} • {emp.id}</div>
                    </td>
                    <td>{emp.leaveBalances.annual} / 24</td>
                    <td>{emp.leaveBalances.sick} / 30</td>
                    <td>{emp.leaveBalances.maternity} / 120</td>
                    <td>{emp.leaveBalances.paternity} / 7</td>
                    <td>{emp.leaveBalances.compassionate} / 7</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <Pagination bind:currentPage={balancesPage} totalItems={employeesWithBalances.length} {pageSize} />
        </div>
      </div>
    {/if}

    <!-- TAB: ATTENDANCE REGISTER -->
    {#if activeTab === 'tab-attendance-register'}
      <div>
        <!-- Card A: Shift Clock-In / Clock-Out Register -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Shift Clock-In / Clock-Out Register</div>
              <div class="card-subtitle">Site Supervisor marks each assigned officer's clock-in and clock-out for the selected date</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <label class="form-label" for="registerDate" style="margin: 0;">Date</label>
              <input type="date" class="form-control" id="registerDate" bind:value={selectedDate} style="width: 165px;">
            </div>
          </div>
          <div class="table-responsive">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Post</th>
                  <th>Shift</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                {#each assignedOfficersForDate as a (a.id)}
                  <tr>
                    <td>
                      <strong>{a.empName}</strong>
                      <div style="font-size: 0.72rem; color: var(--text-dim);">{a.empId}</div>
                    </td>
                    <td style="font-size: 0.84rem;">{a.post}</td>
                    <td style="font-size: 0.84rem;">{a.shiftPattern}</td>
                    <td style="font-size: 0.84rem;">
                      {#if a.clockIn}
                        {a.clockIn}
                        <div style="font-size: 0.68rem; color: var(--text-dim);">by {a.clockInBy}</div>
                      {:else}
                        <span style="color: var(--text-dim);">—</span>
                      {/if}
                    </td>
                    <td style="font-size: 0.84rem;">
                      {#if a.clockOut}
                        {a.clockOut}
                        <div style="font-size: 0.68rem; color: var(--text-dim);">by {a.clockOutBy}</div>
                      {:else}
                        <span style="color: var(--text-dim);">—</span>
                      {/if}
                    </td>
                    <td>
                      {#if a.clockIn && a.clockOut}
                        <span class="badge badge-success"><span class="badge-dot"></span> Completed</span>
                      {:else if a.clockIn}
                        <span class="badge badge-warning"><span class="badge-dot"></span> On Duty</span>
                      {:else}
                        <span class="badge badge-neutral">Not Clocked</span>
                      {/if}
                    </td>
                    <td style="text-align: right;">
                      {#if !a.clockIn}
                        <button class="btn btn-primary btn-sm" onclick={() => clockIn(a)} disabled={!can(cyberguard.activeRoleId, 'canApprove')}>Clock In</button>
                      {:else if !a.clockOut}
                        <button class="btn btn-secondary btn-sm" onclick={() => clockOut(a)} disabled={!can(cyberguard.activeRoleId, 'canApprove')}>Clock Out</button>
                      {:else}
                        <span style="font-size: 0.76rem; color: var(--text-dim);">—</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
                {#if assignedOfficersForDate.length === 0}
                  <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-dim); padding: 24px;">No officers rostered for {selectedDate}. Assign officers from the Live Shift Roster tab first.</td>
                  </tr>
                {/if}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Card B: Officer Attendance History -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Officer Attendance History</div>
              <div class="card-subtitle">Clock-in / clock-out record for a selected officer over the last 14 days</div>
            </div>
            <select class="form-control" style="min-width: 240px;" bind:value={selectedRegisterEmpId}>
              <option value="">Select Officer</option>
              {#each cyberguard.employees as e (e.id)}
                <option value={e.id}>{e.firstName} {e.lastName} ({e.jobTitle} - {e.id})</option>
              {/each}
            </select>
          </div>
          {#if !selectedRegisterEmp}
            <div class="card-body" style="text-align: center; color: var(--text-dim); padding: 32px;">Select an officer to view their attendance history.</div>
          {:else}
            <div class="table-responsive">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Hours Worked</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {#each registerHistory as r (r.date)}
                    <tr>
                      <td style="font-weight: 600; color: var(--text-main);">{r.date}</td>
                      <td style="font-size: 0.84rem;">{r.shiftPattern}</td>
                      <td style="font-size: 0.84rem;">{r.clockIn || '—'}</td>
                      <td style="font-size: 0.84rem;">{r.clockOut || '—'}</td>
                      <td style="font-size: 0.84rem;">{computeHoursWorked(r.clockIn, r.clockOut) ?? '—'}</td>
                      <td>
                        {#if r.status === 'On Time'}
                          <span class="badge badge-success"><span class="badge-dot"></span> On Time</span>
                        {:else if r.status === 'Late'}
                          <span class="badge badge-warning"><span class="badge-dot"></span> Late</span>
                        {:else}
                          <span class="badge badge-danger"><span class="badge-dot"></span> Absent</span>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- TAB 3: SHIFT PATTERNS & POLICIES -->
    <!--
    {#if activeTab === 'tab-policies'}
      <div class="card">
        <div class="card-header">
          <div class="card-title">Security Force Shift Patterns & Clock-in Policies</div>
        </div>
        <div class="card-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div>
              <h4 style="font-size: 0.95rem; color: #fff; margin-bottom: 8px;">1. Standard Guard Shifts (12-Hour Continuous)</h4>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
                Due to the 24/7 security perimeter requirements of mining hubs and commercial compounds:
              </p>
              <ul style="font-size: 0.8rem; color: var(--text-main); line-height: 1.8; margin-left: 20px;">
                <li><strong>Day Shift:</strong> 06:00 to 18:00 (15-min parade at 05:45).</li>
                <li><strong>Night Shift:</strong> 18:00 to 06:00 (15-min parade at 17:45).</li>
                <li><strong>Roster Rotation:</strong> 4 consecutive shifts on duty, followed by 2 rest days.</li>
                <li><strong>Relief Guard Rule:</strong> A guard on post must NEVER leave post until formally relieved by the incoming guard.</li>
              </ul>
            </div>

            <div>
              <h4 style="font-size: 0.95rem; color: #fff; margin-bottom: 8px;">2. Clock-In / Out & Overtime Guidelines</h4>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
                Strict biometric & geofence logging parameters:
              </p>
              <ul style="font-size: 0.8rem; color: var(--text-main); line-height: 1.8; margin-left: 20px;">
                <li><strong>Grace Period:</strong> 15 minutes before shift start. Clocking in after 06:15 triggers an automated late alert to the Shift Coordinator.</li>
                <li><strong>Overtime Rate:</strong> Hours worked beyond 195 regular hours per month are compensated at 1.5x basic hourly pay.</li>
                <li><strong>Gazetted Public Holidays:</strong> Shifts worked on Zambian public holidays are remunerated at 2.0x standard rate.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    {/if}
    -->

    <!--
    {#if activeTab === 'tab-patrol'}
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Patrol Checkpoint Compliance</div>
            <div class="card-subtitle">Most recent GPS geofence-verified checkpoint log per post</div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Site Post</th>
                <th>Checkpoint</th>
                <th>Last Logged By</th>
                <th>Last Logged At</th>
                <th>Geofence Status</th>
              </tr>
            </thead>
            <tbody>
              {#each pagedCheckpoints as cp (cp.id)}
                {@const log = latestPatrolLog(cp.post, cp.label)}
                <tr>
                  <td style="font-weight: 600; color: var(--text-main);">{cp.post}</td>
                  <td style="font-size: 0.84rem;">{cp.label}</td>
                  {#if log}
                    <td style="font-size: 0.84rem;">{log.empName}</td>
                    <td style="font-size: 0.8rem;">{log.loggedAt}</td>
                    <td>
                      {#if log.method === 'manual_override'}
                        <span class="badge badge-secondary" style="font-size: 0.68rem;">Manual Override</span>
                      {:else if log.withinGeofence}
                        <span class="badge badge-success" style="font-size: 0.68rem;">Within Geofence ({log.distanceMeters}m)</span>
                      {:else}
                        <span class="badge badge-danger" style="font-size: 0.68rem;">Outside Geofence ({log.distanceMeters}m)</span>
                      {/if}
                    </td>
                  {:else}
                    <td colspan="3" style="font-size: 0.8rem; color: var(--text-dim);">Never logged</td>
                  {/if}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <Pagination bind:currentPage={patrolPage} totalItems={checkpointsStore.items.length} {pageSize} />
      </div>
    {/if}
    -->

  </div>

</main>

<!-- MODAL: ROSTER - ASSIGN OFFICERS TO POST -->
{#if isAssignModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 760px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Roster — {assignTargetPost}</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            {assignTargetShift} • {selectedDate}
          </div>
        </div>
        <button class="modal-close" onclick={() => isAssignModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={submitAssignment}>
        <div class="modal-body">
          <div class="roster-modal-grid">
            <div class="form-group">
              <label class="form-label" for="assignFilter">Add Officers <span class="req">*</span></label>
              <input type="text" class="form-control" id="assignFilter" bind:value={assignFilterText} placeholder="Filter by name, role, or ID..." style="margin-bottom: 10px;">
              <div class="guard-pick-list">
                {#each availableEmployeesForAssign as e (e.id)}
                  <label class="guard-pick-row">
                    <input type="checkbox" checked={assignEmpIds.has(e.id)} onchange={() => toggleAssignEmp(e.id)}>
                    <div>
                      <div class="guard-pick-name">{e.firstName} {e.lastName}</div>
                      <div class="guard-pick-meta">{e.jobTitle} • {e.id}</div>
                    </div>
                  </label>
                {/each}
                {#if availableEmployeesForAssign.length === 0}
                  <div style="font-size: 0.8rem; color: var(--text-dim); text-align: center; padding: 16px;">No matching personnel</div>
                {/if}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Currently Assigned ({assignedForTargetSlot.length})</label>
              <div class="guard-pick-list" style="margin-top: 36px;">
                {#each assignedForTargetSlot as a (a.id)}
                  <div class="guard-pick-row">
                    <div>
                      <div class="guard-pick-name">{a.empName}</div>
                      <div class="guard-pick-meta">{a.empId}</div>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" style="margin-left: auto;" onclick={() => unassign(a)} disabled={!can(cyberguard.activeRoleId, 'canApprove')} title="Unassign">&times;</button>
                  </div>
                {/each}
                {#if assignedForTargetSlot.length === 0}
                  <div style="font-size: 0.8rem; color: var(--text-dim); text-align: center; padding: 16px;">No officers assigned to this post/shift yet.</div>
                {/if}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div style="flex: 1; font-size: 0.8rem; color: var(--text-muted);">{assignEmpIds.size} selected</div>
          <button type="button" class="btn btn-secondary" onclick={() => isAssignModalOpen = false}>Close</button>
          <button type="submit" class="btn btn-primary" disabled={assignEmpIds.size === 0}>Assign to Post</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: SUBMIT LEAVE APPLICATION -->
{#if isLeaveModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div class="modal-title">Submit Employee Leave Application</div>
        <button class="modal-close" onclick={() => isLeaveModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleLeaveSubmit}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="leaveEmp">Select Employee Personnel <span class="req">*</span></label>
            <select class="form-control" id="leaveEmp" bind:value={leaveEmp} required>
              {#each cyberguard.employees as e}
                <option value={e.id}>{e.firstName} {e.lastName} ({e.jobTitle} - {e.id})</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="leaveCat">Leave Category <span class="req">*</span></label>
            <select class="form-control" id="leaveCat" bind:value={leaveCategory} required>
              <option value="Annual">Annual Leave (24 Days Entitlement)</option>
              <option value="Sick">Sick Leave (Medical Certificate Required)</option>
              <option value="Maternity">Maternity / Paternity Leave</option>
              <option value="Compassionate">Compassionate Leave</option>
            </select>
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="lStart">Start Date <span class="req">*</span></label>
              <input type="date" class="form-control" id="lStart" bind:value={leaveStart} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="lEnd">End Date <span class="req">*</span></label>
              <input type="date" class="form-control" id="lEnd" bind:value={leaveEnd} required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="lCover">Relief Personnel Cover</label>
            <input type="text" class="form-control" id="lCover" bind:value={reliefCover} placeholder="e.g. Relief Guard Enock Banda">
          </div>
          <div class="form-group">
            <label class="form-label" for="lReason">Reason / Justification</label>
            <textarea class="form-control" id="lReason" bind:value={leaveReason} placeholder="Provide notes or attach hospital medical recommendation details"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isLeaveModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Submit to Approval Chain</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .roster-modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .guard-pick-list {
    max-height: 320px;
    overflow-y: auto;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .guard-pick-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .guard-pick-row:hover {
    background: var(--bg-card);
  }

  .guard-pick-row input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: var(--primary);
    flex-shrink: 0;
  }

  .guard-pick-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .guard-pick-meta {
    font-size: 0.72rem;
    color: var(--text-dim);
  }
</style>
