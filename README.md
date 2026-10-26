# IGNITEDDREAMS — Full-Stack Aviation Academy & 7-Day Recording Platform

> A premier Aviation Academy learning management platform engineered with live virtual classrooms, automatic 720p composite recording capture, secure Cloudflare R2 object storage, short-lived signed URL playback & downloads, and a strictly enforced **7-Day Automatic Recording Lifecycle Engine**.

---

## ✈️ System Overview & Core Workflow

The platform conducts live online flight theory classes for enrolled cadets, automatically records those classes, makes recordings available to authorized students, allows students to watch and download the recording, and **automatically deletes the recording after 7 days**.

```
Cadet Registers & Enrolls in Ground Course (e.g. CPL Theory)
               ↓
Cadet Logs In → Student Dashboard
               ↓
View Upcoming Class Departure or "LIVE NOW" Classroom Banner
               ↓
Join Live Virtual Classroom (LiveKit Cloud WebRTC 1080p / 720p)
               ↓
Instructor Starts Class → Backend Starts LiveKit Egress Composite Recording
               ↓
Instructor Concludes Class → Room Terminates → Egress Uploads MP4 to Cloudflare R2
               ↓
Backend Webhook (`POST /api/webhooks/livekit`) Verifies & Saves Metadata
               ↓
Recording Status: READY • availableAt: Now • expiresAt: availableAt + 7 Days
               ↓
Eligible Batch Cadets Notified In-App & in Dashboard
               ↓
Cadet Replays via Custom Video Player (Short-Lived Signed R2 URL, 15m Expiry)
               ↓
Cadet Downloads MP4 (Short-Lived Signed R2 Attachment URL, 5m Expiry)
               ↓
7-Day Expiry Milestone Reached:
  • Playback Disabled Server-Side
  • Download Disabled Server-Side
  • Hourly Background Cron Deletes R2 MP4 Object
  • PostgreSQL Status: DELETED • deletedAt: Recorded • Audit Log Logged
```

---

## 🎨 Visual Identity & Design System

- **Color Distribution**:
  - **70–80% White / Off-white**: `#FFFFFF`, `#F7F7F4`, `#F1F1EE`
  - **15–20% Black / Charcoal**: `#0B0B0B`, `#171717`, `#222222`
  - **5–10% Yellow Accent**: `#F5C400` (Aviation Gold), `#FFD21F`, `#D9A900`
  - **Borders & Muted**: `#E5E5E0`, `#707070`
- **Typography**: Plus Jakarta Sans (Headings), Inter (Body & Data UI)
- **Motifs**: Runway navigation lines, altimeter / compass motifs, clear status badges.

---

## 💰 Cost-Optimized Architecture (~₹1800/month Base)

1. **Single Low-Cost VPS**:
   - Next.js 15 Frontend
   - Node.js Express Backend
   - PostgreSQL 16 (persistent container volume)
   - Nginx Reverse Proxy
2. **Cloudflare R2 for Recordings**:
   - Zero VPS disk bloat: MP4 files are uploaded directly from LiveKit Egress to a **private Cloudflare R2 bucket**.
   - Zero egress bandwidth fees on Cloudflare R2.
3. **LiveKit Cloud**:
   - Powers real-time WebRTC camera, microphone, screen sharing, and in-room data chat with zero separate websocket server cost.
4. **Provider Abstraction**:
   - Storage service and LiveKit client are abstracted behind clean interfaces (`IStorageService`, `LiveKitService`), allowing seamless transition to self-hosted LiveKit or MinIO later without rewriting application logic.

---

## 🗄️ Project Structure

```
igniteddreams/
├── frontend/                     # Next.js 15 App Router Frontend
│   ├── app/                      # Public, Student, Instructor, Admin, and Classroom routes
│   │   ├── (public)/             # Landing page, /courses, /about, /contact, /login, /register
│   │   ├── student/              # /student/dashboard, /recordings, /courses, /attendance
│   │   ├── instructor/           # /instructor/dashboard, /classes
│   │   ├── admin/                # /admin, /students, /instructors, /courses, /batches, /recordings, /settings
│   │   └── classroom/[classId]/  # Real-time WebRTC Virtual Classroom
│   ├── components/               # UI design system components (Button, Card, Badge, Modal, Navbar, Footer)
│   ├── lib/                      # Universal API client, Auth Context
│   ├── tailwind.config.ts        # Aviation Academy design tokens
│   ├── Dockerfile
│   └── package.json
│
├── backend/                      # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/               # Centralized policies (7-day retention, join windows)
│   │   ├── controllers/          # Auth, Student, Instructor, Admin, Recording, Livekit, Webhook
│   │   ├── middleware/           # Auth (HTTP-only cookies), RBAC guards, Rate Limiting, Request Logger
│   │   ├── services/             # RecordingService (7-Day engine), CleanupService (Cron), LiveKit, Storage
│   │   ├── validators/           # Zod schemas for all mutations
│   │   ├── jobs/                 # Hourly node-cron recording cleanup & expiration alerts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma         # PostgreSQL schema (Models, Indexes, Foreign Keys)
│   │   └── seed.ts               # Realistic aviation academy seed script
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml            # Complete VPS stack (Postgres + Backend + Frontend + Nginx)
├── nginx.conf                    # Nginx reverse proxy configuration
├── .env.example                  # Documented environment variables
└── README.md
```

---

## 🚀 Quick Start & Local Development

### 1. Backend (SQLite for local dev)

```bash
cd backend
npm install
cp .env.example .env          # fill SEED_ADMIN_EMAIL, SEED_INSTRUCTOR_EMAIL (+ service keys below)
npm run prisma:generate:sqlite
npm run db:push:sqlite        # creates/updates prisma/dev.db
npm run prisma:seed           # admin + lead instructor + course catalogue + first batches
npm run dev                   # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
echo NEXT_PUBLIC_API_URL=http://localhost:5000 > .env.local
npm run dev                   # http://localhost:3000
```

The seed prints generated passwords for any staff account whose password you did not set. There are **no demo logins** — students create their account during checkout.

---

## 🔌 External Services (what each key unlocks)

| Service | Env vars | Without it |
| :--- | :--- | :--- |
| **Razorpay** (payments) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Checkout shows "online payment unavailable" |
| **LiveKit Cloud** (live video + recording) | `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | Classroom shows "not configured" |
| **Cloudflare R2** (recordings + library files) | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Classes run but are not recorded; library uploads disabled |
| **SMTP email** | `SMTP_*`, `MAIL_FROM`, `ADMIN_NOTIFY_EMAIL` | No receipt emails / password reset by email |

### Razorpay setup
1. Dashboard → **Test Mode** → Account & Settings → API Keys → generate `rzp_test_…` keys.
2. Dashboard → Webhooks → add `https://<your-domain>/api/webhooks/razorpay`, events **payment.captured**, **payment.failed**, **order.paid**, and a secret (= `RAZORPAY_WEBHOOK_SECRET`).
3. Test payment: UPI `success@razorpay` or card `4111 1111 1111 1111`, any future expiry, any CVV.
4. Go live: complete KYC, swap to `rzp_live_…` keys and add the webhook again in Live Mode.

Flow: checkout creates the student account → `POST /api/payments/order` (seat check) → Razorpay popup → `POST /api/payments/verify` (HMAC signature + amount check, auto-capture) → enrollment + notification + receipt email. The webhook fulfils the same order idempotently if the browser closes mid-payment.

### LiveKit setup
Create a project at cloud.livekit.io → Settings → Keys. Add webhook `https://<your-domain>/api/webhooks/livekit` (attendance + "recording ready"). Egress (recording) uploads the MP4 straight to your R2 bucket.

### Cloudflare R2 setup
Create a **private** bucket, then R2 → Manage API tokens → *Object Read & Write* for that bucket. Optional lifecycle rule: move `recordings/` to Infrequent Access after 30 days to cut archive cost.

---

## 🔑 Accounts

| Role | How it is created |
| :--- | :--- |
| Admin | Seed script (`SEED_ADMIN_EMAIL`) |
| Lead instructor | Seed script (`SEED_INSTRUCTOR_EMAIL`); more via Admin → Faculty |
| Student | Self sign-up at checkout or /register; offline payments via Admin → Batches → Enroll |

---

## 🔒 Security & Recording Lifecycle

- **Server-side expiry**: students are blocked once `now >= expiresAt` (`410 Gone`), whatever the browser clock says.
- **Short-lived signed R2 URLs**: playback 15 min, download 5 min (`attachment`).
- **Lifecycle** (hourly cron): READY (7 days, students) → ARCHIVED (student access closed, file kept for `ARCHIVE_RETENTION_DAYS`, default 730 = 2 years; admins can still watch/download) → DELETED (file removed from R2, audit-logged, retried on failure).
- Webhooks (Razorpay, LiveKit) reject unsigned requests.

---

## 🚢 Production Deployment (Single VPS)

```bash
git clone <repo-url> /opt/igniteddreams && cd /opt/igniteddreams/igniteddreams
cp .env.example .env && nano .env      # every value is required except optional SMTP
docker compose up -d --build           # backend runs "prisma db push" on start
docker compose exec backend npm run prisma:seed
```

Put HTTPS in front (Cloudflare proxy with SSL "Full", or Certbot on the host) — the session cookie is `Secure` in production.
