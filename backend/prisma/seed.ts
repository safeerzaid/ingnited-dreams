import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

/**
 * Production-safe seed: platform settings, the admin + lead instructor accounts,
 * the academy's course catalogue and the first open batch of each course.
 * No sample students, payments or recordings are created. Safe to re-run (upserts;
 * existing passwords and admin edits to courses are never overwritten).
 *
 *   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
 *   SEED_INSTRUCTOR_EMAIL / SEED_INSTRUCTOR_PASSWORD
 * Passwords that are not provided are generated and printed once.
 */

const prisma = new PrismaClient();

const LEAD_FACULTY = "Justin Burnard Dias";

interface SeedCourse {
  slug: string;
  code: string;
  title: string;
  category: string;
  level: string;
  description: string;
  thumbnail: string;
  marketPrice: number;
  facultyTitle: string;
  facultyBio: string;
  syllabus: { name: string; hours: string; topics: string }[];
  batches: { code: string; name: string; scheduleLabel: string }[];
}

const COURSES: SeedCourse[] = [
  {
    slug: "transportation-logistics-sap",
    code: "ID-TLM-SAP-101",
    title: "Transportation & Logistics Management Course with SAP (ERP)",
    category: "Transportation & Logistics",
    level: "Flagship (6 Months)",
    description:
      "Comprehensive 6-month industry skill training covering multimodal freight, container logistics, port terminal flow, customs clearance, and practical SAP S/4HANA Logistics Execution (VL01N, PGI, transfer orders). Includes English soft skills and viva preparation at running cost.",
    thumbnail: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=85",
    marketPrice: 125000,
    facultyTitle: "Project Coordinator & Lead Faculty",
    facultyBio: "16 Years Logistics & Aviation Experience • Corporate Strategy Lead",
    syllabus: [
      {
        name: "Multimodal Logistics Network, IncoTerms & Freight Forwarding",
        hours: "40 Hours",
        topics: "Multimodal transport acts, Container Freight Stations (CFS), Inland Container Depots (ICD), IncoTerms 2020, and Bill of Lading (B/L) verification.",
      },
      {
        name: "SAP S/4HANA Logistics Execution & Material Management (MM/SD)",
        hours: "60 Hours",
        topics: "Hands-on SAP ERP portal practice: Outbound delivery (VL01N), Transfer Orders, Goods Receipt (MIGO), Goods Issue (MB1A), and inventory reconciliation.",
      },
      {
        name: "Customs Clearing, ICEGATE Portal & EXIM Documentation",
        hours: "35 Hours",
        topics: "Customs Act 1962, ICEGATE portal filing, Shipping Bills, Bills of Entry, bonded warehouses, and Duty Drawback compliance.",
      },
      {
        name: "Professional Business English & Viva Interview Board",
        hours: "25 Hours",
        topics: "Corporate communication modules, mock viva interview panels, client freight negotiation, and speech presentations.",
      },
    ],
    batches: [
      { code: "TLM-ALPHA", name: "Cohort Alpha (Morning)", scheduleLabel: "09:00 - 12:00 IST (Mon-Fri)" },
      { code: "TLM-BRAVO", name: "Cohort Bravo (Evening)", scheduleLabel: "18:00 - 21:00 IST (Mon-Fri)" },
    ],
  },
  {
    slug: "aviation-management-airport-operations",
    code: "ID-AVM-201",
    title: "Aviation Management & Airport Ground Operations",
    category: "Aviation Management",
    level: "Operational (6 Months)",
    description:
      "Career-focused operational training covering airport ground handling, ramp safety, baggage sorting systems, air cargo operations, airline customer service, and ticketing management.",
    thumbnail: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85",
    marketPrice: 130000,
    facultyTitle: "Logistics & Aviation Specialist",
    facultyBio: "Travel, Tourism & Aviation Operations Expert",
    syllabus: [
      {
        name: "Airport Terminal Operations & Passenger Customer Service",
        hours: "40 Hours",
        topics: "Check-in counter management, boarding gate protocols, baggage reconciliation (BRS), and airline reservation systems.",
      },
      {
        name: "Ramp Handling, Marshalling & Apron Safety Envelopes",
        hours: "40 Hours",
        topics: "Ground Support Equipment (GSE), aircraft turnaround coordination, pushback procedures, and FOD prevention.",
      },
      {
        name: "Air Cargo Handling, Unit Load Devices (ULD) & Documentation",
        hours: "45 Hours",
        topics: "Airway Bills (AWB), cargo manifest preparation, dangerous goods acceptance, and customs air cargo clearance.",
      },
      {
        name: "Airline Soft Skills & Professional Viva Board",
        hours: "25 Hours",
        topics: "Aviation phonetic alphabet, crisis communication, passenger dispute handling, and corporate viva board preparation.",
      },
    ],
    batches: [{ code: "AVM-B1", name: "Airport Ground Batch 1", scheduleLabel: "10:00 - 13:00 IST (Mon-Fri)" }],
  },
  {
    slug: "supply-chain-freight-forwarding",
    code: "ID-SCM-301",
    title: "Global Supply Chain & Freight Forwarding with ERP",
    category: "Transportation & Logistics",
    level: "Comprehensive",
    description:
      "End-to-end global supply chain management training integrating shipping line coordination, port terminal operations, EXIM regulations, customs ICEGATE compliance, Letters of Credit and warehouse management systems (WMS).",
    thumbnail: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=85",
    marketPrice: 120000,
    facultyTitle: "Lead Faculty & Specialized Trainers",
    facultyBio: "3PL & Freight Operations Specialist",
    syllabus: [
      {
        name: "International Trade Operations & Shipping Lines",
        hours: "40 Hours",
        topics: "Ocean freight chartering, container leasing, demurrage & detention rules, and transshipment hubs.",
      },
      {
        name: "Warehouse Management Systems (WMS) & Inventory Math",
        hours: "45 Hours",
        topics: "ABC analysis, economic order quantity (EOQ), cross-docking, and RFID pallet scanning.",
      },
      {
        name: "Supply Chain Financials & Trade Finance",
        hours: "35 Hours",
        topics: "Letter of Credit (LC), bank guarantees, export credit insurance (ECGC), and freight invoicing.",
      },
      {
        name: "Corporate English & Weekly Project Presentations",
        hours: "20 Hours",
        topics: "Freight contract negotiation, vendor communications, and weekend project report evaluations.",
      },
    ],
    batches: [{ code: "SCM-A", name: "Supply Chain Cohort A", scheduleLabel: "14:00 - 17:00 IST (Mon-Fri)" }],
  },
  {
    slug: "air-cargo-logistics-dgr",
    code: "ID-CARGO-401",
    title: "Air Cargo Operations, ULD Handling & Dangerous Goods (DGR)",
    category: "Aviation Management",
    level: "Specialized",
    description:
      "Specialized training for air cargo freight forwarders, pharma cold-chain handlers, and airport cargo terminal supervisors: airway bill (AWB) generation, ULD palletization and IATA Dangerous Goods Regulations compliance.",
    thumbnail: "https://images.unsplash.com/photo-1519074069444-1ba4ea16e879?auto=format&fit=crop&w=1200&q=85",
    marketPrice: 125000,
    facultyTitle: "Aviation Ground & Cargo Lead",
    facultyBio: "16 Years Industry Experience",
    syllabus: [
      {
        name: "Air Cargo Logistics Flow & AWB Rating",
        hours: "40 Hours",
        topics: "Chargeable weight calculations, volume weight ratios, Master & House Air Waybills.",
      },
      {
        name: "IATA Dangerous Goods Regulations (DGR) Handling",
        hours: "45 Hours",
        topics: "9 classes of dangerous goods, packaging codes, hazard labels, and shipper's declaration verification.",
      },
      {
        name: "Temperature-Controlled Pharma & Perishables Cargo",
        hours: "35 Hours",
        topics: "Cold-chain air freight, active/passive cooling containers, and pharma time-sensitive handling.",
      },
      {
        name: "Viva Examination Preparation & Interactive Viva Board",
        hours: "20 Hours",
        topics: "IATA compliance scenarios, emergency response procedures, and viva interviews.",
      },
    ],
    batches: [{ code: "CARGO-B1", name: "Air Cargo Batch 1", scheduleLabel: "18:00 - 21:00 IST (Mon-Fri)" }],
  },
  {
    slug: "fmcg-production-supply-chain",
    code: "ID-FMCG-501",
    title: "FMCG Micro-Manufacturing & Supply Chain Distribution",
    category: "Integrated Projects",
    level: "Entrepreneurship",
    description:
      "Master the creation and operation of self-dependent micro-manufacturing units (toffees, chocolates, confectionery and FMCG foods), FSSAI/GST clearance, and direct co-operative distribution and supply chain logistics.",
    thumbnail: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=85",
    marketPrice: 115000,
    facultyTitle: "Project Coordinator • ID Integrated",
    facultyBio: "16 Years Logistics & 4 Years Business Strategy Design",
    syllabus: [
      {
        name: "Confectionery & FMCG Production Technology",
        hours: "45 Hours",
        topics: "Machinery sourcing, batch recipe standardization, food safety, and hygienic packaging.",
      },
      {
        name: "FSSAI, GST & Regulatory Setup for Micro-Units",
        hours: "30 Hours",
        topics: "Food licensing, legal weights & measures, Udyam MSME registration, and compliance filings.",
      },
      {
        name: "Co-operative Logistics, Collection & Retail Linkage",
        hours: "40 Hours",
        topics: "Transport scheduling, 10%–20% operational sustainability model, and supermarket distribution channels.",
      },
      {
        name: "Entrepreneurship Viva & Weekly Project Submissions",
        hours: "25 Hours",
        topics: "Unit cost calculation, break-even analysis, and weekly business progress presentations.",
      },
    ],
    batches: [{ code: "FMCG-B1", name: "FMCG Entrepreneur Cohort", scheduleLabel: "09:00 - 12:00 IST (Mon-Fri)" }],
  },
  {
    slug: "business-operations-management",
    code: "ID-BOM-601",
    title: "Executive Business Operations & Corporate Administration",
    category: "Business & Management",
    level: "Corporate Ready",
    description:
      "Comprehensive training for corporate administration readiness covering enterprise ERP workflows, procurement administration, business communication, and multinational client service protocols.",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
    marketPrice: 120000,
    facultyTitle: "Corporate Strategy Team",
    facultyBio: "Executive Strategy & Corporate Operations",
    syllabus: [
      {
        name: "Enterprise Business Operations & ERP Systems",
        hours: "40 Hours",
        topics: "Purchase orders (PO), vendor management, invoicing reconciliations, and digital workflow systems.",
      },
      {
        name: "Corporate Communication & Executive Administration",
        hours: "40 Hours",
        topics: "Business writing, board minutes, multinational client handling, and conflict resolution.",
      },
      {
        name: "Supply Chain Financial Accounting & Budgeting",
        hours: "35 Hours",
        topics: "Cost center analysis, operational budgets, GST input reconciliations, and expense management.",
      },
      {
        name: "Interactive English Viva & Presentation Board",
        hours: "25 Hours",
        topics: "Weekly speech and project submissions, executive body language, and formal viva exams.",
      },
    ],
    batches: [{ code: "BOM-B1", name: "Corporate Admin Cohort", scheduleLabel: "18:00 - 21:00 IST (Mon-Fri)" }],
  },
];

const COURSE_FEE_INR = 25000;
const BATCH_CAPACITY = 50;

function generatePassword() {
  // Meets the app's password policy: upper, lower, digit, 8+ chars
  return `Id${crypto.randomBytes(6).toString("hex")}9A`;
}

/** First Monday at least two weeks from now, 09:00 IST */
function nextBatchStart() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 14);
  while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(3, 30, 0, 0);
  return d;
}

async function upsertStaff(params: {
  email: string;
  password?: string;
  name: string;
  role: "ADMIN" | "INSTRUCTOR";
  employeeId?: string;
  specialization?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) {
    console.log(`• ${params.role.toLowerCase()} account already exists: ${params.email} (password unchanged)`);
    return existing;
  }

  const password = params.password || generatePassword();
  const user = await prisma.user.create({
    data: {
      email: params.email,
      name: params.name,
      role: params.role,
      status: "ACTIVE",
      passwordHash: await bcrypt.hash(password, 12),
      ...(params.role === "INSTRUCTOR"
        ? {
            instructorProfile: {
              create: {
                employeeId: params.employeeId || `EMP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
                specialization: params.specialization,
              },
            },
          }
        : {}),
    },
  });

  console.log(`• Created ${params.role.toLowerCase()} account: ${params.email}`);
  if (!params.password) console.log(`  Generated password (shown once, change it after first login): ${password}`);
  return user;
}

async function main() {
  console.log("🌱 Seeding IgnitedDreams academy data...");

  // 1. Platform settings
  const settings: Record<string, string> = {
    recordingRetentionDays: process.env.RECORDING_RETENTION_DAYS || "7",
    academyName: process.env.ACADEMY_NAME || "IgnitedDreams Skill Academy",
    academyTimezone: process.env.ACADEMY_TIMEZONE || "Asia/Kolkata",
    classJoinWindowMinutes: process.env.CLASS_JOIN_WINDOW_MINUTES || "15",
    defaultRecordingEnabled: "true",
    downloadEnabled: "true",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  // 2. Staff accounts
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase();
  if (!adminEmail) {
    throw new Error("Set SEED_ADMIN_EMAIL (and optionally SEED_ADMIN_PASSWORD) in backend/.env before seeding.");
  }
  await upsertStaff({
    email: adminEmail,
    password: process.env.SEED_ADMIN_PASSWORD,
    name: process.env.SEED_ADMIN_NAME || "Academy Administrator",
    role: "ADMIN",
  });

  const instructorEmail = (process.env.SEED_INSTRUCTOR_EMAIL || "").trim().toLowerCase();
  if (!instructorEmail) {
    throw new Error("Set SEED_INSTRUCTOR_EMAIL (lead faculty login) in backend/.env before seeding.");
  }
  const instructor = await upsertStaff({
    email: instructorEmail,
    password: process.env.SEED_INSTRUCTOR_PASSWORD,
    name: process.env.SEED_INSTRUCTOR_NAME || LEAD_FACULTY,
    role: "INSTRUCTOR",
    employeeId: "ID-LEAD-001",
    specialization: "Logistics, SAP ERP & Aviation Operations",
  });

  // 3. Course catalogue + first open batch per course
  const startDate = nextBatchStart();
  const endDate = new Date(startDate);
  endDate.setUTCMonth(endDate.getUTCMonth() + 6);

  for (const c of COURSES) {
    const durationHours = c.syllabus.reduce((sum, m) => sum + parseInt(m.hours, 10), 0);
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: {}, // never overwrite edits made in the admin panel
      create: {
        slug: c.slug,
        code: c.code,
        title: c.title,
        description: c.description,
        thumbnail: c.thumbnail,
        status: "PUBLISHED",
        durationHours,
        durationLabel: "6 Months Intensive (3 Hours/Day, 5 Days/Week)",
        price: COURSE_FEE_INR,
        marketPrice: c.marketPrice,
        category: c.category,
        level: c.level,
        syllabus: JSON.stringify(c.syllabus),
        facultyName: LEAD_FACULTY,
        facultyTitle: c.facultyTitle,
        facultyBio: c.facultyBio,
      },
    });

    for (const b of c.batches) {
      await prisma.batch.upsert({
        where: { code: b.code },
        update: {},
        create: {
          code: b.code,
          name: b.name,
          courseId: course.id,
          instructorId: instructor.id,
          startDate,
          endDate,
          status: "UPCOMING",
          capacity: BATCH_CAPACITY,
          scheduleLabel: b.scheduleLabel,
        },
      });
    }
    console.log(`• Course ready: ${c.code} — ${c.title} (${c.batches.length} batch${c.batches.length > 1 ? "es" : ""})`);
  }

  console.log(`✅ Seed complete. Batches start ${startDate.toDateString()} — adjust dates in Admin → Batches.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
