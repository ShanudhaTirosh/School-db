# SchoolForm — Setup Guide

## Quick Start

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project → enable **Firestore Database** and **Authentication**
3. Enable **Email/Password** sign-in method under Authentication → Sign-in method

### 2. Configure Firebase

Open `firebase/firebase-config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

Find these values in: Firebase Console → Project Settings → Your Apps → Web App

### 3. Create Admin Account

1. Firebase Console → Authentication → Users → Add User
2. Enter email/password (e.g. `admin@school.edu` / `Admin@123`)
3. Copy the generated **UID**

### 4. Set Admin Role in Firestore

Firebase Console → Firestore Database → Start collection:
- Collection: `users`
- Document ID: (paste the UID from step 3)
- Fields:
  ```
  name:   "Admin User"       (string)
  email:  "admin@school.edu" (string)
  role:   "admin"            (string)
  status: "active"           (string)
  ```

### 5. Apply Firestore Security Rules

Firestore → Rules → paste the rules from `firebase/firebase-config.js` (in the comment block)

### 6. Deploy or Open Locally

- Open `login.html` directly in browser (uses Firebase CDN)
- Or deploy to Firebase Hosting / Netlify / Vercel

---

## File Structure

```
school-form-system/
├── login.html          # Authentication page
├── dashboard.html      # Main admin dashboard
├── form-builder.html   # Drag & drop form builder
├── forms.html          # Manage forms list
├── form-view.html      # Public student submission page
├── responses.html      # Student data viewer
├── users.html          # User management
├── settings.html       # App settings & backup
├── css/
│   └── style.css       # Global styles (Outfit font, CSS vars, dark mode)
├── js/
│   ├── auth.js         # Firebase Auth helpers & guards
│   ├── rbac.js         # Role-based access control
│   └── firestore.js    # Firestore CRUD helpers
├── firebase/
│   └── firebase-config.js  # Firebase init + security rules reference
└── components/
    └── shell.js        # Shared sidebar + topbar renderer + utilities
```

## Roles

| Role   | Forms | Responses | Users | Export |
|--------|-------|-----------|-------|--------|
| Admin  | CRUD  | CRUD      | CRUD  | ✅     |
| Staff  | View  | View      | View  | ✅     |
| Viewer | View  | View only | ❌    | ❌     |

## Form URL Format

After publishing a form, share this URL:
```
https://yoursite.com/form-view.html?id=FORM_ID
```

## Features

- ✅ Drag & drop form builder (10 field types)
- ✅ Firebase Authentication + RBAC
- ✅ Real-time Firestore storage
- ✅ Image compression via Canvas API (base64)
- ✅ CSV & Excel export (SheetJS)
- ✅ Dark / Light mode
- ✅ Pagination & search in responses
- ✅ Activity logging
- ✅ Full backup export
- ✅ Mobile responsive

## Tech Stack

- HTML5 + CSS3 (CSS Variables, Grid, Flexbox)
- Bootstrap 5.3 + Bootstrap Icons 1.11
- Vanilla JavaScript (ES6+)
- Firebase v9 (Compat mode)
- SortableJS (drag & drop)
- Chart.js (analytics charts)
- SheetJS / xlsx (Excel export)
- Google Fonts: Outfit
