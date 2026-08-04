# WaterWise — Sucol Water System

WaterWise is a full-stack water consumption, billing, payment, and account-management system for administrators, meter readers, and consumers. It records monthly meter readings, creates billing records, delivers notifications, tracks payments, and provides AI-assisted consumption analysis.

## Main Features

### Administrator

- View consumption, billing, payment, and resident KPIs.
- Create and update consumer accounts using any complete, valid email domain.
- View consumer meter readings through the administrator read-only endpoint.
- Manage billing records, payments, events, and announcements.
- View consumption predictions, anomaly detection, recommendations, analytics, and reports.
- Use email OTP two-factor authentication before entering the admin portal.
- Change a signed-in account password using the current password or registered-email OTP.

### Meter Reader

- View consumers and their latest readings.
- Record one consumption reading per consumer per month.
- Calculate consumption from previous and present meter values.
- Trigger billing and consumer notifications after a successful reading.
- Change the signed-in password using the current password or email OTP.

### Consumer

- View current balances, billing history, consumption summaries, and graphs.
- View profile information and announcements.
- Receive targeted and system-wide notifications.
- Mark notifications as read.
- Review payment and billing information.
- Change the signed-in password using the current password or email OTP.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Axios, Tailwind CSS, Recharts |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL through Supabase |
| Authentication | bcrypt password hashing, backend-issued JWTs, email OTP |
| Email | SendGrid |
| AI | Google Gemini |

## Project Structure

```text
Capstone_WaterWise/
├── backend/
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
│   ├── public/
│   ├── src/
│   │   ├── components/
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
- A verified SendGrid sender and API key
- A Google Gemini API key for AI features

## Database Setup

1. Open the Supabase SQL Editor.
2. Open [`backend/db/migration.sql`](backend/db/migration.sql).
3. Run the SQL against the intended Supabase project.
4. Confirm that the tables, indexes, triggers, and database functions were created.

Core tables include:

- `admins`
- `consumers`
- `meter_readers`
- `consumption`
- `billing`
- `payments`
- `notifications`
- `notification_reads`
- `generated_reports`
- `ai_consumption_cache`

## Environment Configuration

Create `backend/.env`:

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=use-a-long-random-secret-with-at-least-32-characters
GEMINI_API_KEY=your-gemini-api-key
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=your-verified-sender@example.com
```

`SENDGRID_FROM_EMAIL` must be verified in SendGrid. Password recovery and admin login verification cannot send codes when the SendGrid variables are missing or invalid.

The frontend uses `/api` by default. An optional `frontend/.env` can override its API address:

```env
VITE_API_URL=/api
```

During local development, Vite proxies `/api` to the backend. `WATERWISE_API_TARGET` can override the proxy target when starting Vite:

```powershell
$env:WATERWISE_API_TARGET="http://127.0.0.1:5000"
npm run dev
```

Never expose the Supabase service-role key, JWT secret, SendGrid API key, or Gemini API key through frontend environment variables.

## Installation and Development

Install and start the backend:

```powershell
cd backend
npm install
npm run dev
```

In another terminal, install and start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The backend uses `http://127.0.0.1:5000` unless `PORT` is changed.

## Authentication and Account Security

### Standard login

Consumers and meter readers submit their username/email and password to `POST /api/auth/login`. After successful authentication, the frontend stores the JWT and account data in tab-scoped `sessionStorage`.

Protected requests include:

```http
Authorization: Bearer <token>
```

### Administrator email OTP login

Administrators use two-step authentication:

1. The administrator submits a valid username/email and password.
2. The backend validates the credentials but does not issue an access token yet.
3. SendGrid sends a six-digit OTP to the registered administrator email.
4. The administrator verifies the OTP through `POST /api/auth/admin/verify-login-otp`.
5. Only successful OTP verification creates the admin JWT and permits portal access.

Admin login codes expire after 10 minutes, allow up to five incorrect attempts, and cannot be reused after successful verification.

### Forgot-password OTP flow

1. The user opens **Forgot password?** and enters the registered email.
2. The backend sends a six-digit OTP through SendGrid.
3. The user verifies the OTP.
4. Only verified users can open the new-password step.
5. The reset session becomes invalid after the password is changed.

The forgot-password response does not reveal whether an email belongs to an account.

### Change password while signed in

The desktop account actions are hidden by default and appear after clicking the profile/account identity. Signed-in users can then select **Change password** or **Log out**.

The password dialog offers two verification methods:

- **Current password:** verify the existing password before saving a different strong password.
- **Email OTP:** send a code to the email already registered to the authenticated account, verify it, then create a new password.

Users cannot redirect the signed-in OTP to another email address.

### Password requirements

New passwords require at least eight characters with:

- One uppercase letter
- One lowercase letter
- One number
- One symbol

Successful password changes clear temporary login lockouts.

## Role-Based Access

| Role | Main Permissions |
| --- | --- |
| `admin` | Manage residents, readings, billing, payments, events, announcements, analytics, and reports |
| `meter-reader` | View reading information and record consumption |
| `consumer` | View personal usage, billing, profile, payments, announcements, and notifications |

Frontend route guards improve navigation safety, but every protected backend endpoint must still enforce authentication and role authorization.

## Main Authentication Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Validate account credentials and start admin OTP when required |
| `POST` | `/api/auth/admin/verify-login-otp` | Verify admin login OTP and issue the admin session |
| `GET` | `/api/auth/me` | Return the authenticated account |
| `POST` | `/api/auth/forgot-password` | Send a password-recovery OTP |
| `POST` | `/api/auth/verify-reset-otp` | Verify a password-recovery or authenticated email OTP |
| `POST` | `/api/auth/reset-password` | Save a new password after OTP verification |
| `POST` | `/api/auth/change-password` | Change password using the current password |
| `POST` | `/api/auth/change-password/email-otp` | Send an OTP to the signed-in account email |

## Main API Groups

| Base Route | Purpose |
| --- | --- |
| `/api/auth` | Authentication, OTP, session, and password security |
| `/api/admins` | Administrator operations |
| `/api/consumers` | Consumer accounts and profiles |
| `/api/meter-readers` | Meter-reader accounts and operations |
| `/api/consumption` | Meter readings and usage |
| `/api/billing` | Billing records and balances |
| `/api/payments` | Payment processing and history |
| `/api/notifications` | Announcements and notification state |
| `/api/consumption/prediction` | AI consumption predictions |
| `/api/anomaly` | AI anomaly detection |
| `/api/recommendation` | AI recommendations |
| `/api/reports` | Report previews, snapshots, and PDF downloads |

## Reading and Billing Workflow

```text
Meter reader records a reading
             ↓
Backend validates role, values, and monthly limit
             ↓
Consumption row is inserted
             ↓
Consumption = present reading - previous reading
             ↓
Billing row and consumer notification are created
             ↓
Dashboards and AI cache detect the updated data
```

- A consumer can have only one accepted reading for a given month.
- Payment-backed consumption records are protected from silent mutation.
- Notifications may target one consumer or be system-wide.
- Notification read state is stored separately for each consumer.

## Production Checks

Run frontend lint and production build:

```powershell
cd frontend
npm run lint
npm run build
```

Check backend JavaScript syntax or start the production server:

```powershell
cd backend
npm start
```

## Troubleshooting

### OTP email is not received

- Confirm `SENDGRID_API_KEY` is valid.
- Confirm `SENDGRID_FROM_EMAIL` is a verified SendGrid sender.
- Check spam or junk folders.
- Confirm the account contains the intended valid email address.
- Review the backend response and SendGrid activity logs.

### Admin credentials are accepted but portal access is not granted

This is expected until the emailed OTP is verified. The admin access token is issued only after the second authentication step succeeds.

### Login redirects back to `/login`

- Confirm `accessToken` and `user` exist in browser `sessionStorage`.
- Confirm the returned role is `admin`, `meter-reader`, or `consumer`.
- Verify the system clock so JWT expiry checks remain accurate.
- Confirm protected requests include the Bearer token.

### Frontend cannot connect to the backend

- Confirm the backend is running on port `5000`.
- Confirm Vite is proxying `/api` to the correct backend address.
- Keep `VITE_API_URL=/api` when using the development proxy.

## Security Notes

- Never commit `.env` files or production secrets.
- Password hashing, JWT generation, OTP validation, and authorization belong to the backend.
- Email OTP challenges are short-lived and bound to the account’s current password state.
- The frontend must never create an authenticated session before the backend returns a valid access token.
- Validate ownership and role permissions on every protected endpoint.
