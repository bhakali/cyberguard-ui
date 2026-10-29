<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';

  let activeTab = $state('tab-linear');
  let isRoleModalOpen = $state(false);
  let selectedRole = $state(null);

  const roleDetails = {
    "Managing Director": {
      incumbent: "Dr. Mwamba Kapwepwe (CG-00101)",
      grade: "Grade E1 (Executive)",
      dept: "Executive Office",
      costCenter: "CC-100-EXEC",
      station: "Corporate HQ - Lusaka",
      reportsTo: "Board of Directors",
      duties: "Executive leadership, strategic direction, corporate governance, board reporting, statutory compliance sign-off, capital resource allocation."
    },
    "Director Operations": {
      incumbent: "Lt. Col. Patrick Banda (Rtd) (CG-00102)",
      grade: "Grade D2 (Senior Director)",
      dept: "Security Operations",
      costCenter: "CC-200-OPS",
      station: "National Ops Command Hub",
      reportsTo: "Managing Director",
      duties: "Tactical command of national security force, high-risk site defense logistics, firearms control, emergency response protocol execution."
    },
    "Director Admin": {
      incumbent: "Chileshe Mulenga (CG-00103)",
      grade: "Grade D2 (Senior Director)",
      dept: "Administration & Facilities",
      costCenter: "CC-300-ADM",
      station: "Corporate HQ - Lusaka",
      reportsTo: "Managing Director",
      duties: "Central facilities, fleet logistics, armored vehicle dispatch, uniform & ballistic equipment procurement, armory vault inventory oversight."
    },
    "Human Resource": {
      incumbent: "Mutale Kangwa (CG-00104)",
      grade: "Grade D1 (Department Head)",
      dept: "Human Resources",
      costCenter: "CC-400-HR",
      station: "Corporate HQ - Lusaka",
      reportsTo: "Managing Director",
      duties: "Workforce lifecycle management, police background vetting, ZRA/NAPSA/NHIMA compliance, employee relations, disciplinary tribunals."
    },
    "Regional Security Manager – North": {
      incumbent: "Kennedy Tembo (CG-00105)",
      grade: "Grade C3 (Regional Manager)",
      dept: "Security Operations - North",
      costCenter: "CC-210-NORTH",
      station: "Copperbelt Regional Hub (Kitwe)",
      reportsTo: "Director Operations",
      duties: "Command over Northern province, Copperbelt mining operations (Kansanshi, Konkola, Mopani), high-value asset transit escort."
    },
    "Regional Security Manager - South": {
      incumbent: "Grace Mwanza (CG-00106)",
      grade: "Grade C3 (Regional Manager)",
      dept: "Security Operations - South",
      costCenter: "CC-220-SOUTH",
      station: "Lusaka South Hub",
      reportsTo: "Director Operations",
      duties: "Commercial sector coverage, diplomatic embassies, retail banks, critical infrastructure perimeter security across Southern & Central provinces."
    },
    "Area Manager": {
      incumbent: "Joseph Phiri (CG-00107)",
      grade: "Grade C1 (Area Manager)",
      dept: "Security Operations - North",
      costCenter: "CC-212-AREA-CB",
      station: "Copperbelt North Hub",
      reportsTo: "Regional Security Manager – North",
      duties: "Multi-site client relationship management, incident reviews, supervisor appraisal, spot checks on armaments and sobriety logs."
    },
    "Shift Coordinator": {
      incumbent: "David Lungu (CG-00108)",
      grade: "Grade B3 (Senior Coordinator)",
      dept: "Security Operations",
      costCenter: "CC-225-SHIFT",
      station: "Central Shift Command",
      reportsTo: "Area Manager",
      duties: "24/7 master shift roster scheduling, relief personnel dispatch, emergency sickness coverage, overtime pre-approvals."
    },
    "Site Coordinators": {
      incumbent: "Mary Chilufya (CG-00109)",
      grade: "Grade B2 (Site Coordinator)",
      dept: "Security Operations - North",
      costCenter: "CC-215-MINE-KANS",
      station: "Kansanshi Copper Hub",
      reportsTo: "Shift Coordinator",
      duties: "On-site command post coordination, client security liaison, shift muster inspections, perimeter access log audit."
    },
    "Site Supervisor": {
      incumbent: "Brian Bwalya (CG-00110)",
      grade: "Grade B1 (Site Supervisor)",
      dept: "Security Operations - North",
      costCenter: "CC-216-SITE-SUP",
      station: "Konkola Smelter Hub",
      reportsTo: "Site Coordinators",
      duties: "Direct guard force supervision, clock-in verification, weapon issue/return logging, patrol monitoring, immediate escalation of security breaches."
    },
    "Guards": {
      incumbent: "Kelvin Musonda & 1,400+ Personnel (CG-00111, CG-00112)",
      grade: "Grade A1 / A2 (Guard Force)",
      dept: "Security Operations",
      costCenter: "CC-218-GUARD-CB",
      station: "Active Guard Posts across Zambia",
      reportsTo: "Site Supervisor",
      duties: "Static and armed sentry duties, perimeter patrol, visitor access screening, incident containment, vehicle search under statutory rules."
    }
  };

  function openRoleModal(roleName) {
    const details = roleDetails[roleName] || {
      incumbent: "Personnel Incumbent",
      grade: "Grade Standard",
      dept: "Operations",
      costCenter: "CC-STANDARD",
      station: "Field Hub",
      reportsTo: "Senior Officer",
      duties: "Operational responsibilities as designated by CyberGuard security standing orders."
    };
    selectedRole = { name: roleName, ...details };
    isRoleModalOpen = true;
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Organizational Structure & Hierarchy</title>
</svelte:head>

<Topbar title="Organizational Structure & Hierarchy Chain">
  {#snippet actions()}
    <button class="btn btn-secondary btn-sm" onclick={() => cyberguard.showToast('Exporting Organizational Structure Map (PDF / High-Res PNG)', 'info')}>
      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      Export Structure Diagram
    </button>
  {/snippet}
</Topbar>

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Command Hierarchy & Operational Reporting Lines</h2>
      <p>10-Tier Organizational structure: Managing Director down to Guard Force, with Cost Centers and Manager-Subordinate mappings</p>
    </div>
    <div class="header-actions">
      <div class="tabs-header" style="background: none; border-bottom: none; padding: 0;">
        <button class="tab-btn" class:active={activeTab === 'tab-linear'} onclick={() => activeTab = 'tab-linear'}>Hierarchy Chain Matrix</button>
        <button class="tab-btn" class:active={activeTab === 'tab-diagram'} onclick={() => activeTab = 'tab-diagram'}>Visual Tree View</button>
      </div>
    </div>
  </div>

  <div class="tabs-container">
    
    <!-- TAB 1: LINEAR HIERARCHY MATRIX WITH ALL 10 ROLES -->
    {#if activeTab === 'tab-linear'}
      <div>
        
        <!-- Tier 1: Managing Director -->
        <div class="hierarchy-card" style="border-left: 5px solid #2563eb; cursor: pointer;" onclick={() => openRoleModal('Managing Director')}>
          <div style="display: flex; align-items: center; gap: 16px;">
            <span class="tier-badge tier-1">Tier 1 • Executive</span>
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff;">Managing Director</h3>
              <div style="font-size: 0.8rem; color: var(--accent-cyan);">Dr. Mwamba Kapwepwe • Grade E1</div>
              <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">Reports To: Board of Directors • Cost Center: CC-100-EXEC</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #93c5fd;">3 Direct Reports</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">Director Ops, Director Admin, Head of HR</div>
          </div>
        </div>

        <!-- Tier 2: Director Operations, Director Admin, Human Resource -->
        <div style="margin-left: 30px; border-left: 2px dashed rgba(59, 130, 246, 0.4); padding-left: 20px;">
          
          <div class="hierarchy-card" style="border-left: 4px solid #6366f1; cursor: pointer;" onclick={() => openRoleModal('Director Operations')}>
            <div style="display: flex; align-items: center; gap: 16px;">
              <span class="tier-badge tier-2">Tier 2 • Senior Ops</span>
              <div>
                <h3 style="font-size: 1rem; font-weight: 700; color: #fff;">Director Operations</h3>
                <div style="font-size: 0.8rem; color: var(--accent-cyan);">Lt. Col. Patrick Banda (Rtd) • Grade D2</div>
                <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">Reports To: Managing Director • Cost Center: CC-200-OPS</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.85rem; font-weight: 700; color: #818cf8;">2 Regional Sec Managers</div>
              <div style="font-size: 0.72rem; color: var(--text-dim);">North & South Regional Commands</div>
            </div>
          </div>

          <div class="hierarchy-card" style="border-left: 4px solid #6366f1; cursor: pointer;" onclick={() => openRoleModal('Director Admin')}>
            <div style="display: flex; align-items: center; gap: 16px;">
              <span class="tier-badge tier-2">Tier 2 • Administration</span>
              <div>
                <h3 style="font-size: 1rem; font-weight: 700; color: #fff;">Director Admin</h3>
                <div style="font-size: 0.8rem; color: var(--accent-cyan);">Chileshe Mulenga • Grade D2</div>
                <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">Reports To: Managing Director • Cost Center: CC-300-ADM</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.85rem; font-weight: 700; color: #818cf8;">Facilities & Fleet Logistics</div>
              <div style="font-size: 0.72rem; color: var(--text-dim);">Central Procurement, Uniforms & Arms Store</div>
            </div>
          </div>

          <div class="hierarchy-card" style="border-left: 4px solid #6366f1; cursor: pointer;" onclick={() => openRoleModal('Human Resource')}>
            <div style="display: flex; align-items: center; gap: 16px;">
              <span class="tier-badge tier-2">Tier 2 • Human Capital</span>
              <div>
                <h3 style="font-size: 1rem; font-weight: 700; color: #fff;">Human Resource</h3>
                <div style="font-size: 0.8rem; color: var(--accent-cyan);">Mutale Kangwa • Grade D1</div>
                <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">Reports To: Managing Director • Cost Center: CC-400-HR</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.85rem; font-weight: 700; color: #818cf8;">Recruitment, Payroll & Compliance</div>
              <div style="font-size: 0.72rem; color: var(--text-dim);">NAPSA, NHIMA, ZRA, Labor Laws</div>
            </div>
          </div>

          <!-- Tier 3: Regional Security Managers (North & South) -->
          <div style="margin-left: 30px; border-left: 2px dashed rgba(6, 182, 212, 0.4); padding-left: 20px;">
            
            <div class="hierarchy-card" style="border-left: 4px solid #06b6d4; cursor: pointer;" onclick={() => openRoleModal('Regional Security Manager – North')}>
              <div style="display: flex; align-items: center; gap: 16px;">
                <span class="tier-badge tier-3">Tier 3 • Regional Command</span>
                <div>
                  <h3 style="font-size: 0.95rem; font-weight: 700; color: #fff;">Regional Security Manager – North</h3>
                  <div style="font-size: 0.78rem; color: var(--accent-cyan);">Kennedy Tembo • Grade C3</div>
                  <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">Reports To: Director Operations • Cost Center: CC-210-NORTH</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.82rem; font-weight: 700; color: #22d3ee;">Copperbelt, Solwezi & North-West</div>
                <div style="font-size: 0.72rem; color: var(--text-dim);">Mining & Industrial Sector</div>
              </div>
            </div>

            <div class="hierarchy-card" style="border-left: 4px solid #06b6d4; cursor: pointer;" onclick={() => openRoleModal('Regional Security Manager - South')}>
              <div style="display: flex; align-items: center; gap: 16px;">
                <span class="tier-badge tier-3">Tier 3 • Regional Command</span>
                <div>
                  <h3 style="font-size: 0.95rem; font-weight: 700; color: #fff;">Regional Security Manager - South</h3>
                  <div style="font-size: 0.78rem; color: var(--accent-cyan);">Grace Mwanza • Grade C3</div>
                  <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">Reports To: Director Operations • Cost Center: CC-220-SOUTH</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.82rem; font-weight: 700; color: #22d3ee;">Lusaka, Southern & Western Hubs</div>
                <div style="font-size: 0.72rem; color: var(--text-dim);">Commercial, Banking & Embassies</div>
              </div>
            </div>

            <!-- Tier 4: Area Manager -->
            <div style="margin-left: 30px; border-left: 2px dashed rgba(16, 185, 129, 0.4); padding-left: 20px;">
              
              <div class="hierarchy-card" style="border-left: 4px solid #10b981; cursor: pointer;" onclick={() => openRoleModal('Area Manager')}>
                <div style="display: flex; align-items: center; gap: 16px;">
                  <span class="tier-badge tier-4">Tier 4 • Field Management</span>
                  <div>
                    <h3 style="font-size: 0.92rem; font-weight: 700; color: #fff;">Area Manager</h3>
                    <div style="font-size: 0.78rem; color: var(--accent-cyan);">Joseph Phiri (Copperbelt) • Grade C1</div>
                    <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">Reports To: Regional Security Manager – North • Cost Center: CC-212-AREA-CB</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 0.82rem; font-weight: 700; color: #34d399;">Multi-Site Operational Oversight</div>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">Client Relations & Emergency Response</div>
                </div>
              </div>

              <!-- Tier 5: Shift Coordinator -->
              <div style="margin-left: 30px; border-left: 2px dashed rgba(245, 158, 11, 0.4); padding-left: 20px;">
                
                <div class="hierarchy-card" style="border-left: 4px solid #f59e0b; cursor: pointer;" onclick={() => openRoleModal('Shift Coordinator')}>
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <span class="tier-badge tier-5">Tier 5 • Roster Control</span>
                    <div>
                      <h3 style="font-size: 0.9rem; font-weight: 700; color: #fff;">Shift Coordinator</h3>
                      <div style="font-size: 0.78rem; color: var(--accent-cyan);">David Lungu • Grade B3</div>
                      <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">Reports To: Area Manager • Cost Center: CC-225-SHIFT</div>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 0.82rem; font-weight: 700; color: #fbbf24;">24/7 Shift Handover & Relief</div>
                    <div style="font-size: 0.72rem; color: var(--text-dim);">Overtime Authorization & Timesheets</div>
                  </div>
                </div>

                <!-- Tier 6: Site Coordinators -->
                <div style="margin-left: 30px; border-left: 2px dashed rgba(59, 130, 246, 0.4); padding-left: 20px;">
                  
                  <div class="hierarchy-card" style="border-left: 4px solid #3b82f6; cursor: pointer;" onclick={() => openRoleModal('Site Coordinators')}>
                    <div style="display: flex; align-items: center; gap: 16px;">
                      <span class="tier-badge tier-1">Tier 6 • Station Lead</span>
                      <div>
                        <h3 style="font-size: 0.88rem; font-weight: 700; color: #fff;">Site Coordinators</h3>
                        <div style="font-size: 0.78rem; color: var(--accent-cyan);">Mary Chilufya • Grade B2</div>
                        <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">Reports To: Shift Coordinator • Cost Center: CC-215-MINE-KANS</div>
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 0.82rem; font-weight: 700; color: #93c5fd;">Kansanshi Mining Hub</div>
                      <div style="font-size: 0.72rem; color: var(--text-dim);">On-Site Tactical Leadership</div>
                    </div>
                  </div>

                  <!-- Tier 7: Site Supervisor -->
                  <div style="margin-left: 30px; border-left: 2px dashed rgba(16, 185, 129, 0.4); padding-left: 20px;">
                    
                    <div class="hierarchy-card" style="border-left: 4px solid #10b981; cursor: pointer;" onclick={() => openRoleModal('Site Supervisor')}>
                      <div style="display: flex; align-items: center; gap: 16px;">
                        <span class="tier-badge tier-4">Tier 7 • Post Supervisor</span>
                        <div>
                          <h3 style="font-size: 0.88rem; font-weight: 700; color: #fff;">Site Supervisor</h3>
                          <div style="font-size: 0.78rem; color: var(--accent-cyan);">Brian Bwalya • Grade B1</div>
                          <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">Reports To: Site Coordinators • Cost Center: CC-216-SITE-SUP</div>
                        </div>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-size: 0.82rem; font-weight: 700; color: #34d399;">Direct Post Guard Supervision</div>
                        <div style="font-size: 0.72rem; color: var(--text-dim);">Clock-In Attendance, Parades, Sobriety Logs</div>
                      </div>
                    </div>

                    <!-- Tier 8: Guards -->
                    <div style="margin-left: 30px; border-left: 2px dashed rgba(148, 163, 184, 0.4); padding-left: 20px;">
                      
                      <div class="hierarchy-card" style="border-left: 4px solid #94a3b8; cursor: pointer;" onclick={() => openRoleModal('Guards')}>
                        <div style="display: flex; align-items: center; gap: 16px;">
                          <span class="tier-badge tier-5" style="background: rgba(148,163,184,0.15); color: #cbd5e1; border-color: rgba(148,163,184,0.3);">Tier 8 • Guard Force</span>
                          <div>
                            <h3 style="font-size: 0.88rem; font-weight: 700; color: #fff;">Guards (Armed & Unarmed Operatives)</h3>
                            <div style="font-size: 0.78rem; color: var(--accent-cyan);">Kelvin Musonda, Moses Sakala & 1,400+ Personnel • Grade A1 / A2</div>
                            <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">Reports To: Site Supervisor • Cost Center: CC-218-GUARD-CB</div>
                          </div>
                        </div>
                        <div style="text-align: right;">
                          <div style="font-size: 0.82rem; font-weight: 700; color: #cbd5e1;">Static, Patrol & Access Control</div>
                          <div style="font-size: 0.72rem; color: var(--text-dim);">12h Shift Execution Across 48 Sites</div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    {/if}

    <!-- TAB 2: VISUAL TREE VIEW -->
    {#if activeTab === 'tab-diagram'}
      <div class="card" style="padding: 30px; text-align: center; overflow-x: auto;">
        <div style="display: inline-block; min-width: 800px;">
          <!-- Managing Director -->
          <div style="background: rgba(37, 99, 235, 0.2); border: 2px solid #2563eb; padding: 14px 24px; border-radius: var(--radius-md); display: inline-block; margin-bottom: 24px; cursor: pointer;" onclick={() => openRoleModal('Managing Director')}>
            <div style="font-size: 0.72rem; color: #93c5fd; text-transform: uppercase; font-weight: 700;">Executive Head</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: #fff;">Managing Director</div>
            <div style="font-size: 0.75rem; color: var(--accent-cyan);">Dr. Mwamba Kapwepwe</div>
          </div>

          <div style="width: 2px; height: 24px; background: rgba(255,255,255,0.2); margin: 0 auto;"></div>

          <!-- Directors Tier -->
          <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 24px;">
            <div style="background: var(--bg-card); border: 1px solid #6366f1; padding: 12px 18px; border-radius: var(--radius-md); width: 240px; cursor: pointer;" onclick={() => openRoleModal('Director Operations')}>
              <div style="font-size: 0.7rem; color: #a5b4fc; font-weight: 700;">OPERATIONS</div>
              <div style="font-size: 0.92rem; font-weight: 700; color: #fff;">Director Operations</div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">Lt. Col. P. Banda</div>
            </div>
            <div style="background: var(--bg-card); border: 1px solid #6366f1; padding: 12px 18px; border-radius: var(--radius-md); width: 240px; cursor: pointer;" onclick={() => openRoleModal('Director Admin')}>
              <div style="font-size: 0.7rem; color: #a5b4fc; font-weight: 700;">ADMINISTRATION</div>
              <div style="font-size: 0.92rem; font-weight: 700; color: #fff;">Director Admin</div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">Chileshe Mulenga</div>
            </div>
            <div style="background: var(--bg-card); border: 1px solid #6366f1; padding: 12px 18px; border-radius: var(--radius-md); width: 240px; cursor: pointer;" onclick={() => openRoleModal('Human Resource')}>
              <div style="font-size: 0.7rem; color: #a5b4fc; font-weight: 700;">HUMAN CAPITAL</div>
              <div style="font-size: 0.92rem; font-weight: 700; color: #fff;">Human Resource</div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">Mutale Kangwa</div>
            </div>
          </div>

          <div style="width: 2px; height: 24px; background: rgba(255,255,255,0.2); margin: 0 auto;"></div>

          <!-- Regional Managers -->
          <div style="display: flex; justify-content: center; gap: 30px; margin-bottom: 24px;">
            <div style="background: var(--bg-card); border: 1px solid #06b6d4; padding: 12px 18px; border-radius: var(--radius-md); width: 260px; cursor: pointer;" onclick={() => openRoleModal('Regional Security Manager – North')}>
              <div style="font-size: 0.7rem; color: #67e8f9; font-weight: 700;">NORTHERN COMMAND</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: #fff;">RSM – North (Kennedy Tembo)</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Copperbelt / Solwezi Mines</div>
            </div>
            <div style="background: var(--bg-card); border: 1px solid #06b6d4; padding: 12px 18px; border-radius: var(--radius-md); width: 260px; cursor: pointer;" onclick={() => openRoleModal('Regional Security Manager - South')}>
              <div style="font-size: 0.7rem; color: #67e8f9; font-weight: 700;">SOUTHERN COMMAND</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: #fff;">RSM - South (Grace Mwanza)</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Lusaka / Commercial Sites</div>
            </div>
          </div>

          <div style="background: rgba(16, 185, 129, 0.1); border: 1px dashed rgba(16, 185, 129, 0.4); border-radius: var(--radius-md); padding: 14px; max-width: 600px; margin: 0 auto; font-size: 0.8rem; color: var(--text-muted);">
            ↓ Reporting chain flows into <strong>Area Managers</strong> → <strong>Shift Coordinators</strong> → <strong>Site Coordinators</strong> → <strong>Site Supervisors</strong> → <strong>1,400+ Guard Force</strong>.
          </div>
        </div>
      </div>
    {/if}

  </div>

</main>

<!-- MODAL: ROLE SPECIFICATION -->
{#if isRoleModalOpen && selectedRole}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">{selectedRole.name}</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            {selectedRole.grade} • {selectedRole.dept}
          </div>
        </div>
        <button class="modal-close" onclick={() => isRoleModalOpen = false}>&times;</button>
      </div>

      <div class="modal-body">
        <div class="form-grid" style="grid-template-columns: 1fr;">
          <div class="dossier-field">
            <div class="dossier-label">Incumbent Personnel</div>
            <div class="dossier-val">{selectedRole.incumbent}</div>
          </div>
          <div class="dossier-field">
            <div class="dossier-label">Cost Center & Primary Station</div>
            <div class="dossier-val">{selectedRole.costCenter} • {selectedRole.station}</div>
          </div>
          <div class="dossier-field">
            <div class="dossier-label">Reporting Line</div>
            <div class="dossier-val">{selectedRole.reportsTo}</div>
          </div>
          <div class="dossier-field">
            <div class="dossier-label">Core Governance & Operational Duties</div>
            <div class="dossier-val" style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted); line-height: 1.5;">
              {selectedRole.duties}
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => isRoleModalOpen = false}>Close</button>
        <a href="/employees" class="btn btn-primary">
          Filter in Employee Registry
        </a>
      </div>
    </div>
  </div>
{/if}

<style>
  .hierarchy-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all var(--transition-fast);
    cursor: pointer;
  }

  .hierarchy-card:hover {
    border-color: var(--primary-light);
    transform: translateX(4px);
    background: var(--bg-card-subtle);
  }

  .tier-badge {
    font-size: 0.7rem;
    padding: 3px 8px;
    border-radius: var(--radius-full);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tier-1 { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
  .tier-2 { background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4); }
  .tier-3 { background: rgba(6, 182, 212, 0.2); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.4); }
  .tier-4 { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
  .tier-5 { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
</style>
