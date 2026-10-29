import { PersistedList } from './persisted.svelte.js';

const seedCheckpoints = [
  { id: 1, post: 'Copperbelt Regional HQ - Kitwe', label: 'Main Gate' },
  { id: 2, post: 'Copperbelt Regional HQ - Kitwe', label: 'Control Room' },
  { id: 3, post: 'Corporate HQ - Lusaka', label: 'Main Gate' },
  { id: 4, post: 'Corporate HQ - Lusaka', label: 'Reception Desk' },
  { id: 5, post: 'KCM Open Pit Perimeter Post 4', label: 'Perimeter East' },
  { id: 6, post: 'KCM Open Pit Perimeter Post 4', label: 'Control Room' },
  { id: 7, post: 'Kansanshi Copper Gate 1 & 2', label: 'Gate 1' },
  { id: 8, post: 'Kansanshi Copper Gate 1 & 2', label: 'Gate 2' },
  { id: 9, post: 'Kitwe Industrial Area Cluster', label: 'Main Gate' },
  { id: 10, post: 'Kitwe Industrial Area Cluster', label: 'Perimeter West' },
  { id: 11, post: 'Konkola Mine Smelter Post', label: 'Smelter Entrance' },
  { id: 12, post: 'Konkola Mine Smelter Post', label: 'Control Room' },
  { id: 13, post: 'Lusaka Breweries Logistics Gate', label: 'Logistics Gate' },
  { id: 14, post: 'Lusaka Breweries Logistics Gate', label: 'Loading Bay' },
  { id: 15, post: 'Lusaka Commercial Roster', label: 'Main Entrance' },
  { id: 16, post: 'Lusaka Commercial Roster', label: 'Parking Access' },
  { id: 17, post: 'National Ops Command Hub', label: 'Main Gate' },
  { id: 18, post: 'National Ops Command Hub', label: 'Control Room' },
  { id: 19, post: 'Southern Regional HQ - Lusaka', label: 'Main Gate' },
  { id: 20, post: 'Southern Regional HQ - Lusaka', label: 'Perimeter South' }
];

export const checkpointsStore = new PersistedList('cyberguard_checkpoints', seedCheckpoints);

const seedPatrolLogs = [
  {
    id: 1,
    post: 'KCM Open Pit Perimeter Post 4',
    checkpoint: 'Perimeter East',
    empId: 'CG-00111',
    empName: 'Kelvin Musonda',
    loggedAt: '2026-10-29 06:15',
    distanceMeters: 45,
    withinGeofence: true,
    method: 'gps',
    overrideReason: null
  },
  {
    id: 2,
    post: 'Lusaka Breweries Logistics Gate',
    checkpoint: 'Logistics Gate',
    empId: 'CG-00112',
    empName: 'Moses Sakala',
    loggedAt: '2026-10-28 18:30',
    distanceMeters: 120,
    withinGeofence: true,
    method: 'gps',
    overrideReason: null
  },
  {
    id: 3,
    post: 'Konkola Mine Smelter Post',
    checkpoint: 'Control Room',
    empId: 'CG-00110',
    empName: 'Brian Bwalya',
    loggedAt: '2026-10-28 06:05',
    distanceMeters: null,
    withinGeofence: false,
    method: 'manual_override',
    overrideReason: 'Device GPS unavailable indoors — supervisor verified presence visually.'
  }
];

export const patrolLogsStore = new PersistedList('cyberguard_patrol_logs', seedPatrolLogs);
