import { PersistedList } from './persisted.svelte.js';

const seedRequisitions = [
  {
    id: 1,
    title: 'Armed Sentry Guard',
    department: 'Security Operations - North',
    slots: 15,
    slotsFilled: 1,
    station: 'Kansanshi Hub',
    closingDate: '2026-11-15',
    status: 'open',
    createdAt: '2026-10-01'
  }
];

export const requisitionsStore = new PersistedList('cyberguard_requisitions', seedRequisitions);
