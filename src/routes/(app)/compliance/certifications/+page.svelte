<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';

  let certs = $derived(cyberguard.expiringCertifications);
  let expiredCount = $derived(certs.filter(c => c.daysRemaining < 0).length);
  let dueSoonCount = $derived(certs.filter(c => c.daysRemaining >= 0 && c.daysRemaining <= 30).length);
  let upcomingCount = $derived(certs.filter(c => c.daysRemaining > 30).length);

  let currentPage = $state(1);
  const pageSize = 10;
  let pagedCerts = $derived(certs.slice((currentPage - 1) * pageSize, currentPage * pageSize));

  function urgencyBadgeClass(daysRemaining) {
    if (daysRemaining < 0) return 'badge-danger';
    if (daysRemaining <= 30) return 'badge-warning';
    return 'badge-primary';
  }

  function urgencyLabel(daysRemaining) {
    if (daysRemaining < 0) return `Expired ${Math.abs(daysRemaining)}d ago`;
    if (daysRemaining === 0) return 'Expires today';
    return `${daysRemaining}d remaining`;
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Certification & License Expiry</title>
</svelte:head>

<Topbar title="Certification & License Expiry" />

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Certification & Statutory License Expiry Tracker</h2>
      <p>Every employee qualification and license expiring within 90 days, or already lapsed, drawn live from the employee master records</p>
    </div>
    <div class="header-actions">
      <a href="/compliance" class="btn btn-secondary btn-sm">
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Back to Compliance
      </a>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Already Expired</span>
        <div class="stat-icon rose"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></div>
      </div>
      <div class="stat-val">{expiredCount}</div>
    </div>
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Due Within 30 Days</span>
        <div class="stat-icon amber"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
      </div>
      <div class="stat-val">{dueSoonCount}</div>
    </div>
    <div class="stat-card">
      <div class="stat-top">
        <span class="stat-title">Due in 31-90 Days</span>
        <div class="stat-icon cyan"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
      </div>
      <div class="stat-val">{upcomingCount}</div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">Renewal Watchlist</div>
        <div class="card-subtitle">Sorted most urgent first — click a row to open the employee's qualification record</div>
      </div>
      <span class="badge badge-primary">{certs.length} Flagged</span>
    </div>
    <div class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Qualification / License</th>
            <th>Category</th>
            <th>Expiry Date</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          {#if certs.length === 0}
            <tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">No qualifications are expiring within the next 90 days.</td></tr>
          {:else}
            {#each pagedCerts as c (c.qualId)}
              <tr>
                <td>
                  <strong>{c.empName}</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">{c.jobTitle} • {c.empId}</div>
                </td>
                <td>{c.qualificationName}</td>
                <td><span class="badge badge-secondary">{c.category}</span></td>
                <td>{c.expiryDate}</td>
                <td><span class="badge {urgencyBadgeClass(c.daysRemaining)}">{urgencyLabel(c.daysRemaining)}</span></td>
                <td style="text-align: right;">
                  <a href="/employee-profile?id={c.empId}&tab=qualifications" class="btn btn-secondary btn-sm">View Record</a>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
    <Pagination bind:currentPage totalItems={certs.length} {pageSize} />
  </div>

</main>
