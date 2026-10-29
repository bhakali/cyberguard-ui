import { PersistedList } from './persisted.svelte.js';

const seedAnnouncements = [
  {
    id: 1,
    title: 'Q4 Safety Briefing Schedule Released',
    body: 'All site posts must complete the Q4 safety briefing with their Area Manager before 15 November. Attendance registers will be collected centrally by HR.',
    category: 'Safety',
    postedBy: 'Mutale Kangwa (HR Manager)',
    postedAt: '2026-10-20',
    pinned: true
  },
  {
    id: 2,
    title: 'New Firearms Refresher Deadline',
    body: 'All armed personnel due for the annual Firearms Refresher must complete it by the end of November. Check the Learning & Development module for your due date.',
    category: 'Training',
    postedBy: 'Patrick Banda (Director Operations)',
    postedAt: '2026-10-18',
    pinned: true
  },
  {
    id: 3,
    title: 'Festive Season Roster Changes',
    body: 'Expect additional shift coverage requests across all regions between 15 December and 5 January. Site Supervisors should submit staffing plans by 20 November.',
    category: 'Operations',
    postedBy: 'Patrick Banda (Director Operations)',
    postedAt: '2026-10-12',
    pinned: false
  },
  {
    id: 4,
    title: 'Employee of the Quarter Nominations Open',
    body: 'Nominate a colleague on the Recognition Wall for outstanding service this quarter. Winners are announced at the next all-hands briefing.',
    category: 'Culture',
    postedBy: 'Mutale Kangwa (HR Manager)',
    postedAt: '2026-10-05',
    pinned: false
  }
];

export const announcementsStore = new PersistedList('cyberguard_announcements', seedAnnouncements);

const seedRecognition = [
  {
    id: 1,
    fromEmpId: 'CG-00110',
    fromName: 'Brian Bwalya',
    toEmpId: 'CG-00111',
    toName: 'Kelvin Musonda',
    message: 'Spotted and reported a perimeter breach attempt during night shift — textbook response under pressure.',
    badgeType: 'Vigilance Award',
    postedAt: '2026-10-22'
  },
  {
    id: 2,
    fromEmpId: 'CG-00104',
    fromName: 'Mutale Kangwa',
    toEmpId: 'CG-00112',
    toName: 'Moses Sakala',
    message: 'Covered an extra shift at short notice without complaint. Exactly the reliability we value.',
    badgeType: 'Team Player',
    postedAt: '2026-10-14'
  },
  {
    id: 3,
    fromEmpId: 'CG-00107',
    fromName: 'Joseph Phiri',
    toEmpId: 'CG-00108',
    toName: 'David Lungu',
    message: 'Received positive client feedback for professionalism at the Lusaka Commercial site.',
    badgeType: 'Customer Service Excellence',
    postedAt: '2026-10-08'
  },
  {
    id: 4,
    fromEmpId: 'CG-00102',
    fromName: 'Patrick Banda',
    toEmpId: 'CG-00110',
    toName: 'Brian Bwalya',
    message: 'Excellent supervision and composure during the Copperbelt compliance audit.',
    badgeType: 'Leadership',
    postedAt: '2026-09-28'
  }
];

export const recognitionStore = new PersistedList('cyberguard_recognition', seedRecognition);

const seedSurveys = [
  {
    id: 1,
    question: 'How satisfied are you with the current shift scheduling system?',
    scaleMax: 5,
    status: 'open',
    createdAt: '2026-10-01'
  }
];

export const surveysStore = new PersistedList('cyberguard_surveys', seedSurveys);

const seedResponses = [
  {
    id: 1,
    surveyId: 1,
    empId: 'CG-00111',
    empName: 'Kelvin Musonda',
    rating: 4,
    comment: 'The roster builder makes shift visibility much clearer than before.',
    submittedAt: '2026-10-05'
  },
  {
    id: 2,
    surveyId: 1,
    empId: 'CG-00110',
    empName: 'Brian Bwalya',
    rating: 3,
    comment: 'Would like more notice before night-shift swaps.',
    submittedAt: '2026-10-06'
  }
];

export const surveyResponsesStore = new PersistedList('cyberguard_survey_responses', seedResponses);

export function hasResponded(surveyId, empId) {
  return surveyResponsesStore.items.some((r) => r.surveyId === surveyId && r.empId === empId);
}

export function submitSurveyResponse(surveyId, emp, rating, comment) {
  if (hasResponded(surveyId, emp.id)) return null;
  const response = {
    id: Date.now(),
    surveyId,
    empId: emp.id,
    empName: `${emp.firstName} ${emp.lastName}`,
    rating,
    comment,
    submittedAt: new Date().toISOString().split('T')[0]
  };
  surveyResponsesStore.add(response);
  return response;
}

export function surveyAverageAndDistribution(surveyId) {
  const responses = surveyResponsesStore.items.filter((r) => r.surveyId === surveyId);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  responses.forEach((r) => {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    sum += r.rating;
  });
  return {
    totalResponses: responses.length,
    average: responses.length ? Math.round((sum / responses.length) * 10) / 10 : 0,
    distribution
  };
}
