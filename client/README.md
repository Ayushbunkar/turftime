## Turf Time Client

Simplified React + Vite frontend for Turf booking/admin.

### Tech Stack
- React 19 + Vite
- TailwindCSS
- Axios (central instance at `src/lib/api.js`)
- Context API for auth (`src/context/AuthContext.jsx`)
- Service layer (`src/services/*`) wraps API calls

### Folder Overview
src/
	lib/        -> shared libs (axios instance)
	services/   -> API call wrappers (auth, turf admin, bookings)
	context/    -> global React contexts
	components/ -> reusable + feature components
	pages/      -> route-level views
	routes/     -> route definitions if split

### Environment
Copy `.env.example` to `.env` and adjust:
```
VITE_API_BASE_URL=http://localhost:4500/api
```

### Run Dev
Install deps then start dev server:
```
npm install
npm run dev
```

### Auth Flow (Basic)
1. User logs in -> `authService.loginRequest` -> stores token in localStorage
2. Axios interceptor attaches `Authorization: Bearer <token>`
3. On load, `AuthContext` calls `meRequest` to populate user
4. Logout clears token + user state

### Adding a New API Call
1. Create function in a service file in `src/services/`
2. Import & use in component/page
3. Handle errors with toast or local UI state

### Conventions
- No direct `axios` calls in pages/components (use services)
- Centralized formatting & error handling gradually moving into services
- Keep components presentational; pages orchestrate data

### Next Improvements
- Form validation helpers
- Loading + error UI primitives
- Pagination utilities

---
Minimal, clear, and extendable.
