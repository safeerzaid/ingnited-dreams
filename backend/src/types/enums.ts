export const Role = {
  ADMIN: "ADMIN",
  INSTRUCTOR: "INSTRUCTOR",
  STUDENT: "STUDENT",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const CourseStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;
export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];

export const BatchStatus = {
  UPCOMING: "UPCOMING",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type BatchStatus = (typeof BatchStatus)[keyof typeof BatchStatus];

export const ClassStatus = {
  SCHEDULED: "SCHEDULED",
  LIVE: "LIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type ClassStatus = (typeof ClassStatus)[keyof typeof ClassStatus];

export const RecordingStatus = {
  SCHEDULED: "SCHEDULED",
  LIVE: "LIVE",
  RECORDING: "RECORDING",
  PROCESSING: "PROCESSING",
  READY: "READY",
  EXPIRING_SOON: "EXPIRING_SOON",
  EXPIRED: "EXPIRED",
  ARCHIVED: "ARCHIVED",
  DELETING: "DELETING",
  DELETED: "DELETED",
  FAILED: "FAILED",
} as const;
export type RecordingStatus = (typeof RecordingStatus)[keyof typeof RecordingStatus];

export const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  PARTIAL: "PARTIAL",
} as const;
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export const NotificationType = {
  CLASS_STARTING: "CLASS_STARTING",
  CLASS_RESCHEDULED: "CLASS_RESCHEDULED",
  CLASS_CANCELLED: "CLASS_CANCELLED",
  RECORDING_READY: "RECORDING_READY",
  RECORDING_EXPIRING_48H: "RECORDING_EXPIRING_48H",
  RECORDING_EXPIRING_24H: "RECORDING_EXPIRING_24H",
  RECORDING_EXPIRED: "RECORDING_EXPIRED",
  NEW_ENROLLMENT: "NEW_ENROLLMENT",
  SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
