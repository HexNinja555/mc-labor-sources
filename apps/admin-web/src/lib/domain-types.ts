// Types for UI layer (camelCase)
export interface DashboardStats {
  totalEmployees: number;
  activeJobSites: number;
  clockedInToday: number;
  pendingJobOrders: number;
  signedTimesheets: number;
  recentAttendance: AttendanceLog[];
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  hourlyRate: string | number | null;
  status: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  officeEmail: string | null;
  address: string | null;
  status: string;
  _count?: { jobSites: number; users: number };
}

export interface CustomerDetail extends Customer {
  jobSites: JobSite[];
  users: { id: string; name: string; email: string; status: string; role: string }[];
}

export interface JobSite {
  id: string;
  customerId: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  foremanName: string | null;
  foremanPhone: string | null;
  foremanEmail: string | null;
  status: string;
  customer?: { id: string; companyName: string };
  assignments?: Assignment[];
}

export interface Assignment {
  id: string;
  employeeId: string;
  customerId: string;
  jobSiteId: string;
  assignedDate: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  notes: string | null;
  employee?: Employee;
  customer?: { id: string; companyName: string };
  jobSite?: { id: string; name: string; address?: string };
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  customerId: string;
  jobSiteId: string;
  clockInTime: string;
  clockOutTime: string | null;
  clockInLatitude: string | number | null;
  clockInLongitude: string | number | null;
  clockOutLatitude: string | number | null;
  clockOutLongitude: string | number | null;
  totalHours: string | number | null;
  status: string;
  employee?: { id: string; firstName: string; lastName: string };
  customer?: { id: string; companyName: string };
  jobSite?: { id: string; name: string };
}

export interface Timesheet {
  id: string;
  employeeId: string;
  customerId: string;
  jobSiteId: string;
  totalHours: string | number;
  status: string;
  employee?: { id: string; firstName: string; lastName: string };
  jobSite?: { id: string; name: string };
  signature?: {
    foremanName: string;
    signatureImageUrl: string;
    sentToCustomerOffice: boolean;
    sentToMcLaborOffice: boolean;
  };
}

export interface CustomerDashboard {
  customer: Customer;
  stats: {
    activeJobSites: number;
    workersAssigned: number;
    clockedInToday: number;
    signedTimesheets: number;
  };
  assignments: Assignment[];
  todayAttendance: AttendanceLog[];
  signedTimesheets: Timesheet[];
  jobOrders: unknown[];
}

export interface CustomerJobSite extends JobSite {
  assignments: Assignment[];
}

export interface CompanySettings {
  id: string;
  companyName: string;
  officeEmail: string | null;
  dashboardSubdomain: string | null;
}

export interface CreateCustomerUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  customerId: string | null;
  employeeId: string | null;
}
