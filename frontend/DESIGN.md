# WaterWise Frontend Design Specification

## 1. Purpose

WaterWise is the responsive portal for the Sucol Water System. It supports three account roles:

- Administrators (Barangay Officials)
- Meter Readers (Field Personnel)
- Consumers (Community Portal)

The current production-facing interface is centered on the consumer experience. Admin and meter-reader routes share the application shell but currently render placeholder workspaces until their complete page modules are connected.

This document describes the UI that is implemented in `frontend/src`, not a speculative future interface.

---

## 2. Design Direction

### 2.1 Mobile-first

Every interface begins with the phone layout and progressively expands at larger breakpoints. Mobile is treated as a primary environment rather than a reduced desktop view.

The design prioritizes:

- One-handed navigation
- Minimum 44-pixel touch targets
- Short, scannable content sections
- Cards instead of wide tables on phones
- Drawers and bottom sheets for secondary content
- Strong hierarchy for balances, usage, due dates, and statuses
- Layout stability while API data is loading

### 2.2 Visual character

WaterWise uses a calm civic-utility aesthetic: deep slate surfaces establish trust, sky blue identifies water-related actions, and soft neutral backgrounds keep dense account information readable.

The interface combines:

- Rounded cards and controls
- Restrained gradients
- Soft elevation rather than heavy borders
- Bold, compact headings
- Monospaced financial and meter values
- Status colors used only when they communicate meaning

### 2.3 Interaction principles

- Primary actions are visually obvious and reachable.
- Navigation state is persistent and clearly highlighted.
- Destructive actions use red hover and focus treatments.
- Loading states resemble the content that will replace them.
- Empty and error states explain what happened without blocking unrelated content.
- Consumers can inspect account information but cannot mutate billing records.

---

## 3. Design Tokens

### 3.1 Color palette

| Token | Value | Usage |
|---|---:|---|
| Slate 900 | `#0F172A` | Primary text, dark cards, structural surfaces |
| Sky 600 | `#0284C7` | Primary actions, links, active navigation |
| Sky 50 | `#F0F9FF` | Selected states and supporting surfaces |
| Emerald 600 | `#16A34A` | Paid, secure, and healthy states |
| Red 600 | `#DC2626` | Overdue, destructive, and error states |
| Slate 50 | `#F8FAFC` | Application canvas |
| White | `#FFFFFF` | Cards, drawers, and input surfaces |

The global background includes a subtle sky radial gradient over Slate 50. This provides depth without competing with data cards.

### 3.2 Typography

- Interface font: `Inter`, falling back to `system-ui` and `sans-serif`
- Numeric font: `ui-monospace`, `Consolas`, `monospace`
- Page headings: extra-bold with tight letter spacing
- Section labels: small uppercase text with increased tracking
- Body text: regular or medium weight with comfortable line height

### 3.3 Shape and elevation

- Inputs and buttons: 12-pixel radius
- Standard cards: 16-pixel radius
- Major sections and modals: 24 to 28-pixel radius
- Shadows: soft slate or sky-tinted elevation
- Borders: low-contrast Slate 200, used primarily for separation

---

## 4. Responsive Layout System

The Tailwind breakpoints used by the interface are:

| Breakpoint | Width | Primary behavior |
|---|---:|---|
| Base | Below 640px | Phone-first stacked layout |
| `sm` | 640px | Wider cards, split fields, expanded metadata |
| `lg` | 1024px | Desktop sidebar and multi-column shell |
| `xl` | 1280px | Full dashboard grids and balanced content columns |

### 4.1 Mobile application shell

On phone-sized screens:

- The header remains sticky at the top.
- The main navigation is fixed to the bottom.
- Navigation items use an icon-over-label pattern.
- Content includes bottom padding so the navigation never covers it.
- Logout is not placed in the bottom navigation.
- The account avatar in the header opens an account menu containing user details and logout.

```text
+----------------------------------+
| WaterWise              Bell User |
+----------------------------------+
| YOUR WATER AT A GLANCE           |
| Usage Metrics                    |
|                                  |
| [ Summary cards ]                |
| [ Consumption chart ]            |
|                                  |
+----------------------------------+
| Usage       Billing      Profile |
+----------------------------------+
```

### 4.2 Desktop application shell

At `lg` and above:

- Navigation becomes a sticky left sidebar.
- Navigation labels appear beside their icons.
- Account identity appears at the bottom of the sidebar.
- Logout remains in the header account menu for consistent placement.
- Main content is constrained to a readable maximum width.

### 4.3 Header

The header contains:

- WaterWise brand mark and name
- Sucol Water System subtitle on wider screens
- Active role pill on wider screens
- Consumer notification trigger when applicable
- Account-menu trigger for every authenticated role

The account menu displays the current account name, role, and logout action.

---

## 5. Role-aware Navigation

### 5.1 Consumer

Consumer navigation contains:

- Usage Metrics
- Billing Ledger
- Profile Details

The consumer role also receives the notification trigger and notification data stream.

### 5.2 Administrator

Administrator navigation contains:

- Dashboard
- Consumers
- Readings
- Billings
- Events
- Announcements

These routes currently use the shared shell with placeholder workspace content.

### 5.3 Meter Reader

Meter-reader navigation contains:

- Readings Entry
- Consumer Directory

These routes currently use the shared shell with placeholder workspace content.

### 5.4 Access boundaries

Routes are guarded by the role stored for the active mock session. Opening a route for another role renders a dedicated access-error page with a clear recovery action.

---

## 6. Login Experience

The login page is a responsive split-panel interface.

### Mobile

- A compact dark brand panel introduces WaterWise.
- Role cards communicate the supported workspaces.
- The form follows directly below the introduction.
- Inputs include email and lock icons for faster recognition.
- Password visibility can be toggled.
- A security message reinforces role-based session protection.

### Desktop

- The brand panel and form appear side by side.
- The brand panel uses a deep slate-to-sky gradient.
- The form is vertically centered with a constrained readable width.

### Authentication behavior

The API response determines the destination:

| API role | Destination |
|---|---|
| `admin` | `/admin/dashboard` |
| `meter-reader` | `/meter-reader/readings-entry` |
| `consumer` or `tenant` | `/consumer/usage-metrics` |

Validation and API feedback appear inline without replacing the form.

---

## 7. Consumer Pages

### 7.1 Usage Metrics

The page presents:

- Current balance
- Total water consumption
- Average monthly usage
- Highest consumption month
- Filterable consumption trend graph

On mobile, summary cards form a compact two-column grid. The graph height is reduced to fit the viewport while retaining touch-friendly year filtering. On wider screens, the summary expands to four columns.

### 7.2 Billing Ledger

The page begins with a dark balance card containing:

- Outstanding balance
- Upcoming due date

Billing records adapt by breakpoint:

- Mobile: each billing cycle is a standalone card with labeled values and a full-width action.
- Desktop: records use a conventional multi-column table.

Paid records can open a digital receipt. Unpaid or overdue records keep receipt actions disabled. An official receipt action appears when receipt data is available.

### 7.3 Consumer Profile

The profile page contains:

- Account-holder card
- Current balance card
- Latest monthly consumption card
- Contact and location details
- Latest meter snapshot
- Last reading date
- Consumer read-only notice

Mobile layouts use two-column metric groups only when the values remain readable. Longer details remain stacked.

---

## 8. Notifications

Notifications are currently available only to consumers.

### 8.1 Trigger

- The bell appears in the header for consumer sessions.
- The badge displays the number of unread notifications.
- The badge is removed when the unread count is zero.

### 8.2 Drawer behavior

The notification center always slides in from the right side of the viewport, including at the mobile breakpoint.

- Mobile width: up to 92% of the viewport
- Maximum width: 26rem
- Height: full viewport
- Background overlay: closes the drawer when tapped
- Close button: remains visible in the drawer header

### 8.3 Content streams

Notifications are separated into:

- Account bills
- Community announcements

Unread cards use a sky-highlighted treatment. Read cards use a neutral Slate 50 surface. Billing notifications can navigate directly to the billing ledger and official receipt query state.

---

## 9. Dialogs and Receipts

Receipt experiences use responsive modal patterns:

- Mobile: bottom-aligned sheet with rounded top corners
- Desktop: centered modal with fully rounded corners
- Header: sticky within the scrolling modal
- Actions: download and close remain immediately accessible

Financial totals use monospaced type. Official receipts separate meter identity, usage telemetry, arrears, and final bill totals into clear sections.

---

## 10. Loading, Empty, and Error States

### 10.1 Modern loading skeletons

`LoadingSkeleton.jsx` provides three page-shaped variants:

- `metrics`: summary cards and chart placeholder
- `billing`: current-billing card and billing-record placeholders
- `profile`: profile cards and detail-grid placeholders

Skeletons use a subtle horizontal shimmer rather than a generic spinner. Their shapes closely match the hydrated page, reducing layout movement when data arrives.

Each skeleton:

- Uses `role="status"`
- Includes an accessible screen-reader label
- Uses `aria-live="polite"`
- Disables animation when `prefers-reduced-motion: reduce` is enabled

### 10.2 Empty states

Tables and notification streams display plain-language empty messages inside low-emphasis neutral surfaces.

### 10.3 Error states

- Errors use red borders and light red backgrounds.
- Usage Metrics provides an inline retry action.
- Errors do not remove global navigation or account controls.

---

## 11. PWA Experience

WaterWise is configured as an installable Progressive Web App using `vite-plugin-pwa`.

The PWA includes:

- Generated web app manifest
- Automatically updating service worker
- WaterWise application icons
- Standalone display mode
- Theme and background colors matching the interface
- Custom install prompt

`PWAInstallPrompt.jsx` appears only after the browser emits the installability event. Dismissing the prompt hides it for the current browser session.

API responses are not added to the static precache. This avoids presenting stale billing, profile, or consumption information as current data.

---

## 12. Accessibility Requirements

The implemented interface follows these rules:

- Interactive controls provide visible keyboard focus states.
- Icon-only buttons include accessible labels.
- Touch targets are approximately 44 pixels or larger.
- Dialogs and status messages use appropriate ARIA roles.
- Loading states provide screen-reader text.
- Color is not the only source of status meaning; text labels remain visible.
- Text maintains high contrast against light and dark surfaces.
- Motion-sensitive users can disable skeleton shimmer through system preferences.

---

## 13. Component Map

| Area | Primary components |
|---|---|
| Application shell | `AppLayout`, `Header`, `Sidebar` |
| Authentication | `Login`, `RouteAccessError` |
| Usage | `UsageMetrics`, `AnalyticsSummaryGrid`, `ConsumptionTrendGraph`, `CurrentBalanceCard` |
| Billing | `BillingLedger`, `CurrentBillingCard`, `BillingHistoryTable`, `DigitalReceiptModal`, `OfficialReceiptModal` |
| Profile | `ConsumerProfile`, `ConsumerInfoGrid`, `MonthlyConsumptionWidget`, `CurrentBalanceCard` |
| Notifications | `NotificationBadgeTrigger`, `NotificationPage`, `NotificationCard` |
| Loading | `LoadingSkeleton` |
| Installation | `PWAInstallPrompt` |

---

## 14. UI Quality Expectations

UI changes should preserve:

- Role-based route behavior
- Keyboard access and accessible names
- Loading-to-content transitions
- Mobile bottom-navigation clearance
- Right-side notification drawer behavior
- PWA production build generation

Before delivery, run:

```bash
npm run build
```

Focused lint should also be run against every modified frontend file.
