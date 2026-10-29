<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { complianceStore, logAudit } from '$lib/stores/compliance.svelte.js';
  import { grievancesStore } from '$lib/stores/grievances.svelte.js';
  import { policiesStore } from '$lib/stores/policies.svelte.js';
  import { incidentsStore } from '$lib/stores/incidents.svelte.js';
  import Pagination from '$lib/components/Pagination.svelte';

  let auditPage = $state(1);
  const pageSize = 10;
  let pagedAuditEntries = $derived(
    complianceStore.items.slice((auditPage - 1) * pageSize, auditPage * pageSize)
  );

  let openCaseCount = $derived(
    grievancesStore.items.filter(c => c.currentStep <= c.approvalChain.length).length
  );

  let openIncidentCount = $derived(
    incidentsStore.items.filter(c => c.currentStep <= c.approvalChain.length).length
  );

  let activeTab = $state('tab-rbac');

  function exportAuditTrail() {
    cyberguard.showToast('Exporting Immutable Security Audit Log (CSV/SIEM)', 'info');
    logAudit('EXPORT_AUDIT', 'badge-primary', `${cyberguard.currentUser.name} exported the security audit trail (CSV/SIEM).`);
  }

  function triggerGlSync() {
    cyberguard.showToast('Posted Journal Entry #JE-2026-10-881 to General Ledger', 'success');
    logAudit('GL_BATCH_SYNC', 'badge-accent', `${cyberguard.currentUser.name} triggered a GL batch sync (Journal Entry #JE-2026-10-881).`);
  }

  function syncDispatchRoster() {
    cyberguard.showToast('Operations dispatch schedule refreshed', 'info');
    logAudit('DISPATCH_SYNC', 'badge-accent', `${cyberguard.currentUser.name} synced the guard roster with the Operations dispatch tool.`);
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Compliance, RBAC & Integrations</title>
</svelte:head>

<style>
  .perm-check { color: #10b981; font-weight: 800; }
  .perm-deny { color: #ef4444; font-weight: 700; }
  .audit-entry {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    margin-bottom: 8px;
    font-size: 0.82rem;
  }
  .audit-entry .timestamp {
    color: var(--text-dim);
    font-size: 0.72rem;
    min-width: 130px;
  }
</style>

<Topbar title="Access Governance, Audit Trails & ERP Integrations">
  {#snippet actions()}
    <button class="btn btn-secondary btn-sm" onclick={exportAuditTrail}>
      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      Export Audit Trail
    </button>
  {/snippet}
</Topbar>

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Access Control (RBAC), Data Privacy & Departmental Integrations</h2>
      <p>Sensitive salary visibility boundaries, Zambian Data Protection Act compliance, immutable audit logs, and Finance & Ops ERP connectors</p>
    </div>
    <div class="header-actions">
      <div class="tabs-header" style="background: none; border-bottom: none; padding: 0;">
        <button class="tab-btn" class:active={activeTab === 'tab-rbac'} onclick={() => activeTab = 'tab-rbac'}>RBAC Permissions Matrix</button>
        <button class="tab-btn" class:active={activeTab === 'tab-integrations'} onclick={() => activeTab = 'tab-integrations'}>Finance & Ops Integrations</button>
        <button class="tab-btn" class:active={activeTab === 'tab-audit'} onclick={() => activeTab = 'tab-audit'}>Security Audit Trail</button>
      </div>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 24px;">
    <a href="/compliance/grievances" class="card" style="margin-bottom: 0; padding: 18px; text-decoration: none; display: flex; align-items: center; gap: 14px;">
      <div style="width: 42px; height: 42px; border-radius: var(--radius-md); background: rgba(239, 68, 68, 0.12); color: #f87171; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.75-2.97l-6.93-12a2 2 0 00-3.5 0l-6.93 12A2 2 0 005.07 19z"/></svg>
      </div>
      <div>
        <div style="font-weight: 700; color: var(--text-main); font-size: 0.92rem;">Grievance & Disciplinary Cases</div>
        <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">{openCaseCount} case{openCaseCount === 1 ? '' : 's'} open for review</div>
      </div>
    </a>
    <a href="/compliance/policies" class="card" style="margin-bottom: 0; padding: 18px; text-decoration: none; display: flex; align-items: center; gap: 14px;">
      <div style="width: 42px; height: 42px; border-radius: var(--radius-md); background: rgba(37, 99, 235, 0.12); color: #60a5fa; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      </div>
      <div>
        <div style="font-weight: 700; color: var(--text-main); font-size: 0.92rem;">Policy Library</div>
        <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">{policiesStore.items.length} policies on file</div>
      </div>
    </a>
    <a href="/compliance/incidents" class="card" style="margin-bottom: 0; padding: 18px; text-decoration: none; display: flex; align-items: center; gap: 14px;">
      <div style="width: 42px; height: 42px; border-radius: var(--radius-md); background: rgba(245, 158, 11, 0.12); color: #fbbf24; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <div>
        <div style="font-weight: 700; color: var(--text-main); font-size: 0.92rem;">Incident &amp; Safety Reports</div>
        <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">{openIncidentCount} incident{openIncidentCount === 1 ? '' : 's'} open for review</div>
      </div>
    </a>
  </div>

  <div class="tabs-container">

    <!-- TAB 1: RBAC PERMISSIONS MATRIX -->
    {#if activeTab === 'tab-rbac'}
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Role-Based Access Control (RBAC) Governance Matrix</div>
            <div class="card-subtitle">Restricted salary visibility vs general manager vs field supervisor views</div>
          </div>
          <span class="badge badge-success">Enforced by Zero-Trust Engine</span>
        </div>

        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Organizational Role</th>
                <th style="text-align: center;">View Salary / Paye</th>
                <th style="text-align: center;">View Personal Identity / NOK</th>
                <th style="text-align: center;">Manage Shift Rosters</th>
                <th style="text-align: center;">Approve Leave Requests</th>
                <th style="text-align: center;">Edit Statutory TPIN / NAPSA</th>
                <th style="text-align: center;">Trigger Termination</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Managing Director</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">Dr. Mwamba Kapwepwe (Exec)</div>
                </td>
                <td style="text-align: center;"><span class="perm-check">✓ Full</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Full</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ View Only</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Final Level</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Full</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Sign-off</span></td>
              </tr>

              <tr>
                <td>
                  <strong>Human Resource Manager</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">Mutale Kangwa (Head of HR)</div>
                </td>
                <td style="text-align: center;"><span class="perm-check">✓ Full Admin</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Full Master</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Policy View</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Final Stage</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Full Access</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Process Lead</span></td>
              </tr>

              <tr>
                <td>
                  <strong>Director Operations</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">Lt. Col. Patrick Banda (Rtd)</div>
                </td>
                <td style="text-align: center;"><span class="perm-deny">✗ Restricted</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Operational</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ National Roster</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Stage 2</span></td>
                <td style="text-align: center;"><span class="perm-deny">✗ Restricted</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Recommendation</span></td>
              </tr>

              <tr>
                <td>
                  <strong>Regional Security Managers</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">North & South Regional Leads</div>
                </td>
                <td style="text-align: center;"><span class="perm-deny">✗ Restricted</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Regional Pool</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Regional Ops</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Stage 2</span></td>
                <td style="text-align: center;"><span class="perm-deny">✗ Restricted</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Incident Flag</span></td>
              </tr>

              <tr>
                <td>
                  <strong>Area Managers</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">Joseph Phiri (Copperbelt)</div>
                </td>
                <td style="text-align: center;"><span class="perm-deny">✗ Restricted</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Emergency NOK</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Cluster Dispatch</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Stage 1 Sign</span></td>
                <td style="text-align: center;"><span class="perm-deny">✗ Restricted</span></td>
                <td style="text-align: center;"><span class="perm-deny">✗ Restricted</span></td>
              </tr>

              <tr>
                <td>
                  <strong>Site Supervisor</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">Brian Bwalya (Site Lead)</div>
                </td>
                <td style="text-align: center;"><span class="perm-deny">✗ Restricted</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ On-Duty Emergency</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Shift Post Log</span></td>
                <td style="text-align: center;"><span class="perm-check">✓ Recommendation</span></td>
                <td style="text-align: center;"><span class="perm-deny">✗ Restricted</span></td>
                <td style="text-align: center;"><span class="perm-deny">✗ Restricted</span></td>
              </tr>

              <tr>
                <td>
                  <strong>Guards (Operatives)</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">Kelvin Musonda, Moses Sakala</div>
                </td>
                <td style="text-align: center;"><span style="color:#60a5fa; font-weight:700;">Own Payslip Only</span></td>
                <td style="text-align: center;"><span style="color:#60a5fa; font-weight:700;">Own Profile Only</span></td>
                <td style="text-align: center;"><span style="color:#60a5fa; font-weight:700;">Own Assigned Shift</span></td>
                <td style="text-align: center;"><span style="color:#60a5fa; font-weight:700;">Self-Application</span></td>
                <td style="text-align: center;"><span class="perm-deny">✗ Restricted</span></td>
                <td style="text-align: center;"><span class="perm-deny">✗ Restricted</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    <!-- TAB 2: CROSS-DEPARTMENTAL INTEGRATIONS -->
    {#if activeTab === 'tab-integrations'}
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">
                <svg width="20" height="20" fill="none" stroke="#2563eb" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Finance & General Ledger Sync
              </div>
              <div class="card-subtitle">Automated journal entry feed to SAP / Sage / QuickBooks</div>
            </div>
            <span class="badge badge-success"><span class="badge-dot"></span> Live Sync Active</span>
          </div>
          <div class="card-body">
            <div style="font-size: 0.82rem; display: flex; flex-direction: column; gap: 12px;">
              <div style="background: var(--bg-card); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-weight: 700; color: #fff;">General Ledger Code Mapping:</div>
                <div style="font-size: 0.74rem; color: var(--text-dim); margin-top: 4px;">
                  • GL-51000: Basic Guard Salaries (ZMW 3,120,000)<br>
                  • GL-51010: Housing & Transport Allowances (ZMW 980,000)<br>
                  • GL-51020: NAPSA Employer Match 5% (ZMW 206,400)<br>
                  • GL-51030: NHIMA Employer Match 1% (ZMW 41,280)
                </div>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 4px;">
                  <span>Monthly Payroll vs Ops Budget:</span>
                  <span style="color: #34d399;">ZMW 4.85M / 5.00M (97.0%)</span>
                </div>
                <div style="height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;">
                  <div style="width: 97%; height: 100%; background: var(--success);"></div>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm" onclick={triggerGlSync}>
                Trigger GL Batch Sync Now
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">
                <svg width="20" height="20" fill="none" stroke="#06b6d4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                Operations & Field Guard Dispatch Sync
              </div>
              <div class="card-subtitle">Real-time availability, skillsets and post deployment</div>
            </div>
            <span class="badge badge-accent"><span class="badge-dot"></span> Feed Operational</span>
          </div>
          <div class="card-body">
            <div style="font-size: 0.82rem; display: flex; flex-direction: column; gap: 12px;">
              <div style="background: var(--bg-card); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-weight: 700; color: #fff;">Workforce Skillsets in Database:</div>
                <div style="font-size: 0.74rem; color: var(--text-dim); margin-top: 4px;">
                  • 840 Armed Guards (Class 1 Shotgun / Pistol Certified)<br>
                  • 380 Static & Unarmed Concierge Guards<br>
                  • 120 K9 Patrol Handler Certified<br>
                  • 80 Tactical Fast-Response Drivers (Light & Heavy)
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>Standby Emergency Guard Pool:</span>
                <strong style="color: #60a5fa;">42 Available in North / 28 in South</strong>
              </div>
              <button class="btn btn-secondary btn-sm" onclick={syncDispatchRoster}>
                Sync Roster with Dispatch Tool
              </button>
            </div>
          </div>
        </div>

      </div>
    {/if}

    <!-- TAB 3: AUDIT TRAIL -->
    {#if activeTab === 'tab-audit'}
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Immutable Security & Data Privacy Audit Trail</div>
            <div class="card-subtitle">Zambian Data Protection Act No. 3 of 2021 Compliance Logging</div>
          </div>
        </div>
        <div class="card-body">
          {#each pagedAuditEntries as entry (entry.id)}
            <div class="audit-entry">
              <span class="timestamp">{entry.timestamp}</span>
              <span class="badge {entry.badge}">{entry.action}</span>
              <div style="flex: 1;">{entry.detail}</div>
              <span style="color: {entry.resultColor}; font-size: 0.72rem; font-weight: 700;">{entry.result}</span>
            </div>
          {/each}
        </div>
        <Pagination bind:currentPage={auditPage} totalItems={complianceStore.items.length} {pageSize} />
      </div>
    {/if}

  </div>

</main>
