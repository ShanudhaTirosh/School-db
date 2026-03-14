// ============================================================
//  auth.js  —  Authentication helpers
// ============================================================

const Auth = (() => {

  // ── Login ─────────────────────────────────────────────────
  async function login(email, password) {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    await logActivity("login", `User logged in: ${email}`);
    return cred.user;
  }

  // ── Logout ────────────────────────────────────────────────
  async function logout() {
    const user = auth.currentUser;
    if (user) await logActivity("logout", `User logged out: ${user.email}`);
    await auth.signOut();
    window.location.href = "login.html";
  }

  // ── Guard — redirect if not logged in ────────────────────
  function requireAuth(callback) {
    auth.onAuthStateChanged(async user => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      const snap = await db.collection("users").doc(user.uid).get();
      if (!snap.exists) {
        // Auto-create viewer profile on first sign-in
        await db.collection("users").doc(user.uid).set({
          name:      user.displayName || user.email.split("@")[0],
          email:     user.email,
          role:      "viewer",
          status:    "active",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      const profile = snap.exists ? snap.data() : { role: "viewer" };
      callback(user, profile);
    });
  }

  // ── Guard — redirect if not admin ─────────────────────────
  function requireAdmin(callback) {
    requireAuth((user, profile) => {
      if (profile.role !== "admin") {
        showAccessDenied();
        return;
      }
      callback(user, profile);
    });
  }

  // ── Guard — redirect if not staff or admin ────────────────
  function requireStaff(callback) {
    requireAuth((user, profile) => {
      if (!["admin", "staff"].includes(profile.role)) {
        showAccessDenied();
        return;
      }
      callback(user, profile);
    });
  }

  // ── Get current user profile ──────────────────────────────
  async function getCurrentProfile() {
    const user = auth.currentUser;
    if (!user) return null;
    const snap = await db.collection("users").doc(user.uid).get();
    return snap.exists ? { uid: user.uid, ...snap.data() } : null;
  }

  // ── Populate topbar profile ───────────────────────────────
  function populateTopbar(profile) {
    const nameEl   = document.getElementById("topbar-name");
    const roleEl   = document.getElementById("topbar-role");
    const avatarEl = document.getElementById("topbar-avatar");
    if (nameEl)   nameEl.textContent   = profile.name  || profile.email;
    if (roleEl)   roleEl.textContent   = capitalize(profile.role);
    if (avatarEl) avatarEl.textContent = (profile.name || profile.email)[0].toUpperCase();
  }

  function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : ""; }

  function showAccessDenied() {
    document.body.innerHTML = `
      <div class="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div class="text-center">
          <div style="font-size:4rem">🚫</div>
          <h3 class="mt-3">Access Denied</h3>
          <p class="text-muted">You don't have permission to view this page.</p>
          <a href="dashboard.html" class="btn btn-primary">Back to Dashboard</a>
        </div>
      </div>`;
  }

  return { login, logout, requireAuth, requireAdmin, requireStaff, getCurrentProfile, populateTopbar };
})();

// ── Activity log helper ────────────────────────────────────
async function logActivity(type, message) {
  try {
    await db.collection("activityLogs").add({
      type,
      message,
      uid:       auth.currentUser?.uid || "anonymous",
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) { /* non-critical */ }
}
