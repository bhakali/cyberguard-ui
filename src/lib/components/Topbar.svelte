<script>
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { notifications } from '$lib/stores/notifications.svelte.js';
  import { goto } from '$app/navigation';

  let { title = '', actions = null, full = false } = $props();
  let searchQuery = $state('');
  let showResults = $state(false);
  let showNotifications = $state(false);

  function matchesEmployee(emp, q) {
    const text = `${emp.firstName} ${emp.lastName} ${emp.id} ${emp.nationalId} ${emp.jobTitle} ${emp.siteAssigned} ${emp.zraTpin}`.toLowerCase();
    return text.includes(q);
  }

  let searchResults = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return cyberguard.employees.filter(emp => matchesEmployee(emp, q)).slice(0, 6);
  });

  function goToEmployee(emp) {
    showResults = false;
    searchQuery = '';
    goto(`/employee-profile?id=${emp.id}`);
  }

  function goToAllResults() {
    const q = searchQuery.trim();
    showResults = false;
    goto(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleSearchKeydown(e) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      if (searchResults.length === 1) {
        goToEmployee(searchResults[0]);
      } else {
        goToAllResults();
      }
    } else if (e.key === 'Escape') {
      showResults = false;
    }
  }

  function handleSearchBlur() {
    setTimeout(() => { showResults = false; }, 150);
  }
</script>

<header class="topbar">
  <div class="topbar-left">
    <button class="mobile-menu-toggle icon-btn" onclick={() => cyberguard.toggleMobileNav()} aria-label="Toggle Navigation">
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    {#if title}
      <div style="font-size: 0.88rem; font-weight: 700; color: #fff;">{title}</div>
    {:else}
      <div class="search-bar">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input
          type="text"
          placeholder="Search employee, site post, NRC, or TPIN..."
          id="topSearch"
          autocomplete="off"
          bind:value={searchQuery}
          onkeydown={handleSearchKeydown}
          onfocus={() => showResults = true}
          onblur={handleSearchBlur}
        />
        {#if showResults && searchQuery.trim()}
          <div class="search-results-dropdown">
            {#if searchResults.length === 0}
              <div class="search-result-empty">No employees match "{searchQuery.trim()}"</div>
            {:else}
              {#each searchResults as emp (emp.id)}
                <button type="button" class="search-result-item" onclick={() => goToEmployee(emp)}>
                  <span>{emp.firstName} {emp.lastName}</span>
                  <span class="srm-sub">{emp.jobTitle} • {emp.id}</span>
                </button>
              {/each}
            {/if}
            <button type="button" class="search-result-footer" onclick={goToAllResults}>
              See all results for "{searchQuery.trim()}" →
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="topbar-right">
    {#if actions}
      {@render actions()}
    {/if}

    {#if full}
      <div class="statutory-alert-badge">
        <div class="pulse-indicator"></div>
        <span>ZRA PAYE & NAPSA Filing Due in 5 Days</span>
      </div>
    {/if}

    <!-- Theme Switcher Button (Dark / Mixed / Light) -->
    <button type="button" class="theme-switcher-btn" id="themeToggleBtn" onclick={() => cyberguard.cycleTheme()} title="Toggle UI Theme Mode (Dark, Mixed, Light)">
      <span class="theme-icon">
        {#if cyberguard.theme === 'light'}☀️{:else if cyberguard.theme === 'mixed'}🌓{:else}🌙{/if}
      </span>
      <span class="theme-label">
        {#if cyberguard.theme === 'light'}Light Mode{:else if cyberguard.theme === 'mixed'}Mixed Mode{:else}Dark Mode{/if}
      </span>
    </button>

    {#if full}
      <!-- Role Perspective Switcher -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <label for="headerRoleSwitcher" style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">ACTIVE VIEW:</label>
        <select
          class="role-switcher-select"
          id="headerRoleSwitcher"
          onchange={(e) => cyberguard.switchActiveRole(e.target.value)}
        >
          <option value="exec">Managing Director (Exec View)</option>
          <option value="hr">HR Manager (Mutale Kangwa)</option>
          <option value="ops">Director Operations (Lt. Col. Banda)</option>
          <option value="rsm_n">Regional Sec Mgr – North</option>
          <option value="area">Area Manager (Copperbelt)</option>
          <option value="site_sup">Site Supervisor (Brian Bwalya)</option>
          <option value="guard">Senior Armed Guard (Self-Service)</option>
        </select>
      </div>

      <div style="position: relative;">
        <button class="icon-btn" title="Notifications" onclick={() => showNotifications = !showNotifications}>
          {#if notifications.items.length > 0}
            <div class="icon-badge-dot"></div>
          {/if}
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        </button>
        {#if showNotifications}
          <button type="button" class="notif-click-catcher" aria-label="Close notifications" onclick={() => showNotifications = false}></button>
          <div class="notif-dropdown">
            <div class="notif-dropdown-header">
              Notifications
              <span class="badge badge-primary" style="font-size: 0.65rem;">{notifications.items.length}</span>
            </div>
            {#if notifications.items.length === 0}
              <div class="notif-empty">You're all caught up.</div>
            {:else}
              {#each notifications.items as n (n.id)}
                <div class="notif-item severity-{n.severity}">
                  <a href={n.link} class="notif-item-link" onclick={() => showNotifications = false}>{n.message}</a>
                  <button type="button" class="notif-dismiss" onclick={() => notifications.dismiss(n.id)} title="Dismiss">&times;</button>
                </div>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</header>
