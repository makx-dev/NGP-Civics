# NGP Civics (MERN Scaffold)

NGP Civics is a beginner-friendly MERN stack civic issue reporting and tracking platform.

## Project Structure

```txt
NGP-Civics/
├── client/                 # React + Vite frontend scaffold
└── server/                 # Express + MongoDB API
    ├── api/index.js        # Vercel serverless entry
    └── src/
        ├── config/
        ├── middleware/
        ├── models/
        ├── routes/
        └── utils/
```

## MongoDB Schema Design

### 1) Users (`User`)
Citizens who register and report issues.
- `name`, `email` (unique), `passwordHash`, `phone`
- Timestamps for account creation/update

### 2) Admins (`Admin`)
Separate collection for admin accounts.
- `name`, `email` (unique), `passwordHash`, `department`

### 3) Categories (`Category`)
Issue categories, managed as reusable records.
- `name` (unique), `description`, `isActive`
- Seed script includes:
  - Road Damage (Potholes)
  - Streetlights
  - Garbage
  - Water Leakage
  - Drainage
  - Traffic Signal
  - Public Property Damage
  - Others

### 4) Issues (`Issue`)
Main civic issue record.
- `title`, `description`
- `category` (ref: `Category`)
- `location` object: `lat`, `lng`, `address`
  - Validation enforces GPS (`lat/lng`) **or** manual address
- `reporter` (ref: `User`)
- `assignedAdmin` (ref: `Admin`, optional)
- `photos` (embedded array, max 5)
- `status`: `Pending | In Progress | Resolved`
- `priority`: `Low | Medium | High`
- `adminRemarks`, `completionPhoto`
- `createdAt`, `updatedAt`

### 5) Status History (`StatusHistory`)
Tracks each status transition.
- `issue` (ref: `Issue`)
- `fromStatus`, `toStatus`
- `changedByUser` or `changedByAdmin` (exactly one required)
- `remark`, `changedAt`

### 6) Notifications (`Notification`)
Citizen notifications.
- `recipient` (ref: `User`)
- `issue` (ref: `Issue`)
- `type`: `Issue Submitted | Status Changed | Issue Resolved`
- `message`, `isRead`, `createdAt`

### Why Issue photos are embedded
The requirements allow either separate `IssuePhotos` or embedding. Embedded photos were chosen for simplicity and beginner readability because photos are tightly coupled to a single issue and capped at 5.

## API Overview

Base URL: `/api`

### Auth
- `POST /auth/register` — citizen registration
- `POST /auth/login` — citizen login
- `POST /auth/admin/login` — admin login

### Citizen Issue Routes
- `POST /issues` — create issue
- `GET /issues/mine` — list own issues
- `GET /issues/:id` — view issue details
- `PATCH /issues/:id` — edit own pending issue
- `DELETE /issues/:id` — delete own pending issue
- `GET /issues/:id/history` — status timeline

### Admin Routes
- `GET /admin/issues` — list/filter/search all issues
- `PATCH /admin/issues/:id` — assign category/admin, update status, remarks, completion photo
- `GET /admin/analytics/overview` — counts and resolution trends
- `GET /admin/notifications` — recent notifications

### Category Route
- `GET /categories` — list active categories

## Local Setup

## 1) Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

## 2) Configure environment

```bash
cd server
cp .env.example .env
```

Set `MONGO_URI` and `JWT_SECRET`.

## 3) Seed default categories

```bash
npm run seed
```

## 4) Run backend

```bash
npm run dev
```

## 5) Run frontend (new terminal)

```bash
cd client
npm run dev
```

## Scripts

### Client
- `npm run dev`
- `npm run build`
- `npm run lint`

### Server
- `npm run dev`
- `npm run start`
- `npm run seed`

## Notes
- JWT auth is simple and intentionally beginner-friendly.
- Admin and citizen accounts are separated by collection and token role.
- Status flow allows forward movement only: `Pending → In Progress → Resolved`.
