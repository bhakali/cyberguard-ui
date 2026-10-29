<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { coursesStore, trainingRecordsStore, trainingDueSoon } from '$lib/stores/training.svelte.js';
  import { can } from '$lib/rbac.js';
  import Pagination from '$lib/components/Pagination.svelte';

  let activeTab = $state('tab-catalog');

  let catalogPage = $state(1);
  let recordsPage = $state(1);
  const pageSize = 10;
  let pagedCourses = $derived(
    coursesStore.items.slice((catalogPage - 1) * pageSize, catalogPage * pageSize)
  );
  let pagedRecords = $derived(
    trainingRecordsStore.items.slice((recordsPage - 1) * pageSize, recordsPage * pageSize)
  );

  let isCourseModalOpen = $state(false);
  let isEnrollModalOpen = $state(false);

  // Add Course form
  let courseTitle = $state('');
  let courseCategory = $state('Tactical & Security Certification');
  let courseProvider = $state('');
  let courseDurationHours = $state(8);
  let courseIsMandatory = $state(false);
  let courseRecurrenceMonths = $state('');

  // Enroll Employee form
  let enrollEmpId = $state('');
  let enrollCourseId = $state('');
  let enrollDueDate = $state('');

  let dueSoon = $derived(trainingDueSoon());
  let completedCount = $derived(trainingRecordsStore.items.filter((r) => r.status === 'completed').length);
  let overdueCount = $derived(trainingRecordsStore.items.filter((r) => r.status === 'overdue').length);

  function statusBadgeClass(status) {
    if (status === 'completed') return 'badge-success';
    if (status === 'overdue') return 'badge-danger';
    if (status === 'in_progress') return 'badge-primary';
    return 'badge-warning';
  }

  function statusLabel(status) {
    if (status === 'in_progress') return 'In Progress';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function openCourseModal() {
    courseTitle = '';
    courseCategory = 'Tactical & Security Certification';
    courseProvider = '';
    courseDurationHours = 8;
    courseIsMandatory = false;
    courseRecurrenceMonths = '';
    isCourseModalOpen = true;
  }

  function handleAddCourse(e) {
    e.preventDefault();
    coursesStore.add({
      id: Date.now(),
      title: courseTitle,
      category: courseCategory,
      provider: courseProvider,
      durationHours: Number(courseDurationHours),
      isMandatory: courseIsMandatory,
      recurrenceMonths: courseRecurrenceMonths ? Number(courseRecurrenceMonths) : null
    });
    isCourseModalOpen = false;
    cyberguard.showToast(`"${courseTitle}" added to the course catalog.`, 'success');
  }

  function openEnrollModal() {
    enrollEmpId = '';
    enrollCourseId = '';
    enrollDueDate = '';
    isEnrollModalOpen = true;
  }

  function handleEnroll(e) {
    e.preventDefault();
    const emp = cyberguard.employees.find((x) => x.id === enrollEmpId);
    const course = coursesStore.items.find((c) => c.id === Number(enrollCourseId));
    if (!emp || !course) {
      cyberguard.showToast('Select both an employee and a course.', 'danger');
      return;
    }
    trainingRecordsStore.add({
      id: Date.now(),
      empId: emp.id,
      empName: `${emp.firstName} ${emp.lastName}`,
      courseId: course.id,
      courseTitle: course.title,
      status: 'enrolled',
      enrolledAt: new Date().toISOString().split('T')[0],
      dueDate: enrollDueDate || null,
      completedAt: null,
      score: null
    });
    isEnrollModalOpen = false;
    cyberguard.showToast(`${emp.firstName} ${emp.lastName} enrolled in "${course.title}".`, 'success');
  }

  function canMarkComplete(rec) {
    return can(cyberguard.activeRoleId, 'canApprove') || cyberguard.loggedInEmployeeId === rec.empId;
  }

  function markComplete(rec) {
    trainingRecordsStore.update(rec.id, {
      status: 'completed',
      completedAt: new Date().toISOString().split('T')[0]
    });
    cyberguard.showToast(`${rec.courseTitle} marked complete for ${rec.empName}.`, 'success');
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Learning &amp; Development</title>
</svelte:head>

<Topbar title="Learning &amp; Development">
  {#snippet actions()}
    {#if activeTab === 'tab-catalog'}
      <button class="btn btn-primary btn-sm" onclick={openCourseModal}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Course
      </button>
    {:else}
      <button class="btn btn-primary btn-sm" onclick={openEnrollModal}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Enroll Employee
      </button>
    {/if}
  {/snippet}
</Topbar>

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Training Catalog &amp; Compliance Tracking</h2>
      <p>Mandatory and elective course enrollment with completion tracking across the workforce</p>
    </div>
    <div class="header-actions">
      <div class="tabs-header" style="background: none; border-bottom: none; padding: 0;">
        <button class="tab-btn" class:active={activeTab === 'tab-catalog'} onclick={() => activeTab = 'tab-catalog'}>Course Catalog</button>
        <button class="tab-btn" class:active={activeTab === 'tab-records'} onclick={() => activeTab = 'tab-records'}>Training Records</button>
      </div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Total Enrollments</span>
        <div class="stat-icon cyan"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s4.332.477 5.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg></div>
      </div>
      <div class="stat-val">{trainingRecordsStore.items.length}</div>
      <div class="stat-footer"><span>Across {coursesStore.items.length} catalog courses</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Completed</span>
        <div class="stat-icon emerald"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
      </div>
      <div class="stat-val">{completedCount}</div>
      <div class="stat-footer"><span>Of {trainingRecordsStore.items.length} total enrollments</span></div>
    </div>
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Overdue / Due Soon</span>
        <div class="stat-icon amber"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
      </div>
      <div class="stat-val">{dueSoon.length}</div>
      <div class="stat-footer"><span>{overdueCount} already overdue</span></div>
    </div>
  </div>

  <div class="tabs-container">

    {#if activeTab === 'tab-catalog'}
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Course Catalog</div>
            <div class="card-subtitle">Mandatory courses recur automatically on their renewal cycle</div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Provider</th>
                <th>Duration</th>
                <th>Mandatory</th>
              </tr>
            </thead>
            <tbody>
              {#each pagedCourses as c (c.id)}
                <tr>
                  <td><strong>{c.title}</strong></td>
                  <td><span class="badge badge-secondary">{c.category}</span></td>
                  <td style="font-size: 0.82rem;">{c.provider}</td>
                  <td style="font-size: 0.82rem;">{c.durationHours} hrs</td>
                  <td>
                    {#if c.isMandatory}
                      <span class="badge badge-warning">Mandatory • Every {c.recurrenceMonths}mo</span>
                    {:else}
                      <span class="badge badge-neutral">Elective</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <Pagination bind:currentPage={catalogPage} totalItems={coursesStore.items.length} {pageSize} />
      </div>
    {/if}

    {#if activeTab === 'tab-records'}
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Training Records</div>
            <div class="card-subtitle">Per-employee enrollment and completion status</div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Course</th>
                <th>Status</th>
                <th>Enrolled</th>
                <th>Due</th>
                <th>Score</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              {#if trainingRecordsStore.items.length === 0}
                <tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">No training records on file.</td></tr>
              {:else}
                {#each pagedRecords as r (r.id)}
                  <tr>
                    <td>
                      <strong>{r.empName}</strong>
                      <div style="font-size: 0.72rem; color: var(--text-dim);">{r.empId}</div>
                    </td>
                    <td style="font-size: 0.84rem;">{r.courseTitle}</td>
                    <td><span class="badge {statusBadgeClass(r.status)}">{statusLabel(r.status)}</span></td>
                    <td style="font-size: 0.8rem;">{r.enrolledAt}</td>
                    <td style="font-size: 0.8rem;">{r.dueDate || '—'}</td>
                    <td style="font-size: 0.8rem;">{r.score ?? '—'}</td>
                    <td style="text-align: right;">
                      {#if r.status !== 'completed'}
                        <button class="btn btn-primary btn-sm" onclick={() => markComplete(r)} disabled={!canMarkComplete(r)} title={canMarkComplete(r) ? '' : 'Only this employee or a manager can mark it complete'}>Mark Complete</button>
                      {:else}
                        <span class="badge badge-success" style="font-size: 0.7rem;">Done {r.completedAt}</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
        <Pagination bind:currentPage={recordsPage} totalItems={trainingRecordsStore.items.length} {pageSize} />
      </div>
    {/if}

  </div>

</main>

<!-- MODAL: ADD COURSE -->
{#if isCourseModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div class="modal-title">Add Course to Catalog</div>
        <button class="modal-close" onclick={() => isCourseModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleAddCourse}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="courseTitle">Course Title <span class="req">*</span></label>
            <input type="text" class="form-control" id="courseTitle" bind:value={courseTitle} required>
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="courseCategory">Category <span class="req">*</span></label>
              <select class="form-control" id="courseCategory" bind:value={courseCategory} required>
                <option value="Tactical & Security Certification">Tactical &amp; Security Certification</option>
                <option value="Statutory & Firearms Competency">Statutory &amp; Firearms Competency</option>
                <option value="Health, Safety & Medical (HSE)">Health, Safety &amp; Medical (HSE)</option>
                <option value="Technical & Vocational (TEVETA)">Technical &amp; Vocational (TEVETA)</option>
                <option value="Professional Accreditation & License">Professional Accreditation &amp; License</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="courseProvider">Provider <span class="req">*</span></label>
              <input type="text" class="form-control" id="courseProvider" bind:value={courseProvider} required>
            </div>
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="courseDuration">Duration (hrs) <span class="req">*</span></label>
              <input type="number" class="form-control" id="courseDuration" bind:value={courseDurationHours} min="1" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="courseRecurrence">Recurrence (months, if mandatory)</label>
              <input type="number" class="form-control" id="courseRecurrence" bind:value={courseRecurrenceMonths} min="1" placeholder="e.g. 12">
            </div>
          </div>
          <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="courseIsMandatory" bind:checked={courseIsMandatory} style="width: 16px; height: 16px; accent-color: var(--primary);">
            <label for="courseIsMandatory" style="margin: 0; font-size: 0.85rem; color: var(--text-main); cursor: pointer;">Mandatory for all eligible staff</label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isCourseModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Add Course</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: ENROLL EMPLOYEE -->
{#if isEnrollModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 550px;">
      <div class="modal-header">
        <div class="modal-title">Enroll Employee in Course</div>
        <button class="modal-close" onclick={() => isEnrollModalOpen = false}>&times;</button>
      </div>
      <form onsubmit={handleEnroll}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="enrollEmp">Employee <span class="req">*</span></label>
            <select class="form-control" id="enrollEmp" bind:value={enrollEmpId} required>
              <option value="">Select Employee</option>
              {#each cyberguard.employees as e}
                <option value={e.id}>{e.firstName} {e.lastName} ({e.jobTitle} - {e.id})</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="enrollCourse">Course <span class="req">*</span></label>
            <select class="form-control" id="enrollCourse" bind:value={enrollCourseId} required>
              <option value="">Select Course</option>
              {#each coursesStore.items as c}
                <option value={c.id}>{c.title}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="enrollDue">Due Date</label>
            <input type="date" class="form-control" id="enrollDue" bind:value={enrollDueDate}>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isEnrollModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">Enroll</button>
        </div>
      </form>
    </div>
  </div>
{/if}
