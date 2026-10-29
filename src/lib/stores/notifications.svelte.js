import { cyberguard } from '../cyberguard.svelte.js';
import { attendanceStore } from './attendance.svelte.js';
import { offboardingStore } from './offboarding.svelte.js';
import { performanceStore } from './performance.svelte.js';
import { trainingDueSoon } from './training.svelte.js';
import { rosterStore } from './roster.svelte.js';

// Derived, read-only notification feed. Nothing here is "authored" data —
// every item is computed live from the existing stores (certifications,
// leave queue, offboarding cases, appraisals), which never need to know
// notifications exist. Only the dismissed-id list is persisted.
const DISMISSED_KEY = 'cyberguard_dismissed_notifications';

function certExpiryNotifications() {
  return cyberguard.expiringCertifications
    .filter((c) => c.daysRemaining <= 30)
    .map((c) => ({
      id: `cert-${c.qualId}`,
      type: 'certification',
      severity: c.daysRemaining < 0 ? 'danger' : 'warning',
      message:
        c.daysRemaining < 0
          ? `${c.empName}'s ${c.qualificationName} expired ${Math.abs(c.daysRemaining)}d ago`
          : `${c.empName}'s ${c.qualificationName} expires in ${c.daysRemaining}d`,
      link: `/employee-profile?id=${c.empId}&tab=qualifications`
    }));
}

function pendingLeaveNotifications() {
  return attendanceStore.items
    .filter((item) => !item.isDecided)
    .map((item) => ({
      id: `leave-${item.id}`,
      type: 'leave',
      severity: 'warning',
      message: `Leave request from ${item.name} is awaiting approval`,
      link: '/attendance'
    }));
}

function pendingOffboardingNotifications() {
  return offboardingStore.items
    .filter((c) => c.actionLabel === 'Sign-Off')
    .map((c) => ({
      id: `exit-${c.id}`,
      type: 'offboarding',
      severity: 'warning',
      message: `${c.name}'s clearance checklist is awaiting sign-off`,
      link: '/offboarding'
    }));
}

function latestAppraisalNotification() {
  const latest = performanceStore.items[0];
  if (!latest) return [];
  return [
    {
      id: `appraisal-${latest.id}`,
      type: 'performance',
      severity: 'info',
      message: `Latest appraisal: ${latest.name} — ${latest.statusLabel}`,
      link: '/performance'
    }
  ];
}

function overdueTrainingNotifications() {
  return trainingDueSoon().map((t) => ({
    id: `training-${t.recordId}`,
    type: 'training',
    severity: t.daysRemaining < 0 ? 'danger' : 'warning',
    message:
      t.daysRemaining < 0
        ? `${t.empName}'s ${t.courseTitle} is overdue by ${Math.abs(t.daysRemaining)}d`
        : `${t.empName}'s ${t.courseTitle} is due in ${t.daysRemaining}d`,
    link: '/learning'
  }));
}

function openShiftNotifications() {
  return rosterStore.items
    .filter((a) => a.status === 'open')
    .map((a) => ({
      id: `open-shift-${a.id}`,
      type: 'open-shift',
      severity: 'info',
      message: `Open shift available: ${a.post} (${a.shiftPattern}) on ${a.date}`,
      link: '/my-profile'
    }));
}

class NotificationCenter {
  dismissed = $state([]);

  init() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(DISMISSED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) this.dismissed = parsed;
      }
    } catch (e) {
      console.warn('Could not load dismissed notifications', e);
    }
  }

  save() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(this.dismissed));
    } catch (e) {
      console.warn('Could not save dismissed notifications', e);
    }
  }

  get items() {
    const all = [
      ...certExpiryNotifications(),
      ...pendingLeaveNotifications(),
      ...pendingOffboardingNotifications(),
      ...latestAppraisalNotification(),
      ...overdueTrainingNotifications(),
      ...openShiftNotifications()
    ];
    return all.filter((n) => !this.dismissed.includes(n.id));
  }

  dismiss(id) {
    if (!this.dismissed.includes(id)) {
      this.dismissed.push(id);
      this.save();
    }
  }
}

export const notifications = new NotificationCenter();
