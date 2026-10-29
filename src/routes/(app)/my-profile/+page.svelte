<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard, formatZMW } from '$lib/cyberguard.svelte.js';
  import { attendanceStore } from '$lib/stores/attendance.svelte.js';
  import { trainingRecordsStore } from '$lib/stores/training.svelte.js';
  import { rosterStore } from '$lib/stores/roster.svelte.js';
  import { incidentsStore, newIncidentChain } from '$lib/stores/incidents.svelte.js';
  import { checkpointsStore, patrolLogsStore } from '$lib/stores/patrols.svelte.js';
  import { checkGeofence } from '$lib/geofence.js';

  let emp = $derived(
    cyberguard.employees.find(e => e.id === cyberguard.loggedInEmployeeId) ||
    cyberguard.employees.find(e => e.id === 'CG-00111') ||
    cyberguard.employees[0]
  );

  let qualifications = $derived(emp ? (emp.qualifications || []) : []);
  let mySkills = $derived(emp ? (emp.skills || []) : []);

  function proficiencyBadgeClass(level) {
    if (level === 'Expert') return 'badge-success';
    if (level === 'Proficient') return 'badge-primary';
    if (level === 'Competent') return 'badge-warning';
    return 'badge-secondary';
  }

  let myLeaveRequests = $derived(
    emp ? attendanceStore.items.filter(item => item.empId === emp.id) : []
  );

  let myTraining = $derived(
    emp ? trainingRecordsStore.items.filter(r => r.empId === emp.id) : []
  );

  function trainingStatusBadgeClass(status) {
    if (status === 'completed') return 'badge-success';
    if (status === 'overdue') return 'badge-danger';
    if (status === 'in_progress') return 'badge-primary';
    return 'badge-warning';
  }

  function trainingStatusLabel(status) {
    if (status === 'in_progress') return 'In Progress';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function markTrainingComplete(rec) {
    trainingRecordsStore.update(rec.id, {
      status: 'completed',
      completedAt: new Date().toISOString().split('T')[0]
    });
    cyberguard.showToast(`${rec.courseTitle} marked complete.`, 'success');
  }

  let openShifts = $derived(rosterStore.items.filter(a => a.status === 'open'));

  function claimOpenShift(assignment) {
    if (!emp) return;
    rosterStore.update(assignment.id, {
      empId: emp.id,
      empName: `${emp.firstName} ${emp.lastName}`,
      status: 'assigned'
    });
    cyberguard.showToast(`You claimed ${assignment.post} (${assignment.shiftPattern}) on ${assignment.date}.`, 'success');
  }

  let isIncidentModalOpen = $state(false);
  let incidentCategory = $state('Security Breach');
  let incidentSeverity = $state('Low');
  let incidentDescription = $state('');
  let incidentOccurredAt = $state(new Date().toISOString().split('T')[0]);

  function openIncidentModal() {
    incidentCategory = 'Security Breach';
    incidentSeverity = 'Low';
    incidentDescription = '';
    incidentOccurredAt = new Date().toISOString().split('T')[0];
    isIncidentModalOpen = true;
  }

  function handleFileIncident(e) {
    e.preventDefault();
    if (!emp) return;
    incidentsStore.add({
      id: Date.now(),
      empId: emp.id,
      empName: `${emp.firstName} ${emp.lastName}`,
      reportedBy: `${emp.firstName} ${emp.lastName} (${emp.jobTitle})`,
      post: emp.siteAssigned,
      category: incidentCategory,
      severity: incidentSeverity,
      description: incidentDescription,
      occurredAt: incidentOccurredAt,
      filedAt: new Date().toISOString().split('T')[0],
      outcome: 'pending',
      currentStep: 1,
      approvalChain: newIncidentChain()
    });
    isIncidentModalOpen = false;
    cyberguard.showToast('Incident report filed. HR and Operations will review it shortly.', 'success');
  }

  let isCheckpointModalOpen = $state(false);
  let checkpointId = $state('');
  let checkpointStatusMessage = $state('');
  let checkpointAwaitingOverride = $state(false);
  let overrideReason = $state('');

  let myCheckpoints = $derived(emp ? checkpointsStore.items.filter(cp => cp.post === emp.siteAssigned) : []);

  function openCheckpointModal() {
    checkpointId = myCheckpoints.length ? String(myCheckpoints[0].id) : '';
    checkpointStatusMessage = '';
    checkpointAwaitingOverride = false;
    overrideReason = '';
    isCheckpointModalOpen = true;
  }

  function recordPatrolLog(cp, { distanceMeters, withinGeofence, method, overrideReason: reason }) {
    patrolLogsStore.add({
      id: Date.now(),
      post: cp.post,
      checkpoint: cp.label,
      empId: emp.id,
      empName: `${emp.firstName} ${emp.lastName}`,
      loggedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      distanceMeters,
      withinGeofence,
      method,
      overrideReason: reason || null
    });
  }

  function logCheckpointWithGps() {
    const cp = myCheckpoints.find(c => String(c.id) === checkpointId);
    if (!cp || !emp) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      checkpointAwaitingOverride = true;
      checkpointStatusMessage = 'GPS is not available on this device.';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { distanceMeters, withinRadius } = checkGeofence(cp.post, position.coords);
        recordPatrolLog(cp, { distanceMeters, withinGeofence: withinRadius, method: 'gps' });
        isCheckpointModalOpen = false;
        cyberguard.showToast(
          withinRadius
            ? `Checkpoint logged — within geofence (${distanceMeters}m from post).`
            : `Checkpoint logged — outside geofence (${distanceMeters}m from post). Flagged for review.`,
          withinRadius ? 'success' : 'warning'
        );
      },
      () => {
        checkpointAwaitingOverride = true;
        checkpointStatusMessage = 'Could not get a GPS fix (permission denied, unavailable, or timed out).';
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  function submitManualOverride(e) {
    e.preventDefault();
    const cp = myCheckpoints.find(c => String(c.id) === checkpointId);
    if (!cp || !emp) return;
    recordPatrolLog(cp, { distanceMeters: null, withinGeofence: false, method: 'manual_override', overrideReason });
    isCheckpointModalOpen = false;
    cyberguard.showToast('Checkpoint logged via manual override.', 'info');
  }

  function getOtHours(employee) {
    if (employee.jobTitle === "Guards") return 12;
    if (employee.jobTitle === "Site Supervisor") return 8;
    if (employee.jobTitle === "Shift Coordinator") return 6;
    return 0;
  }

  let pay = $derived.by(() => {
    if (!emp) return null;
    return cyberguard.calculatePayroll(emp, getOtHours(emp));
  });
</script>

<svelte:head>
  <title>CyberGuard Security | My Profile</title>
</svelte:head>

<Topbar title="My Profile" />

<main class="page-container">

  {#if emp}
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-body" style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
        <div class="profile-avatar-sm">{emp.firstName[0]}{emp.lastName[0]}</div>
        <div style="flex: 1;">
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-main);">{emp.firstName} {emp.lastName}</div>
          <div style="font-size: 0.86rem; color: var(--accent-cyan); font-weight: 600; margin-top: 2px;">{emp.jobTitle} • {emp.gradeLevel}</div>
          <div style="font-size: 0.76rem; color: var(--text-dim); margin-top: 4px;">ID: {emp.id} • Station: {emp.siteAssigned}</div>
        </div>
        <span class="badge badge-success"><span class="badge-dot"></span> {emp.status || 'Active Service'}</span>
      </div>
    </div>

    <div class="profile-columns">

      <div class="card">
        <div class="card-header">
          <div class="card-title">Personal & Identity</div>
        </div>
        <div class="card-body">
          <div class="profile-grid">
            <div class="profile-field">
              <div class="profile-field-label">National ID (NRC)</div>
              <div class="profile-field-val">{emp.nationalId}</div>
            </div>
            <div class="profile-field">
              <div class="profile-field-label">Date of Birth</div>
              <div class="profile-field-val">{emp.dob}</div>
            </div>
            <div class="profile-field">
              <div class="profile-field-label">Mobile Phone</div>
              <div class="profile-field-val">{emp.phone}</div>
            </div>
            <div class="profile-field">
              <div class="profile-field-label">Email</div>
              <div class="profile-field-val">{emp.email}</div>
            </div>
            <div class="profile-field" style="grid-column: 1 / -1;">
              <div class="profile-field-label">Residential Address</div>
              <div class="profile-field-val">{emp.address}</div>
            </div>
            <div class="profile-field" style="grid-column: 1 / -1;">
              <div class="profile-field-label">Next of Kin</div>
              <div class="profile-field-val">{emp.nextOfKin}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Job & Organizational Structure</div>
        </div>
        <div class="card-body">
          <div class="profile-grid">
            <div class="profile-field">
              <div class="profile-field-label">Department</div>
              <div class="profile-field-val">{emp.department}</div>
            </div>
            <div class="profile-field">
              <div class="profile-field-label">Direct Manager</div>
              <div class="profile-field-val">{emp.reportingTo}</div>
            </div>
            <div class="profile-field">
              <div class="profile-field-label">Contract Type</div>
              <div class="profile-field-val">{emp.contractType}</div>
            </div>
            <div class="profile-field">
              <div class="profile-field-label">Date of Appointment</div>
              <div class="profile-field-val">{emp.joinDate}</div>
            </div>
            <div class="profile-field">
              <div class="profile-field-label">Shift Pattern</div>
              <div class="profile-field-val">{emp.shiftPattern}</div>
            </div>
            <div class="profile-field">
              <div class="profile-field-label">Assigned Site</div>
              <div class="profile-field-val">{emp.siteAssigned}</div>
            </div>
          </div>
        </div>
      </div>

      {#if pay}
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">My Payslip — Current Period</div>
              <div class="card-subtitle">Figures recomputed live from the statutory engine (ZRA PAYE / NAPSA / NHIMA)</div>
            </div>
          </div>
          <div class="card-body">
            <table class="modern-table" style="margin-bottom: 0;">
              <tbody>
                <tr><td>Basic Salary</td><td style="text-align: right;">{formatZMW(pay.basePay)}</td></tr>
                <tr><td>Housing Allowance</td><td style="text-align: right;">{formatZMW(pay.housingAllowance)}</td></tr>
                <tr><td>Transport Allowance</td><td style="text-align: right;">{formatZMW(pay.transportAllowance)}</td></tr>
                <tr><td>Overtime Pay</td><td style="text-align: right;">{formatZMW(pay.overtimePay)}</td></tr>
                <tr><td><strong>Gross Pay</strong></td><td style="text-align: right;"><strong>{formatZMW(pay.grossTotal)}</strong></td></tr>
                <tr><td>ZRA PAYE Tax</td><td style="text-align: right; color: var(--warning);">-{formatZMW(pay.paye)}</td></tr>
                <tr><td>NAPSA Pension (5%)</td><td style="text-align: right; color: var(--warning);">-{formatZMW(pay.napsaEmployee)}</td></tr>
                <tr><td>NHIMA Health Scheme (1%)</td><td style="text-align: right; color: var(--warning);">-{formatZMW(pay.nhimaEmployee)}</td></tr>
                <tr><td><strong>Net Pay</strong></td><td style="text-align: right; color: var(--success); font-size: 1.05rem;"><strong>{formatZMW(pay.netPay)}</strong></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      {/if}

      <div class="card">
        <div class="card-header">
          <div class="card-title">My Qualifications & Certifications</div>
          <span class="badge badge-primary">{qualifications.length}</span>
        </div>
        <div class="card-body">
          {#if qualifications.length === 0}
            <div style="color: var(--text-muted); font-size: 0.86rem;">No qualifications on file yet.</div>
          {:else}
            <div style="display: flex; flex-direction: column; gap: 10px;">
              {#each qualifications as q (q.id)}
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                  <div>
                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">{q.qualificationName}</div>
                    <div style="font-size: 0.74rem; color: var(--text-muted);">{q.institution} • {q.category}</div>
                  </div>
                  <div style="text-align: right;">
                    <span class="badge badge-success" style="font-size: 0.68rem;">{q.verificationStatus}</span>
                    {#if q.expiryDate}
                      <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 3px;">Expires {q.expiryDate}</div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">My Skills</div>
          <span class="badge badge-primary">{mySkills.length}</span>
        </div>
        <div class="card-body">
          {#if mySkills.length === 0}
            <div style="color: var(--text-muted); font-size: 0.86rem;">No skills assessed yet.</div>
          {:else}
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              {#each mySkills as s (s.id)}
                <span class="badge {proficiencyBadgeClass(s.proficiency)}" style="font-size: 0.74rem;" title="Assessed {s.assessedAt} by {s.assessedBy}">{s.skillName} • {s.proficiency}</span>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">My Training</div>
          <span class="badge badge-primary">{myTraining.length}</span>
        </div>
        <div class="card-body">
          {#if myTraining.length === 0}
            <div style="color: var(--text-muted); font-size: 0.86rem;">No training enrollments yet.</div>
          {:else}
            <div style="display: flex; flex-direction: column; gap: 10px;">
              {#each myTraining as r (r.id)}
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); gap: 10px;">
                  <div>
                    <div style="font-weight: 700; font-size: 0.86rem; color: var(--text-main);">{r.courseTitle}</div>
                    <div style="font-size: 0.74rem; color: var(--text-muted);">Due {r.dueDate || '—'}</div>
                  </div>
                  <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                    <span class="badge {trainingStatusBadgeClass(r.status)}" style="font-size: 0.68rem;">{trainingStatusLabel(r.status)}</span>
                    {#if r.status !== 'completed'}
                      <button class="btn btn-primary btn-sm" onclick={() => markTrainingComplete(r)}>Mark as Complete</button>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Open Shifts</div>
          <span class="badge badge-primary">{openShifts.length}</span>
        </div>
        <div class="card-body">
          {#if openShifts.length === 0}
            <div style="color: var(--text-muted); font-size: 0.86rem;">No open shifts available to claim right now.</div>
          {:else}
            <div style="display: flex; flex-direction: column; gap: 10px;">
              {#each openShifts as a (a.id)}
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); gap: 10px;">
                  <div>
                    <div style="font-weight: 700; font-size: 0.86rem; color: var(--text-main);">{a.post}</div>
                    <div style="font-size: 0.74rem; color: var(--text-muted);">{a.shiftPattern} • {a.date}</div>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick={() => claimOpenShift(a)}>Claim This Shift</button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Safety &amp; Security</div>
        </div>
        <div class="card-body">
          <div style="font-size: 0.86rem; color: var(--text-muted); margin-bottom: 12px;">Report a security, safety, or equipment incident from the field. HR and Operations will review it.</div>
          <button class="btn btn-primary btn-sm" onclick={openIncidentModal}>Report an Incident</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Patrol Checkpoint Log</div>
        </div>
        <div class="card-body">
          {#if myCheckpoints.length === 0}
            <div style="color: var(--text-muted); font-size: 0.86rem;">No checkpoints configured for your assigned site yet.</div>
          {:else}
            <div style="font-size: 0.86rem; color: var(--text-muted); margin-bottom: 12px;">Verify your presence at a checkpoint using your device's GPS location.</div>
            <button class="btn btn-primary btn-sm" onclick={openCheckpointModal}>Log My Checkpoint</button>
          {/if}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">My Leave Requests</div>
        </div>
        <div class="card-body">
          {#if myLeaveRequests.length === 0}
            <div style="color: var(--text-muted); font-size: 0.86rem;">No leave requests on file.</div>
          {:else}
            <div style="display: flex; flex-direction: column; gap: 10px;">
              {#each myLeaveRequests as item (item.id)}
                <div style="background: var(--bg-card); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="font-size: 0.86rem;">{item.type}</strong>
                    <span class="badge {item.badgeClass}">{item.status}</span>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">{item.duration}</div>
                  <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">{item.subStatus}</div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

    </div>
  {/if}

</main>

<!-- MODAL: REPORT AN INCIDENT -->
{#if isIncidentModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 550px;">
      <div class="modal-header">
        <div class="modal-title">Report an Incident</div>
        <button class="modal-close" onclick={() => isIncidentModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleFileIncident}>
        <div class="modal-body">
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="myIncidentCategory">Category <span class="req">*</span></label>
              <select class="form-control" id="myIncidentCategory" bind:value={incidentCategory} required>
                <option value="Security Breach">Security Breach</option>
                <option value="Equipment Fault">Equipment Fault</option>
                <option value="Medical">Medical</option>
                <option value="Altercation">Altercation</option>
                <option value="Theft">Theft</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="myIncidentSeverity">Severity <span class="req">*</span></label>
              <select class="form-control" id="myIncidentSeverity" bind:value={incidentSeverity} required>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="myIncidentOccurred">Date Occurred <span class="req">*</span></label>
            <input type="date" class="form-control" id="myIncidentOccurred" bind:value={incidentOccurredAt} required>
          </div>
          <div class="form-group">
            <label class="form-label" for="myIncidentDescription">What happened? <span class="req">*</span></label>
            <textarea class="form-control" id="myIncidentDescription" bind:value={incidentDescription} rows="4" required></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isIncidentModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">File Report</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: LOG MY CHECKPOINT -->
{#if isCheckpointModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 500px;">
      <div class="modal-header">
        <div class="modal-title">Log My Checkpoint</div>
        <button class="modal-close" onclick={() => isCheckpointModalOpen = false}>&times;</button>
      </div>
      {#if !checkpointAwaitingOverride}
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="checkpointSelect">Checkpoint <span class="req">*</span></label>
            <select class="form-control" id="checkpointSelect" bind:value={checkpointId} required>
              {#each myCheckpoints as cp}
                <option value={String(cp.id)}>{cp.label}</option>
              {/each}
            </select>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Your device will be asked for permission to share its location. The real computed distance to this post is recorded — no result is faked.</div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isCheckpointModalOpen = false}>Cancel</button>
          <button type="button" class="btn btn-primary" onclick={logCheckpointWithGps}>Log via GPS</button>
        </div>
      {:else}
        <form onsubmit={submitManualOverride}>
          <div class="modal-body">
            <div class="form-hint" style="color: var(--warning); margin-bottom: 12px;">{checkpointStatusMessage} You can log this checkpoint via manual supervisor-verified override instead.</div>
            <div class="form-group">
              <label class="form-label" for="overrideReason">Override Reason <span class="req">*</span></label>
              <textarea class="form-control" id="overrideReason" bind:value={overrideReason} rows="3" required></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick={() => isCheckpointModalOpen = false}>Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Manual Override</button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}

<style>
  .profile-avatar-sm {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, #2563eb, #06b6d4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: 800;
    color: white;
    flex-shrink: 0;
  }

  .profile-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 20px;
    align-items: start;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .profile-field-label {
    font-size: 0.7rem;
    color: var(--text-dim);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin-bottom: 3px;
  }

  .profile-field-val {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-main);
  }
</style>
