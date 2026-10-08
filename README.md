# NGP Civics

**A Web-Based Civic Issue Reporting and Tracking Platform for Nagpur**

Live deployment: [ngp-civics.vercel.app](https://ngp-civics.vercel.app)

| | |
|---|---|
| **Project Type** | Community Engagement Project (CEP), Minor Project |
| **Group** | G5 |
| **Faculty Guide** | Dr. Neha Nagdeve |
| **Department** | Information Technology |
| **Institution** | GH Raisoni College of Engineering and Management, Nagpur |

---

## Table of Contents

1. [Abstract](#abstract)
2. [Problem Statement](#problem-statement)
3. [Objectives](#objectives)
4. [System Features](#system-features)
5. [Technology Stack](#technology-stack)
6. [Project Structure](#project-structure)
7. [Database Design](#database-design)
8. [API Reference](#api-reference)
9. [Installation and Setup](#installation-and-setup)
10. [Available Scripts](#available-scripts)
11. [Design Notes](#design-notes)
12. [Future Scope](#future-scope)
13. [Project Team](#project-team)
14. [Acknowledgements](#acknowledgements)
15. [License](#license)

---

## Abstract

NGP Civics is a full-stack web application built on the MERN stack (MongoDB, Express.js, React, Node.js) that enables citizens of Nagpur to report civic issues such as damaged roads, faulty streetlights, garbage accumulation, and water leakage. Reports include a description, photographic evidence, and location information. Administrators review, assign, and resolve each report through a dedicated module, and every change in status is recorded and communicated back to the reporting citizen. The system aims to make civic grievance handling transparent, traceable, and accountable.

## Problem Statement

Citizens who encounter local civic problems often lack a simple, trackable channel to report them. Complaints are made informally or through disconnected channels, receive no acknowledgement, and offer no visibility into progress or resolution. This results in delayed action, poor accountability, and reduced civic participation. A centralised platform with structured reporting, role-based administration, and status tracking addresses these gaps.

## Objectives

- To provide citizens with a simple interface for reporting civic issues with photographic and location evidence.
- To provide administrators with tools to review, prioritise, assign, and resolve reported issues.
- To maintain a complete, auditable history of every status transition for each issue.
- To keep citizens informed through notifications at key stages of the issue lifecycle.
- To provide summary analytics that support monitoring of issue volume and resolution trends.

## System Features

### Citizen Module

- Registration and authentication using JSON Web Tokens (JWT).
- Issue submission with title, description, category, and up to five photographs.
- Location capture through GPS coordinates or a manually entered address.
- A personal dashboard listing submitted issues, with a status timeline for each.
- Editing and deletion of an issue while it remains in the *Pending* state.
- Notifications on issue submission, status change, and resolution.
- Before-and-after photo comparison once the administrator uploads a completion photo.

### Admin Module

- Separate administrator authentication and account storage.
- Listing, filtering, and searching of all reported issues with pagination.
- Assignment of issues to administrators, setting of priority, and entry of remarks.
- Status updates with upload of a completion photograph.
- Analytics overview presenting issue counts and resolution trends.

### Issue Categories

Road Damage (Potholes), Streetlights, Garbage, Water Leakage, Drainage, Traffic Signal, Public Property Damage, and Others.

### Issue Lifecycle

Status transitions are restricted to forward movement only:

```
Pending  ->  In Progress  ->  Resolved
```

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JSON Web Tokens with role-based access control |
| Deployment | Vercel (frontend and serverless API) |

## Project Structure

```
NGP-Civics/
├── client/                 # React + Vite frontend
└── server/                 # Express + MongoDB API
    ├── api/index.js        # Vercel serverless entry point
    └── src/
        ├── config/         # Application and database configuration
        ├── middleware/     # Authentication and validation middleware
        ├── models/         # Mongoose schemas
        ├── routes/         # API route definitions
        └── utils/          # Helper functions
```

## Database Design

The system uses six MongoDB collections.

| Collection | Description |
|---|---|
| `User` | Registered citizens: name, unique email, password hash, phone, timestamps. |
| `Admin` | Administrator accounts stored separately: name, unique email, password hash, department. |
| `Category` | Reusable issue categories: unique name, description, active flag. Populated by a seed script. |
| `Issue` | Core record: title, description, category reference, location (latitude, longitude, address), reporter reference, optional assigned administrator, embedded photos (maximum five), status, priority, administrator remarks, completion photo and its upload time, timestamps. |
| `StatusHistory` | Audit trail of status transitions: issue reference, previous and new status, the user or administrator who made the change (exactly one is required), remark, and timestamp. |
| `Notification` | Citizen notifications: recipient, related issue, type (Issue Submitted, Status Changed, Issue Resolved), message, read flag, creation time. |

**Validation rules:** an issue must contain either GPS coordinates or a manual address; a status history entry must record exactly one actor (user or administrator).

## API Reference

Base URL: `/api`

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a citizen account |
| POST | `/auth/login` | Citizen login |
| POST | `/auth/admin/login` | Administrator login |

### Issues

| Method | Endpoint | Description |
|---|---|---|
| POST | `/issues` | Create a new issue |
| GET | `/issues` | List issues with role-aware access, filtering, search, and pagination |
| GET | `/issues/mine` | List the authenticated citizen's issues |
| GET | `/issues/summary` | Administrator reporting snapshot |
| GET | `/issues/:id` | Retrieve issue details |
| GET | `/issues/:id/photo-comparison` | Retrieve citizen (before) and administrator (after) photographs |
| GET | `/issues/:id/history` | Retrieve the status timeline |
| PATCH | `/issues/:id` | Edit an own issue in Pending state |
| DELETE | `/issues/:id` | Delete an own issue in Pending state |

### Administration

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/issues` | List, filter, and search all issues |
| PATCH | `/admin/issues/:id` | Assign category or administrator, update status, remarks, and completion photo |
| GET | `/admin/analytics/overview` | Issue counts and resolution trends |
| GET | `/admin/notifications` | Recent notifications |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | List active categories |

## Installation and Setup

### Prerequisites

- Node.js (version 18 or later recommended)
- A MongoDB instance (local installation or MongoDB Atlas)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/makx-dev/NGP-Civics.git
   cd NGP-Civics
   ```

2. **Install dependencies**

   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. **Configure environment variables**

   ```bash
   cd server
   cp .env.example .env
   ```

   Set the following values in `.env`:

   ```env
   MONGO_URI=<your MongoDB connection string>
   JWT_SECRET=<your secret key>
   ```

4. **Seed the default categories**

   ```bash
   npm run seed
   ```

5. **Start the backend server**

   ```bash
   npm run dev
   ```

6. **Start the frontend (in a new terminal)**

   ```bash
   cd client
   npm run dev
   ```

## Available Scripts

| Location | Command | Purpose |
|---|---|---|
| Root | `npm run dev` | Start the frontend development server |
| Root | `npm run dev:client` | Start the client |
| Root | `npm run dev:server` | Start the server |
| Client | `npm run dev` | Start the Vite development server |
| Client | `npm run build` | Create a production build |
| Client | `npm run lint` | Run the linter |
| Server | `npm run dev` | Start the API in development mode |
| Server | `npm run start` | Start the API in production mode |
| Server | `npm run seed` | Seed default issue categories |

## Design Notes

- Citizen and administrator accounts are stored in separate collections and distinguished by the role encoded in the JWT.
- Issue photographs are embedded within the `Issue` document rather than held in a separate collection. Each photograph belongs to exactly one issue and the number is capped at five, so embedding simplifies the schema and reduces query overhead.
- Status transitions are enforced as forward-only to preserve the integrity of the issue lifecycle.

## Future Scope

- Email, SMS, or push notification delivery.
- Map-based visualisation of reported issues.
- Community upvoting to prioritise high-impact issues.
- Department-wise routing and service-level tracking.
- Multilingual interface (English, Hindi, Marathi).

## Project Team

**Group G5**

| Name | GitHub |
|---|---|
| Manthan | [@makx-dev](https://github.com/makx-dev) |
| Noesha | |
| Mrunali | |
| Nidhi | |
| Paras | |
| Parinita | |

## Acknowledgements

We express our sincere gratitude to our faculty guide, **Dr. Neha Nagdeve**, for her guidance and support throughout this project, and to the Department of Information Technology, GH Raisoni College of Engineering and Management, Nagpur.

## License

This project was developed for academic purposes as part of the Community Engagement Project (CEP) curriculum. A license may be added if the repository is opened to external contributions.