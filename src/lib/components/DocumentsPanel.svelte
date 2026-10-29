<script>
  import { cyberguard } from '$lib/cyberguard.svelte.js';
  import { documentsStore, getDocumentsFor, attachDocument } from '$lib/stores/documents.svelte.js';

  let { recordType, recordId } = $props();

  let category = $state('General');
  let fileInputEl = $state(null);

  let docs = $derived(getDocumentsFor(recordType, recordId));

  function handleFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    attachDocument(recordType, recordId, file, category, cyberguard.currentUser?.name);
    cyberguard.showToast(`Attached "${file.name}" to this record.`, 'success');
    e.target.value = '';
  }

  function removeDoc(docId) {
    documentsStore.remove(docId);
    cyberguard.showToast('Document removed.', 'info');
  }
</script>

<div class="docs-panel">
  <div class="docs-upload-row">
    <select class="form-control" style="max-width: 220px;" bind:value={category}>
      <option value="General">General</option>
      <option value="CV / Resume">CV / Resume</option>
      <option value="Identity Document">Identity Document</option>
      <option value="Contract">Contract</option>
      <option value="Certificate / License">Certificate / License</option>
      <option value="Clearance Record">Clearance Record</option>
    </select>
    <button type="button" class="btn btn-secondary btn-sm" onclick={() => fileInputEl.click()}>
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
      Attach File
    </button>
    <input bind:this={fileInputEl} type="file" style="display: none;" onchange={handleFileSelected} />
  </div>

  {#if docs.length === 0}
    <div class="docs-empty">No files attached yet.</div>
  {:else}
    <div class="docs-list">
      {#each docs as doc (doc.id)}
        <div class="docs-row">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <div class="docs-row-main">
            <div class="docs-row-name">{doc.fileName}</div>
            <div class="docs-row-meta">{doc.category} • {doc.sizeLabel} • Uploaded {doc.uploadedAt} by {doc.uploadedBy}</div>
          </div>
          <button type="button" class="docs-remove" onclick={() => removeDoc(doc.id)} title="Remove file">&times;</button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .docs-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .docs-upload-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .docs-empty {
    font-size: 0.82rem;
    color: var(--text-muted);
    padding: 10px 2px;
  }

  .docs-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .docs-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    color: var(--accent-cyan);
  }

  .docs-row-main {
    flex: 1;
    color: var(--text-main);
  }

  .docs-row-name {
    font-size: 0.85rem;
    font-weight: 600;
  }

  .docs-row-meta {
    font-size: 0.72rem;
    color: var(--text-dim);
    margin-top: 1px;
  }

  .docs-remove {
    background: none;
    border: none;
    color: var(--danger);
    font-size: 1.1rem;
    cursor: pointer;
    padding: 4px 6px;
    line-height: 1;
  }
</style>
