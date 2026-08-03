# WaterWise UI/UX Design Specification

> **Design direction:** clean, modern, calm, and operationally efficient.
>
> **Primary users:** barangay officials, meter readers, and community residents.
>
> **Implementation target:** responsive React application using reusable tokens and role-aware components.

---

## 1. Executive Purpose & Design Direction

WaterWise is a barangay water-management platform for monitoring consumption, recording meter readings, overseeing billing and payments, identifying anomalies, publishing announcements, and helping residents understand their household water use.

The interface must make complex utility information feel organized and approachable. Barangay officials need high information density without visual clutter, meter readers need fast and reliable field controls, and residents need immediate answers about balances, due dates, payments, and unusual consumption.

### 1.1 Visual direction

The design takes inspiration from the reference dashboard's strongest characteristics:

- Quiet off-white application canvas
- Solid white cards with soft borders
- Restrained shadows used only for raised elements
- Compact desktop sidebar and top utility bar
- Strong black/navy typography with clear hierarchy
- One controlled accent color for navigation and primary actions
- Modular metric cards and balanced dashboard grids
- Generous internal padding with efficient space between sections
- Small status badges that combine color, icon, and text
- Clean charts with muted gridlines and one highlighted data series

WaterWise adapts these qualities with a water-oriented blue accent, civic-service language, consumption units, billing states, and role-specific workflows.

### 1.2 Experience attributes

The product should feel:

- **Clear:** the most important status and next action are immediately visible.
- **Reliable:** billing, payment, and reading data are precise and auditable.
- **Efficient:** frequent staff tasks require few steps and preserve context.
- **Calm:** neutral surfaces and restrained color reduce cognitive load.
- **Responsive:** each workspace adapts to its user's device and environment.
- **Inclusive:** language, contrast, controls, and feedback support varied abilities and digital confidence.

### 1.3 Core UX principles

1. **Lead with the answer.** Show amount due, due date, reading status, or operational exception before supporting detail.
2. **Prioritize action over decoration.** Every visual element must improve hierarchy, recognition, or feedback.
3. **Keep one primary action per region.** Secondary actions use quieter button treatments.
4. **Use progressive disclosure.** Summaries appear first; filters, metadata, and advanced analytics appear when needed.
5. **Prevent errors early.** Validate forms inline and provide review steps for readings, payments, and destructive changes.
6. **Preserve context.** Search, filters, pagination, and scroll position should survive detail views and modal actions.
7. **Make status redundant.** Communicate status using color, icon, and text together.
8. **Design for real conditions.** Support small phones, bright outdoor environments, slow connections, and one-handed use.

---

## 2. Target User Profiles & UX Principles

### 2.1 Barangay officials / administrators

Administrators review system-wide information and work across many resident, billing, payment, reading, announcement, and report records.

**Primary needs**

- Monitor current water-system performance.
- Identify overdue accounts, missing readings, and unusual consumption.
- Search residents by name, account number, meter number, or purok.
- Review billing and payment status.
- Publish targeted or community-wide announcements.
- Generate reliable operational reports.

**UX requirements**

- Use a compact desktop-first workspace with a persistent sidebar.
- Place key metrics and attention items above charts.
- Keep search, filters, date ranges, and actions beside the records they affect.
- Use sortable tables on desktop and structured record cards on mobile.
- Preserve filters when opening and closing resident details.
- Link dashboard exceptions to pre-filtered management pages.
- Confirm financial, publishing, and destructive actions.

### 2.2 Meter readers / field personnel

Meter readers primarily work from phones, often outdoors and with unreliable connectivity.

**Primary needs**

- Find the correct resident and meter quickly.
- Compare the previous reading with the physical meter.
- Enter a new reading accurately.
- Review calculated consumption before submission.
- Know whether a reading was recorded, pending, or failed.

**UX requirements**

- Use a focused sequence: **Select resident → Enter reading → Review → Confirm**.
- Use controls at least `48px` high for field tasks.
- Display resident name, purok, account number, meter number, and previous reading together.
- Open the numeric keypad for meter values.
- Warn when a reading is below the previous value or unusually high.
- Preserve entered values after recoverable errors.
- Clearly distinguish **Recorded**, **Pending**, **Not submitted**, and **Failed**.
- Never imply that offline information was successfully submitted.

### 2.3 Community residents / consumers

Residents may use WaterWise infrequently and should not need utility expertise to understand their account.

**Primary needs**

- Know the amount due and due date.
- Confirm whether a payment was recorded.
- Understand current and historical water use.
- Open and download receipts.
- Receive billing, leak, and barangay announcements.
- Review household and meter details.

**UX requirements**

- Put amount due, due date, and payment state above the fold.
- Prefer plain language such as **Water used this month** before technical terminology.
- Explain comparisons: **3 m³ higher than last month**, not only **18 m³**.
- Keep resident navigation limited to **Home**, **Bills**, and **Profile**.
- Use comfortable spacing and `16px` body text.
- Provide reassuring empty states such as **You have no unpaid bills**.
- Explain how residents can request account-detail corrections.

### 2.4 Shared content rules

- Use **Residents** in user-facing staff interfaces; retain **Consumers** only where required by the data model.
- Use **Billing** for staff navigation and **Bills** for resident navigation.
- Write dates as **31 July 2026** to avoid ambiguity.
- Format currency as Philippine pesos: `₱1,250.00`.
- Use `m³` consistently and explain **cubic meters** on first use where helpful.
- Use direct action labels: **Record payment**, **Add resident**, **Review reading**, **Download receipt**.
- Avoid vague labels such as **Proceed**, **Submit**, or **Manage** when a precise verb exists.

---

## 3. Design Tokens

Tokens are the source of truth. Components must not introduce arbitrary colors, radii, spacing, or shadows.

### 3.1 Color palette

#### Neutral and brand colors

| Token | Value | Usage |
|---|---:|---|
| `--canvas` | `#F4F7FA` | Application background |
| `--surface` | `#FFFFFF` | Cards, tables, forms, drawers, navigation |
| `--surface-subtle` | `#F7FAFC` | Grouped rows, hover states, secondary panels |
| `--surface-selected` | `#E8F5F3` | Selected navigation and records |
| `--navy-950` | `#082032` | Strong page headers and emphasis cards |
| `--navy-900` | `#0B2B40` | Primary text |
| `--navy-700` | `#334B5B` | Secondary headings |
| `--slate-600` | `#52697A` | Body and supporting text |
| `--slate-500` | `#6B7F8E` | Metadata and placeholders |
| `--border` | `#DCE5EA` | Standard borders and dividers |
| `--border-strong` | `#C5D2D9` | Inputs and emphasized separation |
| `--water-700` | `#0369A1` | Pressed primary actions |
| `--water-600` | `#0284C7` | Primary actions, links, active indicators |
| `--water-500` | `#0EA5E9` | Chart highlights and icon accents |
| `--water-100` | `#E0F2FE` | Selected navigation and informational backgrounds |
| `--water-50` | `#F0F9FF` | Subtle accent surfaces |

#### Semantic colors

| State | Strong | Background | Border |
|---|---:|---:|---:|
| Success / Paid / Normal | `#15803D` | `#ECFDF3` | `#BBE7C8` |
| Warning / Due soon | `#A16207` | `#FFF8E6` | `#F4D994` |
| Danger / Overdue / Failed | `#B91C1C` | `#FFF1F1` | `#F4C1C1` |
| Information / In progress | `#0369A1` | `#EFF8FF` | `#BFDBEE` |

Color must never be the only status indicator. Every semantic state includes an icon and visible text.

### 3.2 Typography

Use `Inter`, followed by `system-ui`, `-apple-system`, and `sans-serif`. Use `ui-monospace` only for meter values, reference numbers, and aligned financial data.

| Style | Mobile | Desktop | Weight | Usage |
|---|---:|---:|---:|---|
| Display | `32/38` | `40/46` | 750–800 | Login and major empty states only |
| Page title | `24/30` | `28/34` | 750 | One per page |
| Section title | `20/26` | `22/28` | 700 | Major content groups |
| Card title | `16/22` | `18/24` | 650–700 | Card headings |
| Body | `16/24` | `15/22` | 400 | Resident content and descriptions |
| Data body | `14/20` | `14/20` | 400–500 | Tables and dense staff interfaces |
| Label | `13/18` | `13/18` | 600 | Inputs, metadata, filters |
| Caption | `12/16` | `12/16` | 500 | Supporting information |
| Metric | `28/34` | `32/38` | 750–800 | KPI values and balances |

Rules:

- Use sentence case for headings and actions.
- Limit uppercase text to short eyebrow labels.
- Use tabular numerals for currency, consumption, dates, and readings.
- Keep body line lengths below approximately `75` characters.

### 3.3 Spacing and sizing

- Spacing scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`
- Mobile page gutter: `16px`
- Tablet page gutter: `24px`
- Desktop page gutter: `24px–32px`
- Standard control height: `44px`
- Field-operation control height: `48px`
- Desktop sidebar width: `240px–256px`
- Main content maximum width: `1440px`

### 3.4 Borders and radii

| Element | Radius | Border |
|---|---:|---|
| Input and button | `10px–12px` | `1px solid var(--border-strong)` |
| Standard card | `16px` | `1px solid var(--border)` |
| Major panel | `20px` | `1px solid var(--border)` |
| Modal and drawer | `20px–24px` | `1px solid var(--border)` |
| Badge or chip | `999px` | Semantic or neutral border |

Avoid excessive nested rounded containers. Use spacing and dividers inside a parent card.

### 3.5 Elevation

| Token | Value | Usage |
|---|---|---|
| `--shadow-none` | `none` | Tables and grouped rows |
| `--shadow-card` | `0 4px 16px rgba(15,43,64,.06)` | Standard cards |
| `--shadow-raised` | `0 10px 30px rgba(15,43,64,.10)` | Menus, drawers, important summaries |
| `--shadow-modal` | `0 24px 64px rgba(8,32,50,.20)` | Modals and dialogs |

Shadows should communicate stacking, not decorate every surface.

---

## 4. Responsive Layout Architecture & Shell System

### 4.1 Breakpoints

| Breakpoint | Width | Primary behavior |
|---|---:|---|
| Base | `< 640px` | Single column, mobile header, bottom navigation |
| `sm` | `≥ 640px` | Split form fields and two-column metrics |
| `lg` | `≥ 1024px` | Sticky desktop sidebar and table layouts |
| `xl` | `≥ 1280px` | Expanded analytics and multi-column dashboards |

### 4.2 Desktop application shell

The desktop shell consists of a compact sticky header, a persistent left sidebar, and a flexible content canvas.

```text
┌──────────────────────────────────────────────────────────────────┐
│ WaterWise        Current workspace              Alerts  Account │
├───────────────┬──────────────────────────────────────────────────┤
│ Workspace     │ Page title                       Primary action │
│ Dashboard     │ Supporting description                          │
│ Residents     │                                                  │
│ Readings      │ [ KPI ] [ KPI ] [ KPI ] [ KPI ]                 │
│ Billing       │                                                  │
│ Payments      │ [ Main chart or records ] [ Attention panel ]   │
│ ...           │                                                  │
└───────────────┴──────────────────────────────────────────────────┘
```

**Header**

- Height: `64px–72px`.
- Solid white background with a bottom border.
- Brand column aligns exactly with the sidebar width.
- Center area identifies the active workspace without repeating the page title.
- Right area contains notifications and the account menu.
- The header remains sticky and does not cast a large shadow.

**Sidebar**

- Width: `240px–256px`.
- Solid white background with a right border.
- Navigation groups use small uppercase labels only when grouping improves scanning.
- Items are `44px–48px` high.
- Active item uses a pale water-blue background, strong text, icon, and a left indicator.
- Hover uses a subtle neutral or teal tint without movement.
- Logout remains inside the account menu rather than the primary navigation.

**Content canvas**

- Background: `var(--canvas)`.
- Page gutter: `24px` on desktop.
- Page sections use `20px–24px` vertical gaps.
- Staff data pages may use the full available width up to `1440px`.
- Focused entry flows should remain between `720px` and `880px` where practical.

### 4.3 Mobile application shell

- Sticky `64px` solid header with brand, alerts, and account access.
- Fixed bottom navigation with a maximum of four visible destinations.
- Administrator overflow destinations open through a labeled **More** sheet.
- Bottom navigation accounts for device safe-area insets.
- Page content includes at least `88px` bottom clearance.
- No page-level horizontal scrolling.
- Tables convert to record cards below tablet width.

### 4.4 Grid system

- KPI grid: one column at base, two columns at `sm`, three or four columns at `xl`.
- Standard dashboard: `12` conceptual columns with `16px–20px` gaps.
- Primary analytics region: `8` columns; supporting attention panel: `4` columns.
- Two-panel forms: `7/5` or `8/4` split on desktop; single column on mobile.
- Avoid layouts with more than three different card widths in one section.

### 4.5 Page-header pattern

All roles use the same page-header anatomy:

1. Short eyebrow label
2. Page title
3. One-sentence description
4. Optional status or primary action aligned right on desktop

Page headers use a compact navy surface or a white surface with a strong title. Do not use large decorative hero areas for routine management pages.

---

## 5. Role-Aware Workspaces & Screen Layouts

### 5.1 Administrator workspace

**Navigation**

Dashboard, Residents, Readings, Billing, Payments, Events, Announcements, Analytics, Reports.

**Dashboard order**

1. Page header and current reporting period
2. KPI cards: active residents, monthly consumption, outstanding balance, completed readings
3. Attention queue: overdue accounts, missing readings, anomalies, failed records
4. Monthly and yearly trends
5. Purok comparison
6. Recent operational activity

The dashboard is an exception-monitoring workspace, not a wall of charts. Every attention item links to the corresponding pre-filtered page.

**Management pages**

- Page header with one primary action
- Search and filter toolbar
- Result count and active-filter summary
- Table or record-card region
- Pagination and current range
- Details open as a page or side panel depending on complexity

### 5.2 Meter-reader workspace

**Navigation**

Record Reading, with account access in the header.

**Reading flow**

1. Search and select resident
2. Confirm account, purok, address, and meter number
3. Compare previous and current readings
4. Review calculated usage and anomaly warning
5. Confirm submission
6. Display a persistent recorded, pending, or failed result

The interface uses one primary task panel rather than a dashboard grid. On desktop the flow stays centered; on mobile it fills the available width.

### 5.3 Resident workspace

**Navigation**

Home, Bills, Profile.

**Home layout**

1. Amount due, due date, and payment state
2. Water used this month and comparison with last month
3. Leak or unusual-use warning when applicable
4. Consumption chart
5. Recent payment, bill, and announcement updates

**Bills layout**

- Current amount-due summary
- Billing records ordered newest first
- Status, billing period, amount, due date, and payment date
- Explicit **View receipt** and **Download receipt** actions
- Paid records remain visually quiet; overdue records receive clear semantic emphasis

**Profile layout**

- Account holder
- Contact information
- Service address and purok
- Meter details
- Latest reading
- Read-only explanation and correction instructions

---

## 6. Key UI Component Specifications

### 6.1 KPI cards

**Anatomy**

- Optional `36px–40px` icon container
- Short descriptive label
- Large tabular value
- Unit beside or below the value
- Comparison or timestamp
- Optional overflow action for staff-only cards

KPI cards use solid white surfaces, `16px` radius, `16px–20px` padding, and a subtle border. A dark emphasis variant is reserved for the most important balance or operational total.

### 6.2 Billing summaries

- Lead with **Amount due** rather than internal billing terminology.
- Display due date and written status near the amount.
- Use Philippine peso formatting with two decimals.
- Separate bill status from payment status when the data model distinguishes them.
- Provide only one primary action, such as **Record payment** or **View bill**.

### 6.3 Anomaly alerts

Anomaly alerts include:

- Warning or danger icon
- Plain-language title
- Affected resident or purok
- Observed change and comparison period
- Recommended next step
- Acknowledgement or review action

Do not block a legitimate meter reading solely because it is unusual. Require acknowledgement when appropriate.

### 6.4 Buttons

| Variant | Treatment | Usage |
|---|---|---|
| Primary | Water-teal fill, white text | Main action in a region |
| Secondary | Light neutral fill, navy text | Supporting action |
| Outline | White fill, visible border | Filters and alternative actions |
| Quiet | No container until hover | Row and card utilities |
| Danger | Red fill or red outline | Destructive confirmation |

Requirements:

- Minimum target: `44 × 44px`; field actions: `48px` high.
- Labels describe outcomes: **Record payment**, not **Submit**.
- Loading state preserves button width.
- Disabled controls have a nearby explanation when the reason is not obvious.

### 6.5 Forms and validation

- Labels remain above inputs and never become red solely because the field is invalid.
- Invalid styling applies to the input border, input icon, and inline message.
- Show one concise message beneath only the incorrect field.
- Use `aria-invalid` and `aria-describedby`.
- Focus the first invalid field after submission.
- Preserve entered values after server or validation errors.
- Use `numeric`, `decimal`, `tel`, and `email` input modes appropriately.
- Financial and irreversible actions include a review step.

### 6.6 Tables and record lists

Desktop tables include:

- Solid subtle header row
- Sticky table header for long sets
- Sort direction icons and accessible labels
- Right-aligned numeric columns
- Status badges with icon and text
- Clear row actions or a labeled overflow menu
- Hover background without row movement
- Pagination and result range

Below `768px`, rows become cards that preserve the same field priority.

### 6.7 Charts and data visualization

- Primary data series uses `--water-600`.
- Comparisons use a darker navy or a distinct dashed line.
- Gridlines use `--border` at low visual emphasis.
- Highlight only the selected or current point.
- Tooltips use solid white, a border, and `--shadow-raised`.
- Start quantitative axes at zero unless a documented analytical reason requires otherwise.
- Label units consistently as `m³` or Philippine pesos.
- Limit simultaneous series to five.
- Provide a concise written insight and accessible data summary.
- Avoid 3D charts, decorative gauges, and high-saturation rainbow palettes.

### 6.8 Status badges

Badges use triple-redundant communication:

1. Semantic color
2. Recognizable icon or dot
3. Visible status text

Recommended labels: **Paid**, **Unpaid**, **Overdue**, **Due soon**, **Pending**, **Recorded**, **Failed**, **Normal**, **Review needed**.

### 6.9 Notification drawer

- Opens from the right on desktop and mobile.
- Width: up to `432px` desktop and `94vw` mobile.
- Solid white surface with a left border and raised shadow.
- Header remains sticky with title, unread count, and close action.
- Categories: Bills, Payments, Announcements, System.
- Unread items use a dot, stronger title weight, and **Unread** screen-reader text.
- Opening an actionable notification navigates to the relevant record.

### 6.10 Digital receipt modal

- Mobile: full-width bottom sheet or full-screen dialog.
- Desktop: centered modal with a maximum readable width.
- Solid white background for screen, download, and print.
- Sticky title and close action.
- Group account, meter, usage, payment, and reference information.
- Use monospaced tabular values for totals and reference numbers.
- Actions: **Download receipt**, **Print**, **Close**.

### 6.11 Search and filters

- Search supports a short debounce or explicit submit.
- Display the active query in the result summary.
- Desktop filters use an anchored panel; mobile filters use a bottom sheet.
- Show **Clear all** only when filters are active.
- No-results states retain search and filters for recovery.

---

## 7. Feedback, Loading & Accessibility Standards

### 7.1 Required system states

Every data-driven region defines:

1. **Loading** — content-shaped shimmer skeleton
2. **Success** — current content and freshness context where needed
3. **Empty** — explanation and relevant next step
4. **No results** — preserved search/filter controls and recovery guidance
5. **Error** — plain-language message, retry, and preserved input
6. **Offline/stale** — explicit freshness and submission status

### 7.2 Loading

- Use skeletons shaped like the expected content.
- Preserve layout dimensions to avoid cumulative layout shift.
- Use inline progress for local actions such as recording a payment.
- Disable shimmer under `prefers-reduced-motion`.
- Do not replace an entire page when only one card is refreshing.

### 7.3 Empty and no-results states

- Keep empty states compact and factual.
- Explain whether no data exists or filters returned no matches.
- Offer one relevant action where possible.
- Avoid decorative illustrations in dense staff workspaces.

### 7.4 Errors and validation

- Place errors beside the failed field or content region.
- Do not remove global navigation after a local error.
- Preserve user input.
- Use one primary recovery action.
- Authentication errors identify the affected field without duplicating a page-level banner.
- Backend errors use plain language and include a support code only when it helps resolution.

### 7.5 Connectivity

- Show a persistent offline banner when connection is lost.
- Label cached information with its last successful update time.
- Queue submissions only when duplicate prevention is reliable.
- Otherwise state: **Not submitted. Reconnect and try again.**

### 7.6 Accessibility

Target WCAG 2.2 Level AA.

- Normal text contrast: at least `4.5:1`.
- Large text and essential UI graphics: at least `3:1`.
- Touch targets: at least `44 × 44px`; field workflows prefer `48px`.
- Visible focus: `2px` water-blue ring with `2px` offset.
- Logical keyboard order and correct landmarks.
- Icon-only buttons require accessible names.
- Dialogs trap focus, close with `Escape`, and restore focus to their trigger.
- Errors are programmatically linked to fields.
- Charts include written summaries or accessible tables.
- Color is never the only status indicator.
- Support browser zoom to `200%` without losing content or function.
- Respect reduced-motion and increased-contrast preferences.

### 7.7 Motion

| Interaction | Duration | Easing |
|---|---:|---|
| Hover and focus | `120ms` | ease-out |
| Button and badge state | `160ms` | ease-out |
| Section reveal | `180ms` | ease-out |
| Drawer and modal | `220ms` | cubic-bezier(.2,.8,.2,1) |

Use opacity and transforms of no more than `6px`. Never delay user input or animate backgrounds continuously.

### 7.8 Completion checklist

A screen is ready when:

- The primary status and action are identifiable within five seconds.
- It works from `320px` through large desktop widths.
- It has no page-level horizontal overflow.
- Loading, empty, no-results, error, and offline states are defined.
- Keyboard focus is visible and ordered logically.
- Text, controls, and charts meet contrast requirements.
- Touch targets meet the minimum size.
- Dates, units, currency, and statuses use consistent formatting.
- Financial and destructive actions include clear confirmation.
- Motion respects user preferences.
- Existing role permissions and route guards still pass.
- Production build and focused lint checks pass.

---

## 8. Component Hierarchy Map

```text
WaterWiseApp
├── AuthenticationShell
│   ├── BrandPanel
│   └── LoginForm
│       ├── FormField
│       ├── PasswordField
│       ├── InlineFieldError
│       └── PrimaryButton
│
└── AuthenticatedShell
    ├── AppHeader
    │   ├── Brand
    │   ├── WorkspaceContext
    │   ├── NotificationTrigger
    │   └── AccountMenu
    ├── RoleNavigation
    │   ├── DesktopSidebar
    │   ├── MobileBottomNavigation
    │   └── MoreNavigationSheet
    ├── OfflineBanner
    ├── PageContainer
    │   ├── PageHeader
    │   ├── Toolbar
    │   │   ├── SearchField
    │   │   ├── FilterMenu
    │   │   └── PrimaryAction
    │   └── PageContent
    │       ├── MetricGrid
    │       │   └── KpiCard
    │       ├── AttentionQueue
    │       │   └── AnomalyAlert
    │       ├── ChartPanel
    │       │   ├── ChartHeader
    │       │   ├── AccessibleChart
    │       │   └── DataSummary
    │       ├── DataTable
    │       │   ├── TableToolbar
    │       │   ├── StatusBadge
    │       │   ├── RowActions
    │       │   └── Pagination
    │       ├── RecordCardList
    │       └── SystemState
    │           ├── Skeleton
    │           ├── EmptyState
    │           ├── NoResultsState
    │           └── InlineError
    ├── NotificationDrawer
    ├── ConfirmationDialog
    ├── DigitalReceiptModal
    └── ToastRegion
```

### 8.1 Shared primitive layers

| Layer | Components |
|---|---|
| Foundations | `Surface`, `RaisedSurface`, `Stack`, `Cluster`, `PageContainer`, `Divider` |
| Navigation | `AppHeader`, `DesktopSidebar`, `BottomNavigation`, `Breadcrumbs`, `AccountMenu` |
| Actions | `Button`, `IconButton`, `Menu`, `ConfirmDialog` |
| Forms | `FormField`, `Select`, `SearchField`, `DateRange`, `FormErrorSummary` |
| Data display | `KpiCard`, `StatusBadge`, `DataTable`, `RecordCard`, `DescriptionList` |
| Feedback | `Skeleton`, `InlineAlert`, `Toast`, `EmptyState`, `OfflineBanner` |
| Overlays | `Dialog`, `Drawer`, `BottomSheet` |
| Domain | `BalanceSummary`, `ConsumptionSummary`, `ReadingReview`, `Receipt`, `AnnouncementCard`, `AnomalyAlert` |

Feature components should consume these shared primitives and tokens instead of repeating long utility-class combinations. Visual consistency belongs in the design system; role-specific behavior belongs in feature components.
