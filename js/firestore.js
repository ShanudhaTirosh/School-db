// ============================================================
//  firestore.js  —  Firestore CRUD helpers
// ============================================================

const FS = (() => {

  const ts = () => firebase.firestore.FieldValue.serverTimestamp();

  // ── Forms ──────────────────────────────────────────────────

  async function createForm(data) {
    const ref = db.collection("forms").doc();
    await ref.set({
      ...data,
      published:   false,
      createdAt:   ts(),
      updatedAt:   ts(),
      createdBy:   auth.currentUser?.uid,
      responseCount: 0
    });
    await logActivity("form.create", `Form created: ${data.title}`);
    return ref.id;
  }

  async function updateForm(formId, data) {
    await db.collection("forms").doc(formId).update({ ...data, updatedAt: ts() });
    await logActivity("form.update", `Form updated: ${formId}`);
  }

  async function deleteForm(formId) {
    // Delete all responses first
    const batch = db.batch();
    const responses = await db.collection("responses").doc(formId).collection("submissions").get();
    responses.docs.forEach(doc => batch.delete(doc.ref));
    batch.delete(db.collection("forms").doc(formId));
    await batch.commit();
    await logActivity("form.delete", `Form deleted: ${formId}`);
  }

  async function getForms() {
    const snap = await db.collection("forms").orderBy("createdAt", "desc").get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async function getForm(formId) {
    const snap = await db.collection("forms").doc(formId).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  }

  async function publishForm(formId, published) {
    await db.collection("forms").doc(formId).update({ published, updatedAt: ts() });
    await logActivity("form.publish", `Form ${published ? "published" : "unpublished"}: ${formId}`);
  }

  // ── Responses ──────────────────────────────────────────────

  async function submitResponse(formId, data) {
    const ref = db.collection("responses").doc(formId).collection("submissions").doc();
    await ref.set({ ...data, submittedAt: ts(), id: ref.id });
    // Increment response count
    await db.collection("forms").doc(formId).update({
      responseCount: firebase.firestore.FieldValue.increment(1)
    });
    return ref.id;
  }

  async function getResponses(formId) {
    const snap = await db.collection("responses").doc(formId)
      .collection("submissions").orderBy("submittedAt", "desc").get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async function getAllResponses() {
    const forms = await getForms();
    const all = [];
    for (const form of forms) {
      const responses = await getResponses(form.id);
      responses.forEach(r => all.push({ ...r, formTitle: form.title, formId: form.id }));
    }
    return all;
  }

  async function updateResponse(formId, responseId, data) {
    await db.collection("responses").doc(formId).collection("submissions")
      .doc(responseId).update({ ...data, updatedAt: ts() });
    await logActivity("response.update", `Response updated: ${responseId}`);
  }

  async function deleteResponse(formId, responseId) {
    await db.collection("responses").doc(formId).collection("submissions").doc(responseId).delete();
    await db.collection("forms").doc(formId).update({
      responseCount: firebase.firestore.FieldValue.increment(-1)
    });
    await logActivity("response.delete", `Response deleted: ${responseId}`);
  }

  // ── Users ──────────────────────────────────────────────────

  async function getUsers() {
    const snap = await db.collection("users").orderBy("name").get();
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  }

  async function updateUser(uid, data) {
    await db.collection("users").doc(uid).update({ ...data, updatedAt: ts() });
    await logActivity("user.update", `User updated: ${uid}`);
  }

  async function deleteUser(uid) {
    await db.collection("users").doc(uid).delete();
    await logActivity("user.delete", `User deleted: ${uid}`);
  }

  // ── Stats ──────────────────────────────────────────────────

  async function getStats() {
    const [forms, users] = await Promise.all([
      db.collection("forms").get(),
      db.collection("users").get()
    ]);
    let totalResponses = 0;
    forms.docs.forEach(d => { totalResponses += (d.data().responseCount || 0); });
    return {
      totalForms:     forms.size,
      totalUsers:     users.size,
      totalResponses,
      publishedForms: forms.docs.filter(d => d.data().published).length
    };
  }

  // ── Activity Logs ──────────────────────────────────────────

  async function getActivityLogs(limit = 20) {
    const snap = await db.collection("activityLogs")
      .orderBy("timestamp", "desc").limit(limit).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  return {
    createForm, updateForm, deleteForm, getForms, getForm, publishForm,
    submitResponse, getResponses, getAllResponses, updateResponse, deleteResponse,
    getUsers, updateUser, deleteUser, getStats, getActivityLogs
  };
})();

// Helper to convert Firestore timestamp to readable string
function fmtTime(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
}

function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString();
}
