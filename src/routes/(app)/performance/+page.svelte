<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { performanceStore } from '$lib/stores/performance.svelte.js';
  import { reviewCyclesStore } from '$lib/stores/reviewCycles.svelte.js';
  import Pagination from '$lib/components/Pagination.svelte';

  let currentPage = $state(1);
  const pageSize = 10;
  let pagedAppraisals = $derived(
    performanceStore.items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );

  let isAppraisalModalOpen = $state(false);
  let isSelfReviewModalOpen = $state(false);
  let activeSelfReviewAppraisal = $state(null);
  let selfReviewComments = $state('');

  let appraiseEmployee = $state('');
  let vigilance = $state(4.5);
  let incidentResponse = $state(4.0);
  let discipline = $state(5.0);
  let equipmentCare = $state(4.8);
  let devPlan = $state('');

  let currentCycle = $derived(reviewCyclesStore.items.find(c => c.status === 'open') || reviewCyclesStore.items[0]);

  let averageScore = $derived(
    performanceStore.items.length
      ? (performanceStore.items.reduce((sum, a) => sum + a.overall, 0) / performanceStore.items.length).toFixed(2)
      : '0.00'
  );

  function statusForScore(score) {
    if (score >= 4.5) return { badge: 'badge-success', label: 'Recommended for Promotion' };
    if (score >= 3.5) return { badge: 'badge-primary', label: 'Meets Expectations' };
    return { badge: 'badge-warning', label: 'Performance Improvement Plan' };
  }

  function handleAppraisalSubmit(e) {
    e.preventDefault();
    if (!appraiseEmployee) {
      cyberguard.showToast('Select an employee to appraise.', 'danger');
      return;
    }
    const emp = cyberguard.employees.find(e => e.id === appraiseEmployee);
    const overall = Math.round(((Number(vigilance) + Number(incidentResponse) + Number(discipline) + Number(equipmentCare)) / 4) * 100) / 100;
    const status = statusForScore(overall);
    performanceStore.add({
      id: Date.now(),
      empId: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      role: 'Field Personnel',
      manager: cyberguard.currentUser.name,
      cycleId: currentCycle?.id ?? null,
      vigilance: Number(vigilance),
      incidentResponse: Number(incidentResponse),
      discipline: Number(discipline),
      equipmentCare: Number(equipmentCare),
      overall,
      statusBadge: status.badge,
      statusLabel: status.label,
      growthPlan: devPlan || 'Standard development track',
      actionLabel: 'View Rubric',
      selfReview: null,
      acknowledgment: null
    });
    isAppraisalModalOpen = false;
    cyberguard.showToast('Appraisal form successfully logged to Employee Master Dossier!', 'success');
  }

  function openSelfReviewModal(appraisal) {
    activeSelfReviewAppraisal = appraisal;
    selfReviewComments = '';
    isSelfReviewModalOpen = true;
  }

  function submitSelfReview(e) {
    e.preventDefault();
    performanceStore.update(activeSelfReviewAppraisal.id, {
      selfReview: {
        submitted: true,
        comments: selfReviewComments,
        submittedAt: new Date().toISOString().split('T')[0]
      }
    });
    isSelfReviewModalOpen = false;
    cyberguard.showToast('Self-review submitted.', 'success');
  }

  function acknowledgeReview(appraisal) {
    performanceStore.update(appraisal.id, {
      acknowledgment: {
        acknowledged: true,
        acknowledgedAt: new Date().toISOString().split('T')[0]
      }
    });
    cyberguard.showToast(`${appraisal.name} acknowledged this review.`, 'success');
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Performance & Appraisal</title>
</svelte:head>

<style>
  .rating-stars { display: inline-flex; gap: 4px; color: #f59e0b; }
</style>

<Topbar title="KPI Tracking, Field Appraisals & Development Plans">
  {#snippet actions()}
    <button class="btn btn-primary btn-sm" onclick={() => isAppraisalModalOpen = true}>
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
      Conduct Performance Appraisal
    </button>
  {/snippet}
</Topbar>

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Workforce Performance Management & Appraisal Cycles</h2>
      <p>Objective KPI tracking: site vigilance, incident response, customer conduct, 1-5 rating rubrics and promotion plans</p>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Current Review Cycle</span>
        <div class="stat-icon cyan"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
      </div>
      <div class="stat-val">{currentCycle?.name || 'No Open Cycle'}</div>
      <div class="stat-footer"><span>{performanceStore.items.length} Reviews Logged</span></div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Average Performance Score</span>
        <div class="stat-icon emerald"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg></div>
      </div>
      <div class="stat-val">{averageScore} / 5.0</div>
      <div class="stat-footer"><span>Exceeding Benchmark</span></div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Promotion Recommendations</span>
        <div class="stat-icon amber"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></div>
      </div>
      <div class="stat-val">{performanceStore.items.filter(a => a.statusLabel.includes('Promotion')).length} Guards</div>
      <div class="stat-footer"><span>Elevate to Site Supervisor Grade B1</span></div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">Completed & Pending Performance Reviews</div>
        <div class="card-subtitle">Appraisal Rubric: 1 = Unsatisfactory, 3 = Meets Expectations, 5 = Outstanding</div>
      </div>
    </div>
    <div class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Employee & Role</th>
            <th>Appraising Manager</th>
            <th>Site Vigilance</th>
            <th>Incident Response</th>
            <th>Discipline & Parade</th>
            <th>Overall Score</th>
            <th>Status & Growth Plan</th>
            <th>Employee Sign-off</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          {#each pagedAppraisals as a (a.id)}
            <tr>
              <td>
                <div style="font-weight: 700; color: #fff;">{a.name}</div>
                <div style="font-size: 0.72rem; color: var(--text-dim);">{a.role}</div>
              </td>
              <td>{a.manager}</td>
              <td>{a.vigilance} / 5</td>
              <td>{a.incidentResponse} / 5</td>
              <td>{a.discipline} / 5</td>
              <td>
                <span style="font-weight: 800; color: {a.overall >= 4 ? '#34d399' : '#60a5fa'}; font-size: 1rem;">{a.overall}</span>
                <div class="rating-stars">{'★'.repeat(Math.round(a.overall))}{'☆'.repeat(5 - Math.round(a.overall))}</div>
              </td>
              <td>
                <span class="badge {a.statusBadge}">{a.statusLabel}</span>
                <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 2px;">{a.growthPlan}</div>
              </td>
              <td>
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                  {#if a.selfReview?.submitted}
                    <span class="badge badge-success" style="font-size: 0.68rem;">Self-Reviewed {a.selfReview.submittedAt}</span>
                  {:else}
                    <button class="btn btn-secondary btn-sm" style="font-size: 0.7rem; padding: 4px 8px;" onclick={() => openSelfReviewModal(a)} disabled={cyberguard.loggedInEmployeeId !== a.empId} title={cyberguard.loggedInEmployeeId === a.empId ? '' : 'Only the reviewed employee can submit their self-review'}>Submit Self-Review</button>
                  {/if}
                  {#if a.acknowledgment?.acknowledged}
                    <span class="badge badge-success" style="font-size: 0.68rem;">Acknowledged {a.acknowledgment.acknowledgedAt}</span>
                  {:else}
                    <button class="btn btn-secondary btn-sm" style="font-size: 0.7rem; padding: 4px 8px;" onclick={() => acknowledgeReview(a)} disabled={cyberguard.loggedInEmployeeId !== a.empId} title={cyberguard.loggedInEmployeeId === a.empId ? '' : 'Only the reviewed employee can acknowledge their review'}>Acknowledge Review</button>
                  {/if}
                </div>
              </td>
              <td style="text-align: right;">
                <button class="btn btn-secondary btn-sm" onclick={() => cyberguard.showToast(`Opened appraisal rubric for ${a.name}`, 'info')}>{a.actionLabel}</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <Pagination bind:currentPage totalItems={performanceStore.items.length} {pageSize} />
  </div>

</main>

{#if isAppraisalModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 650px;">
      <div class="modal-header">
        <div class="modal-title">Conduct Formal Performance Appraisal</div>
        <button class="modal-close" onclick={() => isAppraisalModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleAppraisalSubmit}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="appraiseEmp">Employee Subject <span class="req">*</span></label>
            <select class="form-control" id="appraiseEmp" bind:value={appraiseEmployee} required>
              <option value="">Select Employee</option>
              {#each cyberguard.employees as e}
                <option value={e.id}>{e.firstName} {e.lastName} ({e.jobTitle} - {e.id})</option>
              {/each}
            </select>
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="vigilance">Site Vigilance Score (1 - 5) <span class="req">*</span></label>
              <input type="number" min="1" max="5" step="0.1" class="form-control" id="vigilance" bind:value={vigilance} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="incident">Incident Response Speed (1 - 5) <span class="req">*</span></label>
              <input type="number" min="1" max="5" step="0.1" class="form-control" id="incident" bind:value={incidentResponse} required>
            </div>
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="discipline">Discipline & Punctuality (1 - 5) <span class="req">*</span></label>
              <input type="number" min="1" max="5" step="0.1" class="form-control" id="discipline" bind:value={discipline} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="equipCare">Weapon / Equipment Care (1 - 5) <span class="req">*</span></label>
              <input type="number" min="1" max="5" step="0.1" class="form-control" id="equipCare" bind:value={equipmentCare} required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="devPlan">Development Plan & Training Needs</label>
            <textarea class="form-control" id="devPlan" bind:value={devPlan} placeholder="Outline specific coaching, firearms re-certification, or supervisor readiness"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isAppraisalModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Publish Appraisal Record</button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if isSelfReviewModalOpen && activeSelfReviewAppraisal}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 550px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Submit Self-Review</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            {activeSelfReviewAppraisal.name} • {activeSelfReviewAppraisal.role}
          </div>
        </div>
        <button class="modal-close" onclick={() => isSelfReviewModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={submitSelfReview}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="selfReviewComments">Your Comments on this Review <span class="req">*</span></label>
            <textarea class="form-control" id="selfReviewComments" bind:value={selfReviewComments} rows="5" placeholder="Share your own perspective on this appraisal period — achievements, challenges, and support needed." required></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isSelfReviewModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Submit Self-Review</button>
        </div>
      </form>
    </div>
  </div>
{/if}
