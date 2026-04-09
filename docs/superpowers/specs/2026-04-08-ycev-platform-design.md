# Ya Casi Es Viernes — Platform Design Spec

## Overview

Mobile-first PWA for car clubs. Centralizes independent car clubs in a city so they can coordinate while keeping their autonomy. Club-First approach — the club is the center of everything.

**Phase**: Pilot with one club (Stang Kings Cancún), iterate, then open to other clubs.

**Tech stack**: React + TypeScript + Tailwind CSS 3 + Vite + Supabase (Auth, DB, Storage) + PWA

---

## Visual Identity

- **Theme**: Dark, automotive, midnight car meet aesthetic
- **Background**: `#0a0a0a` (deep black)
- **Accent primary**: `#00E5FF` (cyan/teal electric)
- **Accent light**: `#40F8FF`
- **Accent dark**: `#0097A7`
- **Background glows**: deep blue/teal radial gradients
- **Text**: white at 90%, 50%, 30% opacity levels
- **Typography**: Bebas Neue (display/headings) + DM Sans (body)
- **Landing page**: update existing gold palette to match cyan/teal

---

## User Roles

| Role | Who | Permissions |
|------|-----|-------------|
| **Líder** | Club creator | Full control: edit club, create events, approve/remove members, assign admins |
| **Admin** | Assigned by líder | Create events, manage members (cannot edit club config or remove líder) |
| **Miembro** | Joined the club | View feed, RSVP to events, view member list |
| **Independiente** | No club | View profile/garage, browse clubs, request to join |

---

## Auth Flow

1. User lands on landing page
2. Clicks "Registrarse" or "Iniciar Sesión"
3. Google OAuth via Supabase
4. If new user → Onboarding Wizard
5. If returning user → Dashboard (Inicio tab)

---

## Onboarding Wizard

3-step wizard, one screen per step, progress bar at top. Mobile-first.

### Step 1: Perfil
- **Nickname** (required) — "Así te van a conocer en la app"
- **Fecha de nacimiento** (required) — for birthday notifications
- **Photo** — pre-filled from Google, editable

### Step 2: Tu Carro
- **Photos** — up to 5 images (Supabase Storage)
- **Apodo** — e.g. "La Bestia"
- **Marca** — e.g. Ford
- **Modelo** — e.g. Mustang GT
- **Año** — e.g. 2016
- Skippable: "Agregar después" link
- Note: "Puedes agregar más carros después"

### Step 3: Tu Camino
Three options:
- **Unirme a un club** → Club search/list → Join → Club dashboard
- **Crear mi club** → Mini-wizard (name, logo, description, WhatsApp link) → Club dashboard as líder
- **Soy independiente** → Personal dashboard, can browse and join clubs later

---

## Club Model

| Field | Type | Notes |
|-------|------|-------|
| name | string | Required |
| logo | string (URL) | Supabase Storage |
| description | text | Optional |
| whatsapp_link | string | Optional, shown as prominent button to members |
| requires_approval | boolean | Default: `false` (anyone can join). Prepared for future gating |
| created_by | UUID | FK to user (líder) |

### Join flow
- `requires_approval = false`: User clicks "Unirme" → immediately becomes member
- `requires_approval = true` (future): User sends request → líder/admin approves → becomes member

---

## Navigation — Bottom Tabs (4 tabs)

All screens max 2 taps to any action. Large icons, short text. Bottom tabs always visible.

### Tab 1: Inicio (Feed)
- Club header with name, member count, WhatsApp button (always visible, green, prominent)
- Next event card: title, date/time, location, attendee avatars, "¡Voy!" button
- Birthday banner when a club member has a birthday today
- Recent activity feed (new members, new events)

### Tab 2: Calendario
- Monthly calendar view with dots on days with events
- Tap day → show events for that day
- Color-coded dots if user is in multiple clubs (future)

### Tab 3: Mi Club
- **Líder/Admin view**: stats (members, events this month), member list, create event, club settings, WhatsApp link config
- **Member view**: member list, upcoming events, club info
- **Independiente**: prompt to join or create a club

### Tab 4: Perfil
- Nickname, birthday display, photo
- "Mi Garage" — list of registered cars with photos
- "Agregar otro carro" button
- Settings/logout

---

## Events

| Field | Type | Notes |
|-------|------|-------|
| title | string | Required |
| description | text | Optional |
| date_time | timestamp | Required |
| location | string | Text (address or place name) |
| type | string | Free text — leader defines (rodada, meet, arrancones, reunión, etc.) |
| club_id | UUID | FK to club |
| created_by | UUID | FK to user |

### RSVP
Three states: **Voy** / **No voy** / **Tal vez**
- Show attendee count and avatars on event card
- Default: no response (not counted)

### Who can create events
- Líder and Admin roles only

---

## Notifications

Push notifications (PWA) + in-app notification center.

| Trigger | Who receives | Message |
|---------|-------------|---------|
| New event created | All club members | "[Club] nuevo evento: [Title] — [Date]" |
| Event reminder | Members who RSVP'd "Voy" | "Recordatorio: [Title] es mañana / en 1 hora" |
| Join request (future) | Líder + Admins | "[User] quiere unirse a [Club]" |
| Request approved (future) | Requesting user | "¡Bienvenido a [Club]!" |
| Member birthday | All club members | "¡Hoy es cumple de @[nickname]!" |
| New member joined | Líder + Admins | "@[nickname] se unió al club" |

Reminder schedule: 1 day before + 1 hour before event.

---

## Supabase Schema (Tables)

### profiles
- id (UUID, FK auth.users)
- nickname (text, unique, required)
- birthday (date, required)
- avatar_url (text)
- created_at (timestamp)

### cars
- id (UUID)
- user_id (UUID, FK profiles)
- nickname (text) — "La Bestia"
- make (text) — Ford
- model (text) — Mustang GT
- year (integer)
- photos (text[]) — array of Storage URLs
- created_at (timestamp)

### clubs
- id (UUID)
- name (text, required)
- description (text)
- logo_url (text)
- whatsapp_link (text)
- requires_approval (boolean, default false)
- created_by (UUID, FK profiles)
- created_at (timestamp)

### club_members
- id (UUID)
- club_id (UUID, FK clubs)
- user_id (UUID, FK profiles)
- role (text: 'leader' | 'admin' | 'member')
- joined_at (timestamp)

### events
- id (UUID)
- club_id (UUID, FK clubs)
- title (text, required)
- description (text)
- date_time (timestamp, required)
- location (text)
- event_type (text)
- created_by (UUID, FK profiles)
- created_at (timestamp)

### event_rsvps
- id (UUID)
- event_id (UUID, FK events)
- user_id (UUID, FK profiles)
- status (text: 'going' | 'not_going' | 'maybe')
- created_at (timestamp)

### notifications
- id (UUID)
- user_id (UUID, FK profiles)
- type (text)
- title (text)
- body (text)
- read (boolean, default false)
- data (jsonb) — extra payload (event_id, club_id, etc.)
- created_at (timestamp)

---

## UX Principles

- **For non-tech users**: icons large + text short everywhere
- **Max 2 taps** to reach any action
- **Zero nested menus** — everything flat
- **Primary actions** always a big visible button
- **WhatsApp button** always visible and prominent in club context
- **Bottom tabs** always visible (never hidden on scroll)
- **Mobile-first** — desktop is secondary
- **PWA** — installable, push notifications, offline landing page

---

## Out of Scope (Future)

- Event-First discovery (public calendar/map)
- `requires_approval` flow (DB ready, UI deferred)
- Multi-club membership UI (data model supports it)
- Monetization / premium tiers
- Ticket sales for events
- Chat within the app (WhatsApp link covers this)
- Inter-club massive events coordination
