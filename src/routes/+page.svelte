<script>
  import { goto } from "$app/navigation";
  import { cyberguard } from "$lib/cyberguard.svelte.js";

  let email = $state("m.kapwepwe@CyberGuard.zm");
  let password = $state("••••••••••••");
  let rememberSession = $state(true);

  const DEMO_USERS = {
    "m.kapwepwe@CyberGuard.zm": { roleId: "exec", empId: "CG-00101" },
    "m.kangwa@CyberGuard.zm": { roleId: "hr", empId: "CG-00104" },
    "p.banda@CyberGuard.zm": { roleId: "ops", empId: "CG-00102" },
    "j.phiri@CyberGuard.zm": { roleId: "area", empId: "CG-00107" },
    "k.musonda@CyberGuard.zm": { roleId: "guard", empId: "CG-00111" }
  };

  function applyDemoUser(selectedEmail, role) {
    email = selectedEmail;
    cyberguard.showToast(`Selected demo identity: ${role}`, "info");
  }

  function handleLogin(e) {
    e.preventDefault();
    const demo = DEMO_USERS[email];
    if (demo) {
      cyberguard.switchActiveRole(demo.roleId);
      cyberguard.setLoggedInEmployee(demo.empId);
    }
    cyberguard.showToast(
      "Authentication successful! Loading enterprise workspace...",
      "success",
    );
    setTimeout(() => {
      goto(demo && demo.roleId === "guard" ? "/my-profile" : "/dashboard");
    }, 600);
  }
</script>

<svelte:head>
  <title>CyberGuard Security | Secure Authentication Portal</title>
</svelte:head>

<div class="auth-page">
  <!-- Floating Theme Switcher Button -->
  <div style="position: absolute; top: 20px; right: 24px; z-index: 10;">
    <button
      type="button"
      class="theme-switcher-btn"
      id="themeToggleBtn"
      onclick={() => cyberguard.cycleTheme()}
      title="Switch UI Theme Mode (Dark, Mixed, Light)"
    >
      <span class="theme-icon">
        {#if cyberguard.theme === "light"}☀️{:else if cyberguard.theme === "mixed"}🌓{:else}🌙{/if}
      </span>
      <span class="theme-label">
        {#if cyberguard.theme === "light"}Light Mode{:else if cyberguard.theme === "mixed"}Mixed
          Mode{:else}Dark Mode{/if}
      </span>
    </button>
  </div>

  <div class="auth-card">
    <div class="auth-brand">
      <div class="auth-brand-logo">
        <svg
          width="26"
          height="26"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 800; color: #fff;">
          CyberGuard Security
        </h2>
        <span
          style="font-size: 0.7rem; color: var(--accent-cyan); text-transform: uppercase; font-weight: 700; letter-spacing: 0.08em;"
          >Workforce & Operations Management</span
        >
      </div>
    </div>

    <div class="auth-header">
      <h1>Sign In</h1>
      <p>Please sign in with your corporate email and password</p>
    </div>

    <!-- Quick Role Switcher for Interactive Demo -->
    <div class="demo-credentials-box">
      <div class="demo-title">
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          /></svg
        >
        Select Demo Profile (Quick Launch):
      </div>
      <div class="demo-presets">
        <button
          type="button"
          class="preset-btn"
          onclick={() =>
            applyDemoUser("m.kapwepwe@CyberGuard.zm", "Managing Director")}
        >
          <span class="role-tag">Managing Director</span>
          <span class="role-sub">Dr. Mwamba Kapwepwe</span>
        </button>
        <button
          type="button"
          class="preset-btn"
          onclick={() => applyDemoUser("m.kangwa@CyberGuard.zm", "HR Manager")}
        >
          <span class="role-tag">HR Manager</span>
          <span class="role-sub">Mutale Kangwa</span>
        </button>
        <button
          type="button"
          class="preset-btn"
          onclick={() =>
            applyDemoUser("p.banda@CyberGuard.zm", "Director Operations")}
        >
          <span class="role-tag">Director Operations</span>
          <span class="role-sub">Lt. Col. P. Banda (Rtd)</span>
        </button>
        <button
          type="button"
          class="preset-btn"
          onclick={() => applyDemoUser("j.phiri@CyberGuard.zm", "Area Manager")}
        >
          <span class="role-tag">Area Manager</span>
          <span class="role-sub">Joseph Phiri (Copperbelt)</span>
        </button>
        <button
          type="button"
          class="preset-btn"
          onclick={() =>
            applyDemoUser("k.musonda@CyberGuard.zm", "Senior Armed Guard (Self-Service)")}
        >
          <span class="role-tag">Senior Armed Guard</span>
          <span class="role-sub">Kelvin Musonda (Self-Service)</span>
        </button>
      </div>
    </div>

    <form id="loginForm" onsubmit={handleLogin}>
      <div class="form-group">
        <label for="loginEmail" class="form-label"
          >Corporate Email / Username</label
        >
        <input
          type="email"
          id="loginEmail"
          class="form-control"
          bind:value={email}
          required
        />
      </div>

      <div class="form-group">
        <div
          style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;"
        >
          <label
            for="loginPassword"
            class="form-label"
            style="margin-bottom: 0;">Password</label
          >
          <a
            href="#forgot"
            onclick={(e) => {
              e.preventDefault();
              cyberguard.showToast(
                "Password reset link dispatched to authorized enterprise email.",
                "info",
              );
            }}
            style="font-size: 0.72rem; color: var(--primary-light);"
            >Forgot credentials?</a
          >
        </div>
        <input
          type="password"
          id="loginPassword"
          class="form-control"
          bind:value={password}
          required
        />
      </div>

      <div
        style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; font-size: 0.8rem; color: var(--text-muted);"
      >
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer;"
        >
          <input
            type="checkbox"
            bind:checked={rememberSession}
            style="accent-color: var(--primary);"
          /> Remember session
        </label>
        <span class="badge badge-success">
          <span class="badge-dot"></span> 2FA Enforced
        </span>
      </div>

      <button
        type="submit"
        class="btn btn-primary"
        style="width: 100%; justify-content: center; padding: 12px; font-size: 0.95rem;"
      >
        Login
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          /></svg
        >
      </button>
    </form>

    <div class="auth-footer">Copyright 2026</div>
  </div>
</div>

<style>
  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 50% 20%, #1e2c4f 0%, #080d1a 75%);
    position: relative;
    padding: 24px;
  }

  .auth-card {
    width: 100%;
    max-width: 480px;
    background: rgba(14, 23, 42, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-xl);
    padding: 40px;
    box-shadow:
      0 25px 60px rgba(0, 0, 0, 0.6),
      0 0 30px rgba(37, 99, 235, 0.2);
    position: relative;
    z-index: 2;
  }

  .auth-brand {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 28px;
  }

  .auth-brand-logo {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, #2563eb, #06b6d4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
  }

  .auth-header h1 {
    font-size: 1.55rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #ffffff;
  }

  .auth-header p {
    color: var(--text-muted);
    font-size: 0.86rem;
    margin-top: 4px;
    margin-bottom: 24px;
  }

  .demo-credentials-box {
    background: rgba(37, 99, 235, 0.08);
    border: 1px dashed rgba(59, 130, 246, 0.4);
    border-radius: var(--radius-md);
    padding: 14px;
    margin-bottom: 24px;
  }

  .demo-title {
    font-size: 0.72rem;
    text-transform: uppercase;
    font-weight: 700;
    color: #93c5fd;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .demo-presets {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .preset-btn {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .preset-btn:hover {
    border-color: var(--primary-light);
    background: rgba(37, 99, 235, 0.15);
  }

  .preset-btn .role-tag {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-main);
    display: block;
  }

  .preset-btn .role-sub {
    font-size: 0.65rem;
    color: var(--text-muted);
  }

  .auth-footer {
    margin-top: 24px;
    text-align: center;
    font-size: 0.74rem;
    color: var(--text-dim);
  }
</style>
