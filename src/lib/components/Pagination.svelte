<script>
  let { currentPage = $bindable(1), totalItems = 0, pageSize = 10 } = $props();

  let totalPages = $derived(Math.max(1, Math.ceil(totalItems / pageSize)));

  $effect(() => {
    if (currentPage > totalPages) currentPage = totalPages;
    else if (currentPage < 1) currentPage = 1;
  });

  let startItem = $derived(totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1);
  let endItem = $derived(Math.min(currentPage * pageSize, totalItems));

  let pageNumbers = $derived.by(() => {
    const windowSize = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  function goTo(p) {
    currentPage = Math.min(Math.max(1, p), totalPages);
  }
</script>

{#if totalItems > 0}
  <div class="pagination-bar">
    <div class="pagination-info">
      Showing <strong>{startItem}–{endItem}</strong> of <strong>{totalItems}</strong>
    </div>
    <div class="pagination-controls">
      <button class="btn btn-secondary btn-sm" disabled={currentPage === 1} onclick={() => goTo(currentPage - 1)}>
        ← Prev
      </button>
      {#if pageNumbers[0] > 1}
        <button class="btn btn-secondary btn-sm" onclick={() => goTo(1)}>1</button>
        {#if pageNumbers[0] > 2}<span class="pagination-ellipsis">…</span>{/if}
      {/if}
      {#each pageNumbers as p (p)}
        <button
          class="btn btn-sm {p === currentPage ? 'btn-primary' : 'btn-secondary'}"
          onclick={() => goTo(p)}
        >
          {p}
        </button>
      {/each}
      {#if pageNumbers[pageNumbers.length - 1] < totalPages}
        {#if pageNumbers[pageNumbers.length - 1] < totalPages - 1}<span class="pagination-ellipsis">…</span>{/if}
        <button class="btn btn-secondary btn-sm" onclick={() => goTo(totalPages)}>{totalPages}</button>
      {/if}
      <button class="btn btn-secondary btn-sm" disabled={currentPage === totalPages} onclick={() => goTo(currentPage + 1)}>
        Next →
      </button>
    </div>
  </div>
{/if}

<style>
  .pagination-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding: 14px 18px;
    border-top: 1px solid var(--border-subtle);
  }

  .pagination-info {
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  .pagination-info strong {
    color: var(--text-main);
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .pagination-controls .btn-sm {
    min-width: 34px;
    padding: 6px 10px;
  }

  .pagination-ellipsis {
    color: var(--text-dim);
    padding: 0 2px;
    font-size: 0.8rem;
  }
</style>
