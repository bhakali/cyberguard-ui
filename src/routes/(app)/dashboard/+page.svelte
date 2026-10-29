<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard, formatZMW } from '$lib/cyberguard.svelte.js';
  import { payrollRunsStore } from '$lib/stores/payrollRuns.svelte.js';
  import { rosterStore, SHIFT_PATTERNS } from '$lib/stores/roster.svelte.js';
  import { coursesStore, trainingRecordsStore } from '$lib/stores/training.svelte.js';
  import { incidentsStore } from '$lib/stores/incidents.svelte.js';
  import { announcementsStore, surveysStore, surveyAverageAndDistribution } from '$lib/stores/engagement.svelte.js';

  let activeGuardCount = $derived(cyberguard.employees.filter(e => e.jobTitle === 'Guards').length);

  let latestPayrollRun = $derived(payrollRunsStore.items[0] || null);

  let jobTitleTally = $derived(
    Object.entries(
      cyberguard.employees.reduce((acc, e) => {
        acc[e.jobTitle] = (acc[e.jobTitle] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])
  );

  let rosterPosts = $derived([...new Set(cyberguard.employees.map(e => e.siteAssigned).filter(Boolean))].sort());
  let todayStr = new Date().toISOString().split('T')[0];
  let todaysRoster = $derived(rosterStore.items.filter(a => a.date === todayStr));

  function assignmentFor(post, shiftPattern) {
    return todaysRoster.find(a => a.post === post && a.shiftPattern === shiftPattern);
  }

  function coverageStatus(post) {
    const day = assignmentFor(post, SHIFT_PATTERNS[0]);
    const night = assignmentFor(post, SHIFT_PATTERNS[1]);
    if (day && night) return { label: 'Fully Covered', badge: 'badge-success' };
    if (day || night) return { label: 'Partial Coverage', badge: 'badge-warning' };
    return { label: 'Unstaffed', badge: 'badge-danger' };
  }

  let mandatoryCourseIds = $derived(new Set(coursesStore.items.filter(c => c.isMandatory).map(c => c.id)));
  let mandatoryTrainingRecords = $derived(trainingRecordsStore.items.filter(r => mandatoryCourseIds.has(r.courseId)));
  let trainingCompliancePct = $derived(
    mandatoryTrainingRecords.length
      ? Math.round((mandatoryTrainingRecords.filter(r => r.status === 'completed').length / mandatoryTrainingRecords.length) * 100)
      : 100
  );

  let openShiftsCount = $derived(rosterStore.items.filter(a => a.status === 'open').length);

  let pendingIncidentCount = $derived(incidentsStore.items.filter(c => c.currentStep <= c.approvalChain.length).length);

  let currentSurvey = $derived(surveysStore.items.find(s => s.status === 'open') || null);
  let surveyStats = $derived(currentSurvey ? surveyAverageAndDistribution(currentSurvey.id) : null);
  let latestPinnedAnnouncement = $derived(
    [...announcementsStore.items].filter(a => a.pinned).sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))[0] || null
  );
</script>

<svelte:head>
  <title>CyberGuard Security | Operations & Executive Dashboard</title>
</svelte:head>

<Topbar full />

<main class="page-container">
  
  <div class="page-header">
    <div class="header-title-area">
      <h2>Workforce Operations & Executive Command</h2>
      <p>Unified overview of employee master records, guard deployments, payroll statutory obligations & operational workflows</p>
    </div>
    <div class="header-actions">
      <a href="/process-mapping" class="btn btn-secondary">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        Process Maps & SLAs
      </a>
      <a href="/employees" class="btn btn-primary">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
        Add Employee Master Record
      </a>
    </div>
  </div>

  <!-- KPI Metrics Grid -->
  <div class="stats-grid">
    
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Active Personnel</span>
        <div class="stat-icon"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg></div>
      </div>
      <div class="stat-val">{cyberguard.employees.length > 12 ? (1420 + cyberguard.employees.length - 12) : '1,420'}</div>
      <div class="stat-footer">
        <span class="stat-trend up">↑ 3.8%</span>
        <span>1,280 Guards • 140 Supervisory</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Active Guard Deployment</span>
        <div class="stat-icon emerald"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
      </div>
      <div class="stat-val">{activeGuardCount}</div>
      <div class="stat-footer">
        <span>Employees with job title "Guards"</span>
      </div>
    </div>

    {#if cyberguard.activeRoleId !== 'guard'}
      <div class="stat-card">
        <div class="stat-top">
          <span class="stat-title">Monthly Payroll Run</span>
          <div class="stat-icon cyan"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg></div>
        </div>
        {#if latestPayrollRun}
          <div class="stat-val">{formatZMW(latestPayrollRun.totalNet)}</div>
          <div class="stat-footer">
            <span class="badge {latestPayrollRun.status === 'Disbursed' ? 'badge-success' : 'badge-warning'}" style="font-size: 0.65rem;">{latestPayrollRun.status}</span>
            <span>{latestPayrollRun.period}</span>
          </div>
        {:else}
          <div class="stat-val">ZMW 4.85M</div>
          <div class="stat-footer">
            <span class="badge badge-neutral" style="font-size: 0.65rem;">No Run Locked Yet</span>
            <span>Lock a period on the Payroll page</span>
          </div>
        {/if}
      </div>
    {/if}

    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Probation & Rehire Reviews</span>
        <div class="stat-icon amber"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
      </div>
      <div class="stat-val">28 Pending</div>
      <div class="stat-footer">
        <span class="stat-trend down" style="color: var(--warning);">18 Guards completing 3-mo</span>
        <span>4 Area Managers</span>
      </div>
    </div>

    <a href="/compliance/certifications" class="stat-card" style="text-decoration: none; display: block; cursor: pointer;">
      <div class="stat-top">
        <span class="stat-title">Certs Expiring Soon</span>
        <div class="stat-icon rose"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></div>
      </div>
      <div class="stat-val">{cyberguard.expiringCertifications.length}</div>
      <div class="stat-footer">
        <span class="stat-trend down" style="color: var(--danger);">Within 90 days or lapsed</span>
        <span>View renewal watchlist →</span>
      </div>
    </a>

    <a href="/learning" class="stat-card" style="text-decoration: none; display: block; cursor: pointer;">
      <div class="stat-top">
        <span class="stat-title">Training Compliance</span>
        <div class="stat-icon cyan"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s4.332.477 5.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg></div>
      </div>
      <div class="stat-val">{trainingCompliancePct}%</div>
      <div class="stat-footer">
        <span>Mandatory courses completed</span>
      </div>
    </a>

    <a href="/attendance" class="stat-card" style="text-decoration: none; display: block; cursor: pointer;">
      <div class="stat-top">
        <span class="stat-title">Open Shifts Awaiting Pickup</span>
        <div class="stat-icon amber"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
      </div>
      <div class="stat-val">{openShiftsCount}</div>
      <div class="stat-footer">
        <span>Broadcast for self-service claim</span>
      </div>
    </a>

    {#if cyberguard.activeRoleId !== 'guard'}
      <a href="/compliance/incidents" class="stat-card" style="text-decoration: none; display: block; cursor: pointer;">
        <div class="stat-top">
          <span class="stat-title">Pending Incident Reports</span>
          <div class="stat-icon rose"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
        </div>
        <div class="stat-val">{pendingIncidentCount}</div>
        <div class="stat-footer">
          <span>Open for field safety review</span>
        </div>
      </a>
    {/if}

  </div>

  <!-- Main Dashboard 2-Column Section -->
  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
    
    <!-- Left Column: Operations Deployment & Hierarchy Quick Tracker -->
    <div>
      
      <!-- Site Deployment & Field Shift Overview -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg width="20" height="20" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Live Regional Shift Deployments & Site Posts
            </div>
            <div class="card-subtitle">Real-time guard attendance, supervisor coverage and roster status</div>
          </div>
          <a href="/attendance" class="btn btn-secondary btn-sm">Full Shift Roster →</a>
        </div>
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Site Post</th>
                <th>Day Shift (06:00 - 18:00)</th>
                <th>Night Shift (18:00 - 06:00)</th>
                <th>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {#each rosterPosts as post (post)}
                {@const dayAssignment = assignmentFor(post, SHIFT_PATTERNS[0])}
                {@const nightAssignment = assignmentFor(post, SHIFT_PATTERNS[1])}
                {@const coverage = coverageStatus(post)}
                <tr>
                  <td><strong>{post}</strong></td>
                  <td>{dayAssignment ? dayAssignment.empName : '— Unassigned'}</td>
                  <td>{nightAssignment ? nightAssignment.empName : '— Unassigned'}</td>
                  <td><span class="badge {coverage.badge}"><span class="badge-dot"></span> {coverage.label}</span></td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Business Process Mapping Highlights -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg width="20" height="20" fill="none" stroke="#06b6d4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              End-to-End HR Workflow Pipelines
            </div>
            <div class="card-subtitle">Active process tracking aligned with operational SLAs</div>
          </div>
          <a href="/process-mapping" class="btn btn-secondary btn-sm">Interactive Workflow Map →</a>
        </div>
        <div class="card-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            
            <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: 700; font-size: 0.88rem;">Recruitment & Vetting</span>
                <span class="badge badge-accent">14 In Pipeline</span>
              </div>
              <div style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 12px;">
                Posting → Screening → Background Check → Interviews → Offer
              </div>
              <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
                <div style="width: 75%; height: 100%; background: var(--accent-cyan);"></div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.72rem; color: var(--text-dim);">
                <span>Avg SLA: 12 Days</span>
                <span>Target: 14 Days</span>
              </div>
            </div>

            <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: 700; font-size: 0.88rem;">Monthly Payroll Cycle</span>
                <span class="badge badge-success">Approvals Stage</span>
              </div>
              <div style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 12px;">
                Timesheets → Approvals → ZRA/NAPSA Calc → Bank Payment
              </div>
              <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
                <div style="width: 85%; height: 100%; background: var(--success);"></div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.72rem; color: var(--text-dim);">
                <span>NAPSA & NHIMA Reconciled</span>
                <span>Disbursement: 25th</span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- Right Column: Statutory Deadlines, Hierarchy Card & Action Center -->
    <div>

      <!-- Engagement Pulse -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" fill="none" stroke="#a78bfa" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
            Engagement Pulse
          </div>
          <a href="/engagement" class="btn btn-secondary btn-sm">Open →</a>
        </div>
        <div class="card-body" style="display: flex; flex-direction: column; gap: 12px;">
          {#if latestPinnedAnnouncement}
            <div>
              <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px;">Pinned Announcement</div>
              <div style="font-size: 0.86rem; font-weight: 700; color: var(--text-main);">{latestPinnedAnnouncement.title}</div>
            </div>
          {/if}
          {#if currentSurvey && surveyStats}
            <div>
              <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 3px;">Pulse Survey</div>
              <div style="font-size: 0.82rem; color: var(--text-muted);">{currentSurvey.question}</div>
              <div style="font-size: 0.86rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">{surveyStats.average} / {currentSurvey.scaleMax} avg • {surveyStats.totalResponses} responses</div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Statutory Compliance Widget -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" fill="none" stroke="#f59e0b" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            Statutory Bodies Compliance
          </div>
        </div>
        <div class="card-body">
          <div style="display: flex; flex-direction: column; gap: 14px;">
            
            <div style="border-left: 3px solid #3b82f6; padding-left: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
                <span>ZRA PAYE Return (e-Tax)</span>
                <span style="color: #fbbf24;">Due 10th</span>
              </div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">Threshold brackets (0%, 20%, 30%, 37%) verified</div>
            </div>

            <div style="border-left: 3px solid #10b981; padding-left: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
                <span>NAPSA Contributions</span>
                <span style="color: #34d399;">Ready for Upload</span>
              </div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">5% Employer + 5% Employee (Capped at ZMW 1,426)</div>
            </div>

            <div style="border-left: 3px solid #06b6d4; padding-left: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700;">
                <span>NHIMA Health Insurance</span>
                <span style="color: #22d3ee;">Reconciled</span>
              </div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">1% Employee + 1% Employer on basic pay</div>
            </div>

          </div>
        </div>
      </div>

      <!-- Organizational Structure Snapshot -->
      {#if cyberguard.activeRoleId !== 'guard'}
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <svg width="18" height="18" fill="none" stroke="#6366f1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              Operational Hierarchy
            </div>
            <a href="/org-chart" class="btn btn-secondary btn-sm">Full Tree →</a>
          </div>
          <div class="card-body" style="padding: 16px 20px;">
            <div style="font-size: 0.78rem; display: flex; flex-direction: column; gap: 8px;">
              {#each jobTitleTally as [jobTitle, count], idx (jobTitle)}
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: {idx === jobTitleTally.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)'};">
                  <span style={idx === 0 ? 'color: #93c5fd; font-weight: 700;' : ''}>{jobTitle}</span>
                  <span class="badge {idx === jobTitleTally.length - 1 ? 'badge-primary' : 'badge-neutral'}">{count} {count === 1 ? 'Person' : 'People'}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- Quick Actions Hub -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Quick HR Actions</div>
        </div>
        <div class="card-body" style="display: flex; flex-direction: column; gap: 10px;">
          <a href="/employees" class="btn btn-secondary" style="justify-content: flex-start;">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            New Personnel Onboarding
          </a>
          <a href="/payroll" class="btn btn-secondary" style="justify-content: flex-start;">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Generate Monthly Payslip
          </a>
          <a href="/compliance" class="btn btn-secondary" style="justify-content: flex-start;">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
            Access Control & Audit Trail
          </a>
        </div>
      </div>

    </div>

  </div>

</main>
