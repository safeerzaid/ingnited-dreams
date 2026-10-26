export interface SyllabusModule {
  name: string;
  hours?: string;
  topics?: string;
}

export interface PublicBatch {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  status: string;
  capacity: number;
  scheduleLabel: string | null;
  seatsTaken: number;
  seatsLeft: number;
  instructor: { id: string; name: string };
}

export interface PublicCourse {
  id: string;
  title: string;
  slug: string;
  code: string;
  description: string;
  thumbnail: string | null;
  durationHours: number;
  durationLabel: string | null;
  price: number;
  marketPrice: number | null;
  category: string | null;
  level: string | null;
  facultyName: string | null;
  facultyTitle: string | null;
  facultyBio?: string | null;
  syllabus?: SyllabusModule[];
  batches: PublicBatch[];
}
