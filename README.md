# CodeArena Frontend

React + Redux Toolkit frontend for the CodeArena coding platform backend.

## Quick Start

```bash
# 1. Copy environment file
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api  (your backend port)

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

**Make sure your backend is running at port 5000 first** (`npm run dev` in the backend folder).

## Demo Login Credentials

| Role    | Email                  | Password      |
|---------|------------------------|---------------|
| Admin   | admin@platform.com     | Admin@123     |
| Student | arjun@iitm.ac.in       | Student@123   |
| Student | vikram@nitt.ac.in      | Student@123   |

## API Integration

All API calls go to `VITE_API_URL`. The Axios instance in `src/services/api.js`:
- Automatically attaches `Authorization: Bearer <token>` to every request
- Globally catches `401` and redirects to `/login`

Backend response shape expected: `{ success: true, data: <payload> }`

## Theme

White background (`#f8fafc`) with **light blue** (`primary-600 = #2563eb`) as the primary accent colour.
All colours are Tailwind utility classes — change `primary-*` in `tailwind.config.js` to retheme instantly.

## Folder Structure

```
src/
├── app/store.js                   Redux store
├── features/
│   ├── auth/authSlice.js          JWT + user state
│   ├── problems/problemSlice.js   Problem list + selected
│   ├── submissions/               Run + submit results
│   ├── leaderboard/               College-scoped rankings
│   └── ui/uiSlice.js              Sidebar, notifications, editor prefs
├── pages/
│   ├── LoginPage.jsx
│   ├── HomePage.jsx
│   ├── PracticePage.jsx           Filterable problem list
│   ├── ProblemSolvePage.jsx       3-panel editor layout
│   ├── SubmissionsPage.jsx
│   ├── LeaderboardPage.jsx
│   ├── ProfilePage.jsx
│   └── admin/                     5 admin pages
├── components/
│   ├── layout/                    Sidebar, Topbar, AppLayout, Route guards
│   ├── editor/                    CodeEditor (Monaco), ProblemPanel, OutputPanel
│   └── ui/                        Shared primitives + NotificationCenter
├── services/                      Axios API calls (one file per resource)
├── hooks/index.js                 useAuth, useNotify
└── utils/                         helpers.js, editorUtils.js
```

## Build

```bash
npm run build   # outputs to dist/
npm run preview # preview production build
```
