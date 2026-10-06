# TourFlow AI — Developer 2 Traveler Frontend PRD

## Document Owner
**Developer 2 — Traveler Frontend Lead**

## Parent Product
TourFlow AI — PS ID-7

## Scope
Traveler/customer-facing web application only.

---

# 1. Purpose

Build a polished traveler-facing web application that allows a user to create, personalize, plan, customize, book and dynamically adapt a tour.

The frontend must consume the backend contracts provided by Developer 1 and must not implement backend/domain logic itself.

---

# 2. Target User

A traveler who does not want to use a fixed tour package and instead wants to define:

- destination
- dates
- duration
- budget
- accommodation preference
- transportation preference
- interests
- activities
- travel style
- pace

The traveler should receive a personalized trip that can be modified when real-world circumstances change.

---

# 3. Traveler Problem

Traditional tour packages are rigid. Travelers need a simple way to customize their trip while still seeing the effects on:

- time
- budget
- bookings
- activities
- dependencies
- disruptions

The frontend must make these effects understandable without requiring the traveler to understand the underlying technical system.

---

# 4. Traveler Product Goal

Make the traveler experience feel like:

> **“Tell us what kind of trip you want, customize it, and we will help you adapt it when reality changes.”**

---

# 5. MVP Goal

The traveler frontend is successful when this entire flow works:

```text
Sign Up / Sign In
      ↓
Traveler Dashboard
      ↓
Create Trip
      ↓
Enter Preferences
      ↓
Generate Recommendations
      ↓
Generate Itinerary
      ↓
Customize Itinerary
      ↓
See Cost Update
      ↓
Mock Booking
      ↓
Disruption Alert
      ↓
Impact View
      ↓
Recovery Options
      ↓
Approve Recovery
      ↓
Updated Trip
```

---

# 6. Required Pages

## Authentication

```text
/auth/login
/auth/signup
/auth/forgot-password
/auth/confirm
```

## Traveler

```text
/traveler
/traveler/create-trip
/traveler/trips/[tripId]
/traveler/trips/[tripId]/itinerary
/traveler/trips/[tripId]/bookings
/traveler/trips/[tripId]/assistant
```

---

# 7. Feature Requirements

## FR-T01 — Authentication

The traveler must be able to:

- sign up
- sign in
- sign out
- recover password
- maintain a valid authenticated session

Authentication provider:

**Supabase Auth**

The frontend must use the project's approved SSR authentication approach.

---

## FR-T02 — Traveler Dashboard

Display:

- traveler name
- current/upcoming trips
- trip destination
- trip dates
- trip status
- estimated budget
- next itinerary item
- booking status
- alerts

The dashboard should prioritize the active trip.

---

## FR-T03 — Create Trip

Input fields:

- destination
- start date
- end date
- number of travelers
- budget
- accommodation preference
- transportation preference
- interests
- activities/interests
- travel style
- pace
- notes

Validation:

- destination required
- valid date range
- positive traveler count
- non-negative budget
- required preferences where API demands them

---

## FR-T04 — Recommendations

Show recommended destinations/activities/experiences returned by the backend.

Each recommendation can show:

- name
- category
- image if available
- description
- estimated cost
- location
- preference-match explanation
- add/select action

Do not create fake availability claims.

---

## FR-T05 — AI Itinerary

Show the generated itinerary in a visually clear timeline.

Example:

```text
DAY 1
09:00 — Arrival
10:00 — Airport Transfer
11:00 — Hotel Check-in
13:00 — Lunch
15:00 — Eiffel Tower
19:00 — Dinner
```

Each itinerary item should expose enough information for the traveler to understand what is planned.

---

## FR-T06 — Customize Itinerary

Traveler actions:

- add item
- remove item
- replace item
- change time where allowed
- choose an alternative

After any change, display backend-validated results such as:

- new cost
- cost difference
- timing impact
- warnings
- affected items

Never locally override a backend constraint result.

---

## FR-T07 — Budget

Display:

- total estimated cost
- confirmed cost
- remaining budget
- category breakdown
- change delta

Use backend-provided authoritative money values.

---

## FR-T08 — Booking

Support hackathon mock booking.

Display clear statuses:

```text
Planned
Pending
Confirmed
Cancelled
Rescheduled
Disrupted
Completed
```

A mock booking must be clearly identified internally as demo/simulated behavior.

---

## FR-T09 — Dynamic Disruption

When a disruption affects the trip, show:

- disruption summary
- affected itinerary items
- severity/status
- explanation
- action required

Example:

```text
Your flight is delayed by 3 hours.

At Risk
Airport Transfer
Hotel Check-in
Dinner

Unaffected
Day 2 Museum
Day 3 Excursion
```

The backend is the source of truth for impact classification.

---

## FR-T10 — Recovery Options

Show the alternatives produced by the backend.

Each option should contain:

- title
- explanation
- additional/refunded cost
- affected items
- experience impact
- approval action

Example:

```text
Best Experience
+₹2,000
Very Low impact
[Choose this plan]
```

---

## FR-T11 — Recovery Approval

The traveler may approve a recovery option when the backend says the traveler has permission to do so.

Before approval, clearly show:

- what will change
- cost impact
- affected bookings/activities
- whether the change is permanent or reversible where applicable

After approval:

- show success state
- refresh trip data
- update timeline
- update cost summary
- update notifications

---

## FR-T12 — AI Assistant

The traveler can ask natural-language questions about the trip.

Examples:

```text
Why is my dinner at risk?
Can you make Day 3 more relaxed?
What activities are cheapest?
How much budget do I have left?
```

The frontend only provides the UI and sends the request to the backend assistant endpoint.

---

# 8. UX Requirements

## Navigation

Traveler navigation should make these areas easy to find:

- Dashboard
- My Trips
- Current Trip
- Bookings
- Assistant
- Notifications
- Profile

## Timeline

The itinerary timeline is the most important screen.

It must be readable on:

- desktop
- tablet
- mobile

## Status design

Do not rely only on colors.

For example:

```text
✓ Confirmed
⚠ At Risk
! Action Required
× Cancelled
```

Use text labels as the actual accessible meaning.

---

# 9. Loading / Empty / Error States

Every data-driven screen must support:

### Loading
Skeleton/spinner appropriate to the context.

### Empty
Explain what the user can do next.

### Error
Explain the issue and provide retry when possible.

Example:

```text
We couldn't load your itinerary.
Please try again.
[Retry]
```

---

# 10. Responsive Requirements

The traveler UI is mobile-first.

Critical mobile screens:

- login
- dashboard
- create trip
- itinerary
- recovery options
- booking

Do not build a desktop-only layout and retrofit it later.

---

# 11. Accessibility Requirements

- semantic HTML
- keyboard navigation
- visible focus states
- descriptive labels
- accessible form errors
- non-color status indicators
- reasonable contrast
- buttons with meaningful labels

---

# 12. Data and Security Requirements

The frontend must:

- use Supabase Auth
- protect authenticated routes
- never contain privileged keys
- never trust a URL trip ID as proof of access
- use backend authorization
- not expose private data belonging to other travelers
- avoid unsafe HTML rendering
- avoid secrets in client-side storage

Do not implement security by hiding buttons only.

---

# 13. API Integration Requirements

Use a dedicated traveler service layer.

Recommended files:

```text
frontend/services/traveler/
├── trips.ts
├── itinerary.ts
├── recommendations.ts
├── pricing.ts
├── bookings.ts
├── disruptions.ts
└── assistant.ts
```

UI components should call typed service functions rather than directly writing raw network requests throughout the component tree.

API source of truth:

```text
api/openapi.yaml
```

If the backend contract is missing an endpoint:

- do not invent and permanently code against an arbitrary endpoint;
- ask/notify Developer 1;
- optionally use an isolated mock adapter until the contract exists.

---

# 14. Components Required

At minimum:

```text
TravelerSidebar / MobileNav
TravelerHeader
TripCard
TripStatusBadge
TripBuilder
PreferenceSelector
RecommendationCard
ItineraryTimeline
ItineraryItem
ItineraryDay
BudgetSummary
CostBreakdown
AlternativeCard
BookingCard
DisruptionAlert
ImpactSummary
RecoveryOptionCard
AssistantPanel
NotificationList
LoadingState
EmptyState
ErrorState
```

Names may change to match the project's existing component conventions.

---

# 15. No-Conflict Development Rules

## Developer 2 CAN modify

```text
frontend/app/(auth)/
frontend/app/traveler/
frontend/components/traveler/
frontend/features/trip-builder/
frontend/features/itinerary/
frontend/features/budget/
frontend/features/booking/
frontend/features/assistant/
frontend/hooks/traveler/
frontend/services/traveler/
frontend/types/traveler/
```

## Developer 2 MUST NOT modify

```text
backend/
supabase/
contracts/
api/openapi.yaml
frontend/app/operator/
frontend/components/operator/
frontend/features/operations/
frontend/features/disruption/
frontend/features/recovery/
frontend/features/audit/
```

Shared configuration should be changed only when required and with minimal edits.

---

# 16. Git Requirements

Developer 2 is responsible for maintaining the Git history of their work.

## Required branch

```bash
dev/traveler
```

## Start of work

```bash
git status
git pull --rebase origin dev/traveler
```

## Before commit

```bash
git status
git diff --check
npm run lint
npm run typecheck
```

Run tests/build when those scripts exist.

## Commit style

```text
feat(traveler): add trip creation wizard
feat(traveler): add itinerary timeline
fix(traveler): handle expired session
fix(traveler): show recovery approval state
test(traveler): validate trip form
docs(traveler): document traveler API integration
```

## Push

```bash
git push origin dev/traveler
```

## Pull request

Create:

```text
dev/traveler → main
```

PR description must include:

- summary
- changed features
- tests run
- screenshots for visual changes
- backend dependencies
- notes for Developer 3 if integration is required

## NEVER

- force-push shared branches without agreement
- reset another developer's changes
- use `git reset --hard` casually
- use `git clean -fd` casually
- commit `.env`
- commit API secrets
- rewrite another developer's files
- include unrelated refactors in a feature commit

---

# 17. Definition of Done

A traveler feature is complete when:

- the UI works
- responsive behavior works
- API integration exists or the mock adapter is isolated
- validation exists
- loading state exists
- error state exists
- authorization assumptions are respected
- no secrets are exposed
- TypeScript passes
- lint passes
- relevant tests pass
- Git diff contains only intended files
- commit is focused and understandable

---

# 18. Priority

### P0 — Must Have

- Supabase authentication UI
- Traveler dashboard
- Create trip
- Preferences
- AI itinerary presentation
- Itinerary customization
- Budget
- Mock booking
- Disruption notification
- Impact display
- Recovery options
- Recovery approval

### P1 — Important

- AI assistant
- advanced alternative comparison
- richer notifications
- visual polish

### P2 — Nice to Have

- advanced animations
- extensive profile customization
- nonessential analytics

### P3 — Future

- native mobile app
- offline mode
- advanced loyalty features

---

# 19. Traveler Frontend Acceptance Test

A tester should be able to:

1. Sign up.
2. Sign in.
3. Create a personalized trip.
4. Submit destination, budget and preferences.
5. Receive the generated itinerary.
6. Replace an activity.
7. See the resulting cost/timing information.
8. Create a mock booking.
9. Receive a simulated disruption.
10. View affected items.
11. Compare recovery plans.
12. Approve one plan.
13. See the updated itinerary.
14. Refresh the browser and retain the correct server state.
15. Sign out.

---

# 20. Final Rule

**Developer 2 is responsible for the Traveler Frontend only.**

Backend, database, RLS, API implementation, Constraint Engine and Recovery Engine belong to Developer 1.

Operator frontend, operator recovery screens, integration ownership and deployment belong to Developer 3.

Use the API contract. Keep your files isolated. Maintain Git properly. Never overwrite another developer's work.
