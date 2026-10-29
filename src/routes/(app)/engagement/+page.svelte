<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import {
    announcementsStore,
    recognitionStore,
    surveysStore,
    surveyResponsesStore,
    hasResponded,
    submitSurveyResponse,
    surveyAverageAndDistribution
  } from '$lib/stores/engagement.svelte.js';
  import { can } from '$lib/rbac.js';
  import Pagination from '$lib/components/Pagination.svelte';

  let activeTab = $state('tab-announcements');

  let announcementsPage = $state(1);
  let recognitionPage = $state(1);
  let commentsPage = $state(1);
  const pageSize = 10;

  let isAnnouncementModalOpen = $state(false);
  let isRecognitionModalOpen = $state(false);
  let isSurveyModalOpen = $state(false);

  // Post Announcement form
  let annTitle = $state('');
  let annBody = $state('');
  let annCategory = $state('Operations');
  let annPinned = $state(false);

  // Give Recognition form
  let recToEmpId = $state('');
  let recBadgeType = $state('Team Player');
  let recMessage = $state('');

  // Pulse Survey response form
  let surveyRating = $state(5);
  let surveyComment = $state('');

  let sortedAnnouncements = $derived(
    [...announcementsStore.items].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.postedAt) - new Date(a.postedAt);
    })
  );

  let sortedRecognition = $derived(
    [...recognitionStore.items].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
  );

  let currentSurvey = $derived(surveysStore.items.find((s) => s.status === 'open') || null);
  let surveyStats = $derived(currentSurvey ? surveyAverageAndDistribution(currentSurvey.id) : null);
  let alreadyResponded = $derived(
    currentSurvey && cyberguard.loggedInEmployeeId
      ? hasResponded(currentSurvey.id, cyberguard.loggedInEmployeeId)
      : false
  );
  let surveyComments = $derived(
    currentSurvey
      ? surveyResponsesStore.items.filter((r) => r.surveyId === currentSurvey.id && r.comment)
      : []
  );

  let pagedAnnouncements = $derived(
    sortedAnnouncements.slice((announcementsPage - 1) * pageSize, announcementsPage * pageSize)
  );
  let pagedRecognition = $derived(
    sortedRecognition.slice((recognitionPage - 1) * pageSize, recognitionPage * pageSize)
  );
  let pagedComments = $derived(
    surveyComments.slice((commentsPage - 1) * pageSize, commentsPage * pageSize)
  );

  function openAnnouncementModal() {
    annTitle = '';
    annBody = '';
    annCategory = 'Operations';
    annPinned = false;
    isAnnouncementModalOpen = true;
  }

  function handlePostAnnouncement(e) {
    e.preventDefault();
    announcementsStore.add({
      id: Date.now(),
      title: annTitle,
      body: annBody,
      category: annCategory,
      postedBy: cyberguard.currentUser.name,
      postedAt: new Date().toISOString().split('T')[0],
      pinned: annPinned
    });
    isAnnouncementModalOpen = false;
    cyberguard.showToast('Announcement posted.', 'success');
  }

  function openRecognitionModal() {
    recToEmpId = '';
    recBadgeType = 'Team Player';
    recMessage = '';
    isRecognitionModalOpen = true;
  }

  function handleGiveRecognition(e) {
    e.preventDefault();
    const toEmp = cyberguard.employees.find((x) => x.id === recToEmpId);
    if (!toEmp) {
      cyberguard.showToast('Select who you want to recognize.', 'danger');
      return;
    }
    const fromEmp = cyberguard.employees.find((x) => x.id === cyberguard.loggedInEmployeeId);
    recognitionStore.add({
      id: Date.now(),
      fromEmpId: fromEmp ? fromEmp.id : null,
      fromName: fromEmp ? `${fromEmp.firstName} ${fromEmp.lastName}` : cyberguard.currentUser.name,
      toEmpId: toEmp.id,
      toName: `${toEmp.firstName} ${toEmp.lastName}`,
      message: recMessage,
      badgeType: recBadgeType,
      postedAt: new Date().toISOString().split('T')[0]
    });
    isRecognitionModalOpen = false;
    cyberguard.showToast(`Recognition posted for ${toEmp.firstName} ${toEmp.lastName}.`, 'success');
  }

  function openSurveyModal() {
    surveyRating = 5;
    surveyComment = '';
    isSurveyModalOpen = true;
  }

  function handleSubmitSurveyResponse(e) {
    e.preventDefault();
    const emp = cyberguard.employees.find((x) => x.id === cyberguard.loggedInEmployeeId);
    if (!emp) {
      cyberguard.showToast('Log in as an employee (My Profile persona) to respond.', 'danger');
      return;
    }
    const result = submitSurveyResponse(currentSurvey.id, emp, Number(surveyRating), surveyComment);
    if (!result) {
      cyberguard.showToast('You have already responded to this survey.', 'warning');
      isSurveyModalOpen = false;
      return;
    }
    isSurveyModalOpen = false;
    cyberguard.showToast('Thanks — your response has been recorded.', 'success');
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Engagement &amp; Culture</title>
</svelte:head>

<Topbar title="Engagement &amp; Culture">
  {#snippet actions()}
    {#if activeTab === 'tab-announcements' && can(cyberguard.activeRoleId, 'canApprove')}
      <button class="btn btn-primary btn-sm" onclick={openAnnouncementModal}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Post Announcement
      </button>
    {:else if activeTab === 'tab-recognition'}
      <button class="btn btn-primary btn-sm" onclick={openRecognitionModal}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Give Recognition
      </button>
    {/if}
  {/snippet}
</Topbar>

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Company Announcements, Recognition &amp; Pulse Surveys</h2>
      <p>Company-wide updates and the employee recognition wall — visible to every role</p>
    </div>
    <div class="header-actions">
      <div class="tabs-header" style="background: none; border-bottom: none; padding: 0;">
        <button class="tab-btn" class:active={activeTab === 'tab-announcements'} onclick={() => activeTab = 'tab-announcements'}>Announcements</button>
        <button class="tab-btn" class:active={activeTab === 'tab-recognition'} onclick={() => activeTab = 'tab-recognition'}>Recognition Wall</button>
        <button class="tab-btn" class:active={activeTab === 'tab-survey'} onclick={() => activeTab = 'tab-survey'}>Pulse Survey</button>
      </div>
    </div>
  </div>

  <div class="tabs-container">

    {#if activeTab === 'tab-announcements'}
      <div style="display: flex; flex-direction: column; gap: 14px;">
        {#each pagedAnnouncements as a (a.id)}
          <div class="card">
            <div class="card-body" style="display: flex; justify-content: space-between; gap: 16px; align-items: flex-start;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  {#if a.pinned}
                    <span class="badge badge-warning" style="font-size: 0.65rem;">Pinned</span>
                  {/if}
                  <span class="badge badge-secondary" style="font-size: 0.65rem;">{a.category}</span>
                </div>
                <div style="font-weight: 700; font-size: 1rem; color: var(--text-main); margin-bottom: 4px;">{a.title}</div>
                <div style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.5;">{a.body}</div>
                <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 8px;">Posted by {a.postedBy} • {a.postedAt}</div>
              </div>
            </div>
          </div>
        {/each}
      </div>
      <div class="card" style="margin-top: 14px;">
        <Pagination bind:currentPage={announcementsPage} totalItems={sortedAnnouncements.length} {pageSize} />
      </div>
    {/if}

    {#if activeTab === 'tab-recognition'}
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
        {#each pagedRecognition as r (r.id)}
          <div class="card">
            <div class="card-body">
              <span class="badge badge-success" style="font-size: 0.68rem;">{r.badgeType}</span>
              <div style="font-size: 0.88rem; color: var(--text-main); margin: 10px 0; line-height: 1.5;">"{r.message}"</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);"><strong>{r.toName}</strong> — recognized by {r.fromName}</div>
              <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 4px;">{r.postedAt}</div>
            </div>
          </div>
        {/each}
      </div>
      <div class="card" style="margin-top: 14px;">
        <Pagination bind:currentPage={recognitionPage} totalItems={sortedRecognition.length} {pageSize} />
      </div>
    {/if}

    {#if activeTab === 'tab-survey'}
      {#if !currentSurvey}
        <div class="card"><div class="card-body" style="text-align: center; padding: 32px; color: var(--text-muted);">No open pulse survey at the moment.</div></div>
      {:else}
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">{currentSurvey.question}</div>
              <div class="card-subtitle">{surveyStats.totalResponses} responses so far • Average rating {surveyStats.average} / {currentSurvey.scaleMax}</div>
            </div>
            {#if alreadyResponded}
              <span class="badge badge-success">You Responded</span>
            {:else}
              <button class="btn btn-primary btn-sm" onclick={openSurveyModal}>Respond</button>
            {/if}
          </div>
          <div class="card-body">
            <div style="display: flex; flex-direction: column; gap: 8px;">
              {#each [5, 4, 3, 2, 1] as rating}
                {@const count = surveyStats.distribution[rating] || 0}
                {@const pct = surveyStats.totalResponses ? Math.round((count / surveyStats.totalResponses) * 100) : 0}
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 60px; font-size: 0.8rem; color: var(--text-muted);">{rating} Star{rating === 1 ? '' : 's'}</div>
                  <div style="flex: 1; background: var(--bg-card); border-radius: 6px; height: 14px; overflow: hidden;">
                    <div style="width: {pct}%; background: var(--accent-cyan); height: 100%;"></div>
                  </div>
                  <div style="width: 36px; font-size: 0.78rem; color: var(--text-dim); text-align: right;">{count}</div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        {#if surveyComments.length > 0}
          <div class="card" style="margin-top: 16px;">
            <div class="card-header"><div class="card-title">Recent Comments</div></div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 10px;">
              {#each pagedComments as c (c.id)}
                <div style="background: var(--bg-card); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                  <div style="font-size: 0.84rem; color: var(--text-main);">"{c.comment}"</div>
                  <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 4px;">{c.empName} • {c.rating}/{currentSurvey.scaleMax} • {c.submittedAt}</div>
                </div>
              {/each}
            </div>
            <Pagination bind:currentPage={commentsPage} totalItems={surveyComments.length} {pageSize} />
          </div>
        {/if}

      {/if}
    {/if}

  </div>

</main>

<!-- MODAL: POST ANNOUNCEMENT -->
{#if isAnnouncementModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div class="modal-title">Post Company Announcement</div>
        <button class="modal-close" onclick={() => isAnnouncementModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handlePostAnnouncement}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="annTitle">Title <span class="req">*</span></label>
            <input type="text" class="form-control" id="annTitle" bind:value={annTitle} required>
          </div>
          <div class="form-group">
            <label class="form-label" for="annBody">Body <span class="req">*</span></label>
            <textarea class="form-control" id="annBody" bind:value={annBody} rows="4" required></textarea>
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="annCategory">Category</label>
              <select class="form-control" id="annCategory" bind:value={annCategory}>
                <option value="Operations">Operations</option>
                <option value="Safety">Safety</option>
                <option value="Training">Training</option>
                <option value="Culture">Culture</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div class="form-group" style="display: flex; align-items: flex-end; gap: 8px; padding-bottom: 10px;">
              <input type="checkbox" id="annPinned" bind:checked={annPinned} style="width: 16px; height: 16px; accent-color: var(--primary);">
              <label for="annPinned" style="margin: 0; font-size: 0.85rem; color: var(--text-main); cursor: pointer;">Pin to top</label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isAnnouncementModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Post Announcement</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: GIVE RECOGNITION -->
{#if isRecognitionModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 550px;">
      <div class="modal-header">
        <div class="modal-title">Give Recognition</div>
        <button class="modal-close" onclick={() => isRecognitionModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleGiveRecognition}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="recTo">Recognize <span class="req">*</span></label>
            <select class="form-control" id="recTo" bind:value={recToEmpId} required>
              <option value="">Select Employee</option>
              {#each cyberguard.employees as e}
                <option value={e.id}>{e.firstName} {e.lastName} ({e.jobTitle} - {e.id})</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="recBadge">Recognition Type <span class="req">*</span></label>
            <select class="form-control" id="recBadge" bind:value={recBadgeType} required>
              <option value="Team Player">Team Player</option>
              <option value="Vigilance Award">Vigilance Award</option>
              <option value="Leadership">Leadership</option>
              <option value="Customer Service Excellence">Customer Service Excellence</option>
              <option value="Going Above & Beyond">Going Above &amp; Beyond</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="recMessage">Message <span class="req">*</span></label>
            <textarea class="form-control" id="recMessage" bind:value={recMessage} rows="3" placeholder="What did they do?" required></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isRecognitionModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Post Recognition</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: SURVEY RESPONSE -->
{#if isSurveyModalOpen && currentSurvey}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 500px;">
      <div class="modal-header">
        <div class="modal-title">Respond to Pulse Survey</div>
        <button class="modal-close" onclick={() => isSurveyModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleSubmitSurveyResponse}>
        <div class="modal-body">
          <div style="font-size: 0.88rem; color: var(--text-main); margin-bottom: 14px;">{currentSurvey.question}</div>
          <div class="form-group">
            <label class="form-label" for="surveyRating">Rating (1–{currentSurvey.scaleMax}) <span class="req">*</span></label>
            <select class="form-control" id="surveyRating" bind:value={surveyRating} required>
              {#each Array(currentSurvey.scaleMax) as _, i}
                <option value={i + 1}>{i + 1}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="surveyComment">Comment (optional)</label>
            <textarea class="form-control" id="surveyComment" bind:value={surveyComment} rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isSurveyModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Submit Response</button>
        </div>
      </form>
    </div>
  </div>
{/if}
