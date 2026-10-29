<script>
  import { cyberguard } from '$lib/cyberguard.svelte.js';

  let { chain = [], currentStep = 1 } = $props();

  function roleTitle(roleId) {
    return cyberguard.roles.find((r) => r.id === roleId)?.title || roleId;
  }

  function stepState(step) {
    if (step.status === 'approved') return 'done';
    if (step.status === 'rejected') return 'rejected';
    if (step.step === currentStep) return 'active';
    return 'pending';
  }
</script>

<div class="approval-stepper">
  {#each chain as step, idx (step.step)}
    <div class="approval-step state-{stepState(step)}">
      <div class="approval-step-marker">
        {#if step.status === 'approved'}
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
        {:else if step.status === 'rejected'}
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
        {:else}
          {step.step}
        {/if}
      </div>
      <div class="approval-step-label">
        <div class="approval-step-role">{roleTitle(step.role)}</div>
        <div class="approval-step-name">{step.approverName || 'Pending Assignment'}</div>
        {#if step.decidedAt}
          <div class="approval-step-date">{step.status === 'approved' ? 'Approved' : 'Rejected'} {step.decidedAt}</div>
        {/if}
      </div>
    </div>
    {#if idx < chain.length - 1}
      <div class="approval-step-connector state-{step.status === 'approved' ? 'done' : 'pending'}"></div>
    {/if}
  {/each}
</div>

<style>
  .approval-stepper {
    display: flex;
    align-items: flex-start;
    gap: 0;
    flex-wrap: wrap;
  }

  .approval-step {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-width: 150px;
  }

  .approval-step-marker {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.74rem;
    font-weight: 700;
    flex-shrink: 0;
    background: var(--bg-card-subtle);
    color: var(--text-dim);
    border: 2px solid var(--border-subtle);
  }

  .approval-step.state-done .approval-step-marker {
    background: var(--success);
    color: #fff;
    border-color: var(--success);
  }

  .approval-step.state-active .approval-step-marker {
    background: var(--primary-soft);
    color: var(--primary-light);
    border-color: var(--primary-light);
  }

  .approval-step.state-rejected .approval-step-marker {
    background: var(--danger);
    color: #fff;
    border-color: var(--danger);
  }

  .approval-step-role {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .approval-step-name {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .approval-step-date {
    font-size: 0.68rem;
    color: var(--text-dim);
    margin-top: 1px;
  }

  .approval-step-connector {
    width: 40px;
    height: 2px;
    margin-top: 12px;
    background: var(--border-subtle);
  }

  .approval-step-connector.state-done {
    background: var(--success);
  }
</style>
