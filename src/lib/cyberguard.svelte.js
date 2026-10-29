import seedData from './db-seed.json';

// Utility: Format Currency (Zambian Kwacha - ZMW)
export function formatZMW(amount) {
  return "ZMW " + Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Svelte 5 reactive state class
class CyberGuardStore {
  currentUser = $state({ ...seedData.currentUser });
  roles = $state([...seedData.roles]);
  activeRoleId = $state('exec');
  loggedInEmployeeId = $state(null);
  employees = $state(JSON.parse(JSON.stringify(seedData.employees)));
  statutoryConfig = $state({ ...seedData.statutoryConfig });
  theme = $state('dark');
  toasts = $state([]);
  isMobileNavOpen = $state(false);

  constructor() {
    if (typeof window !== 'undefined') {
      this.initClient();
    }
  }

  initClient() {
    this.loadFromStorage();
    const savedTheme = localStorage.getItem('cyberguard_theme') || 'dark';
    this.applyTheme(savedTheme, false);
    this.loggedInEmployeeId = localStorage.getItem('cyberguard_logged_in_employee_id') || null;

    // Global backwards-compatibility attachment
    window.CyberGuardDB = this;
    window.AegisDB = this;
    window.formatZMW = formatZMW;
    window.showToast = (msg, type) => this.showToast(msg, type);
    window.cycleTheme = () => this.cycleTheme();
  }

  toggleMobileNav(forcedState) {
    if (typeof forcedState === 'boolean') {
      this.isMobileNavOpen = forcedState;
    } else {
      this.isMobileNavOpen = !this.isMobileNavOpen;
    }
  }

  applyTheme(themeName, notify = false) {
    this.theme = themeName;
    if (typeof document !== 'undefined') {
      document.body.classList.remove('theme-dark', 'theme-mixed', 'theme-light');
      document.body.classList.add(`theme-${themeName}`);
      localStorage.setItem('cyberguard_theme', themeName);
    }
    if (notify) {
      let desc = 'Dark Mode';
      if (themeName === 'mixed') desc = 'Mixed Mode (Dark Menu + Light Body)';
      if (themeName === 'light') desc = 'Light Mode (Full Light UI)';
      this.showToast(`UI Theme updated to: ${desc}`, 'info');
    }
  }

  cycleTheme() {
    let next = 'mixed';
    if (this.theme === 'dark') next = 'mixed';
    else if (this.theme === 'mixed') next = 'light';
    else if (this.theme === 'light') next = 'dark';
    this.applyTheme(next, true);
  }

  showToast(message, type = 'info') {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const toast = { id, message, type };
    this.toasts.push(toast);

    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      this.toasts.splice(index, 1);
    }
  }

  switchActiveRole(roleId) {
    const roleObj = this.roles.find(r => r.id === roleId);
    if (roleObj) {
      this.activeRoleId = roleId;
      this.currentUser.name = roleObj.name;
      this.currentUser.role = roleObj.title;
      this.currentUser.avatar = roleObj.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      this.showToast(`Switched active view to: ${roleObj.title} (${roleObj.name})`, 'info');
    }
  }

  setLoggedInEmployee(empId) {
    this.loggedInEmployeeId = empId;
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('cyberguard_logged_in_employee_id', empId);
    } catch (e) {
      console.warn("Could not save logged-in employee to localStorage", e);
    }
  }

  getQualifications(empId) {
    const emp = this.employees.find(e => e.id === empId);
    return emp && emp.qualifications ? emp.qualifications : [];
  }

  get expiringCertifications() {
    const EXPIRY_WINDOW_DAYS = 90;
    const today = new Date();
    const results = [];

    this.employees.forEach(emp => {
      (emp.qualifications || []).forEach(qual => {
        if (!qual.expiryDate) return;
        const expiry = new Date(qual.expiryDate);
        if (isNaN(expiry.getTime())) return;
        const daysRemaining = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
        if (daysRemaining <= EXPIRY_WINDOW_DAYS) {
          results.push({
            empId: emp.id,
            empName: `${emp.firstName} ${emp.lastName}`,
            jobTitle: emp.jobTitle,
            qualId: qual.id,
            qualificationName: qual.qualificationName,
            category: qual.category,
            expiryDate: qual.expiryDate,
            daysRemaining
          });
        }
      });
    });

    return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  addQualification(empId, qual) {
    const emp = this.employees.find(e => e.id === empId);
    if (!emp) return null;
    if (!emp.qualifications) emp.qualifications = [];

    const newQual = {
      id: qual.id || `QUAL-${empId.replace('CG-', '')}-${Date.now().toString().slice(-4)}`,
      category: qual.category || "Academic Degree",
      qualificationName: qual.qualificationName || "",
      institution: qual.institution || "",
      country: qual.country || "Zambia",
      fieldOfStudy: qual.fieldOfStudy || "",
      yearStart: qual.yearStart || "",
      yearEnd: qual.yearEnd || "",
      grade: qual.grade || "Completed",
      certificateNo: qual.certificateNo || "PENDING-CERT",
      issueDate: qual.issueDate || new Date().toISOString().split("T")[0],
      expiryDate: qual.expiryDate || "",
      verificationStatus: qual.verificationStatus || "Verified & Sighted",
      verifiedBy: qual.verifiedBy || (this.currentUser ? this.currentUser.name : "Mutale Kangwa (HR Manager)"),
      verificationDate: qual.verificationDate || new Date().toISOString().split("T")[0],
      documentRef: qual.documentRef || "Certificate_Verified_Master.pdf",
      notes: qual.notes || "Official Master Record qualification verified and archived by HR."
    };

    emp.qualifications.unshift(newQual);
    this.saveToStorage();
    return newQual;
  }

  deleteQualification(empId, qualId) {
    const emp = this.employees.find(e => e.id === empId);
    if (!emp || !emp.qualifications) return false;
    const initialLen = emp.qualifications.length;
    emp.qualifications = emp.qualifications.filter(q => q.id !== qualId);
    this.saveToStorage();
    return emp.qualifications.length < initialLen;
  }

  addSkill(empId, skill) {
    const emp = this.employees.find(e => e.id === empId);
    if (!emp) return null;
    if (!emp.skills) emp.skills = [];

    const newSkill = {
      id: skill.id || `SKILL-${empId.replace('CG-', '')}-${Date.now().toString().slice(-4)}`,
      skillName: skill.skillName || '',
      proficiency: skill.proficiency || 'Novice',
      assessedAt: skill.assessedAt || new Date().toISOString().split('T')[0],
      assessedBy: skill.assessedBy || (this.currentUser ? this.currentUser.name : 'HR Manager')
    };

    emp.skills.unshift(newSkill);
    this.saveToStorage();
    return newSkill;
  }

  updateSkillProficiency(empId, skillId, proficiency) {
    const emp = this.employees.find(e => e.id === empId);
    if (!emp || !emp.skills) return null;
    const skill = emp.skills.find(s => s.id === skillId);
    if (!skill) return null;
    skill.proficiency = proficiency;
    skill.assessedAt = new Date().toISOString().split('T')[0];
    skill.assessedBy = this.currentUser ? this.currentUser.name : 'HR Manager';
    this.saveToStorage();
    return skill;
  }

  removeSkill(empId, skillId) {
    const emp = this.employees.find(e => e.id === empId);
    if (!emp || !emp.skills) return false;
    const initialLen = emp.skills.length;
    emp.skills = emp.skills.filter(s => s.id !== skillId);
    this.saveToStorage();
    return emp.skills.length < initialLen;
  }

  updateEmployee(empId, patch) {
    const emp = this.employees.find(e => e.id === empId);
    if (!emp) return null;
    Object.assign(emp, patch);
    this.saveToStorage();
    this.showToast(`Master Record updated for ${emp.firstName} ${emp.lastName}`, 'success');
    return emp;
  }

  createEmployee(newEmp) {
    if (!newEmp.leaveBalances) {
      newEmp.leaveBalances = { annual: 24, sick: 30, maternity: 120, paternity: 7, compassionate: 7 };
    }
    if (!newEmp.skills) {
      newEmp.skills = [];
    }
    this.employees.unshift(newEmp);
    this.saveToStorage();
    this.showToast(`Created Master Profile for ${newEmp.firstName} ${newEmp.lastName} (${newEmp.id})`, 'success');
  }

  deductLeaveBalance(empId, leaveType, days) {
    const emp = this.employees.find(e => e.id === empId);
    if (!emp || !emp.leaveBalances) return;
    const key = leaveType.toLowerCase();
    if (typeof emp.leaveBalances[key] !== 'number') return;
    emp.leaveBalances[key] = Math.max(0, emp.leaveBalances[key] - days);
    this.saveToStorage();
  }

  saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('cyberguard_employees_data', JSON.stringify(this.employees));
    } catch(e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  loadFromStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const data = localStorage.getItem('cyberguard_employees_data');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(storedEmp => {
            const existing = this.employees.find(e => e.id === storedEmp.id);
            if (existing) {
              Object.assign(existing, storedEmp);
            } else {
              this.employees.push(storedEmp);
            }
          });
        }
      }
    } catch(e) {
      console.warn("Could not load from localStorage", e);
    }
  }

  calculatePayroll(employee, overtimeHours = 0) {
    const hourlyRate = (employee.basePay / 195);
    const overtimePay = Math.round(overtimeHours * hourlyRate * 1.5);
    const grossTotal = employee.basePay + employee.housingAllowance + employee.transportAllowance + (employee.dangerPay || 0) + overtimePay;

    // NAPSA Employee (5% capped at statutory limit)
    const napsaGross = employee.basePay;
    const napsaEmployee = Math.min(Math.round(napsaGross * 0.05 * 100) / 100, this.statutoryConfig.napsaCeiling || 1426.00);
    const napsaEmployer = napsaEmployee;

    // NHIMA Employee (1% of basic)
    const nhimaEmployee = Math.round(employee.basePay * 0.01 * 100) / 100;
    const nhimaEmployer = nhimaEmployee;

    // ZRA PAYE Calculation on Taxable Pay (Gross minus statutory exempt pension)
    const taxablePay = Math.max(0, grossTotal - napsaEmployee);
    let paye = 0;

    if (taxablePay <= 5100) {
      paye = 0;
    } else if (taxablePay <= 7100) {
      paye = (taxablePay - 5100) * 0.20;
    } else if (taxablePay <= 9200) {
      paye = (2000 * 0.20) + ((taxablePay - 7100) * 0.30);
    } else {
      paye = (2000 * 0.20) + (2100 * 0.30) + ((taxablePay - 9200) * 0.37);
    }
    paye = Math.round(paye * 100) / 100;

    const totalDeductions = Math.round((paye + napsaEmployee + nhimaEmployee) * 100) / 100;
    const netPay = Math.round((grossTotal - totalDeductions) * 100) / 100;

    return {
      basePay: employee.basePay,
      housingAllowance: employee.housingAllowance,
      transportAllowance: employee.transportAllowance,
      dangerPay: employee.dangerPay || 0,
      overtimeHours,
      overtimePay,
      grossTotal,
      taxablePay,
      paye,
      napsaEmployee,
      napsaEmployer,
      nhimaEmployee,
      nhimaEmployer,
      totalDeductions,
      netPay
    };
  }
}

export const cyberguard = new CyberGuardStore();
export const CyberGuardDB = cyberguard;
