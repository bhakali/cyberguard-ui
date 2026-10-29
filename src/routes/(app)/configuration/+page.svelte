<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard, formatZMW } from '$lib/cyberguard.svelte.js';
  import {
    REFERENCE_DATA_GROUPS,
    LOOKUP_DEFS,
    referenceDataStores,
    statutorySettingsStore,
    zraBandsStore
  } from '$lib/stores/referenceData.svelte.js';

  let activeGroupId = $state('statutory');
  let activeGroup = $derived(REFERENCE_DATA_GROUPS.find((g) => g.id === activeGroupId));

  let activeLookupKey = $state(REFERENCE_DATA_GROUPS.find((g) => !g.custom)?.lookups[0] ?? null);
  let activeLookupDef = $derived(activeLookupKey ? LOOKUP_DEFS[activeLookupKey] : null);
  let activeLookupStore = $derived(activeLookupKey ? referenceDataStores[activeLookupKey] : null);

  let sortedBands = $derived(
    [...zraBandsStore.items].sort((a, b) => (a.upTo === null ? Infinity : a.upTo) - (b.upTo === null ? Infinity : b.upTo))
  );

  function selectGroup(group) {
    activeGroupId = group.id;
    if (!group.custom) {
      activeLookupKey = group.lookups[0];
    }
  }

  let isModalOpen = $state(false);
  let modalMode = $state('add');
  let editingItemId = $state(null);
  let formLabel = $state('');
  let formExtra = $state({});

  function openAddModal() {
    modalMode = 'add';
    editingItemId = null;
    formLabel = '';
    formExtra = {};
    (activeLookupDef?.columns ?? []).forEach((col) => {
      formExtra[col.key] = '';
    });
    isModalOpen = true;
  }

  function openEditModal(item) {
    modalMode = 'edit';
    editingItemId = item.id;
    formLabel = item.label;
    const extra = {};
    (activeLookupDef?.columns ?? []).forEach((col) => {
      extra[col.key] = item[col.key] ?? '';
    });
    formExtra = extra;
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }

  function submitModal(e) {
    e.preventDefault();
    const label = formLabel.trim();
    if (!label) {
      cyberguard.showToast('Enter a value before saving.', 'danger');
      return;
    }
    const payload = { label, ...formExtra };

    if (modalMode === 'add') {
      activeLookupStore.add({ id: `${activeLookupKey}-${Date.now()}`, ...payload });
      cyberguard.showToast(`Added "${label}" to ${activeLookupDef.label}.`, 'success');
    } else {
      activeLookupStore.update(editingItemId, payload);
      cyberguard.showToast(`Updated "${label}" in ${activeLookupDef.label}.`, 'success');
    }
    isModalOpen = false;
  }

  function deleteItem(item) {
    if (!confirm(`Remove "${item.label}" from ${activeLookupDef.label}?`)) return;
    activeLookupStore.remove(item.id);
    cyberguard.showToast(`Removed "${item.label}" from ${activeLookupDef.label}.`, 'info');
  }

  // Statutory settings (NAPSA / NHIMA rates & ceiling) edit modal.
  // Saved to statutorySettingsStore only — kept independent of
  // cyberguard.statutoryConfig so edits here never alter live payroll math.
  let isStatutoryModalOpen = $state(false);
  let statutoryForm = $state({
    napsaRateEmployee: 0,
    napsaRateEmployer: 0,
    napsaCeiling: 0,
    nhimaRateEmployee: 0,
    nhimaRateEmployer: 0
  });

  function openStatutoryModal() {
    const v = statutorySettingsStore.value;
    statutoryForm = {
      napsaRateEmployee: +(v.napsaRateEmployee * 100).toFixed(2),
      napsaRateEmployer: +(v.napsaRateEmployer * 100).toFixed(2),
      napsaCeiling: v.napsaCeiling,
      nhimaRateEmployee: +(v.nhimaRateEmployee * 100).toFixed(2),
      nhimaRateEmployer: +(v.nhimaRateEmployer * 100).toFixed(2)
    };
    isStatutoryModalOpen = true;
  }

  function closeStatutoryModal() {
    isStatutoryModalOpen = false;
  }

  function submitStatutoryModal(e) {
    e.preventDefault();
    statutorySettingsStore.update({
      napsaRateEmployee: Number(statutoryForm.napsaRateEmployee) / 100,
      napsaRateEmployer: Number(statutoryForm.napsaRateEmployer) / 100,
      napsaCeiling: Number(statutoryForm.napsaCeiling),
      nhimaRateEmployee: Number(statutoryForm.nhimaRateEmployee) / 100,
      nhimaRateEmployer: Number(statutoryForm.nhimaRateEmployer) / 100
    });
    isStatutoryModalOpen = false;
    cyberguard.showToast('Statutory settings updated (configuration reference only — not applied to live payroll runs).', 'info');
  }

  // ZRA PAYE band add/edit/remove modal.
  let isBandModalOpen = $state(false);
  let bandModalMode = $state('add');
  let editingBandId = $state(null);
  let bandForm = $state({ upTo: '', rate: '' });

  function openAddBandModal() {
    bandModalMode = 'add';
    editingBandId = null;
    bandForm = { upTo: '', rate: '' };
    isBandModalOpen = true;
  }

  function openEditBandModal(band) {
    bandModalMode = 'edit';
    editingBandId = band.id;
    bandForm = { upTo: band.upTo === null ? '' : band.upTo, rate: +(band.rate * 100).toFixed(2) };
    isBandModalOpen = true;
  }

  function closeBandModal() {
    isBandModalOpen = false;
  }

  function submitBandModal(e) {
    e.preventDefault();
    const rate = Number(bandForm.rate);
    if (bandForm.rate === '' || Number.isNaN(rate)) {
      cyberguard.showToast('Enter a rate for this band.', 'danger');
      return;
    }
    const payload = {
      upTo: bandForm.upTo === '' ? null : Number(bandForm.upTo),
      rate: rate / 100
    };

    if (bandModalMode === 'add') {
      zraBandsStore.add({ id: `zraBand-${Date.now()}`, ...payload });
      cyberguard.showToast('Added ZRA PAYE band.', 'success');
    } else {
      zraBandsStore.update(editingBandId, payload);
      cyberguard.showToast('Updated ZRA PAYE band.', 'success');
    }
    isBandModalOpen = false;
  }

  function deleteBand(band) {
    const label = band.upTo === null ? 'No Upper Limit' : formatZMW(band.upTo);
    if (!confirm(`Remove the "${label}" PAYE band?`)) return;
    zraBandsStore.remove(band.id);
    cyberguard.showToast('Removed ZRA PAYE band.', 'info');
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Configuration</title>
</svelte:head>

<style>
  .lookup-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .lookup-nav-btn {
    text-align: left;
    padding: 10px 12px;
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .lookup-nav-btn:hover {
    background: var(--bg-card);
    color: var(--text-main);
  }
  .lookup-nav-btn.active {
    background: var(--primary);
    color: #fff;
  }
  .config-layout {
    display: grid;
    grid-template-columns: 230px 1fr;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 860px) {
    .config-layout {
      grid-template-columns: 1fr;
    }
  }
  .statutory-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }
  .statutory-tile {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 14px 16px;
  }
  .statutory-tile .label {
    font-size: 0.72rem;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 6px;
  }
  .statutory-tile .value {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-main);
  }
</style>

<Topbar title="System Configuration & Reference Data" />

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>Reference Data Configuration</h2>
      <p>Centralized lookup values used to populate dropdowns and settings across the portal</p>
    </div>
  </div>

  <div class="tabs-row" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;">
    {#each REFERENCE_DATA_GROUPS as group}
      <button class="tab-btn" class:active={activeGroupId === group.id} onclick={() => selectGroup(group)}>
        {group.label}
      </button>
    {/each}
  </div>

  {#if activeGroup?.custom}
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">NAPSA & NHIMA Rates</div>
          <div class="card-subtitle">{activeGroup.description}</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <span class="badge badge-neutral">Configuration only — not applied to live payroll</span>
          <button class="btn btn-secondary btn-sm" onclick={openStatutoryModal}>
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit Rates
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="statutory-grid">
          <div class="statutory-tile">
            <div class="label">NAPSA Employee Rate</div>
            <div class="value">{(statutorySettingsStore.value.napsaRateEmployee * 100).toFixed(2)}%</div>
          </div>
          <div class="statutory-tile">
            <div class="label">NAPSA Employer Rate</div>
            <div class="value">{(statutorySettingsStore.value.napsaRateEmployer * 100).toFixed(2)}%</div>
          </div>
          <div class="statutory-tile">
            <div class="label">NAPSA Ceiling</div>
            <div class="value">{formatZMW(statutorySettingsStore.value.napsaCeiling)}</div>
          </div>
          <div class="statutory-tile">
            <div class="label">NHIMA Employee Rate</div>
            <div class="value">{(statutorySettingsStore.value.nhimaRateEmployee * 100).toFixed(2)}%</div>
          </div>
          <div class="statutory-tile">
            <div class="label">NHIMA Employer Rate</div>
            <div class="value">{(statutorySettingsStore.value.nhimaRateEmployer * 100).toFixed(2)}%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <div class="card-header">
        <div>
          <div class="card-title">ZRA PAYE Bands</div>
          <div class="card-subtitle">{sortedBands.length} bands configured</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick={openAddBandModal}>
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Band
        </button>
      </div>
      <div class="table-responsive">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Taxable Pay Up To</th>
              <th>Rate</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each sortedBands as band (band.id)}
              <tr>
                <td>{band.upTo === null ? 'No Upper Limit' : formatZMW(band.upTo)}</td>
                <td>{(band.rate * 100).toFixed(0)}%</td>
                <td style="text-align:right;">
                  <button class="btn btn-secondary btn-sm" onclick={() => openEditBandModal(band)}>Edit</button>
                  <button class="btn btn-secondary btn-sm" onclick={() => deleteBand(band)}>Delete</button>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="3" style="text-align:center; color: var(--text-dim);">No PAYE bands configured yet.</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {:else if activeGroup}
    <div class="config-layout">
      <div class="card">
        <div class="card-body lookup-nav">
          {#each activeGroup.lookups as key}
            <button
              type="button"
              class="lookup-nav-btn"
              class:active={activeLookupKey === key}
              onclick={() => (activeLookupKey = key)}
            >
              {LOOKUP_DEFS[key].label}
              <span style="opacity:0.7; font-weight:500;">({referenceDataStores[key].items.length})</span>
            </button>
          {/each}
        </div>
      </div>

      {#if activeLookupKey}
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">{activeLookupDef.label}</div>
              <div class="card-subtitle">{activeLookupStore.items.length} values configured</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick={openAddModal}>
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Add
            </button>
          </div>
          <div class="table-responsive">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Value</th>
                  {#each activeLookupDef.columns as col}
                    <th>{col.label}</th>
                  {/each}
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each activeLookupStore.items as item (item.id)}
                  <tr>
                    <td style="font-weight:600; color: var(--text-main);">{item.label}</td>
                    {#each activeLookupDef.columns as col}
                      <td>{item[col.key]}</td>
                    {/each}
                    <td style="text-align:right;">
                      <button class="btn btn-secondary btn-sm" onclick={() => openEditModal(item)}>Edit</button>
                      <button class="btn btn-secondary btn-sm" onclick={() => deleteItem(item)}>Delete</button>
                    </td>
                  </tr>
                {:else}
                  <tr>
                    <td colspan={activeLookupDef.columns.length + 2} style="text-align:center; color: var(--text-dim);">
                      No values configured yet.
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    </div>
  {/if}

</main>

{#if isModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 520px;">
      <div class="modal-header">
        <div class="modal-title">{modalMode === 'add' ? 'Add' : 'Edit'} {activeLookupDef.label.replace(/s$/, '')}</div>
        <button class="modal-close" onclick={closeModal}>&times;</button>
      </div>
      <form onsubmit={submitModal}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="refLabel">Value <span class="req">*</span></label>
            <input type="text" class="form-control" id="refLabel" bind:value={formLabel} required>
          </div>
          {#each activeLookupDef.columns as col}
            <div class="form-group">
              <label class="form-label" for="refExtra-{col.key}">{col.label}</label>
              {#if col.type === 'select'}
                <select class="form-control" id="refExtra-{col.key}" bind:value={formExtra[col.key]}>
                  <option value="">Select {col.label}</option>
                  {#each referenceDataStores[col.source].items as opt}
                    <option value={opt.label}>{opt.label}</option>
                  {/each}
                </select>
              {:else}
                <input type={col.type} class="form-control" id="refExtra-{col.key}" bind:value={formExtra[col.key]}>
              {/if}
            </div>
          {/each}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={closeModal}>Cancel</button>
          <button type="submit" class="btn btn-primary">{modalMode === 'add' ? 'Add Value' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if isStatutoryModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 560px;">
      <div class="modal-header">
        <div class="modal-title">Edit NAPSA & NHIMA Rates</div>
        <button class="modal-close" onclick={closeStatutoryModal}>&times;</button>
      </div>
      <form onsubmit={submitStatutoryModal}>
        <div class="modal-body">
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="napsaEmp">NAPSA Employee Rate (%)</label>
              <input type="number" step="0.01" min="0" max="100" class="form-control" id="napsaEmp" bind:value={statutoryForm.napsaRateEmployee}>
            </div>
            <div class="form-group">
              <label class="form-label" for="napsaEmpr">NAPSA Employer Rate (%)</label>
              <input type="number" step="0.01" min="0" max="100" class="form-control" id="napsaEmpr" bind:value={statutoryForm.napsaRateEmployer}>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="napsaCeiling">NAPSA Ceiling (ZMW)</label>
            <input type="number" step="0.01" min="0" class="form-control" id="napsaCeiling" bind:value={statutoryForm.napsaCeiling}>
          </div>
          <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
            <div class="form-group">
              <label class="form-label" for="nhimaEmp">NHIMA Employee Rate (%)</label>
              <input type="number" step="0.01" min="0" max="100" class="form-control" id="nhimaEmp" bind:value={statutoryForm.nhimaRateEmployee}>
            </div>
            <div class="form-group">
              <label class="form-label" for="nhimaEmpr">NHIMA Employer Rate (%)</label>
              <input type="number" step="0.01" min="0" max="100" class="form-control" id="nhimaEmpr" bind:value={statutoryForm.nhimaRateEmployer}>
            </div>
          </div>
          <p style="font-size:0.78rem; color: var(--text-dim); margin:0;">
            These values are stored as configuration reference only and do not change live payroll calculations in this prototype.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={closeStatutoryModal}>Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if isBandModalOpen}
  <div class="modal-overlay active">
    <div class="modal-container" style="max-width: 480px;">
      <div class="modal-header">
        <div class="modal-title">{bandModalMode === 'add' ? 'Add' : 'Edit'} ZRA PAYE Band</div>
        <button class="modal-close" onclick={closeBandModal}>&times;</button>
      </div>
      <form onsubmit={submitBandModal}>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="bandUpTo">Taxable Pay Up To (ZMW)</label>
            <input type="number" step="0.01" min="0" class="form-control" id="bandUpTo" bind:value={bandForm.upTo} placeholder="Leave blank for No Upper Limit">
          </div>
          <div class="form-group">
            <label class="form-label" for="bandRate">Rate (%) <span class="req">*</span></label>
            <input type="number" step="0.01" min="0" max="100" class="form-control" id="bandRate" bind:value={bandForm.rate} required>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick={closeBandModal}>Cancel</button>
          <button type="submit" class="btn btn-primary">{bandModalMode === 'add' ? 'Add Band' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  </div>
{/if}
