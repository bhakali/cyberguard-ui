import { PersistedList } from './persisted.svelte.js';

const seedPolicies = [
  {
    id: 1,
    title: 'Code of Conduct & Professional Ethics',
    category: 'Code of Conduct',
    version: 'v3.1',
    effectiveDate: '2026-01-01',
    fileName: 'CyberGuard_Code_of_Conduct_v3.1.pdf',
    sizeLabel: '480 KB',
    uploadedBy: 'Mutale Kangwa (HR Manager)',
    uploadedAt: '2026-01-02',
    requiresAcknowledgment: true
  },
  {
    id: 2,
    title: 'Statutory Firearms Handling & Safety SOP',
    category: 'Firearms SOP',
    version: 'v2.0',
    effectiveDate: '2026-03-15',
    fileName: 'Firearms_Safety_SOP_v2.pdf',
    sizeLabel: '1.1 MB',
    uploadedBy: 'Lt. Col. Patrick Banda (Rtd)',
    uploadedAt: '2026-03-15',
    requiresAcknowledgment: true
  },
  {
    id: 3,
    title: 'Leave & Absence Policy (Zambian Employment Code Act)',
    category: 'Leave Policy',
    version: 'v1.4',
    effectiveDate: '2026-02-01',
    fileName: 'Leave_Absence_Policy_v1.4.pdf',
    sizeLabel: '310 KB',
    uploadedBy: 'Mutale Kangwa (HR Manager)',
    uploadedAt: '2026-02-01',
    requiresAcknowledgment: true
  },
  {
    id: 4,
    title: 'Zambian Data Protection Act Compliance Policy',
    category: 'Data Protection',
    version: 'v1.0',
    effectiveDate: '2026-05-10',
    fileName: 'Data_Protection_Policy_v1.pdf',
    sizeLabel: '275 KB',
    uploadedBy: 'Dr. Mwamba Kapwepwe (Managing Director)',
    uploadedAt: '2026-05-10',
    requiresAcknowledgment: false
  },
  {
    id: 5,
    title: 'Disciplinary Code & Grievance Procedure',
    category: 'Disciplinary Code',
    version: 'v2.2',
    effectiveDate: '2026-04-01',
    fileName: 'Disciplinary_Code_v2.2.pdf',
    sizeLabel: '390 KB',
    uploadedBy: 'Mutale Kangwa (HR Manager)',
    uploadedAt: '2026-04-01',
    requiresAcknowledgment: true
  }
];

export const policiesStore = new PersistedList('cyberguard_policy_library', seedPolicies);

const seedAcknowledgments = [
  { id: 1, policyId: 1, empId: 'CG-00111', empName: 'Kelvin Musonda', acknowledgedAt: '2026-01-05' },
  { id: 2, policyId: 1, empId: 'CG-00112', empName: 'Moses Sakala', acknowledgedAt: '2026-01-06' },
  { id: 3, policyId: 2, empId: 'CG-00111', empName: 'Kelvin Musonda', acknowledgedAt: '2026-03-18' }
];

export const acknowledgmentsStore = new PersistedList('cyberguard_policy_acknowledgments', seedAcknowledgments);

export function hasAcknowledged(policyId, empId) {
  return acknowledgmentsStore.items.some((a) => a.policyId === policyId && a.empId === empId);
}

export function acknowledgePolicy(policyId, emp) {
  if (hasAcknowledged(policyId, emp.id)) return;
  acknowledgmentsStore.add({
    id: Date.now(),
    policyId,
    empId: emp.id,
    empName: `${emp.firstName} ${emp.lastName}`,
    acknowledgedAt: new Date().toISOString().split('T')[0]
  });
}
