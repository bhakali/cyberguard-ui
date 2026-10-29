<script>
  import { compressImageToDataUrl } from '$lib/utils/image.js';

  let { emp, variant = 'hero', editable = false, onUpload = () => {} } = $props();

  let fileInputEl = $state(null);
  let isUploading = $state(false);

  let initials = $derived(`${emp.firstName?.[0] ?? ''}${emp.lastName?.[0] ?? ''}`);
  let baseClass = $derived(variant === 'hero' ? 'profile-avatar-lg' : 'user-cell-avatar');

  async function handleFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;

    isUploading = true;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      onUpload?.(dataUrl);
    } catch (err) {
      console.error(err);
    } finally {
      isUploading = false;
    }
  }
</script>

<div class="{baseClass} employee-avatar">
  {#if emp.photoUrl}
    <img src={emp.photoUrl} alt="{emp.firstName} {emp.lastName}" />
  {:else}
    <span>{initials}</span>
  {/if}

  {#if editable}
    <button
      type="button"
      class="employee-avatar-edit"
      title="Upload photo"
      disabled={isUploading}
      onclick={() => fileInputEl.click()}
    >
      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 17a4 4 0 100-8 4 4 0 000 8z"/></svg>
    </button>
    <input
      bind:this={fileInputEl}
      type="file"
      accept="image/*"
      style="display: none;"
      onchange={handleFileSelected}
    />
  {/if}
</div>

<style>
  .profile-avatar-lg {
    width: 88px;
    height: 88px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, #2563eb, #06b6d4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 800;
    color: white;
    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
    border: 3px solid rgba(255, 255, 255, 0.15);
  }

  .employee-avatar {
    position: relative;
    overflow: hidden;
  }

  .employee-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .employee-avatar-edit {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-full);
    background: var(--accent-cyan);
    border: 2px solid var(--bg-card);
    color: #06202a;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
  }

  .employee-avatar-edit:disabled {
    opacity: 0.6;
    cursor: wait;
  }
</style>
