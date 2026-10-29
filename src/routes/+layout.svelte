<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { attendanceStore, normalizeAttendanceChains } from '$lib/stores/attendance.svelte.js';
  import { recruitmentStore } from '$lib/stores/recruitment.svelte.js';
  import { offboardingStore, normalizeOffboardingChains } from '$lib/stores/offboarding.svelte.js';
  import { performanceStore } from '$lib/stores/performance.svelte.js';
  import { complianceStore } from '$lib/stores/compliance.svelte.js';
  import { documentsStore } from '$lib/stores/documents.svelte.js';
  import { notifications } from '$lib/stores/notifications.svelte.js';
  import { payrollRunsStore } from '$lib/stores/payrollRuns.svelte.js';
  import { candidatesStore } from '$lib/stores/candidates.svelte.js';
  import { requisitionsStore } from '$lib/stores/requisitions.svelte.js';
  import { reviewCyclesStore } from '$lib/stores/reviewCycles.svelte.js';
  import { rosterStore } from '$lib/stores/roster.svelte.js';
  import { grievancesStore, normalizeGrievanceChains } from '$lib/stores/grievances.svelte.js';
  import { policiesStore, acknowledgmentsStore } from '$lib/stores/policies.svelte.js';
  import { successionStore } from '$lib/stores/successionPlanning.svelte.js';
  import { coursesStore, trainingRecordsStore } from '$lib/stores/training.svelte.js';
  import { announcementsStore, recognitionStore, surveysStore, surveyResponsesStore } from '$lib/stores/engagement.svelte.js';
  import { incidentsStore, normalizeIncidentChains } from '$lib/stores/incidents.svelte.js';
  import { checkpointsStore, patrolLogsStore } from '$lib/stores/patrols.svelte.js';
  import { initReferenceData } from '$lib/stores/referenceData.svelte.js';
  import ToastContainer from '$lib/components/ToastContainer.svelte';

  let { children } = $props();

  onMount(() => {
    cyberguard.initClient();
    attendanceStore.init();
    normalizeAttendanceChains();
    recruitmentStore.init();
    offboardingStore.init();
    normalizeOffboardingChains();
    performanceStore.init();
    complianceStore.init();
    documentsStore.init();
    notifications.init();
    payrollRunsStore.init();
    candidatesStore.init();
    requisitionsStore.init();
    reviewCyclesStore.init();
    rosterStore.init();
    grievancesStore.init();
    normalizeGrievanceChains();
    policiesStore.init();
    acknowledgmentsStore.init();
    successionStore.init();
    coursesStore.init();
    trainingRecordsStore.init();
    announcementsStore.init();
    recognitionStore.init();
    surveysStore.init();
    surveyResponsesStore.init();
    incidentsStore.init();
    normalizeIncidentChains();
    checkpointsStore.init();
    patrolLogsStore.init();
    initReferenceData();
  });

  // Automatically close mobile menu when navigating
  $effect(() => {
    if (page.url) {
      cyberguard.toggleMobileNav(false);
    }
  });
</script>

{@render children()}

<ToastContainer />
