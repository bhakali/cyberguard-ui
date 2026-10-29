<script>
  import { cyberguard } from '$lib/cyberguard.svelte.js';
</script>

<div id="toast-container" style="position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;">
  {#each cyberguard.toasts as toast (toast.id)}
    <div
      class="toast {toast.type}"
      style="pointer-events: auto; display: flex; align-items: center; gap: 10px; background: rgba(14, 23, 42, 0.95); backdrop-filter: blur(12px); border-left: 4px solid {toast.type === 'success' ? '#10b981' : (toast.type === 'danger' ? '#ef4444' : '#3b82f6')}; padding: 12px 18px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); min-width: 280px; max-width: 420px; animation: slideToastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);"
    >
      {#if toast.type === 'success'}
        <svg width="20" height="20" fill="none" stroke="#10b981" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      {:else if toast.type === 'danger'}
        <svg width="20" height="20" fill="none" stroke="#ef4444" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      {:else}
        <svg width="20" height="20" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      {/if}
      <div style="font-size: 0.85rem; font-weight: 500; color: #f8fafc; flex: 1;">
        {toast.message}
      </div>
      <button
        onclick={() => cyberguard.removeToast(toast.id)}
        style="color: #64748b; font-size: 1.1rem; line-height: 1; padding: 2px;"
        aria-label="Dismiss"
      >&times;</button>
    </div>
  {/each}
</div>

<style>
  @keyframes slideToastIn {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>
