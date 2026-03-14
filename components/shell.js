// ============================================================
//  components/shell.js  —  Renders sidebar + topbar
// ============================================================

function renderShell(activePage) {
  const menuItems = [
    { id: "dashboard",    href: "dashboard.html",     icon: "bi-speedometer2",   label: "Dashboard",      roles: ["admin","staff","viewer"] },
    { id: "form-builder", href: "form-builder.html",  icon: "bi-pencil-square",  label: "Form Builder",   roles: ["admin"] },
    { id: "forms",        href: "forms.html",         icon: "bi-collection",     label: "Manage Forms",   roles: ["admin","staff"] },
    { id: "responses",    href: "responses.html",     icon: "bi-table",          label: "Student Data",   roles: ["admin","staff","viewer"] },
    { id: "users",        href: "users.html",         icon: "bi-people",         label: "User Management",roles: ["admin"] },
    { id: "settings",     href: "settings.html",      icon: "bi-gear",           label: "Settings",       roles: ["admin"] },
  ];

  const sidebarHTML = `
    <aside class="sidebar" id="sidebar">
      <a class="sidebar-brand" href="dashboard.html">
        <div class="sidebar-brand-icon"><i class="bi bi-mortarboard-fill"></i></div>
        <div class="sidebar-brand-text">
          <span class="sidebar-brand-title">SchoolForm</span>
          <span class="sidebar-brand-sub">Data Platform</span>
        </div>
      </a>

      <nav class="sidebar-nav" id="sidebar-nav">
        <div class="sidebar-section-label">Main</div>
        ${menuItems.slice(0,1).map(item => menuItemHTML(item, activePage)).join("")}
        
        <div class="sidebar-section-label" style="margin-top:8px">Forms</div>
        ${menuItems.slice(1,4).map(item => menuItemHTML(item, activePage)).join("")}
        
        <div class="sidebar-section-label" style="margin-top:8px" data-require-role="admin">Administration</div>
        ${menuItems.slice(4).map(item => menuItemHTML(item, activePage)).join("")}
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user" onclick="Auth.logout()">
          <div class="sidebar-avatar" id="sidebar-avatar">?</div>
          <div class="sidebar-user-info">
            <span class="sidebar-user-name" id="sidebar-name">Loading…</span>
            <span class="sidebar-user-role" id="sidebar-role"></span>
          </div>
          <i class="bi bi-box-arrow-right" style="color:#475569;font-size:14px" title="Logout"></i>
        </div>
      </div>
    </aside>`;

  const topbarHTML = `
    <header class="topbar">
      <button class="topbar-btn d-lg-none" id="sidebar-toggle" onclick="document.getElementById('sidebar').classList.toggle('show')">
        <i class="bi bi-list"></i>
      </button>
      <div class="topbar-title" id="page-title"></div>
      <div class="topbar-actions">
        <button class="topbar-btn" id="theme-toggle" title="Toggle dark mode" onclick="toggleTheme()">
          <i class="bi bi-moon" id="theme-icon"></i>
        </button>
        <div class="topbar-profile dropdown">
          <div data-bs-toggle="dropdown" style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <div class="topbar-avatar" id="topbar-avatar">?</div>
            <div class="d-none d-md-block">
              <div class="topbar-profile-name" id="topbar-name">Loading…</div>
              <div class="topbar-profile-role" id="topbar-role"></div>
            </div>
            <i class="bi bi-chevron-down" style="font-size:11px;color:#64748b"></i>
          </div>
          <ul class="dropdown-menu dropdown-menu-end shadow border-0" style="min-width:180px;border-radius:12px;padding:6px">
            <li><a class="dropdown-item rounded-2 py-2" href="dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>
            <li><hr class="dropdown-divider my-1"></li>
            <li><button class="dropdown-item rounded-2 py-2 text-danger" onclick="Auth.logout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
          </ul>
        </div>
      </div>
    </header>`;

  return { sidebarHTML, topbarHTML };
}

function menuItemHTML(item, activePage) {
  const active = item.id === activePage ? " active" : "";
  const rolesAttr = `data-require-role="${item.roles.join(",")}"`;
  return `<a href="${item.href}" class="sidebar-link${active}" ${rolesAttr}>
    <i class="bi ${item.icon}"></i>
    <span>${item.label}</span>
  </a>`;
}

// ── Theme toggle ─────────────────────────────────────────────
function initTheme() {
  const stored = localStorage.getItem("sfs-theme") || "light";
  document.documentElement.setAttribute("data-theme", stored);
  updateThemeIcon(stored);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("sfs-theme", next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("theme-icon");
  if (icon) icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon";
}

// ── Toast helper ─────────────────────────────────────────────
function showToast(message, type = "success", title = "") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(container);
  }

  const icons = { success: "bi-check-circle-fill text-success", danger: "bi-x-circle-fill text-danger", warning: "bi-exclamation-triangle-fill text-warning", info: "bi-info-circle-fill text-primary" };
  const id = "toast-" + Date.now();
  container.insertAdjacentHTML("beforeend", `
    <div id="${id}" class="toast align-items-center border-0 shadow-sm" role="alert" aria-live="assertive" data-bs-autohide="true" data-bs-delay="4000">
      <div class="d-flex" style="padding:12px 14px">
        <i class="bi ${icons[type] || icons.info} me-2 mt-1" style="font-size:15px;flex-shrink:0"></i>
        <div class="flex-grow-1">
          ${title ? `<div style="font-weight:600;font-size:13px">${title}</div>` : ""}
          <div style="font-size:13px;${title ? "color:#64748b" : ""}">${message}</div>
        </div>
        <button type="button" class="btn-close ms-2 my-auto" data-bs-dismiss="toast" style="font-size:11px"></button>
      </div>
    </div>`);

  const el = document.getElementById(id);
  const toast = new bootstrap.Toast(el);
  toast.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}

// ── Confirm modal helper ──────────────────────────────────────
function confirmAction(message, title = "Confirm Action") {
  return new Promise(resolve => {
    let modal = document.getElementById("confirm-modal");
    if (!modal) {
      document.body.insertAdjacentHTML("beforeend", `
        <div class="modal fade" id="confirm-modal" tabindex="-1">
          <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header border-0 pb-0">
                <h6 class="modal-title fw-700" id="confirm-title">Confirm</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body pt-2" id="confirm-message"></div>
              <div class="modal-footer border-0 pt-0">
                <button class="btn btn-sm btn-light" data-bs-dismiss="modal">Cancel</button>
                <button class="btn btn-sm btn-danger" id="confirm-ok">Delete</button>
              </div>
            </div>
          </div>
        </div>`);
      modal = document.getElementById("confirm-modal");
    }
    document.getElementById("confirm-title").textContent   = title;
    document.getElementById("confirm-message").textContent = message;
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    const okBtn = document.getElementById("confirm-ok");
    const handler = () => { bsModal.hide(); okBtn.removeEventListener("click", handler); resolve(true); };
    okBtn.addEventListener("click", handler);
    modal.addEventListener("hidden.bs.modal", () => resolve(false), { once: true });
  });
}
