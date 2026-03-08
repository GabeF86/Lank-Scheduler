# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root (`anesthesiaFlow/`).

```bash
npm install          # install all workspace dependencies (client + server)
npm run dev          # start client (:5173) + server (:3001) concurrently
npm run build        # build client for production (output: client/dist/)
```

Individual workspaces:
```bash
npm run dev --workspace=client   # Vite dev server only
npm run dev --workspace=server   # Express server only (node --watch)
```

## Environment Setup

Two `.env` files are required (not committed):

**`server/.env`**
```
MONGODB_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_test_...
PORT=3001
CLIENT_URL=http://localhost:5173
```

**`client/.env`**
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Architecture

npm workspaces monorepo with two packages: `client/` and `server/`.

### Data flow

```
React (Vite) → axios → Express REST API → Mongoose → MongoDB Atlas
            ↕
         Socket.io (real-time push notifications only)
            ↕
         Clerk (JWT auth, organizations = hospitals)
```

### Multi-tenancy

Every MongoDB document has a `hospitalId` field populated from the user's Clerk Organization ID (`payload.org_id`). All DB queries are scoped to this field. Clerk Organizations map 1:1 to hospitals.

### Auth pattern

`server/middleware/auth.js` exports `requireAuth` and `requireAdmin`. `requireAuth` verifies the Clerk JWT and attaches `req.auth = { userId, orgId, orgRole }`. Routes use these as middleware. The client attaches the token via `setAuthToken()` in `client/src/api/client.js` before every request.

### Real-time pattern

Socket.io is used only as a push notification layer — not as the data source. When a schedule is saved via REST (`PUT /api/schedules/:date`), the server emits `schedule:updated` to the Socket.io room `{orgId}-{date}`. Clients receive this and call `queryClient.invalidateQueries()` to refetch from the REST API. The `useSocket` hook in `client/src/hooks/useSocket.js` manages room join/leave lifecycle.

### Core algorithm

`client/src/lib/calcStaffing.js` is a pure function (no React, no I/O) that takes a site `config` object and `availability` counts, and returns a complete staffing assignment. This is the heart of the app. The result is computed client-side on every config change and can optionally be persisted to MongoDB via `PUT /api/schedules/:date`.

### Key files

| File | Purpose |
|---|---|
| `client/src/lib/calcStaffing.js` | Core staffing algorithm — pure function |
| `client/src/theme.js` | All color constants (`C`) used across components |
| `client/src/pages/SchedulePage.jsx` | Main optimizer UI — owns `cfg`, `avail`, `result` state |
| `client/src/components/schedule/StaffingDiagram.jsx` | Interactive lane diagram with drag-and-drop reassignment |
| `server/index.js` | Express + Socket.io setup, MongoDB connection |
| `server/middleware/auth.js` | Clerk JWT verification |
| `server/models/Schedule.js` | Schedule document schema (one per hospital per date) |
| `server/socket/index.js` | Socket.io auth middleware + room management |

### Roles

- `org:admin` — can edit schedules and manage staff
- `org:member` (default) — read-only
