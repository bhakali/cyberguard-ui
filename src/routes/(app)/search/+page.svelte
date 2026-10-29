<script>
  import { page } from '$app/state';
  import Topbar from '$lib/components/Topbar.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';

  let query = $state(page.url.searchParams.get('q') || '');
  let currentPage = $state(1);
  const pageSize = 10;

  $effect(() => {
    const q = page.url.searchParams.get('q');
    if (q !== null) query = q;
  });

  function matchesEmployee(emp, q) {
    const text = `${emp.firstName} ${emp.lastName} ${emp.id} ${emp.nationalId} ${emp.jobTitle} ${emp.department} ${emp.siteAssigned} ${emp.zraTpin}`.toLowerCase();
    return text.includes(q);
  }

  let results = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return cyberguard.employees.filter(emp => matchesEmployee(emp, q));
  });

  $effect(() => {
    query;
    currentPage = 1;
  });

  let pagedResults = $derived(results.slice((currentPage - 1) * pageSize, currentPage * pageSize));
</script>

<svelte:head>
  <title>CyberGuard Security | Directory Search</title>
</svelte:head>

<Topbar title="Directory Search Results" />

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Search Results</h2>
      <p>Matches across name, employee ID, NRC, job title, department, site, and ZRA TPIN</p>
    </div>
    <div class="header-actions">
      <div class="search-bar" style="width: 320px;">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="text" placeholder="Refine search..." bind:value={query} autocomplete="off" />
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">{query.trim() ? `Results for "${query.trim()}"` : 'Enter a search term above'}</div>
        <div class="card-subtitle">{results.length} employee{results.length === 1 ? '' : 's'} matched</div>
      </div>
    </div>
    <div class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Job Title / Grade</th>
            <th>Department</th>
            <th>Site / Region</th>
            <th>Contact</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          {#if !query.trim()}
            <tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">Type a name, employee ID, NRC, job title, site, or TPIN to search.</td></tr>
          {:else if results.length === 0}
            <tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">No employees match "{query.trim()}".</td></tr>
          {:else}
            {#each pagedResults as emp (emp.id)}
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-cell-avatar">{emp.firstName[0]}{emp.lastName[0]}</div>
                    <div>
                      <div class="user-cell-name">{emp.firstName} {emp.lastName}</div>
                      <div class="user-cell-sub">ID: {emp.id} • NRC: {emp.nationalId}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style="font-weight: 600; color: var(--text-main);">{emp.jobTitle}</div>
                  <div style="font-size: 0.72rem; color: var(--accent-cyan);">{emp.gradeLevel}</div>
                </td>
                <td>{emp.department}</td>
                <td>
                  <div>{emp.siteAssigned}</div>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">{emp.region}</div>
                </td>
                <td style="font-size: 0.8rem;">{emp.phone}</td>
                <td style="text-align: right;">
                  <a href="/employee-profile?id={emp.id}" class="btn btn-secondary btn-sm">Dossier</a>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
    <Pagination bind:currentPage totalItems={results.length} {pageSize} />
  </div>

</main>
