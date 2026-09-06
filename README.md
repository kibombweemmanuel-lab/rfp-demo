# RFP EMR

A modern clinical operations platform demo for patient records, encounters, triage, occupational health, admissions, theatre scheduling, and healthcare interoperability.

RFP EMR combines a premium React interface with a Node.js API, role-aware authentication, persistent patient workflows, offline synchronization, simulated FHIR and SAP integrations, and optional PostgreSQL storage.

> This project is an RFP/demo platform. FHIR and SAP integrations are simulated, and the included credentials are for demonstration only.

## Highlights

- Secure login flow with five clinical roles
- Protected application routes and server-side permission checks
- Patient directory with search by name or national ID
- Patient records with clinical summaries and encounter timelines
- Encounter creation for assessments, admissions, follow-ups, and discharges
- Emergency triage queue with priority indicators
- Occupational health exposure and equipment monitoring
- Medical admission workflow
- Surgical theatre schedule and pre-operative checklist
- Offline patient capture and synchronization queue
- Simulated HL7 FHIR observation retrieval
- Simulated SAP S/4HANA stock requisitions
- PostgreSQL adapter with JSON storage fallback
- Responsive Tailwind CSS interface with premium SVG icons

## Technology

- React 18 and TypeScript
- Vite
- React Router
- Framer Motion
- Tailwind CSS and PostCSS
- Node.js HTTP API
- Zod request validation
- PostgreSQL via `pg`
- Docker Compose for local PostgreSQL
- JSON persistence for zero-setup development

## Quick Start

### Requirements

- Node.js 18 or newer
- npm
- Docker Desktop, only if using PostgreSQL

### Install dependencies

```powershell
npm install
```

### Start the API

```powershell
npm run dev:api
```

The API runs on `http://localhost:4000`.

### Start the frontend

In a second terminal:

```powershell
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Doctor | `doctor@rfp.demo` | `doctor123` |
| Nurse | `nurse@rfp.demo` | `nurse123` |
| Pharmacist | `pharmacist@rfp.demo` | `pharmacist123` |
| Cashier | `cashier@rfp.demo` | `cashier123` |
| Admin | `admin@rfp.demo` | `admin123` |

These accounts are intentionally included for demonstrations. Do not use them in production.

## PostgreSQL

The API uses JSON storage by default. To use PostgreSQL locally, start Docker Desktop and run:

```powershell
npm run db:up
$env:DATABASE_URL = "postgresql://rfp:rfp_demo@localhost:5432/rfp_demo"
npm run dev:api
```

The API initializes its application document table automatically on first access.

Stop the database with:

```powershell
npm run db:down
```

You can also copy [.env.example](.env.example) to `.env` and provide the same values. The server reads `DATABASE_URL` from the process environment.

## API Surface

### Authentication

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Patients and encounters

- `GET /api/patients?q=search-term`
- `GET /api/patients/:id`
- `POST /api/patients/:id/encounters`

### Clinical modules

- `GET /api/dashboard/summary`
- `GET /api/emergency/triage`
- `GET /api/ohs/patients`
- `GET /api/medical/admission`
- `GET /api/surgical/schedule`
- `GET /api/reference/roles`

### Integrations and synchronization

- `GET /api/fhir/patient/:id/observation`
- `POST /api/sap/requisition`
- `GET /api/sync/status`
- `GET /api/sync/queue`
- `POST /api/sync/queue`
- `POST /api/sync/process`
- `DELETE /api/sync/queue/:id`

Protected endpoints require an authenticated session token in the `Authorization` header:

```text
Authorization: Bearer <session-token>
```

## Project Structure

```text
src/
  components/       Shared layout and premium icons
  features/         Auth, patient records, offline queue, admin tools
  hooks/            API and synchronization hooks
  pages/            Clinical workflow screens
  styles/           Tailwind-powered visual system
  types/            Shared TypeScript contracts
server/
  services/         Patient and synchronization domain services
  storage/          JSON and PostgreSQL storage adapters
  validation.js     Zod request schemas
  index.js          HTTP API entry point
```

## Development Commands

```powershell
npm run dev          # Start the Vite frontend
npm run dev:api      # Start the Node.js API
npm run build        # Type-check and create a production build
npm run preview      # Preview the production build
npm run db:up        # Start PostgreSQL with Docker Compose
npm run db:down      # Stop PostgreSQL
```

## Current Scope

This repository is designed for demonstrations and RFP evaluation. The following areas should be completed before production deployment:

- Replace demo credentials with administrator-created accounts
- Hash passwords and add password reset and MFA flows
- Persist sessions in a database or secure session store
- Add comprehensive audit logging
- Replace simulated SAP and FHIR integrations with certified endpoints
- Add clinical workflow state transitions and stronger domain validation
- Add automated API, component, and end-to-end tests
- Review privacy, security, hosting, and regulatory requirements for the deployment region

## Repository Description

Suggested GitHub description:

> Premium clinical operations platform demo with patient records, role-based workflows, offline sync, FHIR/SAP integrations, and PostgreSQL support.

## License

No license has been declared yet. Add a license before distributing this repository publicly.
