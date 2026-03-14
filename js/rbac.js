// ============================================================
//  rbac.js  —  Role-Based Access Control helpers
// ============================================================

const RBAC = (() => {

  const permissions = {
    admin: [
      "form.create","form.edit","form.delete","form.publish",
      "response.view","response.edit","response.delete",
      "user.create","user.edit","user.delete","user.assign_role",
      "data.export","settings.manage","analytics.view"
    ],
    staff: [
      "response.view","data.export","analytics.view"
    ],
    viewer: [
      "response.view"
    ]
  };

  function can(role, permission) {
    return (permissions[role] || []).includes(permission);
  }

  // Apply UI restrictions based on role
  function applyRoleUI(role) {
    // Hide elements that require specific roles
    document.querySelectorAll("[data-require-role]").forEach(el => {
      const required = el.getAttribute("data-require-role").split(",").map(r => r.trim());
      if (!required.includes(role)) {
        el.style.display = "none";
      }
    });

    // Disable elements based on permission
    document.querySelectorAll("[data-require-permission]").forEach(el => {
      const perm = el.getAttribute("data-require-permission");
      if (!can(role, perm)) {
        el.classList.add("disabled");
        el.setAttribute("title", "You don't have permission for this action");
        if (el.tagName === "BUTTON" || el.tagName === "A") el.setAttribute("disabled", true);
      }
    });
  }

  function getBadgeHTML(role) {
    const map = {
      admin:  '<span class="badge bg-danger">Admin</span>',
      staff:  '<span class="badge bg-primary">Staff</span>',
      viewer: '<span class="badge bg-secondary">Viewer</span>'
    };
    return map[role] || '<span class="badge bg-light text-dark">Unknown</span>';
  }

  return { can, applyRoleUI, getBadgeHTML, permissions };
})();
