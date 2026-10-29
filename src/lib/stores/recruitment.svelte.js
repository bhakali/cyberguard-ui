import { PersistedList } from './persisted.svelte.js';

const TASK_TEMPLATE = [
  {
    title: '1. National Identity & Next of Kin Verification',
    desc: 'Verify original NRC and Next of Kin emergency contact form.'
  },
  {
    title: '2. Statutory Registrations (NAPSA, NHIMA, ZRA TPIN)',
    desc: 'Enroll under NAPSA employer code; activate NHIMA membership; register TPIN on e-Tax.'
  },
  {
    title: '3. Uniform, Combat Boots & Protective Kit Handover',
    desc: 'Issue tactical overalls, steel-toe boots, duty belt, whistle, and badge.'
  },
  {
    title: '4. Site Biometric Enrollment & RFID Access Card',
    desc: 'Capture fingerprint on site clock-in system; encode Access RFID card.'
  },
  {
    title: '5. Firearms Safety & Security Standard Operating Procedures (SOP)',
    desc: '48-hour mandatory orientation on armed engagement rules, radio protocols, and patrol logs.'
  }
];

// Spins up a fresh onboarding checklist instance for a newly hired employee,
// mirroring the newOffboardingChain()/newLeaveChain() factory pattern.
export function newOnboardingChecklist(emp) {
  return {
    id: Date.now(),
    empId: emp.id,
    empName: `${emp.firstName} ${emp.lastName}`,
    jobTitle: emp.jobTitle,
    createdAt: new Date().toISOString().split('T')[0],
    tasks: TASK_TEMPLATE.map((t, i) => ({
      id: i + 1,
      title: t.title,
      desc: t.desc,
      status: i === 0 || i === 1 ? 'Completed' : 'Pending',
      done: i === 0 || i === 1
    }))
  };
}

const seedChecklists = [
  {
    id: 1,
    empId: 'CG-00112',
    empName: 'Moses Sakala',
    jobTitle: 'Guards',
    createdAt: '2026-10-20',
    tasks: [
      {
        id: 1,
        title: '1. National Identity & Next of Kin Verification',
        desc: 'Verified original NRC 512938/11/1 and Next of Kin emergency contact form.',
        status: 'Completed',
        done: true
      },
      {
        id: 2,
        title: '2. Statutory Registrations (NAPSA, NHIMA, ZRA TPIN)',
        desc: 'Enrolled under NAPSA employer code; NHIMA membership active; TPIN registered on e-Tax.',
        status: 'Completed',
        done: true
      },
      {
        id: 3,
        title: '3. Uniform, Combat Boots & Protective Kit Handover',
        desc: 'Issued 2x tactical overalls, steel-toe boots, duty belt, whistle, and badge #G-442.',
        status: 'Pending Kit Store',
        done: false
      },
      {
        id: 4,
        title: '4. Site Biometric Enrollment & RFID Access Card',
        desc: 'Fingerprint captured on Lusaka Breweries Gate system; Access RFID card encoded.',
        status: 'Scheduled for 19th',
        done: false
      },
      {
        id: 5,
        title: '5. Firearms Safety & Security Standard Operating Procedures (SOP)',
        desc: '48-hour mandatory orientation on armed engagement rules, radio protocols, and patrol logs.',
        status: 'Orientation Day 2',
        done: false
      }
    ]
  }
];

export const recruitmentStore = new PersistedList('cyberguard_onboarding_checklists_v2', seedChecklists);
