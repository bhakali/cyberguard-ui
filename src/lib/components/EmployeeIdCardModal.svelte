<script>
  import QRCode from 'qrcode';
  import EmployeeAvatar from './EmployeeAvatar.svelte';

  let { emp, onClose } = $props();

  let qrSvg = $state('');

  $effect(() => {
    QRCode.toString(emp.id, {
      type: 'svg',
      margin: 1,
      width: 180,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((svg) => (qrSvg = svg))
      .catch(() => (qrSvg = ''));
  });

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[c]);
  }

  function printId() {
    const printWindow = window.open('', '_blank', 'width=420,height=680');
    if (!printWindow) return;

    const initials = `${emp.firstName?.[0] ?? ''}${emp.lastName?.[0] ?? ''}`;
    const avatarHtml = emp.photoUrl
      ? `<img class="avatar" src="${emp.photoUrl}" alt="" />`
      : `<div class="avatar avatar-initials">${escapeHtml(initials)}</div>`;

    printWindow.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Employee ID - ${escapeHtml(emp.id)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 24px;
    display: flex;
    justify-content: center;
    background: #f1f5f9;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  }
  .card {
    width: 300px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 14px;
    padding: 22px;
    text-align: center;
    color: #0f172a;
  }
  .brand-name { font-weight: 800; font-size: 0.95rem; }
  .brand-sub { font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-top: 2px; }
  .avatar {
    width: 88px; height: 88px; border-radius: 9999px; margin: 16px auto 0;
    object-fit: cover; display: block; border: 3px solid #e2e8f0;
  }
  .avatar-initials {
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #2563eb, #06b6d4);
    color: #fff; font-weight: 800; font-size: 2rem;
  }
  .name { font-size: 1.1rem; font-weight: 800; margin-top: 12px; }
  .role { font-size: 0.82rem; font-weight: 600; color: #2563eb; }
  .dept { font-size: 0.74rem; color: #475569; }
  .meta { font-size: 0.7rem; color: #64748b; margin-top: 6px; }
  .qr { margin-top: 16px; }
  .qr svg { width: 160px; height: 160px; }
  .qr-caption { font-size: 0.66rem; color: #64748b; margin-top: 6px; }
  .footer {
    margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0;
    font-size: 0.72rem; color: #475569;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="brand-name">CyberGuard Security</div>
    <div class="brand-sub">Enterprise Workforce</div>
    ${avatarHtml}
    <div class="name">${escapeHtml(emp.firstName)} ${escapeHtml(emp.lastName)}</div>
    <div class="role">${escapeHtml(emp.jobTitle)}</div>
    <div class="dept">${escapeHtml(emp.department)}</div>
    <div class="meta">ID: ${escapeHtml(emp.id)} &nbsp;&bull;&nbsp; NRC: ${escapeHtml(emp.nationalId)}</div>
    <div class="qr">${qrSvg}</div>
    <div class="qr-caption">Scan to verify &middot; ${escapeHtml(emp.id)}</div>
    <div class="footer">${escapeHtml(emp.status || 'Active Service')} &nbsp;&bull;&nbsp; ${escapeHtml(emp.siteAssigned)}</div>
  </div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
</script>

<div class="modal-overlay active">
  <div class="modal-container id-card-modal">
    <div class="modal-header">
      <div class="modal-title">Employee ID</div>
      <button class="modal-close" onclick={onClose}>&times;</button>
    </div>

    <div class="modal-body">
      <div class="id-card">
        <div class="id-card-brand">
          <span class="id-card-brand-name">CyberGuard Security</span>
          <span class="id-card-brand-sub">Enterprise Workforce</span>
        </div>

        <EmployeeAvatar {emp} variant="hero" />

        <div class="id-card-name">{emp.firstName} {emp.lastName}</div>
        <div class="id-card-role">{emp.jobTitle}</div>
        <div class="id-card-dept">{emp.department}</div>

        <div class="id-card-meta">
          ID: {emp.id} &nbsp;•&nbsp; NRC: {emp.nationalId}
        </div>

        <div class="id-card-qr">
          {#if qrSvg}
            {@html qrSvg}
          {/if}
        </div>
        <div class="id-card-qr-caption">Scan to verify &middot; {emp.id}</div>

        <div class="id-card-footer">
          <span class="badge badge-success"
            ><span class="badge-dot"></span> {emp.status || 'Active Service'}</span
          >
          <span class="id-card-site">{emp.siteAssigned}</span>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" onclick={onClose}>Close</button>
      <button class="btn btn-primary" disabled={!qrSvg} onclick={printId}>
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
        Print ID
      </button>
    </div>
  </div>
</div>

<style>
  .id-card-modal {
    max-width: 380px;
  }

  .id-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
    padding: 6px 0 10px;
  }

  .id-card-brand {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
  }

  .id-card-brand-name {
    font-weight: 800;
    font-size: 0.95rem;
    color: #fff;
  }

  .id-card-brand-sub {
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-dim);
  }

  .id-card-name {
    font-size: 1.15rem;
    font-weight: 800;
    color: #fff;
    margin-top: 12px;
  }

  .id-card-role {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--accent-cyan);
  }

  .id-card-dept {
    font-size: 0.76rem;
    color: var(--text-muted);
  }

  .id-card-meta {
    font-size: 0.72rem;
    color: var(--text-dim);
    margin-top: 6px;
  }

  .id-card-qr {
    background: #ffffff;
    padding: 14px;
    border-radius: var(--radius-md);
    margin-top: 16px;
    line-height: 0;
  }

  .id-card-qr :global(svg) {
    display: block;
    width: 160px;
    height: 160px;
  }

  .id-card-qr-caption {
    font-size: 0.68rem;
    color: var(--text-dim);
    margin-top: 8px;
  }

  .id-card-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--border-subtle);
    width: 100%;
  }

  .id-card-site {
    font-size: 0.74rem;
    color: var(--text-muted);
  }
</style>
