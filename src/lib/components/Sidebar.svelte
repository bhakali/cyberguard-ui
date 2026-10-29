<script>
  import { page } from "$app/state";
  import { cyberguard } from "$lib/cyberguard.svelte.js";
  import { canSeeNav } from "$lib/rbac.js";

  function isActive(path) {
    if (!page.url) return false;
    if (path === "/dashboard") return page.url.pathname === "/dashboard";
    if (path === "/employees")
      return (
        page.url.pathname.startsWith("/employees") ||
        page.url.pathname.startsWith("/employee-profile")
      );
    if (path === "/compliance") return page.url.pathname === "/compliance";
    return page.url.pathname.startsWith(path);
  }

  let showCoreHrGroup = $derived(
    [
      "dashboard",
      "employees",
      "org-chart",
      "process-mapping",
      "my-profile",
      "engagement",
    ].some((k) => canSeeNav(cyberguard.activeRoleId, k)),
  );
  let showOpsGroup = $derived(
    [
      "recruitment",
      "attendance",
      "payroll",
      "performance",
      "offboarding",
      "succession",
      "learning",
    ].some((k) => canSeeNav(cyberguard.activeRoleId, k)),
  );
  let showGovernanceGroup = $derived(
    ["compliance", "grievances", "policies", "incidents"].some((k) =>
      canSeeNav(cyberguard.activeRoleId, k),
    ),
  );
  let showSystemGroup = $derived(
    canSeeNav(cyberguard.activeRoleId, "configuration"),
  );
</script>

<aside class="sidebar" class:open={cyberguard.isMobileNavOpen}>
  <div class="brand-section">
    <div class="brand-logo-icon">
      <svg
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    </div>
    <div class="brand-info">
      <h1>CyberGuard</h1>
      <p>Enterprise Workforce</p>
    </div>
  </div>

  <nav class="sidebar-nav">
    {#if showCoreHrGroup}
      <div class="nav-group-title">Executive & Core HR</div>
      {#if canSeeNav(cyberguard.activeRoleId, "dashboard")}
        <a
          href="/dashboard"
          class="nav-link"
          class:active={isActive("/dashboard")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            /></svg
          >
          Dashboard
        </a>
      {/if}
      {#if canSeeNav(cyberguard.activeRoleId, "my-profile")}
        <a
          href="/my-profile"
          class="nav-link"
          class:active={isActive("/my-profile")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            /></svg
          >
          My Profile
        </a>
      {/if}
      {#if canSeeNav(cyberguard.activeRoleId, "employees")}
        <a
          href="/employees"
          class="nav-link"
          class:active={isActive("/employees")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            /></svg
          >
          Employee Records
          <span class="nav-badge">{cyberguard.employees.length}</span>
        </a>
      {/if}
      <!-- 
      {#if canSeeNav(cyberguard.activeRoleId, "org-chart")}
        <a
          href="/org-chart"
          class="nav-link"
          class:active={isActive("/org-chart")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            /></svg
          >
          Organizational Hierarchy
        </a>
      {/if}
      
      {#if canSeeNav(cyberguard.activeRoleId, "process-mapping")}
        <a
          href="/process-mapping"
          class="nav-link"
          class:active={isActive("/process-mapping")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            /></svg
          >
          Business Process Mapping
          <span class="nav-badge accent">Key</span>
        </a>
      {/if} 
       -->
      {#if canSeeNav(cyberguard.activeRoleId, "engagement")}
        <a
          href="/engagement"
          class="nav-link"
          class:active={isActive("/engagement")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            /></svg
          >
          Engagement & Culture
        </a>
      {/if}
    {/if}

    {#if showOpsGroup}
      <div class="nav-group-title">HR Operations & Lifecycle</div>
      {#if canSeeNav(cyberguard.activeRoleId, "recruitment")}
        <a
          href="/recruitment"
          class="nav-link"
          class:active={isActive("/recruitment")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            /></svg
          >
          Recruitment & Onboarding
          <span class="nav-badge">14</span>
        </a>
      {/if}
      {#if canSeeNav(cyberguard.activeRoleId, "attendance")}
        <a
          href="/attendance"
          class="nav-link"
          class:active={isActive("/attendance")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            /></svg
          >
          Time & Guard Shifts
        </a>
      {/if}
      {#if canSeeNav(cyberguard.activeRoleId, "payroll")}
        <a href="/payroll" class="nav-link" class:active={isActive("/payroll")}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            /></svg
          >
          Payroll Management
        </a>
      {/if}
      {#if canSeeNav(cyberguard.activeRoleId, "performance")}
        <a
          href="/performance"
          class="nav-link"
          class:active={isActive("/performance")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            /></svg
          >
          Performance & Appraisal
        </a>
      {/if}
      {#if canSeeNav(cyberguard.activeRoleId, "offboarding")}
        <a
          href="/offboarding"
          class="nav-link"
          class:active={isActive("/offboarding")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            /></svg
          >
          Offboarding & Clearance
        </a>
      {/if}
      {#if canSeeNav(cyberguard.activeRoleId, "succession")}
        <a
          href="/succession"
          class="nav-link"
          class:active={isActive("/succession")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M9 20v-2c0-.656.126-1.283.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            /></svg
          >
          Succession & Skills Matrix
        </a>
      {/if}
      {#if canSeeNav(cyberguard.activeRoleId, "learning")}
        <a
          href="/learning"
          class="nav-link"
          class:active={isActive("/learning")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s4.332.477 5.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            /></svg
          >
          Learning & Development
        </a>
      {/if}
    {/if}

    {#if showGovernanceGroup}
      <div class="nav-group-title">Governance & Security</div>
      <!--
      {#if canSeeNav(cyberguard.activeRoleId, "compliance")}
        <a
          href="/compliance"
          class="nav-link"
          class:active={isActive("/compliance")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            /></svg
          >
          Compliance, RBAC & Integrations
        </a>
      {/if} -->
      {#if canSeeNav(cyberguard.activeRoleId, "grievances")}
        <a
          href="/compliance/grievances"
          class="nav-link"
          class:active={isActive("/compliance/grievances")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M10.29 3.86l-8.18 14.14A1 1 0 003 19.5h18a1 1 0 00.89-1.5L13.71 3.86a1 1 0 00-1.73 0z"
            /></svg
          >
          Grievance & Disciplinary Cases
        </a>
      {/if}
      {#if canSeeNav(cyberguard.activeRoleId, "policies")}
        <a
          href="/compliance/policies"
          class="nav-link"
          class:active={isActive("/compliance/policies")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m-7 8h8a2 2 0 002-2V7.414a1 1 0 00-.293-.707l-4.414-4.414A1 1 0 0012.586 2H6a2 2 0 00-2 2v16a2 2 0 002 2z"
            /></svg
          >
          Policy Library
        </a>
      {/if}
      {#if canSeeNav(cyberguard.activeRoleId, "incidents")}
        <a
          href="/compliance/incidents"
          class="nav-link"
          class:active={isActive("/compliance/incidents")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
            /></svg
          >
          Incident & Safety Reports
        </a>
      {/if}
    {/if}

    {#if showSystemGroup}
      <div class="nav-group-title">System Administration</div>
      {#if canSeeNav(cyberguard.activeRoleId, "configuration")}
        <a
          href="/configuration"
          class="nav-link"
          class:active={isActive("/configuration")}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            /><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            /></svg
          >
          Configuration
        </a>
      {/if}
    {/if}
  </nav>

  <div class="sidebar-footer">
    <div class="user-quick-profile">
      <div class="user-avatar">{cyberguard.currentUser.avatar || "MK"}</div>
      <div class="user-meta">
        <div class="user-name current-user-name">
          {cyberguard.currentUser.name}
        </div>
        <div class="user-role current-user-role">
          {cyberguard.currentUser.role}
        </div>
      </div>
      <a href="/" title="Sign Out" style="color: var(--text-dim);">
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          /></svg
        >
      </a>
    </div>
  </div>
</aside>
