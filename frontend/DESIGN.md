# WaterWise UI/UX Design System

> **Design direction:** a modern, calm, and trustworthy civic utility experience inspired by water—clear, fluid, and accessible.
>
> **Primary users:** barangay officials, meter readers, and residents/consumers.
>
> **Document status:** target design specification. Existing screens should migrate toward this system without changing role permissions or business rules.

---

## 1. Product Experience

WaterWise helps a barangay manage water consumption, meter readings, billing, payments, announcements, and reports. The interface must make public-service work easier for officials while giving residents a simple and transparent view of their household account.

The experience should feel:

- **Clear:** important numbers and next actions are easy to find.
- **Trustworthy:** billing, readings, and payment records are presented precisely.
- **Fluid:** layouts transition naturally between phone, tablet, and desktop.
- **Calm:** water-inspired color and motion support the content without distracting from it.
- **Inclusive:** the system works for users with different ages, abilities, devices, and levels of digital confidence.

### 1.1 Design principles

1. **Show the answer before the data.** Lead with “Amount due,” “Due date,” “Reading status,” or “Consumers needing attention,” then provide details.
2. **One clear primary action per view.** Secondary actions remain available but visually quieter.
3. **Recognition over recall.** Use familiar labels, visible status text, icons with labels, and persistent context.
4. **Progressive disclosure.** Summaries come first; advanced filters, analytics, and record metadata appear on demand.
5. **Prevent errors before confirming them.** Validate forms early, explain consequences, and show a review step for financial or irreversible actions.
6. **Design for real conditions.** Prioritize small screens, sunlight readability, unstable connections, and touch use in the field.
7. **Glass supports hierarchy.** Transparency is a visual accent—not a substitute for contrast, structure, or readable surfaces.

---

## 2. Users and Their Needs

### 2.1 Barangay officials / administrators

Officials work with many records and frequently switch between monitoring, searching, verification, and reporting.

**Primary goals**

- See the water system’s current condition at a glance.
- Find a resident, bill, payment, or meter reading quickly.
- Identify overdue balances, unusual consumption, and incomplete readings.
- Manage consumers, events, and announcements.
- Produce reliable reports and receipts.

**Design response**

- Use a compact, data-first desktop workspace with clear page titles and saved context.
- Keep global search, filters, date ranges, and key actions close to the data they affect.
- Use tables on wide screens and structured record cards on narrow screens.
- Preserve filters and pagination when returning from a record.
- Confirm high-impact actions and display an audit-friendly success result.
- Pair charts with a plain-language interpretation and a data table or summary.

### 2.2 Residents / consumers

Residents may open WaterWise only when checking a bill, payment, announcement, or unusual usage. They should not need utility terminology to understand their account.

**Primary goals**

- Know how much to pay and when.
- Understand current and historical water use.
- Confirm whether a payment was recorded.
- View or download a receipt.
- Receive important barangay water announcements.
- Check and understand account details.

**Design response**

- Put amount due, due date, payment status, and latest consumption above the fold.
- Use plain-language labels such as “Water used this month” before technical units.
- Explain changes: “3 m³ higher than last month,” not only “18 m³.”
- Use reassuring empty states such as “You have no unpaid bills.”
- Keep the three resident destinations stable: **Home**, **Bills**, and **Profile**.
- Make receipts and announcements easy to open from notifications.

### 2.3 Meter readers / field personnel

Meter readers often work outdoors, on phones, and with intermittent connectivity.

**Primary goals**

- Find the correct consumer and meter.
- See the previous reading before entering the new one.
- Record a reading quickly and accurately.
- Know whether a submission succeeded or still needs attention.

**Design response**

- Use a focused step flow: **Select consumer → Enter reading → Review → Submit**.
- Keep the previous reading, meter number, address/purok, and current input visible together.
- Use a numeric keypad, large controls, and strong sunlight contrast.
- Detect readings below the previous value and unusually large changes.
- Never imply that unsent data was saved; use explicit **Saved**, **Pending**, and **Failed** states.
- Preserve typed values after recoverable errors.

---

## 3. Information Architecture

Use role-specific navigation. Do not expose inaccessible destinations and then rely on an error page to explain permissions.

| Role | Primary navigation | Default landing view |
|---|---|---|
| Administrator | Dashboard, Consumers, Readings, Billing, Payments, Announcements, Analytics, Reports | Dashboard |
| Meter reader | Record Reading | Record Reading |
| Resident | Home, Bills, Profile | Home |

Events may appear as a dedicated administrator item when actively used; otherwise group event notices with Announcements to keep navigation concise.

### 3.1 Page hierarchy

Every page follows the same order:

1. Breadcrumb when the user is deeper than one level
2. Eyebrow or context label
3. Page title
4. One-sentence description
5. Primary action
6. Summary or status
7. Filters and search
8. Main content
9. Supporting details

On mobile, keep the title, status, and primary action visible before secondary filters.

### 3.2 Naming conventions

- Use **Residents** in public-facing UI and **Consumers** only where it matches existing records or domain language.
- Use **Billing** for staff workflows and **Bills** for resident navigation.
- Use verbs for actions: **Record payment**, **Add resident**, **Download receipt**.
- Avoid vague actions such as **Proceed**, **Submit**, or **Manage** when a precise verb is available.

---

## 4. Fluid-Glass Visual Language

The visual metaphor is clean water over a stable civic foundation. Soft blue light, translucent layers, and gentle depth create the “fluid glass” character. Content surfaces remain solid enough for long reading sessions.

### 4.1 Surface hierarchy

| Level | Surface | Use |
|---|---|---|
| Canvas | Mist gradient with soft blue ambient shapes | Application background |
| Base | `rgba(255,255,255,0.92)` | Tables, forms, dense content, receipts |
| Glass | `rgba(255,255,255,0.72)` with blur | Header, sidebar, summary cards, drawers |
| Emphasis | Deep navy-to-ocean gradient | Hero balance, login brand panel, critical summary |
| Overlay | `rgba(8,32,50,0.38)` | Modal and drawer scrim |

Glass surfaces use all four of the following:

```css
background: rgba(255, 255, 255, 0.72);
border: 1px solid rgba(255, 255, 255, 0.62);
box-shadow: 0 16px 48px rgba(15, 74, 110, 0.12);
backdrop-filter: blur(18px) saturate(135%);
```

Provide a solid fallback for browsers or devices that do not support blur:

```css
@supports not (backdrop-filter: blur(1px)) {
  .glass-surface {
    background: #ffffff;
    border-color: #d8e6ee;
  }
}
```

### 4.2 Glass usage rules

- Use at most two visibly layered glass surfaces in the same region.
- Do not place body text directly over decorative gradients or imagery.
- Use near-solid surfaces for tables, long forms, receipts, and destructive dialogs.
- Never lower text opacity to create hierarchy; use approved semantic text colors.
- Keep glass blur between `12px` and `24px`; excessive blur wastes device resources.
- On low-power or reduced-transparency modes, remove blur and preserve the same hierarchy with solid color and borders.

### 4.3 Water-inspired details

- Use asymmetrical ambient gradients rather than literal wave decorations.
- A small droplet-shaped brand mark is appropriate; repeated water icons are not.
- Use aqua highlights for active and selected states.
- Use subtle flowing motion only for transitions or loading—not as a permanent background animation.

---

## 5. Design Tokens

Tokens are the source of truth. Components should not introduce arbitrary colors, radii, shadows, or spacing.

### 5.1 Color

#### Brand and neutral

| Token | Value | Purpose |
|---|---:|---|
| `--ocean-950` | `#082032` | Deep backgrounds |
| `--ocean-900` | `#0B2B40` | Primary text and emphasis |
| `--ocean-800` | `#0F3D57` | Dark interactive surfaces |
| `--water-700` | `#036E9F` | Pressed primary action |
| `--water-600` | `#0284B8` | Primary action and links |
| `--water-500` | `#0EA5C9` | Active indicators |
| `--aqua-300` | `#67E8D3` | Accent on dark surfaces |
| `--mist-100` | `#E8F5F8` | Selected and hover surfaces |
| `--mist-50` | `#F4FAFB` | Application canvas |
| `--white` | `#FFFFFF` | Solid content surface |
| `--slate-700` | `#334155` | Secondary text |
| `--slate-500` | `#64748B` | Supporting text |
| `--slate-200` | `#D8E2E8` | Dividers and input borders |

#### Semantic

| Token | Value | Meaning |
|---|---:|---|
| `--success-700` | `#15803D` | Paid, complete, normal |
| `--warning-700` | `#A16207` | Due soon, attention needed |
| `--danger-700` | `#B91C1C` | Overdue, failed, destructive |
| `--info-700` | `#0369A1` | Informational and in progress |

Semantic colors always appear with an icon or written label. “Paid,” “Overdue,” and “Pending” must remain understandable without color.

### 5.2 Background recipe

```css
background:
  radial-gradient(circle at 8% 4%, rgba(103, 232, 211, 0.18), transparent 28rem),
  radial-gradient(circle at 92% 0%, rgba(14, 165, 201, 0.16), transparent 34rem),
  linear-gradient(180deg, #f7fcfd 0%, #edf7fa 100%);
```

### 5.3 Typography

Use `Inter`, then `system-ui`, for the application. Use `ui-monospace` only for meter readings, reference numbers, and tabular financial values.

| Style | Mobile / Desktop | Weight | Use |
|---|---|---:|---|
| Display | `32/38` / `44/50` | 750–800 | Login or major empty state only |
| Page title | `26/32` / `32/38` | 750 | One per page |
| Section title | `20/26` / `24/30` | 700 | Content sections |
| Card title | `16/22` / `18/24` | 650–700 | Card headings |
| Body | `16/24` | 400 | Default resident content |
| Data body | `14/20` | 400–500 | Dense administrator content |
| Label | `13/18` | 600 | Inputs and metadata |
| Caption | `12/16` | 500 | Supporting information |

Do not use all-uppercase paragraphs. Uppercase eyebrow labels are limited to one short line with modest letter spacing.

### 5.4 Spacing, shape, and depth

- Spacing scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`
- Control radius: `12px`
- Card radius: `20px`
- Hero, modal, and major panel radius: `24px`
- Pill radius: `999px`
- Mobile page gutter: `16px`
- Tablet page gutter: `24px`
- Desktop page gutter: `32px`
- Standard shadow: `0 16px 48px rgba(15, 74, 110, 0.12)`
- Raised shadow: `0 24px 72px rgba(8, 32, 50, 0.18)`

Avoid nesting multiple heavily rounded cards. Use dividers, spacing, or grouped rows inside a parent card.

### 5.5 Icons

- Use one outline icon family consistently.
- Default sizes: `20px` in controls, `24px` in mobile navigation.
- Icons supplement labels; they do not replace unfamiliar actions.
- Icon-only buttons require an accessible name and tooltip on pointer devices.

---

## 6. Responsive Layout

WaterWise uses content-based adaptation rather than shrinking desktop layouts.

| Breakpoint | Width | Behavior |
|---|---:|---|
| Base | `< 640px` | Single column, bottom navigation, card records |
| `sm` | `≥ 640px` | Split fields and two-column summaries |
| `lg` | `≥ 1024px` | Left sidebar, tables, multi-column workspaces |
| `xl` | `≥ 1280px` | Expanded analytics and side-by-side detail panels |

### 6.1 Application shell

#### Mobile

- Sticky glass header with brand, notification bell, and account menu.
- Fixed glass bottom navigation with a maximum of four destinations.
- Use safe-area insets and at least `96px` bottom content clearance.
- Keep horizontal scrolling out of page-level layouts.
- Drawers become full-height edge panels; long forms become full-screen dialogs.

```text
┌──────────────────────────────────┐
│ WaterWise             Alerts  Me │
├──────────────────────────────────┤
│ Good morning, Maria              │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Amount due          ₱ 420.00 │ │
│ │ Due August 15       View bill│ │
│ └──────────────────────────────┘ │
│                                  │
│ Water used this month            │
│ [ 18 m³   ↑ 3 m³ from June ]     │
│                                  │
│ Recent updates                   │
└──────────────────────────────────┘
│   Home        Bills       Profile│
└──────────────────────────────────┘
```

#### Desktop

- Sticky glass header for global account and notification actions.
- Sticky left navigation between `224px` and `256px`.
- Main content width is capped at `1440px`.
- Data pages may use the full content width; reading pages stay near `760px`.
- Page-level primary actions align to the upper-right of the title block.

### 6.2 Density by role

- **Resident:** comfortable spacing, `16px` body text, large summaries, minimal controls.
- **Meter reader:** comfortable touch density, large numeric input, minimal navigation.
- **Administrator:** compact but never below `14px` for functional text or `40px` for pointer targets.

Density is role-based, not device-based. An administrator on a phone still receives touch-friendly controls.

---

## 7. Navigation and Wayfinding

### 7.1 Active state

Active destinations use a water-tinted surface, strong text, and a left indicator on desktop or top indicator on mobile. Do not rely on icon color alone.

### 7.2 Global header

The header contains:

- WaterWise mark and product name
- Current barangay/water-system name on wide screens
- Notification trigger where applicable
- Account menu with user name, role, and logout

Do not repeat the page title in the global header and page body.

### 7.3 Back behavior

- Detail views use a labeled back link: **Back to residents**, not only a chevron.
- Closing a modal returns focus to the control that opened it.
- Browser Back must not discard an in-progress form without warning.

---

## 8. Core Components

### 8.1 Buttons

| Variant | Use |
|---|---|
| Primary | The single most important action in a region |
| Secondary | Common supporting action |
| Quiet | Low-emphasis action inside a card or row |
| Danger | Destructive action after clear intent |

Requirements:

- Minimum touch target: `44 × 44px`; field-work controls should be `48px` high.
- Use labels that describe the result.
- Show loading without changing button width.
- Disable only when necessary and explain why nearby.
- After async actions, show an inline result or toast with a meaningful next step.

### 8.2 Forms

- Labels remain visible above inputs; placeholders are examples, not labels.
- Required fields use “Required” text where ambiguity is possible.
- Help text appears before an error; errors appear directly below the field.
- Preserve values after validation or network errors.
- Use appropriate input modes (`numeric`, `decimal`, `tel`, `email`).
- Destructive and financial forms include a review/confirmation step.
- Long administrator forms are grouped into named sections, not one uninterrupted card.

### 8.3 Status chips

Use concise labels: **Paid**, **Unpaid**, **Overdue**, **Pending**, **Recorded**, **Failed**. Chips are not interactive unless they visibly include a filter affordance.

### 8.4 Cards

Every card has one purpose. Recommended anatomy:

1. Optional icon or status
2. Short label
3. Primary value or title
4. Comparison/context
5. One optional action

Avoid making an entire card clickable when it contains other controls.

### 8.5 Tables and record lists

Administrator tables include:

- Search and filters above the table
- Result count and active-filter summary
- Sticky header for long data sets
- Sort indicators with accessible labels
- Right-aligned numeric columns
- Visible row action labels or a clearly named overflow menu
- Pagination or progressive loading with current position

At widths below `768px`, convert rows into cards that preserve the same field priority. Do not hide critical values merely to fit a table.

### 8.6 Search and filters

- Search starts after explicit submit or a short debounce.
- Show the current query in the results summary.
- Filters open in a bottom sheet on mobile and an anchored panel on desktop.
- Provide **Clear all** only when filters are active.
- Empty results retain search and filters so users can recover.

### 8.7 Charts

- Use blue as the primary series and aqua as comparison; reserve semantic colors for status.
- Never encode multiple series by color alone—use labels, patterns, or distinct points.
- Start quantitative axes at zero unless a clearly labeled exception improves analysis.
- Use `m³` consistently and explain the comparison period.
- Provide a concise insight above or below the chart.
- Provide a table or accessible text summary for screen-reader and low-vision users.
- Avoid 3D charts, decorative gauges, and charts with more than five simultaneous series.

### 8.8 Dialogs, drawers, and sheets

- Use dialogs for focused decisions, drawers for supporting context, and pages for complex tasks.
- Mobile receipts may use a bottom sheet; long financial forms use a full-screen dialog.
- Keep the title and close action visible during scrolling.
- Trap focus, close with `Escape`, restore focus, and prevent background interaction.
- Destructive confirmations name the affected record and consequence.

### 8.9 Notifications and feedback

- Use the notification center for durable account and community messages.
- Use toasts only for short action feedback; they must not contain the only copy of important information.
- Maximum one toast stack with up to three visible items.
- Notification categories: **Bills**, **Payments**, **Announcements**, and **System**.
- Unread state uses a dot, weight, and label—not a tinted background alone.

---

## 9. Role-Specific Experiences

### 9.1 Resident home

The home view answers four questions in order:

1. **Do I need to pay?** Amount due, due date, and status
2. **How much water did I use?** Current use and change from last month
3. **Is anything unusual?** Plain-language alert or reassurance
4. **What is new?** Latest payment, bill, or barangay announcement

Use one prominent financial card followed by consumption and recent updates. Advanced graphs belong lower on the page.

### 9.2 Resident bills

- Group records by billing period.
- Show status, amount, due date, payment date, and receipt availability.
- Default to the newest bill.
- Keep paid bills visually calm; emphasize overdue bills without alarming language.
- Receipt actions are explicit: **View receipt** and **Download receipt**.
- Empty state: “No bills yet. Your first bill will appear here after a meter reading is recorded.”

### 9.3 Resident profile

- Separate identity, contact details, service address, and meter details.
- Clearly mark information as read-only.
- Explain how to request a correction through the barangay office.
- Avoid showing internal IDs unless needed for support.

### 9.4 Administrator dashboard

The dashboard is an exception-monitoring workspace, not a wall of charts.

Top row:

- Total active residents
- This month’s consumption
- Outstanding balance
- Readings completed

Attention queue:

- Overdue accounts
- Missing readings
- Unusual consumption
- Failed or pending records

Trends and purok comparisons follow the attention queue. Each item links to a pre-filtered destination.

### 9.5 Resident management

- Default search supports name, account number, meter number, and purok.
- Resident detail opens as a page on mobile and may use a side panel on desktop.
- Show account summary before editable information.
- Adding or editing a resident uses grouped sections and a final review.

### 9.6 Billing and payments

- Separate bill status from payment status where the backend distinguishes them.
- Display currency as Philippine pesos with consistent decimals: `₱1,250.00`.
- Before recording payment, show resident, bill period, balance, entered amount, and resulting balance.
- Success state includes reference number, timestamp, amount, and **View receipt**.
- Never allow duplicate action through repeated taps while a payment is processing.

### 9.7 Readings

- Administrator reading views are read-only and optimized for review.
- Meter-reader entry is a guided task optimized for speed and accuracy.
- Always show units beside values.
- Highlight the difference from the previous reading before submission.
- An anomaly warning requires acknowledgement but should not automatically block a legitimate reading.

### 9.8 Announcements and reports

- Announcement composition shows audience and publishing status near the title.
- Preview important announcements before publishing.
- Reports use a short sequence: **Choose report → Set period/filters → Preview → Generate**.
- Generated reports show format, filters, creator, date, and download status.

---

## 10. Content Design

### 10.1 Voice and tone

WaterWise is respectful, direct, and helpful. It sounds like a competent public-service assistant.

- Prefer: “Payment recorded. Receipt WW-2026-0184 is ready.”
- Avoid: “Transaction completed successfully!”
- Prefer: “We couldn’t load your bills. Check your connection and try again.”
- Avoid: “An unknown error occurred.”

### 10.2 Local clarity

- Use familiar terms such as **barangay**, **purok**, **meter reading**, and **due date** consistently.
- Write dates unambiguously: **30 July 2026**.
- Use `m³` and provide “cubic meters” on first use or in help text.
- Support English first with concise Filipino helper text where user testing shows it improves comprehension.
- Never mix languages inside one sentence unless the phrase is commonly understood and tested.

### 10.3 Confirmation language

Confirmation prompts state:

1. The action
2. The affected record
3. The consequence
4. The exact confirmation action

Example: “Record a ₱420.00 payment for Maria Santos? The remaining balance will be ₱0.00. This will create an official receipt.”

---

## 11. System States

Every data region must define all six states:

1. **Loading:** content-shaped skeleton with stable dimensions
2. **Success:** content plus last-updated context where freshness matters
3. **Empty:** explanation plus a relevant next step
4. **No results:** preserve query/filter controls and offer recovery
5. **Error:** plain-language cause when known, retry, and preserved input
6. **Offline/stale:** visible status and no false claim that data is current

### 11.1 Loading

- Use skeletons for initial page content.
- Use a small inline progress indicator for local actions.
- Prevent layout shift by matching the expected content shape.
- Disable shimmer under `prefers-reduced-motion`.

### 11.2 Empty states

Empty states are compact and useful. Use illustration only when it adds meaning. Do not celebrate the absence of records in serious contexts.

### 11.3 Error recovery

- Keep global navigation usable.
- Place the error beside the failed region.
- Preserve entered information.
- Offer one primary recovery action.
- Include a support/reference code only when it helps staff resolve the issue.

### 11.4 Connectivity

- Show a persistent offline banner when connection is lost.
- Label cached information with its last successful update time.
- Queue field submissions only if the system can safely prevent duplicates.
- If queueing is not implemented, state: “Not submitted. Reconnect and try again.”

---

## 12. Motion

Motion should feel like water settling: smooth, short, and purposeful.

| Interaction | Duration | Easing |
|---|---:|---|
| Hover/focus color | `120ms` | ease-out |
| Button or chip state | `160ms` | ease-out |
| Card/section reveal | `200ms` | ease-out |
| Drawer or modal | `240ms` | cubic-bezier(.2,.8,.2,1) |

- Use opacity and small transforms of no more than `8px`.
- Do not animate large background gradients continuously.
- Never delay user input for animation.
- Under `prefers-reduced-motion: reduce`, remove nonessential movement and use instant or opacity-only changes.

---

## 13. Accessibility and Inclusion

Target WCAG 2.2 Level AA.

- Text contrast: at least `4.5:1`; large text and essential UI graphics: at least `3:1`.
- Glass surfaces must pass contrast against their actual rendered background.
- Keyboard focus uses a visible `2px` water-blue ring with `2px` offset.
- Touch targets are at least `44 × 44px`.
- Navigation, headings, landmarks, tables, dialogs, and status messages use correct semantics.
- Errors are announced and linked to their fields.
- Focus moves to the error summary after an unsuccessful form submission.
- Do not use color, position, gesture, or hover as the only way to reveal meaning.
- Charts include accessible summaries.
- Session timeouts warn users and offer an extension before logout.
- Authentication and core tasks do not depend on drag, precise pointer movement, or time-limited interaction.
- Support browser zoom to `200%` without loss of content or function.
- Respect reduced motion, increased contrast, and reduced transparency preferences.

### 13.1 Readability for mixed digital confidence

- Keep resident task language near Grade 6–8 reading level where possible.
- Avoid abbreviations without an explanation.
- Pair important icons with text.
- Use examples in forms, especially for account numbers and meter readings.
- Keep instructions beside the relevant action rather than in a separate help page.

---

## 14. Privacy, Trust, and Safety

- Show only the minimum personal information needed for the current task.
- Mask sensitive details in lists and notification previews where appropriate.
- Do not include full account or payment details in toast messages.
- Auto-dismiss menus and overlays on logout.
- Receipts have a solid white print/download layout; glass effects are screen-only.
- High-impact record changes should show who performed them and when if audit data exists.
- Never use deceptive urgency, hidden fees, or preselected destructive choices.

---

## 15. Performance and PWA Behavior

- Core resident content should remain usable on mid-range mobile devices.
- Use glass blur only on fixed-size interface surfaces; avoid full-page nested blur.
- Lazy-load heavy charts and report modules below the fold.
- Avoid large decorative images when gradients and CSS shapes are sufficient.
- Keep the shell stable while content loads.
- The PWA install prompt appears only after the browser’s installability event and never blocks a bill or reading task.
- Do not cache billing, payment, or reading data as if it were current. Clearly label stale data.

Suggested experience budgets:

| Measure | Target |
|---|---:|
| Largest Contentful Paint | `< 2.5s` on a representative mobile connection |
| Cumulative Layout Shift | `< 0.1` |
| Interaction to Next Paint | `< 200ms` |
| Initial route feedback | `< 100ms` visual acknowledgement |

---

## 16. Component Architecture

Shared primitives should express this system consistently:

| Layer | Suggested components |
|---|---|
| Foundations | `GlassSurface`, `SolidSurface`, `Stack`, `Cluster`, `PageContainer` |
| Navigation | `AppHeader`, `RoleNavigation`, `BottomNavigation`, `Breadcrumbs`, `AccountMenu` |
| Actions | `Button`, `IconButton`, `Menu`, `ConfirmDialog` |
| Forms | `Field`, `Select`, `SearchField`, `DateRange`, `FormErrorSummary` |
| Data display | `MetricCard`, `StatusChip`, `DataTable`, `RecordCard`, `DescriptionList` |
| Feedback | `Skeleton`, `InlineAlert`, `Toast`, `EmptyState`, `OfflineBanner` |
| Overlays | `Dialog`, `Drawer`, `BottomSheet` |
| Domain | `BalanceCard`, `ConsumptionSummary`, `ReadingReview`, `Receipt`, `AnnouncementCard` |

Existing feature components should consume shared tokens and primitives rather than repeating long utility-class recipes.

---

## 17. Implementation Roadmap

### Phase 1 — Foundations

- Add color, type, spacing, radius, shadow, and motion tokens.
- Build solid and glass surface primitives with fallbacks.
- Standardize buttons, fields, status chips, focus states, and system feedback.
- Update the shell, header, sidebar, and mobile bottom navigation.

### Phase 2 — Resident experience

- Redesign Home/Usage Metrics around amount due and understandable consumption.
- Simplify Bills and receipt access.
- Reorganize Profile into clear read-only sections.
- Redesign the notification center by category and priority.

### Phase 3 — Field workflow

- Convert reading entry into the four-step guided flow.
- Add validation, review, anomaly acknowledgement, and connectivity states.
- Test outdoors and on representative mobile devices.

### Phase 4 — Administrator workspace

- Standardize page headers, filters, data tables, and record detail views.
- Reframe the dashboard around attention items and linked actions.
- Apply the same payment, announcement, analytics, and report patterns.

### Phase 5 — Validation and refinement

- Run accessibility checks and keyboard-only task testing.
- Test at `320px`, `390px`, `768px`, `1024px`, and `1440px`.
- Test reduced motion, reduced transparency, high contrast, zoom, slow connection, offline, empty, and error states.
- Validate terminology and workflows with barangay officials, meter readers, and residents.

---

## 18. Definition of Done

A redesigned screen is complete only when:

- It follows the role-specific hierarchy in this document.
- The primary task is obvious within five seconds.
- It works from `320px` phone width through large desktop.
- It defines loading, empty, no-results, error, and offline behavior.
- It has no horizontal page overflow.
- Keyboard order is logical and focus is always visible.
- Text and controls meet WCAG 2.2 AA contrast.
- Touch targets meet the `44 × 44px` minimum.
- Glass effects have a readable solid fallback.
- Financial values, dates, units, and statuses are formatted consistently.
- Destructive and financial actions include clear review/confirmation.
- Motion respects reduced-motion preferences.
- Existing role permissions and route guards still pass.
- Production build and focused lint checks pass.

---

## 19. Design Review Checklist

Before approving a UI change, ask:

- Can the intended user identify the most important status and action immediately?
- Is the language understandable without technical knowledge?
- Does the design still work without transparency, animation, or color?
- Are dense administrator tools efficient without becoming visually cramped?
- Can a meter reader complete the task one-handed on a phone?
- Can a resident understand the bill, due date, usage change, and payment state?
- Are error and offline states honest about what was saved?
- Is personal and financial information shown only where needed?
- Does the screen feel like WaterWise without adding decorative glass everywhere?
