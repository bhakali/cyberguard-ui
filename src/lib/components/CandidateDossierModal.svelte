<script>
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { can } from '$lib/rbac.js';
  import { STAGE_LABELS, nextStage } from '$lib/stores/candidates.svelte.js';
  import { requisitionsStore } from '$lib/stores/requisitions.svelte.js';
  import DocumentsPanel from './DocumentsPanel.svelte';

  let { candidate, onClose, onMove, onReject, onMarkHired } = $props();

  let linkedRequisition = $derived(
    candidate.requisitionId
      ? requisitionsStore.items.find((r) => r.id === candidate.requisitionId)
      : null
  );

  let canAct = $derived(can(cyberguard.activeRoleId, 'canApprove'));
  let upcomingStage = $derived(nextStage(candidate.stage));
</script>

<div class="modal-overlay active">
  <div class="modal-container" style="max-width: 640px;">
    <div class="modal-header">
      <div>
        <div class="modal-title">{candidate.name}</div>
        <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
          {candidate.targetRole}{candidate.region ? ` • ${candidate.region}` : ''}
        </div>
      </div>
      <button class="modal-close" onclick={onClose}>&times;</button>
    </div>

    <div class="modal-body">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 18px;">
        <span class="badge {candidate.badgeClass || 'badge-neutral'}">{candidate.badgeLabel || 'Unrated'}</span>
        <span class="badge badge-primary">{STAGE_LABELS[candidate.stage]}</span>
        {#if candidate.empId}
          <span class="badge badge-success">Hired as {candidate.empId}</span>
        {/if}
      </div>

      <div class="dossier-section-header">
        <h3 style="font-size: 0.85rem;">Candidate Details</h3>
      </div>
      <div class="form-grid" style="margin-bottom: 20px;">
        <div class="form-group">
          <div class="form-label">National ID / Passport</div>
          <div class="dossier-val">{candidate.nrcLine || 'Not captured'}</div>
        </div>
        <div class="form-group">
          <div class="form-label">Region</div>
          <div class="dossier-val">{candidate.region || 'Not captured'}</div>
        </div>
        <div class="form-group">
          <div class="form-label">Applied / Status</div>
          <div class="dossier-val">{candidate.appliedDate || '—'}</div>
        </div>
        <div class="form-group">
          <div class="form-label">Linked Requisition</div>
          <div class="dossier-val">{linkedRequisition ? `${linkedRequisition.title} (${linkedRequisition.station})` : 'Unlinked / General Pipeline'}</div>
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
          <div class="form-label">Vetting Notes</div>
          <div class="dossier-val">{candidate.vettingNotes || 'No notes captured yet.'}</div>
        </div>
      </div>

      <div class="dossier-section-header">
        <h3 style="font-size: 0.85rem;">Pipeline History</h3>
      </div>
      <div style="margin-bottom: 20px;">
        {#each candidate.stageHistory as entry, i (i)}
          <div class="stage-history-row">
            <span class="stage-history-label">{STAGE_LABELS[entry.stage] || entry.stage}</span>
            <span class="stage-history-date">{entry.enteredAt}</span>
          </div>
        {/each}
      </div>

      <div class="dossier-section-header">
        <h3 style="font-size: 0.85rem;">Submitted Documents</h3>
      </div>
      <DocumentsPanel recordType="candidate" recordId={candidate.id} />
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" onclick={onClose}>Close</button>
      {#if candidate.stage !== 'rejected' && candidate.stage !== 'hired'}
        <button class="btn btn-danger" disabled={!canAct} onclick={() => { onReject(candidate); onClose(); }}>
          Reject
        </button>
        {#if candidate.stage === 'offer'}
          <button class="btn btn-primary" disabled={!canAct} onclick={() => { onMarkHired(candidate); onClose(); }}>
            Mark Hired
          </button>
        {:else if upcomingStage}
          <button class="btn btn-primary" disabled={!canAct} onclick={() => onMove(candidate)}>
            Move to {STAGE_LABELS[upcomingStage]} →
          </button>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .dossier-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .dossier-section-header h3 {
    color: #93c5fd;
  }

  .dossier-val {
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .stage-history-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 14px;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    margin-bottom: 6px;
    font-size: 0.8rem;
  }

  .stage-history-label {
    font-weight: 600;
    color: var(--text-main);
  }

  .stage-history-date {
    color: var(--text-dim);
    font-size: 0.72rem;
  }
</style>
