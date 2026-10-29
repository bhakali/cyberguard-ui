// Role-based capability map for the HR portal UI prototype.
// Keyed by the role ids already seeded in db-seed.json's `roles` array.
// `nav` lists which Sidebar route-keys a role can see; the capability flags
// gate mutating actions (approve/sign-off/disburse/edit) across the app.

const FULL_NAV = [
  'dashboard', 'employees', 'org-chart', 'process-mapping',
  'recruitment', 'attendance', 'payroll', 'performance',
  'offboarding', 'compliance', 'grievances', 'policies', 'incidents',
  'succession', 'learning', 'engagement', 'configuration'
];

export const ROLE_CAPABILITIES = {
  exec: { nav: FULL_NAV, canApprove: true, canEditPay: true },
  ops: { nav: FULL_NAV, canApprove: true, canEditPay: true },
  admin: { nav: FULL_NAV, canApprove: true, canEditPay: true },
  hr: { nav: FULL_NAV, canApprove: true, canEditPay: true },

  rsm_n: {
    nav: ['dashboard', 'employees', 'org-chart', 'attendance', 'recruitment', 'performance', 'offboarding', 'succession', 'learning', 'engagement'],
    canApprove: true,
    canEditPay: false
  },
  rsm_s: {
    nav: ['dashboard', 'employees', 'org-chart', 'attendance', 'recruitment', 'performance', 'offboarding', 'succession', 'learning', 'engagement'],
    canApprove: true,
    canEditPay: false
  },

  area: {
    nav: ['dashboard', 'employees', 'attendance', 'recruitment', 'performance', 'offboarding', 'succession', 'learning', 'engagement'],
    canApprove: true,
    canEditPay: false
  },

  shift: {
    nav: ['dashboard', 'attendance', 'engagement'],
    canApprove: false,
    canEditPay: false
  },
  site_coord: {
    nav: ['dashboard', 'attendance', 'recruitment', 'engagement'],
    canApprove: false,
    canEditPay: false
  },
  site_sup: {
    nav: ['dashboard', 'attendance', 'engagement'],
    canApprove: true,
    canEditPay: false
  },

  guard: {
    nav: ['dashboard', 'my-profile', 'engagement'],
    canApprove: false,
    canEditPay: false,
    selfServiceOnly: true
  }
};

export function can(roleId, capability) {
  return !!ROLE_CAPABILITIES[roleId]?.[capability];
}

export function canSeeNav(roleId, routeKey) {
  return ROLE_CAPABILITIES[roleId]?.nav?.includes(routeKey) ?? false;
}

// Senior roles that can act on any approval-chain step, bypassing the
// step's assigned role (e.g. HR or Exec can sign off out of turn).
const OVERRIDE_ROLES = ['exec', 'hr', 'ops', 'admin'];

export function canActOnStep(roleId, stepRole) {
  if (!can(roleId, 'canApprove')) return false;
  return OVERRIDE_ROLES.includes(roleId) || roleId === stepRole;
}
