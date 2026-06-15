export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  WORKER = 'WORKER',
  CUSTOMER = 'CUSTOMER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum JobSiteStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AttendanceStatus {
  CLOCKED_IN = 'CLOCKED_IN',
  CLOCKED_OUT = 'CLOCKED_OUT',
  PENDING_REVIEW = 'PENDING_REVIEW',
}

export enum JobOrderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TimesheetStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  SIGNED = 'SIGNED',
  SENT = 'SENT',
  APPROVED = 'APPROVED',
}

export enum DocumentCategory {
  SAFETY = 'SAFETY',
  HANDBOOK = 'HANDBOOK',
  SITE_INSTRUCTION = 'SITE_INSTRUCTION',
  COMPANY_FORM = 'COMPANY_FORM',
  OTHER = 'OTHER',
}

export enum SafetyAudience {
  ALL_EMPLOYEES = 'ALL_EMPLOYEES',
  SPECIFIC_JOB_SITE = 'SPECIFIC_JOB_SITE',
  SPECIFIC_WORKERS = 'SPECIFIC_WORKERS',
}

export enum NotificationType {
  JOB_ORDER = 'JOB_ORDER',
  SAFETY = 'SAFETY',
  ATTENDANCE = 'ATTENDANCE',
  SYSTEM = 'SYSTEM',
  EMERGENCY = 'EMERGENCY',
}
