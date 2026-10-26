# IGNITEDDREAMS — Complete Platform Documentation & Technical Notes
**Project:** IGNITEDDREAMS Aviation Academy & Learning Management Platform  
**Version:** 1.0.0 Production-Ready Architecture  
**Target Infrastructure:** Cost-Optimized Single VPS (~₹1800/mo) + Cloudflare R2 + LiveKit Cloud  

---

## 1. Core Purpose & Business Workflow

IGNITEDDREAMS is not a simple marketing website. It is an end-to-end Aviation Academy Operations & Learning Management Platform designed to conduct live flight theory classes for enrolled cadets, capture composite 720p 30fps recordings, provide secure playback/downloads, and **strictly delete them automatically after 7 days**.

### The Complete Student Lifecycle
```
Cadet Registers & Enrolls in Aviation Ground Course (e.g. CPL Theory)
                              ↓
Cadet Logs In → Student Dashboard
                              ↓
Views "LIVE NOW" Classroom Banner or Upcoming Departure Countdown
                              ↓
Enters Live Virtual Classroom (/classroom/[classId])
                              ↓
Instructor Starts Class → Backend Starts LiveKit Egress Composite Recording
                              ↓
Instructor Ends Class → Room Terminates → MP4 Uploaded Directly to Cloudflare R2
                              ↓
Backend Webhook (/api/webhooks/livekit) Verifies Signature & Saves Metadata
                              ↓
Recording Status: READY • availableAt: Now • expiresAt: availableAt + 7 Days
                              ↓
Enrolled Cadets Receive In-App Alert (Notification Bell & Dashboard)
                              ↓
Cadet Replays via Custom Video Player (Short-Lived Signed R2 URL, 15m Expiry)
                              ↓
Cadet Downloads MP4 Attachment (Short-Lived Signed R2 Download URL, 5m Expiry)
                              ↓
Hour 120 (48h Remaining): In-App Warning Notification Sent
Hour 144 (24h Remaining): Final Expiration Alert Notification Sent
                              ↓
7 Days Expire (168 Hours):
  • Server-Side Playback & Download Blocked (Returns 410 Gone)
  • Hourly Background Cron Deletes R2 Object from Bucket
  • PostgreSQL Record Updated (status: DELETED, deletedAt: Timestamp)
  • Audit Log Logged
```

---

## 2. Cost-Optimized Single-VPS Architecture (~₹1800/mo)

| Component | Technology | Role & Cost Strategy |
|---|---|---|
| **Frontend** | Next.js 15 (App Router, TypeScript) | Hosted on VPS with SSR & static rendering. |
| **Backend** | Node.js + Express + TypeScript | Lightweight REST API running on same VPS. |
| **Database** | PostgreSQL 16 (Prisma ORM) | Runs in a persistent Docker container on the same VPS. No paid managed DB required. |
| **Reverse Proxy** | Nginx + Certbot SSL | Manages HTTPS termination and routes traffic to frontend and backend. |
| **Video Storage** | Cloudflare R2 Private Bucket | **CRITICAL:** Video files NEVER touch VPS disk storage or PostgreSQL. R2 has $0 egress fees. |
| **Live Classroom** | LiveKit Cloud (WebRTC) | Real-time audio, video, screen share, and data-channel chat without separate websocket servers. |
| **Recording Engine** | LiveKit Egress | Composites classroom into a single 720p 30fps MP4 file directly into R2. |

---

## 3. The 7-Day Recording Engine Details

### Centralized Retention Policy
- Defined in backend configuration and stored in database settings (`recordingRetentionDays: 7`).
- When a class recording completes and uploads to R2:
  $$\text{expiresAt} = \text{availableAt} + (7 \times 24 \times 60 \times 60 \times 1000)\text{ ms}$$

### Server-Side Expiry Enforcement
- Client device timestamps and local storage are **never trusted**.
- On playback request (`GET /api/recordings/:id/play`):
  1. Checks if cadet is enrolled in the course batch.
  2. Verifies `new Date() < recording.expiresAt`.
  3. If expired, responds with `HTTP 410 Gone` (`RecordingExpiredError`).
  4. If active, generates an AWS SDK S3 presigned `GetObjectCommand` URL valid for **900 seconds (15 minutes)**.
- On download request (`GET /api/recordings/:id/download`):
  1. Verifies authorization and active expiry.
  2. Generates presigned URL with `ResponseContentDisposition: attachment; filename="..."` valid for **300 seconds (5 minutes)**.
  3. Records download telemetry into `DownloadLog`.

### Hourly Background Cleanup Cron
- Schedulers in `backend/src/jobs/recordingCleanupCron.ts`:
  - `0 * * * *` (Runs every hour): Queries all recordings where `expiresAt <= now` and status is `READY` or `EXPIRING_SOON`.
  - Sends S3 `DeleteObjectCommand` to Cloudflare R2 bucket.
  - Updates PostgreSQL: `status = DELETED`, `deletedAt = now()`, `playbackEnabled = false`, `downloadEnabled = false`.
  - If R2 delete fails, logs error, increments retry count, and schedules retry without marking it false-positive.
  - Runs expiration warning scanner for recordings with $\le 48\text{h}$ and $\le 24\text{h}$ remaining.

---

## 4. Live Virtual Classroom (`/classroom/[classId]`)

- **Pre-Join Notice:** Cadets see an academic recording disclosure modal before entering.
- **WebRTC Connection:** LiveKit WebRTC client connects using short-lived tokens generated securely by backend.
- **Instructor Capabilities:**
  - Turn Camera & Mic On/Off.
  - Screen Sharing (Desktop, Window, Tab).
  - Floating Picture-in-Picture: Instructor camera switches to a floating mini tile while screen sharing is active.
  - Classroom Recording Trigger & Session Termination.
  - Attendee management.
- **Cadet Capabilities:**
  - Watch instructor stream and screen share in HD.
  - Toggle audio/video question participation.
  - Live in-room text chat with timestamped messages over WebRTC data channels.
  - Dedicated mobile layout with responsive drawer tabs.

---

## 5. Complete Application Modules & Routes

### Public Marketing Website
- `/` — Homepage: Hero with aviation motifs, 7-day recording advantage feature, course catalog preview, curriculum highlights, FAQ, and footer.
- `/courses` — Ground School Course Catalog (CPL, PPL, Meteorology, ATPL).
- `/courses/[slug]` — Course syllabus, flight hours, ground theory topics, instructor bios.
- `/about` — Academy flight safety standards, fleet profile, and modern teaching approach.
- `/contact` — Contact forms and official communication channels.
- `/login` — Portal Login with **1-Click Quick-Fill test buttons** for Student, Instructor, and Admin.
- `/register` — Cadet registration with automatic student profile generation.

### Student LMS Portal
- `/student/dashboard` — "Good Morning, [Name]" welcome, "LIVE NOW" class banner with 1-click entry, upcoming flight theory schedule, recent 7-day recordings with expiration chips, attendance rate meter.
- `/student/recordings` — Filterable recording library (Search, Course filter, Status: Ready, Expiring Soon, Expired).
- `/student/recordings/[id]` — Custom video player with seek bar, playback speed (0.75x–2x), volume, picture-in-picture, full screen, expiration alert banner, and direct MP4 download.
- `/student/courses` — Enrolled ground courses, progress, and batch schedules.
- `/student/attendance` — Class attendance history, joined/left timestamps, and duration.

### Instructor Portal
- `/instructor/dashboard` — Today's scheduled classes, live session launcher, upcoming schedule, assigned cadet count.
- `/instructor/classes` — Assigned class list, start live class, end class, view class recordings and attendance roster.

### Admin SaaS Platform
- `/admin` — Metrics overview: Active Cadets, Flight Instructors, Active Courses, Live Sessions, Storage health.
- `/admin/students` — Cadet directory, enrollment status, profile details, batch assignments.
- `/admin/instructors` — Instructor management, specialization assignments.
- `/admin/courses` — Course catalog manager (Draft, Published, Archived).
- `/admin/batches` — Ground school batch scheduling.
- `/admin/classes` — Class session scheduling, rescheduling, room mapping.
- `/admin/recordings` — Complete recording lifecycle dashboard:
  - Expiry status indicators.
  - **Manual Delete Action:** Safe deletion with confirmation modal (deletes from R2 and updates DB).
  - **Extend Expiry Action:** Add $N$ days to `expiresAt` with reason logging.
- `/admin/settings` — Academy operational timezone, default retention period (7 days), join window.
- `/admin/audit-logs` — Immutable audit trail of all administrative actions.

---

## 6. Accounts

There are no demo accounts. The seed script creates the admin (`SEED_ADMIN_EMAIL`) and lead instructor (`SEED_INSTRUCTOR_EMAIL`) and prints any generated passwords once. Students register themselves during checkout. See README → External Services for Razorpay, LiveKit, R2 and SMTP setup.

---

## 7. Design System & Aesthetics

- **70–80% White / Off-White:** `#FFFFFF`, `#F7F7F4`, `#F1F1EE`
- **15–20% Jet Black / Charcoal:** `#0B0B0B`, `#171717`, `#222222`
- **5–10% Aviation Gold Accent:** `#F5C400`, `#FFD21F`, `#D9A900`
- **Borders & Muted Elements:** `#E5E5E0`, `#707070`
- **Typography:** Plus Jakarta Sans (Headings), Inter (Body & Data UI)
- **Motifs:** Runway heading lines, compass marks, clean aviation badges. No cartoon graphics.

---

## 8. Development & Deployment Commands

### Running Locally

```powershell
# 1. Start Backend Server (Port 5000)
cd c:\clixdotFiles\websites\igniteddreams\backend
npm run dev

# 2. Start Frontend App (Port 3000)
cd c:\clixdotFiles\websites\igniteddreams\frontend
npm run dev
```

### Production Deployment via Docker Compose

```bash
# From workspace root
docker compose up -d --build
```
This launches:
- `igniteddreams-frontend`: Next.js production build on internal port 3000.
- `igniteddreams-backend`: Node.js Express production server on internal port 5000.
- `igniteddreams-postgres`: PostgreSQL database with volume persistence.
