import { PersistedList } from './persisted.svelte.js';

const seedCourses = [
  {
    id: 1,
    title: 'Firearms Refresher (Annual)',
    category: 'Statutory & Firearms Competency',
    provider: 'CyberGuard Training Academy',
    durationHours: 8,
    isMandatory: true,
    recurrenceMonths: 12
  },
  {
    id: 2,
    title: 'First Aid & CPR Certification',
    category: 'Health, Safety & Medical (HSE)',
    provider: 'Zambia Red Cross Society',
    durationHours: 16,
    isMandatory: true,
    recurrenceMonths: 24
  },
  {
    id: 3,
    title: 'K9 Handling Fundamentals',
    category: 'Tactical & Security Certification',
    provider: 'K9 Security Services Zambia',
    durationHours: 40,
    isMandatory: false,
    recurrenceMonths: null
  },
  {
    id: 4,
    title: 'Defensive Driving',
    category: 'Technical & Vocational (TEVETA)',
    provider: 'Zambia Driving School',
    durationHours: 12,
    isMandatory: false,
    recurrenceMonths: null
  },
  {
    id: 5,
    title: 'Customer Service for Security Personnel',
    category: 'Professional Accreditation & License',
    provider: 'CyberGuard Training Academy',
    durationHours: 6,
    isMandatory: false,
    recurrenceMonths: null
  },
  {
    id: 6,
    title: 'Supervisor Leadership Essentials',
    category: 'Professional Accreditation & License',
    provider: 'Zambia Institute of Management',
    durationHours: 20,
    isMandatory: false,
    recurrenceMonths: null
  }
];

export const coursesStore = new PersistedList('cyberguard_courses', seedCourses);

const seedTrainingRecords = [
  {
    id: 1,
    empId: 'CG-00111',
    empName: 'Kelvin Musonda',
    courseId: 1,
    courseTitle: 'Firearms Refresher (Annual)',
    status: 'completed',
    enrolledAt: '2026-02-01',
    dueDate: '2026-03-01',
    completedAt: '2026-02-20',
    score: 92
  },
  {
    id: 2,
    empId: 'CG-00111',
    empName: 'Kelvin Musonda',
    courseId: 2,
    courseTitle: 'First Aid & CPR Certification',
    status: 'in_progress',
    enrolledAt: '2026-10-10',
    dueDate: '2026-11-20',
    completedAt: null,
    score: null
  },
  {
    id: 3,
    empId: 'CG-00112',
    empName: 'Moses Sakala',
    courseId: 1,
    courseTitle: 'Firearms Refresher (Annual)',
    status: 'overdue',
    enrolledAt: '2026-08-01',
    dueDate: '2026-09-15',
    completedAt: null,
    score: null
  },
  {
    id: 4,
    empId: 'CG-00110',
    empName: 'Brian Bwalya',
    courseId: 6,
    courseTitle: 'Supervisor Leadership Essentials',
    status: 'completed',
    enrolledAt: '2026-05-01',
    dueDate: '2026-06-01',
    completedAt: '2026-05-28',
    score: 88
  },
  {
    id: 5,
    empId: 'CG-00108',
    empName: 'David Lungu',
    courseId: 4,
    courseTitle: 'Defensive Driving',
    status: 'enrolled',
    enrolledAt: '2026-10-20',
    dueDate: '2026-12-15',
    completedAt: null,
    score: null
  },
  {
    id: 6,
    empId: 'CG-00107',
    empName: 'Joseph Phiri',
    courseId: 5,
    courseTitle: 'Customer Service for Security Personnel',
    status: 'completed',
    enrolledAt: '2026-04-01',
    dueDate: '2026-04-15',
    completedAt: '2026-04-12',
    score: 95
  },
  {
    id: 7,
    empId: 'CG-00105',
    empName: 'Kennedy Tembo',
    courseId: 1,
    courseTitle: 'Firearms Refresher (Annual)',
    status: 'completed',
    enrolledAt: '2026-01-10',
    dueDate: '2026-02-10',
    completedAt: '2026-02-05',
    score: 97
  },
  {
    id: 8,
    empId: 'CG-00109',
    empName: 'Mary Chilufya',
    courseId: 3,
    courseTitle: 'K9 Handling Fundamentals',
    status: 'enrolled',
    enrolledAt: '2026-10-15',
    dueDate: '2026-11-10',
    completedAt: null,
    score: null
  }
];

export const trainingRecordsStore = new PersistedList('cyberguard_training_records', seedTrainingRecords);

export function trainingDueSoon() {
  const DUE_WINDOW_DAYS = 30;
  const today = new Date();
  const results = [];

  trainingRecordsStore.items.forEach((rec) => {
    if (rec.status === 'completed' || !rec.dueDate) return;
    const due = new Date(rec.dueDate);
    if (isNaN(due.getTime())) return;
    const daysRemaining = Math.round((due - today) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= DUE_WINDOW_DAYS) {
      results.push({
        recordId: rec.id,
        empId: rec.empId,
        empName: rec.empName,
        courseTitle: rec.courseTitle,
        dueDate: rec.dueDate,
        daysRemaining,
        status: rec.status
      });
    }
  });

  return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
