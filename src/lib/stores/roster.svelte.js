import { PersistedList } from './persisted.svelte.js';

export const SHIFT_PATTERNS = ['12h Day (06:00 - 18:00)', '12h Night (18:00 - 06:00)'];

const TODAY = new Date().toISOString().split('T')[0];

const seedAssignments = [
  {
    id: 1,
    date: TODAY,
    post: 'KCM Open Pit Perimeter Post 4',
    shiftPattern: '12h Day (06:00 - 18:00)',
    empId: 'CG-00111',
    empName: 'Kelvin Musonda',
    status: 'assigned'
  },
  {
    id: 2,
    date: TODAY,
    post: 'Lusaka Breweries Logistics Gate',
    shiftPattern: '12h Night (18:00 - 06:00)',
    empId: 'CG-00112',
    empName: 'Moses Sakala',
    status: 'assigned'
  },
  {
    id: 3,
    date: TODAY,
    post: 'Konkola Mine Smelter Post',
    shiftPattern: '12h Day (06:00 - 18:00)',
    empId: 'CG-00110',
    empName: 'Brian Bwalya',
    status: 'assigned'
  },
  {
    id: 4,
    date: TODAY,
    post: 'Lusaka Commercial Roster',
    shiftPattern: '12h Day (06:00 - 18:00)',
    empId: 'CG-00108',
    empName: 'David Lungu',
    status: 'assigned'
  }
];

export const rosterStore = new PersistedList('cyberguard_roster_assignments', seedAssignments);
