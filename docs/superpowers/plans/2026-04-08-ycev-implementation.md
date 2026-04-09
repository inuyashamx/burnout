# YCEV Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full YCEV car club platform — onboarding, club management, events, calendar, notifications.

**Architecture:** React SPA with Supabase backend. Auth via Google OAuth. Bottom-tab mobile-first navigation. Supabase handles DB, auth, storage, and realtime. All state management via React context + Supabase client queries.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3, Vite, Supabase (Auth, Postgres, Storage), PWA

---

### Task 1: Update Color Theme (Gold → Cyan/Teal)

**Files:**
- Modify: `src/index.css` — replace all gold CSS vars with cyan
- Modify: `tailwind.config.cjs` — replace gold colors with cyan
- Modify: `src/pages/Landing.tsx` — update hardcoded gold refs
- Modify: `src/pages/Login.tsx` — update gold refs
- Modify: `src/pages/Register.tsx` — update gold refs
- Modify: `src/components/InstallPWA.tsx` — update gold refs
- Modify: `public/manifest.json` — update theme_color

- [ ] Replace CSS custom properties: `--gold` → `--cyan` (#00E5FF), `--gold-light` → `--cyan-light` (#40F8FF), `--gold-dark` → `--cyan-dark` (#0097A7)
- [ ] Update tailwind.config.cjs colors from gold to cyan
- [ ] Update all component references (btn-gold → btn-cyan, text-gold → text-cyan, etc.)
- [ ] Update Landing.tsx hardcoded rgba gold values to cyan equivalents
- [ ] Update Login.tsx and Register.tsx gold references
- [ ] Update manifest.json theme_color to #00E5FF
- [ ] Verify build passes, commit

### Task 2: Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_schema.sql`

- [ ] Create all tables via Supabase MCP: profiles, cars, clubs, club_members, events, event_rsvps, notifications
- [ ] Create RLS policies for each table
- [ ] Create storage bucket for avatars and car photos
- [ ] Verify with execute_sql

### Task 3: Auth Context & Protected Routing

**Files:**
- Create: `src/lib/auth.tsx` — AuthProvider context with session, profile, loading states
- Create: `src/lib/types.ts` — shared TypeScript types for all entities
- Modify: `src/lib/supabase.ts` — simplify back to direct client (env vars now exist)
- Modify: `src/App.tsx` — add AuthProvider, protected routes, onboarding redirect
- Modify: `src/main.tsx` — wrap with AuthProvider

- [ ] Define all TypeScript types (Profile, Car, Club, ClubMember, Event, EventRsvp, Notification)
- [ ] Build AuthProvider that tracks session + profile + loading
- [ ] Add onboarding detection: if authenticated but no profile → redirect to /onboarding
- [ ] Add protected route wrapper component
- [ ] Update App.tsx routing: public routes (/, /login, /register), protected routes (/onboarding, /app/*)
- [ ] Commit

### Task 4: Shared UI Components

**Files:**
- Create: `src/components/BottomTabs.tsx` — 4-tab navigation bar
- Create: `src/components/AppShell.tsx` — layout wrapper with bottom tabs
- Create: `src/components/LoadingScreen.tsx` — full-screen loading spinner

- [ ] Build BottomTabs with 4 tabs: Inicio, Calendario, Mi Club, Perfil
- [ ] Build AppShell that wraps page content with BottomTabs always visible
- [ ] Build LoadingScreen for auth/data loading states
- [ ] Commit

### Task 5: Onboarding Wizard

**Files:**
- Create: `src/pages/onboarding/Step1Profile.tsx` — nickname + birthday
- Create: `src/pages/onboarding/Step2Car.tsx` — car registration with photo upload
- Create: `src/pages/onboarding/Step3Path.tsx` — join/create/independent
- Create: `src/pages/onboarding/OnboardingLayout.tsx` — wizard shell with progress bar
- Create: `src/pages/onboarding/CreateClub.tsx` — mini club creation form
- Create: `src/pages/onboarding/JoinClub.tsx` — club search and join

- [ ] Build OnboardingLayout with progress bar (3 steps)
- [ ] Build Step1Profile: nickname (required), birthday (required), avatar from Google
- [ ] Build Step2Car: photos upload (up to 5, Supabase Storage), apodo, marca, modelo, año. Skip option.
- [ ] Build Step3Path: three cards (Unirme, Crear, Independiente)
- [ ] Build CreateClub mini-form: name, logo upload, description, WhatsApp link
- [ ] Build JoinClub: list of clubs with search, join button
- [ ] Wire routing: /onboarding/step-1 → /step-2 → /step-3 → destination
- [ ] Commit

### Task 6: Inicio (Feed) Page

**Files:**
- Create: `src/pages/app/Inicio.tsx` — main feed page
- Create: `src/lib/hooks.ts` — shared data fetching hooks

- [ ] Build hooks: useClub, useClubMembers, useNextEvent, useRsvps, useBirthdays
- [ ] Build Inicio page: club header + WhatsApp button, next event card with RSVP, birthday banner, activity feed
- [ ] RSVP button toggles going/not_going/maybe
- [ ] Commit

### Task 7: Calendar Page

**Files:**
- Create: `src/pages/app/Calendario.tsx` — monthly calendar
- Create: `src/components/CalendarGrid.tsx` — calendar grid component

- [ ] Build CalendarGrid: monthly view with navigation (prev/next month)
- [ ] Show dots on days with events
- [ ] Tap day → show events for that day below calendar
- [ ] Event cards show title, time, location, attendee count
- [ ] Commit

### Task 8: Mi Club Page

**Files:**
- Create: `src/pages/app/MiClub.tsx` — club management page
- Create: `src/pages/app/MemberList.tsx` — member list view
- Create: `src/pages/app/CreateEvent.tsx` — event creation form
- Create: `src/pages/app/ClubSettings.tsx` — club config (leader only)

- [ ] Build MiClub with role-based views (leader vs member vs no-club)
- [ ] Leader view: stats cards, member list, create event, settings, WhatsApp config
- [ ] Member view: member list, upcoming events, club info
- [ ] No-club view: prompt to join or create
- [ ] Build MemberList with role badges, remove option for leader
- [ ] Build CreateEvent form: title, description, date/time, location, type
- [ ] Build ClubSettings: edit name, description, logo, WhatsApp link, requires_approval toggle
- [ ] Commit

### Task 9: Profile Page

**Files:**
- Create: `src/pages/app/Perfil.tsx` — user profile
- Create: `src/pages/app/AddCar.tsx` — add/edit car form
- Create: `src/components/CarCard.tsx` — car display card

- [ ] Build Perfil: avatar, nickname, birthday, garage list, logout button
- [ ] Build CarCard: photo carousel, apodo, make/model/year
- [ ] Build AddCar form: same as onboarding step 2 but standalone
- [ ] Commit

### Task 10: Notifications

**Files:**
- Create: `src/lib/notifications.ts` — notification helpers + push registration
- Create: `src/components/NotificationBell.tsx` — bell icon with unread count
- Create: `src/pages/app/Notifications.tsx` — notification list page

- [ ] Build notification creation helpers (createNotification for different triggers)
- [ ] Build NotificationBell component with unread badge
- [ ] Build Notifications page: list with read/unread states, tap to navigate
- [ ] Add PWA push notification registration in service worker
- [ ] Add bell to AppShell header
- [ ] Commit

### Task 11: Final Integration & Polish

- [ ] Verify all routes work end-to-end: landing → register → Google auth → onboarding → app
- [ ] Verify club creation → event creation → RSVP flow
- [ ] Verify calendar shows events correctly
- [ ] Build passes with no TS errors
- [ ] Push to GitHub
