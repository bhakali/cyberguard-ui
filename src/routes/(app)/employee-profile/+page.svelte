<script>
  import { page } from '$app/state';
  import { cyberguard, formatZMW } from '$lib/cyberguard.svelte.js';
  import { can } from '$lib/rbac.js';
  import DocumentsPanel from '$lib/components/DocumentsPanel.svelte';
  import EmployeeAvatar from '$lib/components/EmployeeAvatar.svelte';
  import EmployeeIdCardModal from '$lib/components/EmployeeIdCardModal.svelte';

  // Read URL query params
  let empId = $derived(page.url.searchParams.get('id') || 'CG-00111');
  let currentTab = $state('tab-overview');

  $effect(() => {
    const tabParam = page.url.searchParams.get('tab');
    if (tabParam === 'qualifications') {
      currentTab = 'tab-qualifications';
    }
  });

  let emp = $derived(
    cyberguard.employees.find(e => e.id === empId) || cyberguard.employees[10] || cyberguard.employees[0]
  );

  let qualifications = $derived(emp ? (emp.qualifications || []) : []);

  // Filter chips in qualifications tab
  let activeCategoryFilter = $state('ALL');

  let filteredQuals = $derived(
    qualifications.filter(q => {
      if (activeCategoryFilter === 'ALL') return true;
      return q.category === activeCategoryFilter;
    })
  );

  // Modals state
  let isAddQualModalOpen = $state(false);
  let isViewCertModalOpen = $state(false);
  let activeCert = $state(null);

  // New Qualification Form Fields
  let newQualCategory = $state('Academic Degree');
  let newQualName = $state('');
  let newQualInstitution = $state('');
  let newQualCountry = $state('Zambia');
  let newQualField = $state('');
  let newQualStart = $state('2020');
  let newQualEnd = $state('2023');
  let newQualGrade = $state('Pass with Merit');
  let newQualCertNo = $state('');
  let newQualExpiry = $state('');
  let newQualStatus = $state('Verified & Sighted');
  let newQualNotes = $state('');

  function handleAddQualSubmit(e) {
    e.preventDefault();
    if (!newQualName || !newQualInstitution) {
      cyberguard.showToast('Please provide Qualification Title and Institution', 'danger');
      return;
    }

    const created = cyberguard.addQualification(emp.id, {
      category: newQualCategory,
      qualificationName: newQualName,
      institution: newQualInstitution,
      country: newQualCountry,
      fieldOfStudy: newQualField,
      yearStart: newQualStart,
      yearEnd: newQualEnd,
      grade: newQualGrade,
      certificateNo: newQualCertNo || `CERT-${Date.now().toString().slice(-6)}`,
      expiryDate: newQualExpiry,
      verificationStatus: newQualStatus,
      notes: newQualNotes || 'Certified copy archived in employee physical and digital dossier.'
    });

    isAddQualModalOpen = false;
    cyberguard.showToast(`Qualification "${created.qualificationName}" added and validated.`, 'success');
    // Reset form
    newQualName = '';
    newQualInstitution = '';
    newQualField = '';
    newQualCertNo = '';
    newQualExpiry = '';
    newQualNotes = '';
  }

  function viewCertificate(qual) {
    activeCert = qual;
    isViewCertModalOpen = true;
  }

  function deleteQual(qualId) {
    if (confirm('Are you sure you want to remove this verified qualification record?')) {
      cyberguard.deleteQualification(emp.id, qualId);
      cyberguard.showToast('Qualification removed from master dossier.', 'info');
    }
  }

  // Edit modals state
  let isEditPersonalOpen = $state(false);
  let isEditJobOpen = $state(false);
  let isEditLifecycleOpen = $state(false);
  let isEditStatutoryOpen = $state(false);
  let isEditSecurityOpen = $state(false);

  // Edit form fields - Personal & Identity
  let editFirstName = $state('');
  let editLastName = $state('');
  let editNationalId = $state('');
  let editDob = $state('');
  let editGender = $state('Male');
  let editPhone = $state('');
  let editEmail = $state('');
  let editAddress = $state('');
  let editNextOfKin = $state('');

  function openEditPersonal() {
    editFirstName = emp.firstName;
    editLastName = emp.lastName;
    editNationalId = emp.nationalId;
    editDob = emp.dob;
    editGender = emp.gender;
    editPhone = emp.phone;
    editEmail = emp.email;
    editAddress = emp.address;
    editNextOfKin = emp.nextOfKin;
    isEditPersonalOpen = true;
  }

  function saveEditPersonal(e) {
    e.preventDefault();
    cyberguard.updateEmployee(emp.id, {
      firstName: editFirstName,
      lastName: editLastName,
      nationalId: editNationalId,
      dob: editDob,
      gender: editGender,
      phone: editPhone,
      email: editEmail,
      address: editAddress,
      nextOfKin: editNextOfKin
    });
    isEditPersonalOpen = false;
  }

  // Edit form fields - Job & Org Structure
  let editJobTitle = $state('');
  let editGradeLevel = $state('');
  let editDepartment = $state('');
  let editCostCenter = $state('');
  let editReportingTo = $state('');
  let editSiteAssigned = $state('');
  let editRegion = $state('');

  function openEditJob() {
    editJobTitle = emp.jobTitle;
    editGradeLevel = emp.gradeLevel;
    editDepartment = emp.department;
    editCostCenter = emp.costCenter;
    editReportingTo = emp.reportingTo;
    editSiteAssigned = emp.siteAssigned;
    editRegion = emp.region;
    isEditJobOpen = true;
  }

  function saveEditJob(e) {
    e.preventDefault();
    cyberguard.updateEmployee(emp.id, {
      jobTitle: editJobTitle,
      gradeLevel: editGradeLevel,
      department: editDepartment,
      costCenter: editCostCenter,
      reportingTo: editReportingTo,
      siteAssigned: editSiteAssigned,
      region: editRegion
    });
    isEditJobOpen = false;
  }

  // Edit form fields - Employment Lifecycle & Rehire
  let editContractType = $state('');
  let editJoinDate = $state('');
  let editProbationMonths = $state('3');
  let editProbationStatus = $state('');
  let editRehireHistory = $state('');

  function openEditLifecycle() {
    editContractType = emp.contractType;
    editJoinDate = emp.joinDate;
    editProbationMonths = String(emp.probationMonths);
    editProbationStatus = emp.probationStatus;
    editRehireHistory = emp.rehireHistory;
    isEditLifecycleOpen = true;
  }

  function saveEditLifecycle(e) {
    e.preventDefault();
    cyberguard.updateEmployee(emp.id, {
      contractType: editContractType,
      joinDate: editJoinDate,
      probationMonths: parseInt(editProbationMonths) || 0,
      probationStatus: editProbationStatus,
      rehireHistory: editRehireHistory
    });
    isEditLifecycleOpen = false;
  }

  // Edit form fields - Statutory, Tax & Pay
  let editZraTpin = $state('');
  let editNapsaNo = $state('');
  let editNhimaNo = $state('');
  let editBankName = $state('');
  let editBasePay = $state(0);
  let editHousingAllowance = $state(0);
  let editTransportAllowance = $state(0);
  let editDangerPay = $state(0);

  function openEditStatutory() {
    editZraTpin = emp.zraTpin;
    editNapsaNo = emp.napsaNo;
    editNhimaNo = emp.nhimaNo;
    editBankName = emp.bankName;
    editBasePay = emp.basePay;
    editHousingAllowance = emp.housingAllowance;
    editTransportAllowance = emp.transportAllowance;
    editDangerPay = emp.dangerPay || 0;
    isEditStatutoryOpen = true;
  }

  function saveEditStatutory(e) {
    e.preventDefault();
    const basePay = Number(editBasePay);
    const housingAllowance = Number(editHousingAllowance);
    const transportAllowance = Number(editTransportAllowance);
    cyberguard.updateEmployee(emp.id, {
      zraTpin: editZraTpin,
      napsaNo: editNapsaNo,
      nhimaNo: editNhimaNo,
      bankName: editBankName,
      basePay,
      housingAllowance,
      transportAllowance,
      dangerPay: Number(editDangerPay),
      salaryGross: basePay + housingAllowance + transportAllowance
    });
    isEditStatutoryOpen = false;
  }

  // Edit form fields - Deployment & Security Clearance
  let editShiftPattern = $state('');
  let editDeploymentSite = $state('');

  function openEditSecurity() {
    editShiftPattern = emp.shiftPattern;
    editDeploymentSite = emp.siteAssigned;
    isEditSecurityOpen = true;
  }

  function saveEditSecurity(e) {
    e.preventDefault();
    cyberguard.updateEmployee(emp.id, {
      shiftPattern: editShiftPattern,
      siteAssigned: editDeploymentSite
    });
    isEditSecurityOpen = false;
  }

  function printDossier() {
    cyberguard.showToast('Employee Master Dossier exported as encrypted PDF.', 'success');
  }

  let isIdCardOpen = $state(false);

  function handlePhotoUpload(dataUrl) {
    cyberguard.updateEmployee(emp.id, { photoUrl: dataUrl });
  }

  function getCategoryTagClass(cat) {
    if (cat.includes('Academic')) return 'tag-academic';
    if (cat.includes('Professional')) return 'tag-professional';
    if (cat.includes('Tactical')) return 'tag-tactical';
    if (cat.includes('Statutory') || cat.includes('Firearm')) return 'tag-statutory';
    if (cat.includes('Health') || cat.includes('Medical')) return 'tag-health';
    if (cat.includes('Secondary')) return 'tag-secondary';
    if (cat.includes('Technical') || cat.includes('TEVETA')) return 'tag-technical';
    return 'tag-academic';
  }
</script>

<svelte:head>
  <title>CyberGuard Security | 360 Master Dossier - {emp ? emp.firstName + ' ' + emp.lastName : 'Personnel'}</title>
</svelte:head>

<header class="topbar">
  <div class="topbar-left">
    <a href="/employees" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px;">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
      Back to Registry
    </a>
  </div>
  <div class="topbar-right">
    <button class="btn btn-secondary btn-sm" onclick={printDossier}>
      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
      Print Dossier
    </button>
    <a href="/payroll" class="btn btn-primary btn-sm">
      View Current Payslip
    </a>
  </div>
</header>

<main class="page-container">

  {#if emp}
    <!-- Hero Dossier Header -->
    <div class="profile-hero">
      <div class="profile-hero-left">
        <EmployeeAvatar {emp} variant="hero" editable={true} onUpload={handlePhotoUpload} />
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px; flex-wrap: wrap;">
            <h1 style="font-size: 1.6rem; font-weight: 800; color: #fff;">{emp.firstName} {emp.lastName}</h1>
            <span class="badge badge-success"><span class="badge-dot"></span> {emp.status || 'Active Service'}</span>
            <span class="badge badge-primary">{emp.contractType}</span>
            <button class="btn btn-secondary btn-sm" onclick={() => (isIdCardOpen = true)}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 15a2 2 0 100-4 2 2 0 000 4zM13 9h5M13 13h5"/></svg>
              View Employee ID
            </button>
          </div>
          <div style="font-size: 0.92rem; color: var(--accent-cyan); font-weight: 600;">
            {emp.jobTitle} • {emp.gradeLevel}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
            ID: {emp.id} • National ID (NRC): {emp.nationalId} • Station: {emp.siteAssigned}
          </div>
        </div>
      </div>

      <div style="text-align: right;">
        <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Direct Reporting Manager</div>
        <div style="font-size: 0.95rem; font-weight: 700; color: #93c5fd;">{emp.reportingTo}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Cost Center: {emp.costCenter}</div>
      </div>
    </div>

    <!-- Dossier Tabs Container -->
    <div class="card tabs-container">
      <div class="tabs-header">
        <button class="tab-btn" class:active={currentTab === 'tab-overview'} onclick={() => currentTab = 'tab-overview'}>1. Personal & Identity Data</button>
        <button class="tab-btn" class:active={currentTab === 'tab-job'} onclick={() => currentTab = 'tab-job'}>2. Job & Organizational Structure</button>
        <button class="tab-btn" class:active={currentTab === 'tab-lifecycle'} onclick={() => currentTab = 'tab-lifecycle'}>3. Employment Lifecycle & Rehire</button>
        <button class="tab-btn" class:active={currentTab === 'tab-statutory'} onclick={() => currentTab = 'tab-statutory'}>4. Statutory, Tax & Pay</button>
        <button class="tab-btn" class:active={currentTab === 'tab-security'} onclick={() => currentTab = 'tab-security'}>5. Deployment & Security Clearance</button>
        <button class="tab-btn" class:active={currentTab === 'tab-qualifications'} onclick={() => currentTab = 'tab-qualifications'}>
          6. Qualifications & Certifications
          <span class="badge badge-primary" style="margin-left: 6px; padding: 2px 7px; font-size: 0.72rem; border-radius: 9999px;">{qualifications.length}</span>
        </button>
        <button class="tab-btn" class:active={currentTab === 'tab-documents'} onclick={() => currentTab = 'tab-documents'}>
          7. Documents & Files
        </button>
      </div>

      <div class="card-body">
        
        <!-- TAB 1: PERSONAL & IDENTITY -->
        {#if currentTab === 'tab-overview'}
          <div>
            <div class="dossier-section-header">
              <h3>Personal Identity & Next of Kin Verification</h3>
              <button class="btn btn-secondary btn-sm" onclick={openEditPersonal} disabled={!can(cyberguard.activeRoleId, 'canApprove')} title={can(cyberguard.activeRoleId, 'canApprove') ? 'Edit Personal & Identity Data' : 'Your current role cannot edit personnel records'}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
            </div>
            <div class="dossier-grid">
              <div class="dossier-field">
                <div class="dossier-label">Full Legal Names</div>
                <div class="dossier-val">{emp.firstName} {emp.lastName}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">National Registration Card (NRC) / Passport</div>
                <div class="dossier-val">{emp.nationalId}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Date of Birth & Age</div>
                <div class="dossier-val">{emp.dob}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Gender</div>
                <div class="dossier-val">{emp.gender}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Primary Mobile Phone</div>
                <div class="dossier-val">{emp.phone}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Corporate / Personal Email</div>
                <div class="dossier-val">{emp.email}</div>
              </div>
              <div class="dossier-field" style="grid-column: 1 / -1;">
                <div class="dossier-label">Physical Residential Address</div>
                <div class="dossier-val">{emp.address}</div>
              </div>
              <div class="dossier-field" style="grid-column: 1 / -1;">
                <div class="dossier-label">Next of Kin & Emergency Contact Line</div>
                <div class="dossier-val">{emp.nextOfKin}</div>
              </div>
            </div>
          </div>
        {/if}

        <!-- TAB 2: JOB & ORG STRUCTURE -->
        {#if currentTab === 'tab-job'}
          <div>
            <div class="dossier-section-header">
              <h3>Hierarchy Alignment & Assigned Cost Center</h3>
              <button class="btn btn-secondary btn-sm" onclick={openEditJob} disabled={!can(cyberguard.activeRoleId, 'canApprove')} title={can(cyberguard.activeRoleId, 'canApprove') ? 'Edit Job & Organizational Structure' : 'Your current role cannot edit personnel records'}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
            </div>
            <div class="dossier-grid">
              <div class="dossier-field">
                <div class="dossier-label">Job Title / Functional Designation</div>
                <div class="dossier-val">{emp.jobTitle}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Hierarchy Grade Level</div>
                <div class="dossier-val">{emp.gradeLevel}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Operating Department</div>
                <div class="dossier-val">{emp.department}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Financial Cost Center</div>
                <div class="dossier-val">{emp.costCenter}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Direct Line Manager</div>
                <div class="dossier-val">{emp.reportingTo}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Assigned Deployment Hub</div>
                <div class="dossier-val">{emp.siteAssigned} ({emp.region})</div>
              </div>
            </div>
          </div>
        {/if}

        <!-- TAB 3: LIFECYCLE & REHIRE -->
        {#if currentTab === 'tab-lifecycle'}
          <div>
            <div class="dossier-section-header">
              <h3>Employment Lifecycle & Vetting Records</h3>
              <button class="btn btn-secondary btn-sm" onclick={openEditLifecycle} disabled={!can(cyberguard.activeRoleId, 'canApprove')} title={can(cyberguard.activeRoleId, 'canApprove') ? 'Edit Employment Lifecycle & Rehire' : 'Your current role cannot edit personnel records'}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
            </div>
            <div class="dossier-grid">
              <div class="dossier-field">
                <div class="dossier-label">Contract Type</div>
                <div class="dossier-val">{emp.contractType}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Date of Appointment</div>
                <div class="dossier-val">{emp.joinDate}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Probation Period Duration</div>
                <div class="dossier-val">{emp.probationMonths} Months ({emp.probationStatus})</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Rehire Eligibility History</div>
                <div class="dossier-val">{emp.rehireHistory}</div>
              </div>
            </div>
          </div>
        {/if}

        <!-- TAB 4: STATUTORY & PAY -->
        {#if currentTab === 'tab-statutory'}
          <div>
            <div class="dossier-section-header">
              <h3>Statutory Registration Identifiers & Compensation Structure</h3>
              <button class="btn btn-secondary btn-sm" onclick={openEditStatutory} disabled={!can(cyberguard.activeRoleId, 'canEditPay')} title={can(cyberguard.activeRoleId, 'canEditPay') ? 'Edit Statutory, Tax & Pay' : 'Your current role cannot edit pay or statutory data'}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
            </div>
            <div class="dossier-grid">
              <div class="dossier-field">
                <div class="dossier-label">ZRA Taxpayer TPIN</div>
                <div class="dossier-val">{emp.zraTpin} (e-Tax Reconciled)</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">NAPSA Social Security ID</div>
                <div class="dossier-val">{emp.napsaNo}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">NHIMA Health Insurance ID</div>
                <div class="dossier-val">{emp.nhimaNo}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Salary Remittance Bank</div>
                <div class="dossier-val">{emp.bankName}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Basic Base Pay (Monthly)</div>
                <div class="dossier-val" style="color: #34d399; font-weight: 700;">{formatZMW(emp.basePay)}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Housing Allowance</div>
                <div class="dossier-val">{formatZMW(emp.housingAllowance)}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Transport Allowance</div>
                <div class="dossier-val">{formatZMW(emp.transportAllowance)}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Hazard / Tactical Danger Pay</div>
                <div class="dossier-val">{formatZMW(emp.dangerPay || 0)}</div>
              </div>
            </div>
          </div>
        {/if}

        <!-- TAB 5: DEPLOYMENT & CLEARANCE -->
        {#if currentTab === 'tab-security'}
          <div>
            <div class="dossier-section-header">
              <h3>Tactical Post Assignment & Station Clearances</h3>
              <button class="btn btn-secondary btn-sm" onclick={openEditSecurity} disabled={!can(cyberguard.activeRoleId, 'canApprove')} title={can(cyberguard.activeRoleId, 'canApprove') ? 'Edit Deployment & Security Clearance' : 'Your current role cannot edit personnel records'}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
            </div>
            <div class="dossier-grid">
              <div class="dossier-field">
                <div class="dossier-label">Shift Schedule Pattern</div>
                <div class="dossier-val">{emp.shiftPattern}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Current Post Site</div>
                <div class="dossier-val">{emp.siteAssigned}</div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Police Criminal Record Vetting</div>
                <div class="dossier-val"><span class="badge badge-success">Clear & Sighted (CRB-ZPS-2024)</span></div>
              </div>
              <div class="dossier-field">
                <div class="dossier-label">Biometric Geofence Status</div>
                <div class="dossier-val"><span class="badge badge-success">Fingerprint Enrolled</span></div>
              </div>
            </div>
          </div>
        {/if}

        <!-- TAB 6: QUALIFICATIONS & CERTIFICATIONS -->
        {#if currentTab === 'tab-qualifications'}
          <div>
            <!-- Metrics Row -->
            <div class="qual-metrics-grid">
              <div class="qual-metric-card">
                <div class="qual-metric-icon">
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                </div>
                <div>
                  <div class="qual-metric-val">{qualifications.length}</div>
                  <div class="qual-metric-label">Total Documented Credentials</div>
                </div>
              </div>

              <div class="qual-metric-card">
                <div class="qual-metric-icon success">
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <div class="qual-metric-val">{qualifications.filter(q => q.verificationStatus === 'Verified & Sighted').length}</div>
                  <div class="qual-metric-label">HR Verified & Sighted</div>
                </div>
              </div>

              <div class="qual-metric-card">
                <div class="qual-metric-icon cyan">
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                </div>
                <div>
                  <div class="qual-metric-val">{qualifications.filter(q => q.expiryDate).length}</div>
                  <div class="qual-metric-label">Active Licenses / Permits</div>
                </div>
              </div>
            </div>

            <!-- Toolbar & Filter Chips -->
            <div class="qual-toolbar">
              <div class="qual-filter-chips">
                <button type="button" class="filter-chip" class:active={activeCategoryFilter === 'ALL'} onclick={() => activeCategoryFilter = 'ALL'}>
                  All ({qualifications.length})
                </button>
                <button type="button" class="filter-chip" class:active={activeCategoryFilter === 'Academic Degree'} onclick={() => activeCategoryFilter = 'Academic Degree'}>
                  Academic Degrees
                </button>
                <button type="button" class="filter-chip" class:active={activeCategoryFilter === 'Professional Accreditation & License'} onclick={() => activeCategoryFilter = 'Professional Accreditation & License'}>
                  Professional Accreditations
                </button>
                <button type="button" class="filter-chip" class:active={activeCategoryFilter === 'Tactical & Security Certification'} onclick={() => activeCategoryFilter = 'Tactical & Security Certification'}>
                  Tactical Security
                </button>
                <button type="button" class="filter-chip" class:active={activeCategoryFilter === 'Statutory & Firearms Competency'} onclick={() => activeCategoryFilter = 'Statutory & Firearms Competency'}>
                  Firearms Competencies
                </button>
                <button type="button" class="filter-chip" class:active={activeCategoryFilter === 'Health, Safety & Medical (HSE)'} onclick={() => activeCategoryFilter = 'Health, Safety & Medical (HSE)'}>
                  Health & Safety
                </button>
                <button type="button" class="filter-chip" class:active={activeCategoryFilter === 'Secondary Education'} onclick={() => activeCategoryFilter = 'Secondary Education'}>
                  Secondary Education
                </button>
              </div>

              <button class="btn btn-primary btn-sm" onclick={() => isAddQualModalOpen = true}>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                + Add Qualification Record
              </button>
            </div>

            <!-- Qualifications List Cards -->
            {#if filteredQuals.length === 0}
              <div style="text-align: center; padding: 40px; background: rgba(0,0,0,0.2); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg); color: var(--text-muted);">
                No qualifications found matching the selected filter.
              </div>
            {:else}
              {#each filteredQuals as qual (qual.id)}
                <div class="qual-card">
                  <div class="qual-card-header">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span class="qual-tag {getCategoryTagClass(qual.category)}">{qual.category}</span>
                        {#if qual.expiryDate}
                          <span class="badge badge-warning" style="font-size: 0.68rem;">Renewal: {qual.expiryDate}</span>
                        {/if}
                      </div>
                      <div class="qual-title">{qual.qualificationName}</div>
                      <div class="qual-institution">
                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        {qual.institution} ({qual.country})
                      </div>
                    </div>

                    <div style="display: flex; gap: 8px; align-items: center;">
                      <button class="btn btn-secondary btn-sm" onclick={() => viewCertificate(qual)}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        View Certificate
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick={() => deleteQual(qual.id)} title="Delete record" style="color: #ef4444;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>

                  <div class="qual-grid">
                    <div>
                      <div class="qual-grid-item-label">Field of Study / Scope</div>
                      <div class="qual-grid-item-val">{qual.fieldOfStudy || 'General / Foundational'}</div>
                    </div>
                    <div>
                      <div class="qual-grid-item-label">Award / Attainment Year</div>
                      <div class="qual-grid-item-val">{qual.yearStart ? qual.yearStart + ' – ' + qual.yearEnd : qual.yearEnd}</div>
                    </div>
                    <div>
                      <div class="qual-grid-item-label">Grade / Performance</div>
                      <div class="qual-grid-item-val">{qual.grade}</div>
                    </div>
                    <div>
                      <div class="qual-grid-item-label">Serial / Certificate Ref</div>
                      <div class="cert-mono-box">{qual.certificateNo}</div>
                    </div>
                  </div>

                  <div class="qual-footer">
                    <div class="qual-verified-note">
                      <span class="badge badge-success" style="font-size: 0.68rem;"><span class="badge-dot"></span> {qual.verificationStatus}</span>
                      <span>Verified by <strong>{qual.verifiedBy}</strong> on {qual.verificationDate}</span>
                    </div>
                    <div style="font-size: 0.74rem; color: var(--text-dim);">
                      Archived file: <em>{qual.documentRef}</em>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}

          </div>
        {/if}

        <!-- TAB 7: DOCUMENTS & FILES -->
        {#if currentTab === 'tab-documents'}
          <div>
            <h3 style="font-size: 1rem; margin-bottom: 4px; color: #93c5fd;">Employee Document Vault</h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px;">
              Scanned NRC, employment contract, and other records attached to this Master Record.
            </p>
            <DocumentsPanel recordType="employee" recordId={emp.id} />
          </div>
        {/if}

      </div>
    </div>
  {/if}

</main>

<!-- MODAL: EDIT PERSONAL & IDENTITY -->
{#if isEditPersonalOpen && emp}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 700px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Edit Personal & Identity Data</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            Personnel: {emp.firstName} {emp.lastName} ({emp.id})
          </div>
        </div>
        <button class="modal-close" onclick={() => isEditPersonalOpen = false}>&times;</button>
      </div>

      <form onsubmit={saveEditPersonal}>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" for="editFirstName">First Name <span class="req">*</span></label>
              <input type="text" class="form-control" id="editFirstName" bind:value={editFirstName} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editLastName">Last Name <span class="req">*</span></label>
              <input type="text" class="form-control" id="editLastName" bind:value={editLastName} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editNationalId">National ID (NRC) / Passport <span class="req">*</span></label>
              <input type="text" class="form-control" id="editNationalId" bind:value={editNationalId} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editDob">Date of Birth <span class="req">*</span></label>
              <input type="date" class="form-control" id="editDob" bind:value={editDob} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editGender">Gender <span class="req">*</span></label>
              <select class="form-control" id="editGender" bind:value={editGender} required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="editPhone">Primary Mobile Phone <span class="req">*</span></label>
              <input type="tel" class="form-control" id="editPhone" bind:value={editPhone} required>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="editEmail">Corporate / Personal Email</label>
              <input type="email" class="form-control" id="editEmail" bind:value={editEmail}>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="editAddress">Physical Residential Address <span class="req">*</span></label>
              <input type="text" class="form-control" id="editAddress" bind:value={editAddress} required>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="editNextOfKin">Next of Kin & Emergency Contact Line <span class="req">*</span></label>
              <input type="text" class="form-control" id="editNextOfKin" bind:value={editNextOfKin} required>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isEditPersonalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: EDIT JOB & ORG STRUCTURE -->
{#if isEditJobOpen && emp}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 700px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Edit Job & Organizational Structure</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            Personnel: {emp.firstName} {emp.lastName} ({emp.id})
          </div>
        </div>
        <button class="modal-close" onclick={() => isEditJobOpen = false}>&times;</button>
      </div>

      <form onsubmit={saveEditJob}>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" for="editJobTitle">Job Title / Functional Designation <span class="req">*</span></label>
              <select class="form-control" id="editJobTitle" bind:value={editJobTitle} required>
                <option value="Managing Director">Managing Director</option>
                <option value="Director Operations">Director Operations</option>
                <option value="Director Admin">Director Admin</option>
                <option value="Regional Security Manager – North">Regional Security Manager – North</option>
                <option value="Regional Security Manager - South">Regional Security Manager - South</option>
                <option value="Human Resource Manager">Human Resource Manager</option>
                <option value="Area Manager">Area Manager</option>
                <option value="Shift Coordinator">Shift Coordinator</option>
                <option value="Site Coordinators">Site Coordinators</option>
                <option value="Site Supervisor">Site Supervisor</option>
                <option value="Guards">Guards</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="editGradeLevel">Hierarchy Grade Level <span class="req">*</span></label>
              <input type="text" class="form-control" id="editGradeLevel" bind:value={editGradeLevel} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editDepartment">Operating Department <span class="req">*</span></label>
              <select class="form-control" id="editDepartment" bind:value={editDepartment} required>
                <option value="Security Operations - North">Security Operations - North</option>
                <option value="Security Operations - South">Security Operations - South</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Administration & Facilities">Administration & Facilities</option>
                <option value="Executive">Executive Office</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="editCostCenter">Financial Cost Center <span class="req">*</span></label>
              <input type="text" class="form-control" id="editCostCenter" bind:value={editCostCenter} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editReportingTo">Direct Line Manager <span class="req">*</span></label>
              <select class="form-control" id="editReportingTo" bind:value={editReportingTo} required>
                <option value="Board of Directors">Board of Directors</option>
                <option value="Managing Director">Managing Director (Dr. Mwamba Kapwepwe)</option>
                <option value="Director Operations">Director Operations (Lt. Col. P. Banda)</option>
                <option value="Regional Security Manager – North">Reg. Sec. Mgr – North (Kennedy Tembo)</option>
                <option value="Regional Security Manager - South">Reg. Sec. Mgr – South (Grace Mwanza)</option>
                <option value="Area Manager">Area Manager (Joseph Phiri)</option>
                <option value="Shift Coordinator">Shift Coordinator (David Lungu)</option>
                <option value="Site Coordinators">Site Coordinators (Mary Chilufya)</option>
                <option value="Site Supervisor">Site Supervisor (Brian Bwalya)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="editSiteAssigned">Assigned Deployment Hub <span class="req">*</span></label>
              <input type="text" class="form-control" id="editSiteAssigned" bind:value={editSiteAssigned} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editRegion">Region <span class="req">*</span></label>
              <input type="text" class="form-control" id="editRegion" bind:value={editRegion} required>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isEditJobOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: EDIT EMPLOYMENT LIFECYCLE & REHIRE -->
{#if isEditLifecycleOpen && emp}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 700px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Edit Employment Lifecycle & Rehire</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            Personnel: {emp.firstName} {emp.lastName} ({emp.id})
          </div>
        </div>
        <button class="modal-close" onclick={() => isEditLifecycleOpen = false}>&times;</button>
      </div>

      <form onsubmit={saveEditLifecycle}>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" for="editContractType">Contract Type <span class="req">*</span></label>
              <select class="form-control" id="editContractType" bind:value={editContractType} required>
                <option value="Fixed Contract (1 Year)">Fixed Contract (1 Year)</option>
                <option value="Fixed Contract (2 Years)">Fixed Contract (2 Years)</option>
                <option value="Permanent">Permanent</option>
                <option value="Probation (3 Months)">Probation (3 Months)</option>
                <option value="Probation (6 Months)">Probation (6 Months)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="editJoinDate">Date of Appointment <span class="req">*</span></label>
              <input type="date" class="form-control" id="editJoinDate" bind:value={editJoinDate} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editProbationMonths">Probation Period Duration <span class="req">*</span></label>
              <select class="form-control" id="editProbationMonths" bind:value={editProbationMonths} required>
                <option value="3">3 Months (Standard Operative/Guard)</option>
                <option value="6">6 Months (Supervisory & Executive)</option>
                <option value="0">Exempt (Prior Service Completed)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="editProbationStatus">Probation Status</label>
              <select class="form-control" id="editProbationStatus" bind:value={editProbationStatus}>
                <option value="Active (In Progress)">Active (In Progress)</option>
                <option value="Completed">Completed & Confirmed</option>
                <option value="Extended">Extended (Under Review)</option>
              </select>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="editRehireHistory">Rehire Eligibility History <span class="req">*</span></label>
              <input type="text" class="form-control" id="editRehireHistory" bind:value={editRehireHistory} required>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isEditLifecycleOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: EDIT STATUTORY, TAX & PAY -->
{#if isEditStatutoryOpen && emp}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 700px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Edit Statutory Identifiers & Compensation</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            Personnel: {emp.firstName} {emp.lastName} ({emp.id})
          </div>
        </div>
        <button class="modal-close" onclick={() => isEditStatutoryOpen = false}>&times;</button>
      </div>

      <form onsubmit={saveEditStatutory}>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" for="editZraTpin">ZRA Taxpayer TPIN <span class="req">*</span></label>
              <input type="text" class="form-control" id="editZraTpin" bind:value={editZraTpin} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editNapsaNo">NAPSA Social Security ID <span class="req">*</span></label>
              <input type="text" class="form-control" id="editNapsaNo" bind:value={editNapsaNo} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editNhimaNo">NHIMA Health Insurance ID <span class="req">*</span></label>
              <input type="text" class="form-control" id="editNhimaNo" bind:value={editNhimaNo} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editBankName">Salary Remittance Bank <span class="req">*</span></label>
              <input type="text" class="form-control" id="editBankName" bind:value={editBankName} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editBasePay">Basic Base Pay (Monthly ZMW) <span class="req">*</span></label>
              <input type="number" class="form-control" id="editBasePay" bind:value={editBasePay} required>
            </div>
            <div class="form-group">
              <label class="form-label" for="editHousingAllowance">Housing Allowance (ZMW)</label>
              <input type="number" class="form-control" id="editHousingAllowance" bind:value={editHousingAllowance}>
            </div>
            <div class="form-group">
              <label class="form-label" for="editTransportAllowance">Transport Allowance (ZMW)</label>
              <input type="number" class="form-control" id="editTransportAllowance" bind:value={editTransportAllowance}>
            </div>
            <div class="form-group">
              <label class="form-label" for="editDangerPay">Hazard / Tactical Danger Pay (ZMW)</label>
              <input type="number" class="form-control" id="editDangerPay" bind:value={editDangerPay}>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isEditStatutoryOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: EDIT DEPLOYMENT & SECURITY CLEARANCE -->
{#if isEditSecurityOpen && emp}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 600px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Edit Deployment & Security Clearance</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            Personnel: {emp.firstName} {emp.lastName} ({emp.id})
          </div>
        </div>
        <button class="modal-close" onclick={() => isEditSecurityOpen = false}>&times;</button>
      </div>

      <form onsubmit={saveEditSecurity}>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="editShiftPattern">Shift Schedule Pattern <span class="req">*</span></label>
              <input type="text" class="form-control" id="editShiftPattern" bind:value={editShiftPattern} required>
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="editDeploymentSite">Current Post Site <span class="req">*</span></label>
              <input type="text" class="form-control" id="editDeploymentSite" bind:value={editDeploymentSite} required>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isEditSecurityOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: ADD QUALIFICATION RECORD -->
{#if isAddQualModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 700px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Attach New Credential to Master Dossier</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            Personnel: {emp.firstName} {emp.lastName} ({emp.id})
          </div>
        </div>
        <button class="modal-close" onclick={() => isAddQualModalOpen = false}>&times;</button>
      </div>

      <form onsubmit={handleAddQualSubmit}>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="nqCat">Qualification Classification <span class="req">*</span></label>
              <select class="form-control" id="nqCat" bind:value={newQualCategory} required>
                <option value="Academic Degree">Academic Degree (Doctorate, Master's, Bachelor's)</option>
                <option value="Higher Diploma & Diploma">Higher Diploma & Diploma</option>
                <option value="Professional Accreditation & License">Professional Accreditation (ZIHRM, ASIS, ACCA)</option>
                <option value="Tactical & Security Certification">Tactical Security (Lilayi Police College, VIP Guard)</option>
                <option value="Statutory & Firearms Competency">Statutory Firearms Competency (Police Class 1/2)</option>
                <option value="Health, Safety & Medical (HSE)">Health & Safety (Red Cross CPR / First Aid)</option>
                <option value="Technical & Vocational (TEVETA)">Technical / Vocational (TEVETA CCTV, Comms)</option>
                <option value="Secondary Education">Secondary Education (ECZ Grade 12)</option>
              </select>
            </div>

            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="nqName">Qualification Title / Award Name <span class="req">*</span></label>
              <input type="text" class="form-control" id="nqName" bind:value={newQualName} placeholder="e.g. Master of Business Administration" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="nqInst">Awarding Institution <span class="req">*</span></label>
              <input type="text" class="form-control" id="nqInst" bind:value={newQualInstitution} placeholder="e.g. University of Zambia (UNZA)" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="nqCountry">Country of Institution <span class="req">*</span></label>
              <input type="text" class="form-control" id="nqCountry" bind:value={newQualCountry} placeholder="e.g. Zambia" required>
            </div>

            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="nqField">Field of Study / Technical Specialization</label>
              <input type="text" class="form-control" id="nqField" bind:value={newQualField} placeholder="e.g. Corporate Security Governance">
            </div>

            <div class="form-group">
              <label class="form-label" for="nqStart">Year Commenced</label>
              <input type="number" class="form-control" id="nqStart" bind:value={newQualStart} min="1970" max="2030">
            </div>

            <div class="form-group">
              <label class="form-label" for="nqEnd">Year Conferred / Completed <span class="req">*</span></label>
              <input type="number" class="form-control" id="nqEnd" bind:value={newQualEnd} min="1970" max="2030" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="nqGrade">Grade / Honors Awarded <span class="req">*</span></label>
              <input type="text" class="form-control" id="nqGrade" bind:value={newQualGrade} placeholder="e.g. Distinction, Merit, or Division 1" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="nqCert">Certificate Serial Number <span class="req">*</span></label>
              <input type="text" class="form-control" id="nqCert" bind:value={newQualCertNo} placeholder="e.g. UNZA-MBA-2024-00192" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="nqExp">License Expiry / Renewal Date</label>
              <input type="date" class="form-control" id="nqExp" bind:value={newQualExpiry}>
            </div>

            <div class="form-group">
              <label class="form-label" for="nqStat">Audit Verification Status <span class="req">*</span></label>
              <select class="form-control" id="nqStat" bind:value={newQualStatus} required>
                <option value="Verified & Sighted">Verified & Sighted (Physical Document Audited)</option>
                <option value="Pending Verification">Pending Verification (Certified Copy Sourced)</option>
              </select>
            </div>

            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="nqNotes">HR Auditor Notes & Registry Citation</label>
              <textarea class="form-control" id="nqNotes" bind:value={newQualNotes} rows="2" placeholder="e.g. Original university scroll sighted by HR Manager. Sighted under seal."></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={() => isAddQualModalOpen = false}>Cancel</button>
          <button type="submit" class="btn btn-primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Save Credential Record
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL: VIEW CERTIFICATE PREVIEW -->
{#if isViewCertModalOpen && activeCert}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 650px;">
      <div class="modal-header">
        <div>
          <div class="modal-title">Verified Credential Record</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
            Archived Certificate Dossier Record • Ref: {activeCert.certificateNo}
          </div>
        </div>
        <button class="modal-close" onclick={() => isViewCertModalOpen = false}>&times;</button>
      </div>

      <div class="modal-body">
        <div style="border: 2px solid rgba(59, 130, 246, 0.4); border-radius: var(--radius-md); padding: 30px; background: rgba(15, 23, 42, 0.8); text-align: center; position: relative;">
          
          <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-cyan); font-weight: 700; margin-bottom: 8px;">
            {activeCert.category}
          </div>

          <h2 style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 10px;">
            {activeCert.qualificationName}
          </h2>

          <div style="font-size: 0.95rem; color: #93c5fd; margin-bottom: 20px;">
            Conferred by <strong>{activeCert.institution}</strong> ({activeCert.country})
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; text-align: left; background: rgba(0,0,0,0.3); padding: 18px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.06);">
            <div>
              <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Conferred Grade</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: #fff;">{activeCert.grade}</div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Attainment Period</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: #fff;">{activeCert.yearEnd}</div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Certificate Serial</div>
              <div class="cert-mono-box" style="margin-top: 3px; display: inline-block;">{activeCert.certificateNo}</div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Verification Audit</div>
              <div style="color: #34d399; font-weight: 700; font-size: 0.85rem;">✓ {activeCert.verificationStatus}</div>
            </div>
          </div>

          {#if activeCert.notes}
            <div style="margin-top: 18px; font-size: 0.8rem; color: var(--text-muted); text-align: left; font-style: italic; border-left: 3px solid var(--primary); padding-left: 10px;">
              "{activeCert.notes}"
            </div>
          {/if}
        </div>

        <div style="margin-top: 20px; text-align: left;">
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 10px;">
            Attached Files for this Credential
          </div>
          <DocumentsPanel recordType="qualification" recordId={activeCert.id} />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={() => isViewCertModalOpen = false}>Close</button>
        <button class="btn btn-primary" onclick={() => cyberguard.showToast('Downloaded authenticated certificate copy as PDF.', 'info')}>
          Download PDF Proof
        </button>
      </div>
    </div>
  </div>
{/if}

{#if isIdCardOpen && emp}
  <EmployeeIdCardModal {emp} onClose={() => (isIdCardOpen = false)} />
{/if}

<style>
  .profile-hero {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: 32px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
    position: relative;
    overflow: hidden;
  }

  .profile-hero::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .profile-hero-left {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .dossier-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .dossier-section-header h3 {
    font-size: 1rem;
    color: #93c5fd;
  }

  .dossier-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .dossier-field {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    padding: 16px 18px;
    border-radius: var(--radius-md);
  }

  .dossier-label {
    font-size: 0.72rem;
    color: var(--text-dim);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }

  .dossier-val {
    font-size: 0.94rem;
    font-weight: 600;
    color: var(--text-main);
  }

  /* Qualifications & Certifications Tab Styles */
  .qual-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .qual-metric-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: var(--transition-normal);
  }

  .qual-metric-card:hover {
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
  }

  .qual-metric-icon {
    width: 46px;
    height: 46px;
    border-radius: var(--radius-md);
    background: rgba(37, 99, 235, 0.12);
    color: #60a5fa;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .qual-metric-icon.success {
    background: rgba(16, 185, 129, 0.12);
    color: #34d399;
  }

  .qual-metric-icon.warning {
    background: rgba(245, 158, 11, 0.12);
    color: #fbbf24;
  }

  .qual-metric-icon.cyan {
    background: rgba(6, 182, 212, 0.12);
    color: #22d3ee;
  }

  .qual-metric-val {
    font-size: 1.35rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
  }

  .qual-metric-label {
    font-size: 0.74rem;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .qual-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .qual-filter-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .filter-chip {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    color: var(--text-muted);
    padding: 6px 14px;
    border-radius: var(--radius-full);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .filter-chip:hover {
    background: var(--bg-card-subtle);
    color: var(--text-main);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .filter-chip.active {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
    box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35);
  }

  .qual-card {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: 22px;
    margin-bottom: 16px;
    transition: all 0.2s ease;
    position: relative;
  }

  .qual-card:hover {
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }

  .qual-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .qual-tag {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 4px 10px;
    border-radius: var(--radius-full);
  }

  .tag-academic { background: rgba(59, 130, 246, 0.15); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); }
  .tag-professional { background: rgba(139, 92, 246, 0.15); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.3); }
  .tag-tactical { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }
  .tag-statutory { background: rgba(245, 158, 11, 0.15); color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.3); }
  .tag-health { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }
  .tag-secondary { background: rgba(6, 182, 212, 0.15); color: #67e8f9; border: 1px solid rgba(6, 182, 212, 0.3); }
  .tag-technical { background: rgba(168, 85, 247, 0.15); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.3); }

  .qual-title {
    font-size: 1.12rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
  }

  .qual-institution {
    font-size: 0.88rem;
    color: var(--accent-cyan);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .qual-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 14px;
    margin-top: 16px;
    padding: 14px 16px;
    background: var(--bg-card-subtle);
    border-radius: var(--radius-md);
    border: 1px solid rgba(255, 255, 255, 0.04);
  }

  .qual-grid-item-label {
    font-size: 0.7rem;
    color: var(--text-dim);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .qual-grid-item-val {
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--text-main);
    margin-top: 2px;
  }

  .qual-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--border-subtle);
    flex-wrap: wrap;
  }

  .qual-verified-note {
    font-size: 0.74rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .cert-mono-box {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.75rem;
    padding: 3px 8px;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    color: #93c5fd;
  }
</style>
