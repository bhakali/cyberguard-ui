import { PersistedList } from './persisted.svelte.js';

// Linear pipeline order. 'offer' advances to 'hired' via a dedicated
// "Mark Hired" action (it creates a real employee record + onboarding
// checklist as a side effect, not just a status flip), and any active
// stage can instead be moved to the 'rejected' terminal.
export const STAGE_ORDER = ['sourced', 'vetting', 'tactical', 'offer'];

export const STAGE_LABELS = {
  sourced: 'Sourced / Applied',
  vetting: 'Vetting & Background',
  tactical: 'Tactical & Interview',
  offer: 'Formal Offer',
  hired: 'Hired',
  rejected: 'Rejected'
};

export function nextStage(stage) {
  const idx = STAGE_ORDER.indexOf(stage);
  if (idx === -1 || idx === STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1];
}

const seedCandidates = [
  {
    id: 1,
    name: 'Collins Chileshe',
    nrcLine: 'NRC: 491820/66/1',
    targetRole: 'Senior Guard',
    region: 'Copperbelt',
    appliedDate: 'Applied 2d ago',
    vettingNotes: '4 Yrs Mining Exp',
    badgeLabel: 'Class 1 Firearms',
    badgeClass: 'badge-neutral',
    stage: 'sourced',
    stageHistory: [{ stage: 'sourced', enteredAt: '2026-10-27' }],
    requisitionId: null,
    offer: null
  },
  {
    id: 2,
    name: 'Peter Simbeye',
    nrcLine: 'NRC: 382910/11/1',
    targetRole: 'Area Patrol Guard',
    region: 'Lusaka',
    appliedDate: 'Applied 3d ago',
    vettingNotes: 'Ex-Service',
    badgeLabel: 'Driver License C',
    badgeClass: 'badge-neutral',
    stage: 'sourced',
    stageHistory: [{ stage: 'sourced', enteredAt: '2026-10-26' }],
    requisitionId: null,
    offer: null
  },
  {
    id: 3,
    name: 'Esther Tembo',
    nrcLine: '',
    targetRole: 'Site Supervisor Candidate',
    region: 'Kitwe',
    appliedDate: 'Screening in progress',
    vettingNotes: 'Police Fingerprints submitted',
    badgeLabel: 'CRB Vetting 80%',
    badgeClass: 'badge-warning',
    stage: 'vetting',
    stageHistory: [
      { stage: 'sourced', enteredAt: '2026-10-20' },
      { stage: 'vetting', enteredAt: '2026-10-24' }
    ],
    requisitionId: null,
    offer: null
  },
  {
    id: 4,
    name: 'Jonathan Mwila',
    nrcLine: '',
    targetRole: 'Shift Coordinator',
    region: 'Solwezi',
    appliedDate: 'Vetting Approved',
    vettingNotes: 'Past employer references checked',
    badgeLabel: 'Vetting Verified',
    badgeClass: 'badge-success',
    stage: 'vetting',
    stageHistory: [
      { stage: 'sourced', enteredAt: '2026-10-18' },
      { stage: 'vetting', enteredAt: '2026-10-22' }
    ],
    requisitionId: null,
    offer: null
  },
  {
    id: 5,
    name: 'Davies Zulu',
    nrcLine: '',
    targetRole: 'Senior Armed Guard',
    region: '',
    appliedDate: 'Interview Scheduled',
    vettingNotes: 'Shooting Range Score: 94% • Tactical Panel: Lt. Col. Banda',
    badgeLabel: 'Panel Interview Oct 18',
    badgeClass: 'badge-primary',
    stage: 'tactical',
    stageHistory: [
      { stage: 'sourced', enteredAt: '2026-10-10' },
      { stage: 'vetting', enteredAt: '2026-10-14' },
      { stage: 'tactical', enteredAt: '2026-10-18' }
    ],
    requisitionId: null,
    offer: null
  },
  {
    id: 6,
    name: 'Moses Sakala',
    nrcLine: '',
    targetRole: 'Guards',
    region: 'Lusaka Industrial',
    appliedDate: 'Hired',
    vettingNotes: 'Offer Accepted • Joining Oct 20',
    badgeLabel: 'Offer Signed',
    badgeClass: 'badge-success',
    stage: 'hired',
    stageHistory: [
      { stage: 'sourced', enteredAt: '2026-09-28' },
      { stage: 'vetting', enteredAt: '2026-10-02' },
      { stage: 'tactical', enteredAt: '2026-10-08' },
      { stage: 'offer', enteredAt: '2026-10-14' },
      { stage: 'hired', enteredAt: '2026-10-20' }
    ],
    requisitionId: null,
    empId: 'CG-00112',
    offer: { gross: 5800, joiningDate: '2026-10-20', status: 'accepted' }
  }
];

export const candidatesStore = new PersistedList('cyberguard_candidates', seedCandidates);
