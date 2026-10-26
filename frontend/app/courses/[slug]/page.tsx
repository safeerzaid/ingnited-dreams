import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { notFound } from "next/navigation";
import { serverGet } from "@/lib/server-api";
import { formatDate, formatInr } from "@/lib/format";
import type { PublicCourse } from "@/lib/types";
import {
  Clock,
  ArrowRight,
  Video,
  Download,
  ShieldCheck,
  CheckCircle2,
  User,
  Users,
  Camera,
  FileCheck,
  Award,
  Sparkles,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const course = await serverGet<PublicCourse>(`/public/courses/${encodeURIComponent(slug)}`).catch(() => null);
  return course ? { title: `${course.title} | Ignited Dreams`, description: course.description } : {};
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const course = await serverGet<PublicCourse>(`/public/courses/${encodeURIComponent(slug)}`);
  if (!course) notFound();

  const courseData = {
    title: course.title,
    code: course.code,
    duration: course.durationLabel || `${course.durationHours} Hours`,
    category: course.category || "Skill Training",
    description: course.description,
    modules: course.syllabus || [],
    instructor: {
      name: course.facultyName || "Academy Faculty",
      title: course.facultyTitle || "",
      experience: course.facultyBio || "",
    },
  };
  const openBatches = course.batches;
  const hasSeats = openBatches.some((b) => b.seatsLeft > 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Header - Clean Light Mode */}
      <section className="py-12 sm:py-16 bg-[#FBFBFA] border-b border-slate-200 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-50/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-5">
            <div className="flex items-center gap-2">
              <Badge variant="yellow" size="sm" className="bg-[#F5C400] text-[#0e271d] font-bold">
                {courseData.category}
              </Badge>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                {courseData.code}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-heading leading-tight text-[#0e271d]">
              {courseData.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {courseData.description}
            </p>

            {/* Academic Highlights Banner */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Cohort Training Standard</span>
                  <span className="text-sm sm:text-base font-black text-[#0e271d]">50 Cadets Strict Limit • 1 Mentor + 2 Trainers</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Live Classroom + 7-Day Replay
                </span>
              </div>
            </div>

            {/* Metadata Chips */}
            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-700 font-semibold pt-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{courseData.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600 shrink-0" />
                <span>1 Mentor + 2 Trainers per 50 Students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Download className="w-4 h-4 text-amber-600 shrink-0" />
                <span>7-Day Replay + 2-Year Vault</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content Grid */}
      <section className="py-16 bg-slate-50 flex-1">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Content: Syllabus (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-heading mb-4">
                  Curriculum & Hands-on Practical Modules
                </h2>
                <div className="space-y-4">
                  {courseData.modules.length === 0 && (
                    <p className="text-sm text-slate-500">The detailed syllabus will be published soon.</p>
                  )}
                  {courseData.modules.map((m, idx) => (
                    <Card key={idx} padding="md" variant="default" className="border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-slate-900 font-heading">
                          Module {idx + 1}: {m.name}
                        </h3>
                        {m.hours && (
                          <span className="text-xs font-mono font-bold text-amber-800 px-2 py-0.5 rounded bg-amber-100">
                            {m.hours}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{m.topics}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Classroom Discipline & Monitoring Policy */}
              <Card variant="accent" padding="md" className="border border-amber-300 bg-amber-50/60">
                <h3 className="text-base font-bold text-amber-950 font-heading mb-2 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-700" />
                  Live Virtual Classroom & Monitoring Guidelines
                </h3>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Hosted Directly on Website:</strong> Students and mentors meet for daily live sessions directly inside <code>www.igniteddreams.com</code>.
                  </li>
                  <li>
                    <strong>Daily 3-Hour Rhythm:</strong> 2 Hours Live Instruction + 1 Hour Dedicated Doubt Clearing (5 days a week).
                  </li>
                  <li>
                    <strong>Strict Proctoring:</strong> Both students and trainers are continuously monitored via webcams during class hours to ensure academic integrity.
                  </li>
                  <li>
                    <strong>7-Day Revision + 2-Year Vault:</strong> Sessions are recorded and available for 7 days on the student dashboard. On the 7th day, they are downloaded and securely vaulted on ID servers for 2 years.
                  </li>
                  <li>
                    <strong>Weekly Weekend Projects:</strong> Students submit a project every weekend (written report or speech presentation).
                  </li>
                  <li>
                    <strong>Final Exit Examinations:</strong> Online written exam for SAP ERP; VIVA mode (Oral Examination) for Logistics & English soft-skills.
                  </li>
                </ul>
              </Card>
            </div>

            {/* Right Sidebar: Batches & Online Fee Payment (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              <Card variant="default" padding="lg" className="border-2 border-aviation-border shadow-md bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Batch Allocation
                  </span>
                  <span className="text-xs font-bold text-emerald-700">50 Seats Strict Limit</span>
                </div>

                {/* Fee */}
                <div className="mb-4 p-3.5 rounded-xl bg-slate-900 text-white">
                  {course.marketPrice ? (
                    <div className="text-[11px] text-slate-400">
                      Other private academies: <span className="line-through">{formatInr(course.marketPrice)} + GST</span>
                    </div>
                  ) : null}
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs text-slate-300">Course fee (tax included)</span>
                    <span className="text-2xl font-black text-aviation-yellow">{formatInr(course.price)}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {openBatches.length === 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      No batch is open for admission right now. Please contact the academy for the next intake.
                    </div>
                  )}
                  {openBatches.map((b) => (
                    <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="font-bold text-sm text-slate-900">{b.name}</div>
                      {b.scheduleLabel && <div className="text-xs font-mono text-slate-500 mt-1">{b.scheduleLabel}</div>}
                      <div className="text-[11px] text-slate-500 mt-1">Starts {formatDate(b.startDate)}</div>
                      <Badge variant="yellow" size="sm" className="mt-2">
                        {b.seatsLeft > 0 ? `${b.seatsLeft} of ${b.capacity} seats open` : "Batch full"}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Faculty Card - Clean Light Mode */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#F5C400] text-[#0e271d] font-black flex items-center justify-center text-sm shrink-0 shadow-xs border border-amber-300">
                    ID
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{courseData.instructor.name}</div>
                    <div className="text-[11px] font-semibold text-amber-800">{courseData.instructor.title}</div>
                    <div className="text-[10px] text-slate-500">{courseData.instructor.experience}</div>
                  </div>
                </div>

                {/* Direct Enrollment & Check-In Button */}
                <div className="space-y-3">
                  {hasSeats ? (
                    <Link href={`/checkout?course=${course.slug}`} className="block">
                      <Button
                        variant="primary"
                        className="w-full font-bold shadow-md text-sm py-3 bg-[#F5C400] hover:bg-[#e0b400] text-[#0e271d]"
                        size="lg"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Enroll &amp; Pay Online
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/contact" className="block">
                      <Button variant="outline" className="w-full font-bold text-sm py-3" size="lg">
                        Contact Admissions
                      </Button>
                    </Link>
                  )}

                  <div className="text-center text-[11px] text-slate-500 font-medium">
                    Instant Admission Pass • Live Virtual Classroom • 2-Year Vault
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
