<script>
  import Sidebar from '$lib/components/Sidebar.svelte';

  let { children } = $props();
</script>

<div class="app-layout">
  <Sidebar />
  <div class="main-wrapper">
    {@render children()}
  </div>
</div>
