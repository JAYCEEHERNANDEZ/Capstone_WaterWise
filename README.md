# WaterWise — Sucol Water System

WaterWise is a full-stack water consumption and billing management system for administrators, meter readers, and consumers. It records monthly meter readings, automatically creates billing records, delivers consumer notifications, tracks payments, and provides AI-assisted consumption predictions, anomaly detection, and recommendations.

## Main Features

### Administrator

- View current consumption and billing KPIs
- Manage consumer accounts
- View all consumer meter readings through a read-only admin endpoint
- Review billing records and payment status
- Create system-wide or consumer-specific announcements
- View AI consumption predictions, anomalies, and recommendations
- Filter analytics by overall, yearly, monthly, and purok scope

### Meter Reader

- View consumers and their previous readings
- Record one consumption reading per consumer per month
- Automatically calculate consumption from the previous and present readings
- Trigger billing creation and a consumer billing notification after a successful reading

### Consumer

- View the current month's balance and billing history
- View total, average, and highest consumption
- Review consumption graphs and monthly usage
- View profile information
- Receive targeted and system-wide notifications
- Mark notifications as read
- Submit and review payments through the available payment API

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Axios, Tailwind CSS, Recharts |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL through Supabase |
| Authentication | Backend-issued JSON Web Tokens (JWT) |
| AI | Google Gemini |

## Project Structure

```text
Capstone project/
├── Backend revised for capstone/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   │   └── migration.sql
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── services/
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 20 or later
- npm
- A Supabase project
- A Google Gemini API key for AI analytics

## Database Setup

1. Open the Supabase SQL Editor.
2. Open [`Backend revised for capstone/db/migration.sql`](Backend%20revised%20for%20capstone/db/migration.sql).
3. Run the SQL in the migration file against the intended Supabase project.
4. Confirm that the core and AI cache tables were created.

The main tables are:

- `admins`
- `consumers`
- `meter_readers`
- `consumption`
- `billing`
- `payments`
- `notifications`
- `notification_reads`
- `ai_consumption_predictions`
- `ai_consumption_anomalies`
- `ai_consumption_recommendations`
- `generated_reports`

The migration also contains the database functions, indexes, and notification trigger used by the application. Keep the migration definitions aligned with the backend models.

## Environment Configuration

Create `Backend revised for capstone/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=use-a-long-random-secret-with-at-least-32-characters
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
```

`SUPABASE_KEY` can be used as a fallback, but the service-role key is expected for trusted backend database operations.

The frontend uses `/api` by default and Vite proxies requests to the backend. An optional `frontend/.env` can override these values:

```env
VITE_API_URL=/api
WATERWISE_API_TARGET=http://127.0.0.1:5000
```

Do not expose the Supabase service-role key, JWT secret, or Gemini API key in frontend environment variables.

## Installation and Development

Install and start the backend:

```powershell
cd "Backend revised for capstone"
npm install
npm run dev
```

In another terminal, install and start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The backend runs on `http://127.0.0.1:5000` unless `PORT` is changed.

## Authentication Flow

JWT generation and validation remain entirely in the Express backend.

1. The frontend sends the login credentials to `POST /api/auth/login`.
2. After a successful login, the frontend saves:
   - JWT as `sessionStorage.accessToken`
   - logged-in account data as `sessionStorage.user`
3. The centralized Axios client sends the token on protected requests:

   ```http
   Authorization: Bearer <token>
   ```

4. Authentication state is restored from `sessionStorage` after a page refresh.
5. Logging out removes both session values and redirects to `/login`.
6. A backend `401 Unauthorized` or `403 Forbidden` response clears the frontend session and returns the user to the login page.

Because `sessionStorage` is tab-scoped, closing the browser tab ends the stored frontend session.

## Role-Based Access

| Role | Main Permissions |
| --- | --- |
| `admin` | Manage consumers and announcements, view readings, billings, payments, and analytics |
| `meter-reader` | Get consumer reading information and record consumption |
| `consumer` | View their own usage, billing, profile, payments, and notifications |

### Consumption Endpoint Rules

These routes intentionally separate meter-reader operations from the administrator's read-only access:

| Method | Endpoint | Permission |
| --- | --- | --- |
| `GET` | `/api/consumption/readings` | Meter reader only |
| `POST` | `/api/consumption/readings` | Meter reader only |
| `GET` | `/api/consumption/admin/readings` | Administrator only |
| `GET` | `/api/consumption/consumer/:consumerId` | The consumer owner and authorized staff |

Administrators must not use `/api/consumption/readings`; the admin Readings page must request `/api/consumption/admin/readings`.

## Main API Groups

All protected routes require a valid Bearer token.

| Base Route | Purpose |
| --- | --- |
| `/api/auth` | Login and current-session account data |
| `/api/admins` | Administrator operations |
| `/api/consumers` | Consumer accounts and profiles |
| `/api/meter-readers` | Meter-reader accounts and operations |
| `/api/consumption` | Meter readings and consumer usage |
| `/api/billing` | Billing records and balances |
| `/api/payments` | Payment creation and history |
| `/api/notifications` | Announcements and notification read state |
| `/api/consumption/prediction` | AI consumption predictions |
| `/api/anomaly` | AI anomaly detection |
| `/api/recommendation` | AI recommendations |
| `/api/reports` | Persistent report previews, snapshots, and PDF downloads |

## Reading, Billing, and Notification Workflow

```text
Meter reader records a reading
             ↓
Backend validates the role, values, date, and monthly limit
             ↓
Consumption row is inserted
             ↓
Consumption = present reading − previous reading
             ↓
Billing row is created using the configured rate
             ↓
Consumer billing notification is created
             ↓
Dashboards and AI caches detect the updated consumption data
```

- A consumer can have only one accepted reading for a given month.
- The reading date sent by the frontend is preserved by the backend.
- The calculated consumption is stored by PostgreSQL using the generated `consumption` column.
- The billing total is currently calculated from consumption at the configured application rate.
- Notifications may target one consumer or use a `NULL` consumer ID for a system-wide announcement.
- When a consumer opens a notification, its read state is stored in `notification_reads`.

## AI Analytics Cache

Predictions, anomaly results, and recommendations are saved in their corresponding Supabase cache tables.

- If the consumption source data has not changed, the backend returns the stored result.
- When a new consumption entry changes the source signature, the backend requests a new Gemini analysis.
- The new result replaces or updates the stored cache used after page refresh.
- Analytics responses are formatted as one concise paragraph for each relevant scope: overall, yearly, monthly, and per purok.

This prevents repeated Gemini requests when no new consumption data is available.

## Production Build

Build the frontend:

```powershell
cd frontend
npm run build
```

Run frontend lint checks:

```powershell
npm run lint
```

Start the backend without the development watcher:

```powershell
cd "Backend revised for capstone"
npm start
```

## Troubleshooting

### Login succeeds but redirects back to login

- Confirm `accessToken` and `user` exist in the browser's `sessionStorage`.
- Check that the account role returned by the backend matches `admin`, `meter-reader`, or `consumer`.
- Confirm the system clock is correct so the JWT is not treated as expired.
- Inspect the failing request and verify that it contains the Bearer token.

### `401 Unauthorized`

- Verify `JWT_SECRET` is configured and unchanged between token generation and verification.
- Sign in again to replace an expired or invalid token.
- Confirm the request uses the correct role-specific endpoint.

### `403 Forbidden`

The account is authenticated but does not have permission for the requested route. For example, an admin must use `/api/consumption/admin/readings`, while `/api/consumption/readings` is reserved for meter readers.

### AI analytics do not load

- Confirm `GEMINI_API_KEY` is valid.
- Confirm the three AI cache tables exist.
- Verify that at least one valid consumption record is available.

### Frontend cannot connect to the backend

- Confirm the backend is running on port `5000`.
- Confirm `WATERWISE_API_TARGET` points to the correct backend address.
- Keep `VITE_API_URL=/api` when using the Vite development proxy.

## Security Notes

- Never commit `.env` files or production secrets.
- Never place the Supabase service-role key in React code.
- Password hashing, JWT generation, JWT verification, and role authorization are backend responsibilities.
- Frontend protected routes improve navigation safety but do not replace backend authorization.
- Validate permissions on every protected backend endpoint.

