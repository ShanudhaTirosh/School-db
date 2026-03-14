// ============================================================
//  SCHOOL FORM SYSTEM — Firebase Configuration
//  Replace the placeholder values with your own Firebase project credentials.
//  Get them at: https://console.firebase.google.com → Project Settings → General
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyBVkXIQRpmZCNb-hKhaqEBjblK_TeE1I_Y",
  authDomain: "school-db1.firebaseapp.com",
  projectId: "school-db1",
  storageBucket: "school-db1.firebasestorage.app",
  messagingSenderId: "516090596654",
  appId: "1:516090596654:web:cc058e0d1f6d98d2fa3ebf"
};

// ── Initialize ───────────────────────────────────────────────
firebase.initializeApp(firebaseConfig);

const db   = firebase.firestore();
const auth = firebase.auth();

// ── Enable offline persistence (optional but recommended) ────
db.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code === "failed-precondition") console.warn("Persistence failed: multiple tabs open.");
    else if (err.code === "unimplemented")   console.warn("Persistence not supported in this browser.");
  });

// ============================================================
//  FIRESTORE SECURITY RULES  (paste into Firebase Console)
// ============================================================
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function getRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    function isAdmin()  { return request.auth != null && getRole() == 'admin'; }
    function isStaff()  { return request.auth != null && (getRole() == 'admin' || getRole() == 'staff'); }
    function isViewer() { return request.auth != null; }

    // Users collection
    match /users/{uid} {
      allow read:   if isViewer();
      allow write:  if isAdmin();
      allow create: if request.auth.uid == uid;
    }

    // Forms collection
    match /forms/{formId} {
      allow read:   if isViewer() || resource.data.published == true;
      allow write:  if isAdmin();
    }

    // Responses — public submit, staff read, admin full control
    match /responses/{formId}/submissions/{responseId} {
      allow create: if true;           // Public can submit
      allow read:   if isStaff();
      allow update, delete: if isAdmin();
    }

    // Activity logs
    match /activityLogs/{logId} {
      allow read:  if isStaff();
      allow write: if isViewer();
    }
  }
}
*/
