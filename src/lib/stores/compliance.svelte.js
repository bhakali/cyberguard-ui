import { PersistedList } from './persisted.svelte.js';

const seedAuditLog = [
  {
    id: 1,
    timestamp: 'Today, 20:25:12',
    badge: 'badge-primary',
    action: 'ACCESS_SALARY',
    detail: 'Mutale Kangwa (HR Manager) viewed master payroll breakdown for Grade A1-A2 Guard Force.',
    result: 'AUTHORIZED',
    resultColor: '#34d399'
  },
  {
    id: 2,
    timestamp: 'Today, 19:44:02',
    badge: 'badge-accent',
    action: 'UPDATE_ROSTER',
    detail: 'David Lungu (Shift Coordinator) modified shift schedule for Lusaka Breweries Post 2.',
    result: 'AUTHORIZED',
    resultColor: '#34d399'
  },
  {
    id: 3,
    timestamp: 'Today, 18:15:33',
    badge: 'badge-warning',
    action: 'TPIN_VERIFY',
    detail: 'Mutale Kangwa (HR Manager) verified ZRA TPIN #1012837465 against e-Tax gateway.',
    result: 'AUTHORIZED',
    resultColor: '#34d399'
  },
  {
    id: 4,
    timestamp: 'Yesterday, 16:30:19',
    badge: 'badge-danger',
    action: 'DENIED_ATTEMPT',
    detail: 'Site Supervisor Brian Bwalya attempted access to /api/v1/payroll/salaries (Blocked by RBAC).',
    result: 'BLOCKED',
    resultColor: '#ef4444'
  }
];

export const complianceStore = new PersistedList('cyberguard_audit_log', seedAuditLog);

export function logAudit(action, badge, detail) {
  complianceStore.add({
    id: Date.now(),
    timestamp: 'Just now',
    badge,
    action,
    detail,
    result: 'AUTHORIZED',
    resultColor: '#34d399'
  });
}
