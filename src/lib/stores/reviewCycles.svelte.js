import { PersistedList } from './persisted.svelte.js';

const seedCycles = [
  {
    id: 1,
    name: 'Q3 2026',
    periodStart: '2026-07-01',
    periodEnd: '2026-09-30',
    status: 'open'
  }
];

export const reviewCyclesStore = new PersistedList('cyberguard_review_cycles', seedCycles);
