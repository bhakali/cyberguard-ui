<script>
  import Topbar from "$lib/components/Topbar.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import EmployeeAvatar from "$lib/components/EmployeeAvatar.svelte";
  import { cyberguard } from "$lib/cyberguard.svelte.js";
  import { logAudit } from "$lib/stores/compliance.svelte.js";

  let deptFilter = $state("");
  let roleFilter = $state("");
  let statusFilter = $state("");
  let globalSearch = $state("");
  let currentPage = $state(1);
  const pageSize = 10;

  // Modal State
  let isNewModalOpen = $state(false);
  let activeModalTab = $state("tab-personal");
  let isAuditModalOpen = $state(false);
  let auditEmployee = $state(null);

  // Form State
  let firstName = $state("");
  let lastName = $state("");
  let nationalId = $state("");
  let dob = $state("1990-01-01");
  let gender = $state("Male");
  let phone = $state("+260 977 000 111");
  let email = $state("");
  let nextOfKinName = $state("");
  let nextOfKinContact = $state("");

  let jobTitle = $state("Guards");
  let department = $state("Security Operations - North");
  let costCenter = $state("CC-218-GUARD-CB");
  let reportingTo = $state("Site Supervisor (Brian Bwalya)");
  let siteAssigned = $state("Kansanshi Copper Perimeter Post");

  let contractType = $state("Permanent");
  let probationMonths = $state("3");
  let probationStatus = $state("Active (In Progress)");
  let rehireHistory = $state("No (First Appointment)");
  let terminationRules = $state("");

  let napsaNo = $state("NAP-" + Math.floor(1000000 + Math.random() * 9000000));
  let nhimaNo = $state("NHI-" + Math.floor(1000000 + Math.random() * 9000000));
  let zraTpin = $state("100" + Math.floor(1000000 + Math.random() * 9000000));
  let basePay = $state(4500);
  let housingAllowance = $state(1000);
  let transportAllowance = $state(800);
  let bankName = $state("Zambia National Commercial Bank (ZANACO)");

  const roleToGrade = {
    "Managing Director": "Grade E1 (Executive)",
    "Director Operations": "Grade D2 (Senior Director)",
    "Director Admin": "Grade D2 (Senior Director)",
    "Regional Security Manager – North": "Grade C3 (Regional Manager)",
    "Regional Security Manager - South": "Grade C3 (Regional Manager)",
    "Human Resource Manager": "Grade D1 (Department Head)",
    "Area Manager": "Grade C1 (Area Manager)",
    "Shift Coordinator": "Grade B3 (Senior Coordinator)",
    "Site Coordinators": "Grade B2 (Site Coordinator)",
    "Site Supervisor": "Grade B1 (Site Supervisor)",
    Guards: "Grade A1 / A2 (Guard Force)",
  };

  let gradeLevel = $derived(roleToGrade[jobTitle] || "Grade Standard");

  let filteredEmployees = $derived(
    cyberguard.employees.filter((emp) => {
      const matchDept = !deptFilter || emp.department === deptFilter;
      const matchRole = !roleFilter || emp.jobTitle === roleFilter;
      let matchStatus = true;
      if (statusFilter === "Permanent")
        matchStatus = emp.contractType.includes("Permanent");
      if (statusFilter === "Fixed")
        matchStatus = emp.contractType.includes("Fixed");
      if (statusFilter === "Probation")
        matchStatus = emp.contractType.includes("Probation");
      if (statusFilter === "Rehired")
        matchStatus = emp.rehireHistory.includes("Rehired");

      let matchSearch = true;
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase();
        const text =
          `${emp.firstName} ${emp.lastName} ${emp.id} ${emp.nationalId} ${emp.jobTitle} ${emp.department} ${emp.siteAssigned} ${emp.zraTpin}`.toLowerCase();
        matchSearch = text.includes(q);
      }

      return matchDept && matchRole && matchStatus && matchSearch;
    }),
  );

  $effect(() => {
    deptFilter;
    roleFilter;
    statusFilter;
    globalSearch;
    currentPage = 1;
  });

  let pagedEmployees = $derived(
    filteredEmployees.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    ),
  );

  function handleCreateEmployee(e) {
    e.preventDefault();
    const newId = `CG-00${100 + cyberguard.employees.length + 1}`;
    const generatedEmail =
      email ||
      `${firstName.toLowerCase()[0]}.${lastName.toLowerCase()}@CyberGuard.zm`;

    const newEmp = {
      id: newId,
      firstName,
      lastName,
      nationalId,
      dob,
      gender,
      phone,
      email: generatedEmail,
      address: "Plot 42, Operations Hub, Copperbelt",
      nextOfKin: `${nextOfKinName} - ${nextOfKinContact}`,
      jobTitle,
      gradeLevel,
      department,
      costCenter,
      reportingTo,
      region: department.includes("North")
        ? "Northern Region"
        : "Southern Region",
      siteAssigned,
      contractType,
      probationMonths: parseInt(probationMonths) || 3,
      probationStatus,
      joinDate: new Date().toISOString().split("T")[0],
      rehireHistory,
      salaryGross:
        Number(basePay) + Number(housingAllowance) + Number(transportAllowance),
      basePay: Number(basePay),
      housingAllowance: Number(housingAllowance),
      transportAllowance: Number(transportAllowance),
      dangerPay: 0,
      napsaNo,
      nhimaNo,
      zraTpin,
      bankName,
      status: "Active",
      shiftPattern: "Standard Rotational Shift",
      qualifications: [],
    };

    cyberguard.createEmployee(newEmp);
    isNewModalOpen = false;
  }

  function exportCSV() {
    cyberguard.showToast(
      "Exporting Master Employee Registry (CSV)... Download ready.",
      "info",
    );
  }

  function buildEmployeeAuditLog(emp) {
    if (!emp) return [];

    const entries = [
      {
        timestamp: "Just now",
        badge: "badge-primary",
        action: "VIEW_AUDIT_TRAIL",
        detail: `${cyberguard.currentUser.name} opened the audit trail for ${emp.firstName} ${emp.lastName} (${emp.id}).`,
        result: "AUTHORIZED",
        resultColor: "#34d399",
      },
    ];

    if (emp.rehireHistory?.includes("Rehired")) {
      entries.push({
        timestamp: "Today, 08:55",
        badge: "badge-accent",
        action: "REHIRE_VERIFIED",
        detail: `Rehire history verified for ${emp.firstName} ${emp.lastName}: ${emp.rehireHistory}.`,
        result: "AUTHORIZED",
        resultColor: "#34d399",
      });
    }

    if (emp.contractType?.includes("Probation")) {
      entries.push({
        timestamp: "Today, 08:40",
        badge: "badge-warning",
        action: "PROBATION_REVIEW",
        detail: `Probation status for ${emp.firstName} ${emp.lastName} marked "${emp.probationStatus}" ahead of the ${emp.probationMonths}-month review.`,
        result: "AUTHORIZED",
        resultColor: "#34d399",
      });
    }

    entries.push(
      {
        timestamp: "Yesterday, 14:05",
        badge: "badge-primary",
        action: "ACCESS_SALARY",
        detail: `Mutale Kangwa (HR Manager) viewed the payroll breakdown (Base ZMW ${emp.basePay?.toLocaleString?.() ?? emp.basePay}) for ${emp.firstName} ${emp.lastName}.`,
        result: "AUTHORIZED",
        resultColor: "#34d399",
      },
      {
        timestamp: "Yesterday, 11:20",
        badge: "badge-accent",
        action: "PROFILE_UPDATE",
        detail: `Reporting line confirmed as ${emp.reportingTo} and site assignment set to ${emp.siteAssigned}.`,
        result: "AUTHORIZED",
        resultColor: "#34d399",
      },
      {
        timestamp: `${emp.joinDate} · 09:12`,
        badge: "badge-accent",
        action: "STATUTORY_REGISTERED",
        detail: `NAPSA (${emp.napsaNo}), NHIMA (${emp.nhimaNo}) and ZRA TPIN (${emp.zraTpin}) registered against the statutory ledger.`,
        result: "AUTHORIZED",
        resultColor: "#34d399",
      },
      {
        timestamp: `${emp.joinDate} · 09:00`,
        badge: "badge-primary",
        action: "RECORD_CREATED",
        detail: `Employee master record for ${emp.firstName} ${emp.lastName} (${emp.id}) created by Mutale Kangwa (HR Manager).`,
        result: "AUTHORIZED",
        resultColor: "#34d399",
      },
    );

    return entries;
  }

  let auditEntries = $derived(buildEmployeeAuditLog(auditEmployee));

  function openAuditTrail(emp) {
    auditEmployee = emp;
    isAuditModalOpen = true;
    logAudit(
      "VIEW_AUDIT_TRAIL",
      "badge-primary",
      `${cyberguard.currentUser.name} opened the audit trail for ${emp.firstName} ${emp.lastName} (${emp.id}).`,
    );
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Employee Master Records</title>
</svelte:head>

<Topbar full />

<main class="page-container">
  <div class="page-header">
    <div class="header-title-area">
      <h2>Employee Master Records & Organizational Hierarchy</h2>
      <p>
        Comprehensive personnel registry mapping identity, reporting lines, cost
        centers, lifecycle, and statutory identifiers
      </p>
    </div>
    <div class="header-actions">
      <button class="btn btn-secondary" onclick={exportCSV}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          /></svg
        >
        Export Registry (CSV)
      </button>
      <button class="btn btn-primary" onclick={() => (isNewModalOpen = true)}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          /></svg
        >
        Create Record
      </button>
    </div>
  </div>

  <!-- Filter & Search Toolbar -->
  <div class="card" style="margin-bottom: 20px;">
    <div
      class="filter-bar"
      style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;"
    >
      <div
        class="filter-group"
        style="display: flex; flex-wrap: wrap; gap: 10px;"
      >
        <select
          class="form-control"
          bind:value={deptFilter}
          style="width: 200px;"
        >
          <option value="">All Departments</option>
          <option value="Executive">Executive Office</option>
          <option value="Security Operations - North"
            >Operations – North (Copperbelt/North-West)</option
          >
          <option value="Security Operations - South"
            >Operations – South (Lusaka/Southern)</option
          >
          <option value="Human Resources">Human Resources</option>
          <option value="Administration & Facilities">Administration</option>
        </select>

        <select
          class="form-control"
          bind:value={roleFilter}
          style="width: 210px;"
        >
          <option value="">All Hierarchy Ranks</option>
          <option value="Managing Director">Managing Director</option>
          <option value="Director Operations">Director Operations</option>
          <option value="Director Admin">Director Admin</option>
          <option value="Regional Security Manager – North"
            >Reg. Sec. Manager – North</option
          >
          <option value="Regional Security Manager - South"
            >Reg. Sec. Manager – South</option
          >
          <option value="Human Resource Manager">Human Resource Manager</option>
          <option value="Area Manager">Area Manager</option>
          <option value="Shift Coordinator">Shift Coordinator</option>
          <option value="Site Coordinators">Site Coordinators</option>
          <option value="Site Supervisor">Site Supervisor</option>
          <option value="Guards">Guards</option>
        </select>

        <select
          class="form-control"
          bind:value={statusFilter}
          style="width: 170px;"
        >
          <option value="">All Lifecycles</option>
          <option value="Permanent">Permanent</option>
          <option value="Fixed">Fixed Contract</option>
          <option value="Probation">Probationary</option>
          <option value="Rehired">Rehire History</option>
        </select>

        <input
          type="text"
          class="form-control"
          placeholder="Filter by name, NRC, or TPIN..."
          bind:value={globalSearch}
          style="width: 220px;"
        />
      </div>

      <div style="font-size: 0.8rem; color: var(--text-muted);">
        Displaying <strong style="color: var(--text-main);"
          >{filteredEmployees.length}</strong
        > Personnel Records
      </div>
    </div>

    <!-- Master Records Table -->
    <div class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Personnel & National ID</th>
            <th>Job Title & Grade Level</th>
            <th>Department & Cost Center</th>
            <th>Reporting Line</th>
            <th>Region / Station</th>
            <th>Lifecycle & Contract</th>
            <th>Statutory (NAPSA/NHIMA/ZRA)</th>
            <th style="text-align: right;">Dossier Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each pagedEmployees as emp (emp.id)}
            <tr>
              <td>
                <div class="user-cell">
                  <EmployeeAvatar {emp} variant="cell" />
                  <div>
                    <div class="user-cell-name">
                      {emp.firstName}
                      {emp.lastName}
                    </div>
                    <div class="user-cell-sub">
                      ID: {emp.id} • NRC: {emp.nationalId}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div style="font-weight: 600; color: #fff;">{emp.jobTitle}</div>
                <div
                  style="display: flex; align-items: center; gap: 6px; margin-top: 2px;"
                >
                  <span style="font-size: 0.72rem; color: var(--accent-cyan);"
                    >{emp.gradeLevel}</span
                  >
                  <a
                    href="/employee-profile?id={emp.id}&tab=qualifications"
                    class="badge badge-secondary"
                    style="font-size: 0.68rem; padding: 1px 6px; text-decoration: none;"
                    title="View Qualifications Tab"
                  >
                    🎓 {(emp.qualifications || []).length} Quals
                  </a>
                </div>
              </td>
              <td>
                <div>{emp.department}</div>
                <div style="font-size: 0.72rem; color: var(--text-dim);">
                  {emp.costCenter}
                </div>
              </td>
              <td>
                <div style="font-size: 0.8rem; color: #93c5fd;">
                  {emp.reportingTo}
                </div>
              </td>
              <td>
                <div style="font-size: 0.8rem;">{emp.region}</div>
                <div style="font-size: 0.72rem; color: var(--text-dim);">
                  {emp.siteAssigned}
                </div>
              </td>
              <td>
                {#if emp.contractType.includes("Probation")}
                  <span class="badge badge-warning"
                    ><span class="badge-dot"></span> {emp.contractType}</span
                  >
                {:else if emp.rehireHistory.includes("Rehired")}
                  <span class="badge badge-accent"
                    ><span class="badge-dot"></span> Rehired Record</span
                  >
                {:else}
                  <span class="badge badge-primary">{emp.contractType}</span>
                {/if}
                <div
                  style="font-size: 0.7rem; color: var(--text-dim); margin-top: 3px;"
                >
                  Probation: {emp.probationStatus}
                </div>
              </td>
              <td>
                <div style="font-size: 0.72rem; line-height: 1.4;">
                  <div><strong>NAPSA:</strong> {emp.napsaNo}</div>
                  <div><strong>NHIMA:</strong> {emp.nhimaNo}</div>
                  <div><strong>TPIN:</strong> {emp.zraTpin}</div>
                </div>
              </td>
              <td style="text-align: right;">
                <div
                  style="display: flex; justify-content: flex-end; gap: 6px;"
                >
                  <a
                    href="/employee-profile?id={emp.id}"
                    class="btn btn-secondary btn-sm"
                    title="View 360 Master Dossier"
                  >
                    Dossier
                  </a>
                  <button
                    class="btn btn-secondary btn-sm"
                    onclick={() => openAuditTrail(emp)}
                    title="Audit Trail"
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      /></svg
                    >
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <Pagination
      bind:currentPage
      totalItems={filteredEmployees.length}
      {pageSize}
    />
  </div>
</main>

<!-- MODAL: ADD NEW EMPLOYEE MASTER RECORD -->
{#if isNewModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 900px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Define Employee Master Record</div>
          <div
            style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;"
          >
            Input required identity, organizational hierarchy, lifecycle, and
            statutory data fields
          </div>
        </div>
        <button class="modal-close" onclick={() => (isNewModalOpen = false)}
          >&times;</button
        >
      </div>

      <!-- Modal Tabs Navigation -->
      <div class="tabs-header">
        <button
          class="tab-btn"
          class:active={activeModalTab === "tab-personal"}
          onclick={() => (activeModalTab = "tab-personal")}
        >
          1. Personal & Identity
        </button>
        <button
          class="tab-btn"
          class:active={activeModalTab === "tab-org"}
          onclick={() => (activeModalTab = "tab-org")}
        >
          2. Job & Org Structure
        </button>
        <button
          class="tab-btn"
          class:active={activeModalTab === "tab-lifecycle"}
          onclick={() => (activeModalTab = "tab-lifecycle")}
        >
          3. Status & Lifecycle
        </button>
        <button
          class="tab-btn"
          class:active={activeModalTab === "tab-statutory"}
          onclick={() => (activeModalTab = "tab-statutory")}
        >
          4. Statutory & Compensation
        </button>
      </div>

      <form onsubmit={handleCreateEmployee}>
        <div class="modal-body">
          <!-- TAB 1: PERSONAL & IDENTITY -->
          {#if activeModalTab === "tab-personal"}
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="inpFirstName"
                  >First Name <span class="req">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="inpFirstName"
                  bind:value={firstName}
                  placeholder="e.g. Chanda"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpLastName"
                  >Last Name <span class="req">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="inpLastName"
                  bind:value={lastName}
                  placeholder="e.g. Mumba"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpNationalId"
                  >National ID / Passport Number <span class="req">*</span
                  ></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="inpNationalId"
                  bind:value={nationalId}
                  placeholder="e.g. 391820/11/1 (NRC) or Passport"
                  required
                />
                <div class="form-hint">
                  Zambian NRC format: 6 digits / 2 digits / 1 digit
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="inpDob"
                  >Date of Birth <span class="req">*</span></label
                >
                <input
                  type="date"
                  class="form-control"
                  id="inpDob"
                  bind:value={dob}
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpGender"
                  >Gender <span class="req">*</span></label
                >
                <select
                  class="form-control"
                  id="inpGender"
                  bind:value={gender}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="inpPhone"
                  >Contact Phone <span class="req">*</span></label
                >
                <input
                  type="tel"
                  class="form-control"
                  id="inpPhone"
                  bind:value={phone}
                  placeholder="+260 97X XXX XXX"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpEmail">Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  id="inpEmail"
                  bind:value={email}
                  placeholder="employee@CyberGuard.zm"
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpNextOfKinName"
                  >Next of Kin Full Name & Relationship <span class="req"
                    >*</span
                  ></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="inpNextOfKinName"
                  bind:value={nextOfKinName}
                  placeholder="e.g. Mary Mumba (Spouse)"
                  required
                />
              </div>
              <div class="form-group" style="grid-column: 1 / -1;">
                <label class="form-label" for="inpNextOfKinContact"
                  >Next of Kin Contact Phone & Emergency Address <span
                    class="req">*</span
                  ></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="inpNextOfKinContact"
                  bind:value={nextOfKinContact}
                  placeholder="+260 96X XXX XXX • Plot 14, Kitwe Central"
                  required
                />
              </div>
            </div>
          {/if}

          <!-- TAB 2: JOB & ORG STRUCTURE -->
          {#if activeModalTab === "tab-org"}
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="inpJobTitle"
                  >Job Title / Designated Role <span class="req">*</span></label
                >
                <select
                  class="form-control"
                  id="inpJobTitle"
                  bind:value={jobTitle}
                  required
                >
                  <option value="Managing Director">Managing Director</option>
                  <option value="Director Operations"
                    >Director Operations</option
                  >
                  <option value="Director Admin">Director Admin</option>
                  <option value="Regional Security Manager – North"
                    >Regional Security Manager – North</option
                  >
                  <option value="Regional Security Manager - South"
                    >Regional Security Manager - South</option
                  >
                  <option value="Human Resource Manager">Human Resource</option>
                  <option value="Area Manager">Area Manager</option>
                  <option value="Shift Coordinator">Shift Coordinator</option>
                  <option value="Site Coordinators">Site Coordinators</option>
                  <option value="Site Supervisor">Site Supervisor</option>
                  <option value="Guards">Guards</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="inpGradeLevel"
                  >Hierarchy Grade Level <span class="req">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="inpGradeLevel"
                  value={gradeLevel}
                  readonly
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpDepartment"
                  >Department <span class="req">*</span></label
                >
                <select
                  class="form-control"
                  id="inpDepartment"
                  bind:value={department}
                  required
                >
                  <option value="Security Operations - North"
                    >Security Operations - North</option
                  >
                  <option value="Security Operations - South"
                    >Security Operations - South</option
                  >
                  <option value="Human Resources">Human Resources</option>
                  <option value="Administration & Facilities"
                    >Administration & Facilities</option
                  >
                  <option value="Executive">Executive Office</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="inpCostCenter"
                  >Cost Center Code <span class="req">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="inpCostCenter"
                  bind:value={costCenter}
                  placeholder="e.g. CC-218-GUARD-CB"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpReportingTo"
                  >Reporting Line (Direct Manager) <span class="req">*</span
                  ></label
                >
                <select
                  class="form-control"
                  id="inpReportingTo"
                  bind:value={reportingTo}
                  required
                >
                  <option value="Board of Directors">Board of Directors</option>
                  <option value="Managing Director"
                    >Managing Director (Dr. Mwamba Kapwepwe)</option
                  >
                  <option value="Director Operations"
                    >Director Operations (Lt. Col. P. Banda)</option
                  >
                  <option value="Regional Security Manager – North"
                    >Reg. Sec. Mgr – North (Kennedy Tembo)</option
                  >
                  <option value="Regional Security Manager - South"
                    >Reg. Sec. Mgr – South (Grace Mwanza)</option
                  >
                  <option value="Area Manager"
                    >Area Manager (Joseph Phiri)</option
                  >
                  <option value="Shift Coordinator"
                    >Shift Coordinator (David Lungu)</option
                  >
                  <option value="Site Coordinators"
                    >Site Coordinators (Mary Chilufya)</option
                  >
                  <option value="Site Supervisor"
                    >Site Supervisor (Brian Bwalya)</option
                  >
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="inpSiteAssigned"
                  >Assigned Site / Hub Station <span class="req">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="inpSiteAssigned"
                  bind:value={siteAssigned}
                  placeholder="e.g. Kansanshi Mine Gate 1"
                  required
                />
              </div>
            </div>
          {/if}

          <!-- TAB 3: STATUS & LIFECYCLE -->
          {#if activeModalTab === "tab-lifecycle"}
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="inpContractType"
                  >Employment Type <span class="req">*</span></label
                >
                <select
                  class="form-control"
                  id="inpContractType"
                  bind:value={contractType}
                  required
                >
                  <option value="Fixed Contract (1 Year)"
                    >Fixed Contract (1 Year)</option
                  >
                  <option value="Fixed Contract (2 Years)"
                    >Fixed Contract (2 Years)</option
                  >
                  <option value="Permanent">Permanent</option>
                  <option value="Probation (3 Months)"
                    >Probation (3 Months)</option
                  >
                  <option value="Probation (6 Months)"
                    >Probation (6 Months)</option
                  >
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="inpProbationMonths"
                  >Probation Period Duration <span class="req">*</span></label
                >
                <select
                  class="form-control"
                  id="inpProbationMonths"
                  bind:value={probationMonths}
                  required
                >
                  <option value="3">3 Months (Standard Operative/Guard)</option>
                  <option value="6">6 Months (Supervisory & Executive)</option>
                  <option value="0">Exempt (Prior Service Completed)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="inpProbationStatus"
                  >Probation Status</label
                >
                <select
                  class="form-control"
                  id="inpProbationStatus"
                  bind:value={probationStatus}
                >
                  <option value="Active (In Progress)"
                    >Active (In Progress)</option
                  >
                  <option value="Completed">Completed & Confirmed</option>
                  <option value="Extended">Extended (Under Review)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="inpRehireHistory"
                  >Rehire History Status <span class="req">*</span></label
                >
                <select
                  class="form-control"
                  id="inpRehireHistory"
                  bind:value={rehireHistory}
                  required
                >
                  <option value="No (First Appointment)"
                    >No (First Appointment)</option
                  >
                  <option
                    value="Rehired (Previous service 2021-2023, Honorable Exit)"
                    >Rehired (Honorable Exit Verified)</option
                  >
                  <option
                    value="Rehired (Ex-Defence / Police Clearance Verified)"
                    >Rehired (External Security Vetting)</option
                  >
                </select>
              </div>
              <div class="form-group" style="grid-column: 1 / -1;">
                <label class="form-label" for="inpTerminationRules"
                  >Termination & Notice Period Rules</label
                >
                <textarea
                  class="form-control"
                  id="inpTerminationRules"
                  bind:value={terminationRules}
                  rows="2"
                  placeholder="e.g. Standard 30 days written notice during permanent status; 14 days during probation. Immediate dismissal for gross insubordination, weapon violation, or site abandonment."
                ></textarea>
              </div>
            </div>
          {/if}

          <!-- TAB 4: STATUTORY & COMPENSATION -->
          {#if activeModalTab === "tab-statutory"}
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="inpNapsa"
                  >NAPSA Social Security No <span class="req">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="inpNapsa"
                  bind:value={napsaNo}
                  placeholder="e.g. NAP-0928374"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpNhima"
                  >NHIMA Health Insurance No <span class="req">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="inpNhima"
                  bind:value={nhimaNo}
                  placeholder="e.g. NHI-5019283"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpTpin"
                  >ZRA Taxpayer TPIN <span class="req">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="inpTpin"
                  bind:value={zraTpin}
                  placeholder="10-digit ZRA TPIN (e.g. 1012938472)"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpBasePay"
                  >Base Monthly Salary (ZMW) <span class="req">*</span></label
                >
                <input
                  type="number"
                  class="form-control"
                  id="inpBasePay"
                  bind:value={basePay}
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpHousing"
                  >Housing Allowance (ZMW)</label
                >
                <input
                  type="number"
                  class="form-control"
                  id="inpHousing"
                  bind:value={housingAllowance}
                  placeholder="e.g. 1000"
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpTransport"
                  >Transport Allowance (ZMW)</label
                >
                <input
                  type="number"
                  class="form-control"
                  id="inpTransport"
                  bind:value={transportAllowance}
                  placeholder="e.g. 800"
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="inpBank"
                  >Designated Bank & Branch <span class="req">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="inpBank"
                  bind:value={bankName}
                  placeholder="e.g. ZANACO Kitwe Branch"
                  required
                />
              </div>
            </div>
          {/if}
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            onclick={() => (isNewModalOpen = false)}>Cancel</button
          >
          <button type="submit" class="btn btn-primary">
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
                d="M5 13l4 4L19 7"
              /></svg
            >
            Save & Publish
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: EMPLOYEE AUDIT TRAIL -->
{#if isAuditModalOpen && auditEmployee}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 720px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">
            Audit Trail — {auditEmployee.firstName} {auditEmployee.lastName}
          </div>
          <div
            style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;"
          >
            ID: {auditEmployee.id} • {auditEmployee.jobTitle} • {auditEmployee.department}
          </div>
        </div>
        <button
          class="modal-close"
          onclick={() => (isAuditModalOpen = false)}>&times;</button
        >
      </div>

      <div class="modal-body">
        <div class="card-subtitle" style="margin-bottom: 10px;">
          Immutable record of access, edits, and verification events for this
          employee's master record
        </div>
        {#each auditEntries as entry, i (i)}
          <div class="audit-entry">
            <span class="timestamp">{entry.timestamp}</span>
            <span class="badge {entry.badge}">{entry.action}</span>
            <div style="flex: 1;">{entry.detail}</div>
            <span
              style="color: {entry.resultColor}; font-size: 0.72rem; font-weight: 700;"
              >{entry.result}</span
            >
          </div>
        {/each}
      </div>

      <div class="modal-footer">
        <button
          class="btn btn-secondary"
          onclick={() => (isAuditModalOpen = false)}>Close</button
        >
      </div>
    </div>
  </div>
{/if}

<style>
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
