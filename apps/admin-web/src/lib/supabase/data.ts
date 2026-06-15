import { createClient } from './client';
import type {
  AuthUser,
  Employee,
  Customer,
  CustomerDetail,
  JobSite,
  Assignment,
  AttendanceLog,
  Timesheet,
  DashboardStats,
  CustomerDashboard,
  CustomerJobSite,
  CompanySettings,
  CreateCustomerUserInput,
} from '../domain-types';

export class DataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataError';
  }
}

function sb() {
  return createClient();
}

function throwIf(error: { message: string } | null) {
  if (error) throw new DataError(error.message);
}

// --- mappers: snake_case DB -> camelCase UI ---

function mapEmployee(row: Record<string, unknown>): Employee {
  return {
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    position: (row.position as string) ?? null,
    hourlyRate: (row.hourly_rate as string | number | null) ?? null,
    status: row.status as string,
  };
}

function mapCustomer(row: Record<string, unknown>): Customer {
  const jobSites = row.job_sites as { count: number }[] | undefined;
  const users = row.users as { count: number }[] | undefined;
  return {
    id: row.id as string,
    companyName: row.company_name as string,
    contactName: (row.contact_name as string) ?? null,
    contactEmail: (row.contact_email as string) ?? null,
    contactPhone: (row.contact_phone as string) ?? null,
    officeEmail: (row.office_email as string) ?? null,
    address: (row.address as string) ?? null,
    status: row.status as string,
    _count: {
      jobSites: jobSites?.[0]?.count ?? 0,
      users: users?.[0]?.count ?? 0,
    },
  };
}

function mapJobSite(row: Record<string, unknown>): JobSite {
  const customer = row.customer as Record<string, unknown> | null;
  return {
    id: row.id as string,
    customerId: row.customer_id as string,
    name: row.name as string,
    address: row.address as string,
    city: (row.city as string) ?? null,
    state: (row.state as string) ?? null,
    zipCode: (row.zip_code as string) ?? null,
    foremanName: (row.foreman_name as string) ?? null,
    foremanPhone: (row.foreman_phone as string) ?? null,
    foremanEmail: (row.foreman_email as string) ?? null,
    status: row.status as string,
    customer: customer
      ? { id: customer.id as string, companyName: customer.company_name as string }
      : undefined,
  };
}

function mapAssignment(row: Record<string, unknown>): Assignment {
  const employee = row.employee as Record<string, unknown> | null;
  const customer = row.customer as Record<string, unknown> | null;
  const jobSite = row.job_site as Record<string, unknown> | null;
  return {
    id: row.id as string,
    employeeId: row.employee_id as string,
    customerId: row.customer_id as string,
    jobSiteId: row.job_site_id as string,
    assignedDate: row.assigned_date as string,
    startTime: (row.start_time as string) ?? null,
    endTime: (row.end_time as string) ?? null,
    status: row.status as string,
    notes: (row.notes as string) ?? null,
    employee: employee ? mapEmployee(employee) : undefined,
    customer: customer
      ? { id: customer.id as string, companyName: customer.company_name as string }
      : undefined,
    jobSite: jobSite
      ? {
          id: jobSite.id as string,
          name: jobSite.name as string,
          address: jobSite.address as string | undefined,
        }
      : undefined,
  };
}

function mapAttendance(row: Record<string, unknown>): AttendanceLog {
  const employee = row.employee as Record<string, unknown> | null;
  const customer = row.customer as Record<string, unknown> | null;
  const jobSite = row.job_site as Record<string, unknown> | null;
  return {
    id: row.id as string,
    employeeId: row.employee_id as string,
    customerId: row.customer_id as string,
    jobSiteId: row.job_site_id as string,
    clockInTime: row.clock_in_time as string,
    clockOutTime: (row.clock_out_time as string) ?? null,
    clockInLatitude: (row.clock_in_latitude as string | number | null) ?? null,
    clockInLongitude: (row.clock_in_longitude as string | number | null) ?? null,
    clockOutLatitude: (row.clock_out_latitude as string | number | null) ?? null,
    clockOutLongitude: (row.clock_out_longitude as string | number | null) ?? null,
    totalHours: (row.total_hours as string | number | null) ?? null,
    status: row.status as string,
    employee: employee
      ? {
          id: employee.id as string,
          firstName: employee.first_name as string,
          lastName: employee.last_name as string,
        }
      : undefined,
    customer: customer
      ? { id: customer.id as string, companyName: customer.company_name as string }
      : undefined,
    jobSite: jobSite
      ? { id: jobSite.id as string, name: jobSite.name as string }
      : undefined,
  };
}

function mapTimesheet(row: Record<string, unknown>): Timesheet {
  const employee = row.employee as Record<string, unknown> | null;
  const jobSite = row.job_site as Record<string, unknown> | null;
  const sig = row.signature as Record<string, unknown> | null;
  return {
    id: row.id as string,
    employeeId: row.employee_id as string,
    customerId: row.customer_id as string,
    jobSiteId: row.job_site_id as string,
    totalHours: row.total_hours as string | number,
    status: row.status as string,
    employee: employee
      ? {
          id: employee.id as string,
          firstName: employee.first_name as string,
          lastName: employee.last_name as string,
        }
      : undefined,
    jobSite: jobSite
      ? { id: jobSite.id as string, name: jobSite.name as string }
      : undefined,
    signature: sig
      ? {
          foremanName: sig.foreman_name as string,
          signatureImageUrl: sig.signature_image_url as string,
          sentToCustomerOffice: sig.sent_to_customer_office as boolean,
          sentToMcLaborOffice: sig.sent_to_mc_labor_office as boolean,
        }
      : undefined,
  };
}

function mapUser(row: Record<string, unknown>): AuthUser {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as string,
    customerId: (row.customer_id as string) ?? null,
    employeeId: (row.employee_id as string) ?? null,
  };
}

function mapSettings(row: Record<string, unknown>): CompanySettings {
  return {
    id: row.id as string,
    companyName: row.company_name as string,
    officeEmail: (row.office_email as string) ?? null,
    dashboardSubdomain: (row.dashboard_subdomain as string) ?? null,
  };
}

// --- API surface (same shape as former REST client) ---

export const data = {
  async getMe(): Promise<AuthUser> {
    const { data: session } = await sb().auth.getSession();
    if (!session.session?.user) throw new DataError('Not authenticated');
    const { data: row, error } = await sb()
      .from('users')
      .select('*')
      .eq('auth_user_id', session.session.user.id)
      .single();
    throwIf(error);
    return mapUser(row as Record<string, unknown>);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const { data: stats, error } = await sb().rpc('get_admin_dashboard_stats');
    throwIf(error);
    const s = stats as Record<string, number>;
    const { data: recent, error: e2 } = await sb()
      .from('attendance_logs')
      .select(
        '*, employee:employees(id, first_name, last_name), job_site:job_sites(id, name), customer:customers(id, company_name)',
      )
      .order('clock_in_time', { ascending: false })
      .limit(10);
    throwIf(e2);
    return {
      totalEmployees: s.totalEmployees ?? 0,
      activeJobSites: s.activeJobSites ?? 0,
      clockedInToday: s.clockedInToday ?? 0,
      pendingJobOrders: s.pendingJobOrders ?? 0,
      signedTimesheets: s.signedTimesheets ?? 0,
      recentAttendance: (recent ?? []).map((r) => mapAttendance(r as Record<string, unknown>)),
    };
  },

  async getEmployees(params?: Record<string, string>): Promise<Employee[]> {
    let q = sb().from('employees').select('*').order('last_name');
    if (params?.status) q = q.eq('status', params.status);
    if (params?.search) {
      q = q.or(
        `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%,position.ilike.%${params.search}%`,
      );
    }
    const { data: rows, error } = await q;
    throwIf(error);
    return (rows ?? []).map((r) => mapEmployee(r as Record<string, unknown>));
  },

  async getEmployee(id: string): Promise<Employee> {
    const { data: row, error } = await sb().from('employees').select('*').eq('id', id).single();
    throwIf(error);
    return mapEmployee(row as Record<string, unknown>);
  },

  async createEmployee(payload: Partial<Employee>): Promise<Employee> {
    const { data: row, error } = await sb()
      .from('employees')
      .insert({
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        position: payload.position,
        hourly_rate: payload.hourlyRate,
        status: payload.status ?? 'ACTIVE',
      })
      .select()
      .single();
    throwIf(error);
    return mapEmployee(row as Record<string, unknown>);
  },

  async updateEmployee(id: string, payload: Partial<Employee>): Promise<Employee> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.firstName !== undefined) update.first_name = payload.firstName;
    if (payload.lastName !== undefined) update.last_name = payload.lastName;
    if (payload.email !== undefined) update.email = payload.email;
    if (payload.phone !== undefined) update.phone = payload.phone;
    if (payload.position !== undefined) update.position = payload.position;
    if (payload.hourlyRate !== undefined) update.hourly_rate = payload.hourlyRate;
    if (payload.status !== undefined) update.status = payload.status;
    const { data: row, error } = await sb()
      .from('employees')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    throwIf(error);
    return mapEmployee(row as Record<string, unknown>);
  },

  async deleteEmployee(id: string): Promise<{ deleted: boolean }> {
    const { error } = await sb().from('employees').delete().eq('id', id);
    throwIf(error);
    return { deleted: true };
  },

  async getCustomers(params?: Record<string, string>): Promise<Customer[]> {
    let q = sb()
      .from('customers')
      .select('*, job_sites(count), users(count)')
      .order('company_name');
    if (params?.search) {
      q = q.or(
        `company_name.ilike.%${params.search}%,contact_name.ilike.%${params.search}%`,
      );
    }
    const { data: rows, error } = await q;
    throwIf(error);
    return (rows ?? []).map((r) => mapCustomer(r as Record<string, unknown>));
  },

  async getCustomer(id: string): Promise<CustomerDetail> {
    const { data: customer, error } = await sb()
      .from('customers')
      .select('*, job_sites(*), users(id, name, email, status, role)')
      .eq('id', id)
      .single();
    throwIf(error);
    const c = customer as Record<string, unknown>;
    const base = mapCustomer(c);
    const jobSites = ((c.job_sites as Record<string, unknown>[]) ?? []).map((js) =>
      mapJobSite(js),
    );
    const users = ((c.users as Record<string, unknown>[]) ?? []).map((u) => ({
      id: u.id as string,
      name: u.name as string,
      email: u.email as string,
      status: u.status as string,
      role: u.role as string,
    }));
    return { ...base, jobSites, users };
  },

  async createCustomer(payload: Partial<Customer>): Promise<Customer> {
    const { data: row, error } = await sb()
      .from('customers')
      .insert({
        company_name: payload.companyName,
        contact_name: payload.contactName,
        contact_email: payload.contactEmail,
        contact_phone: payload.contactPhone,
        office_email: payload.officeEmail,
        address: payload.address,
        status: payload.status ?? 'ACTIVE',
      })
      .select()
      .single();
    throwIf(error);
    return mapCustomer(row as Record<string, unknown>);
  },

  async updateCustomer(id: string, payload: Partial<Customer>): Promise<Customer> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.companyName !== undefined) update.company_name = payload.companyName;
    if (payload.contactName !== undefined) update.contact_name = payload.contactName;
    if (payload.contactEmail !== undefined) update.contact_email = payload.contactEmail;
    if (payload.contactPhone !== undefined) update.contact_phone = payload.contactPhone;
    if (payload.officeEmail !== undefined) update.office_email = payload.officeEmail;
    if (payload.address !== undefined) update.address = payload.address;
    if (payload.status !== undefined) update.status = payload.status;
    const { data: row, error } = await sb()
      .from('customers')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    throwIf(error);
    return mapCustomer(row as Record<string, unknown>);
  },

  async deleteCustomer(id: string): Promise<{ deleted: boolean }> {
    const { error } = await sb().from('customers').delete().eq('id', id);
    throwIf(error);
    return { deleted: true };
  },

  async createCustomerUser(
    customerId: string,
    input: CreateCustomerUserInput,
  ): Promise<unknown> {
    const { data: session } = await sb().auth.getSession();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-app-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({
          name: input.name,
          email: input.email,
          password: input.password,
          phone: input.phone,
          role: 'CUSTOMER',
          customerId,
        }),
      },
    );
    const json = await res.json();
    if (!res.ok) throw new DataError(json.error || 'Failed to create user');
    return json;
  },

  async getJobSites(params?: Record<string, string>): Promise<JobSite[]> {
    let q = sb()
      .from('job_sites')
      .select('*, customer:customers(id, company_name)')
      .order('name');
    if (params?.customerId) q = q.eq('customer_id', params.customerId);
    if (params?.status) q = q.eq('status', params.status);
    const { data: rows, error } = await q;
    throwIf(error);
    return (rows ?? []).map((r) => mapJobSite(r as Record<string, unknown>));
  },

  async getJobSite(id: string): Promise<JobSite> {
    const { data: row, error } = await sb()
      .from('job_sites')
      .select('*, customer:customers(id, company_name)')
      .eq('id', id)
      .single();
    throwIf(error);
    return mapJobSite(row as Record<string, unknown>);
  },

  async createJobSite(payload: Partial<JobSite>): Promise<JobSite> {
    const { data: row, error } = await sb()
      .from('job_sites')
      .insert({
        customer_id: payload.customerId,
        name: payload.name,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        zip_code: payload.zipCode,
        foreman_name: payload.foremanName,
        foreman_phone: payload.foremanPhone,
        foreman_email: payload.foremanEmail,
        status: payload.status ?? 'ACTIVE',
      })
      .select('*, customer:customers(id, company_name)')
      .single();
    throwIf(error);
    return mapJobSite(row as Record<string, unknown>);
  },

  async updateJobSite(id: string, payload: Partial<JobSite>): Promise<JobSite> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.customerId !== undefined) update.customer_id = payload.customerId;
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.address !== undefined) update.address = payload.address;
    if (payload.city !== undefined) update.city = payload.city;
    if (payload.state !== undefined) update.state = payload.state;
    if (payload.zipCode !== undefined) update.zip_code = payload.zipCode;
    if (payload.foremanName !== undefined) update.foreman_name = payload.foremanName;
    if (payload.foremanPhone !== undefined) update.foreman_phone = payload.foremanPhone;
    if (payload.foremanEmail !== undefined) update.foreman_email = payload.foremanEmail;
    if (payload.status !== undefined) update.status = payload.status;
    const { data: row, error } = await sb()
      .from('job_sites')
      .update(update)
      .eq('id', id)
      .select('*, customer:customers(id, company_name)')
      .single();
    throwIf(error);
    return mapJobSite(row as Record<string, unknown>);
  },

  async deleteJobSite(id: string): Promise<{ deleted: boolean }> {
    const { error } = await sb().from('job_sites').delete().eq('id', id);
    throwIf(error);
    return { deleted: true };
  },

  async getAssignments(params?: Record<string, string>): Promise<Assignment[]> {
    let q = sb()
      .from('job_assignments')
      .select(
        '*, employee:employees(*), customer:customers(id, company_name), job_site:job_sites(id, name, address)',
      )
      .order('assigned_date', { ascending: false });
    if (params?.employeeId) q = q.eq('employee_id', params.employeeId);
    if (params?.customerId) q = q.eq('customer_id', params.customerId);
    if (params?.jobSiteId) q = q.eq('job_site_id', params.jobSiteId);
    if (params?.status) q = q.eq('status', params.status);
    const { data: rows, error } = await q;
    throwIf(error);
    return (rows ?? []).map((r) => mapAssignment(r as Record<string, unknown>));
  },

  async createAssignment(payload: Partial<Assignment>): Promise<Assignment> {
    const { data: row, error } = await sb()
      .from('job_assignments')
      .insert({
        employee_id: payload.employeeId,
        customer_id: payload.customerId,
        job_site_id: payload.jobSiteId,
        assigned_date: payload.assignedDate,
        start_time: payload.startTime,
        end_time: payload.endTime,
        status: payload.status ?? 'PENDING',
        notes: payload.notes,
      })
      .select(
        '*, employee:employees(*), customer:customers(id, company_name), job_site:job_sites(id, name, address)',
      )
      .single();
    throwIf(error);
    return mapAssignment(row as Record<string, unknown>);
  },

  async updateAssignment(id: string, payload: Partial<Assignment>): Promise<Assignment> {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.status !== undefined) update.status = payload.status;
    if (payload.startTime !== undefined) update.start_time = payload.startTime;
    if (payload.endTime !== undefined) update.end_time = payload.endTime;
    if (payload.notes !== undefined) update.notes = payload.notes;
    const { data: row, error } = await sb()
      .from('job_assignments')
      .update(update)
      .eq('id', id)
      .select(
        '*, employee:employees(*), customer:customers(id, company_name), job_site:job_sites(id, name, address)',
      )
      .single();
    throwIf(error);
    return mapAssignment(row as Record<string, unknown>);
  },

  async deleteAssignment(id: string): Promise<{ deleted: boolean }> {
    const { error } = await sb().from('job_assignments').delete().eq('id', id);
    throwIf(error);
    return { deleted: true };
  },

  async getAttendance(params?: Record<string, string>): Promise<AttendanceLog[]> {
    let q = sb()
      .from('attendance_logs')
      .select(
        '*, employee:employees(id, first_name, last_name), customer:customers(id, company_name), job_site:job_sites(id, name)',
      )
      .order('clock_in_time', { ascending: false });
    if (params?.employeeId) q = q.eq('employee_id', params.employeeId);
    if (params?.customerId) q = q.eq('customer_id', params.customerId);
    if (params?.jobSiteId) q = q.eq('job_site_id', params.jobSiteId);
    if (params?.status) q = q.eq('status', params.status);
    if (params?.date) {
      const start = `${params.date}T00:00:00`;
      const end = `${params.date}T23:59:59`;
      q = q.gte('clock_in_time', start).lte('clock_in_time', end);
    }
    const { data: rows, error } = await q;
    throwIf(error);
    return (rows ?? []).map((r) => mapAttendance(r as Record<string, unknown>));
  },

  async getAttendanceToday(): Promise<AttendanceLog[]> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { data: rows, error } = await sb()
      .from('attendance_logs')
      .select(
        '*, employee:employees(id, first_name, last_name), customer:customers(id, company_name), job_site:job_sites(id, name)',
      )
      .gte('clock_in_time', start.toISOString())
      .order('clock_in_time', { ascending: false });
    throwIf(error);
    return (rows ?? []).map((r) => mapAttendance(r as Record<string, unknown>));
  },

  async getCustomerPortalDashboard(): Promise<CustomerDashboard> {
    const me = await data.getMe();
    if (!me.customerId) throw new DataError('No customer linked');
    const { data: customer, error: e1 } = await sb()
      .from('customers')
      .select('*')
      .eq('id', me.customerId)
      .single();
    throwIf(e1);
    const { data: stats, error: e2 } = await sb().rpc('get_customer_dashboard_stats', {
      p_customer_id: me.customerId,
    });
    throwIf(e2);
    const s = stats as Record<string, number>;
    const { data: assignmentRows, error: eA } = await sb()
      .from('job_assignments')
      .select(
        '*, employee:employees(*), customer:customers(id, company_name), job_site:job_sites(id, name, address)',
      )
      .eq('customer_id', me.customerId)
      .in('status', ['ACTIVE', 'ACCEPTED'])
      .order('assigned_date', { ascending: false });
    throwIf(eA);
    const assignments = (assignmentRows ?? []).map((r) =>
      mapAssignment(r as Record<string, unknown>),
    );
    const todayAttendance = await data.getAttendance({
      customerId: me.customerId,
      date: new Date().toISOString().slice(0, 10),
    });
    const { data: timesheets, error: e3 } = await sb()
      .from('timesheets')
      .select(
        '*, employee:employees(id, first_name, last_name), job_site:job_sites(id, name), signature:timesheet_signatures(*)',
      )
      .eq('customer_id', me.customerId)
      .in('status', ['SIGNED', 'SENT', 'APPROVED'])
      .order('created_at', { ascending: false })
      .limit(10);
    throwIf(e3);
    const { data: jobOrders, error: e4 } = await sb()
      .from('job_orders')
      .select('*, job_site:job_sites(id, name), employee:employees(id, first_name, last_name)')
      .eq('customer_id', me.customerId)
      .order('created_at', { ascending: false })
      .limit(10);
    throwIf(e4);
    return {
      customer: mapCustomer(customer as Record<string, unknown>),
      stats: {
        activeJobSites: s.activeJobSites ?? 0,
        workersAssigned: s.workersAssigned ?? 0,
        clockedInToday: s.clockedInToday ?? 0,
        signedTimesheets: s.signedTimesheets ?? 0,
      },
      assignments,
      todayAttendance,
      signedTimesheets: (timesheets ?? []).map((t) => mapTimesheet(t as Record<string, unknown>)),
      jobOrders: jobOrders ?? [],
    };
  },

  async getCustomerPortalJobSites(): Promise<CustomerJobSite[]> {
    const me = await data.getMe();
    if (!me.customerId) throw new DataError('No customer linked');
    const { data: rows, error } = await sb()
      .from('job_sites')
      .select(
        '*, assignments:job_assignments(*, employee:employees(id, first_name, last_name, position))',
      )
      .eq('customer_id', me.customerId)
      .eq('status', 'ACTIVE');
    throwIf(error);
    return (rows ?? []).map((r) => {
      const site = mapJobSite(r as Record<string, unknown>);
      const assignments = ((r as Record<string, unknown>).assignments as Record<string, unknown>[]) ?? [];
      return {
        ...site,
        assignments: assignments.map((a) => mapAssignment(a)),
      };
    });
  },

  async getCustomerPortalAttendance(date?: string): Promise<AttendanceLog[]> {
    const me = await data.getMe();
    return data.getAttendance({
      customerId: me.customerId!,
      ...(date ? { date } : {}),
    });
  },

  async getCustomerPortalTimesheets(): Promise<Timesheet[]> {
    const me = await data.getMe();
    if (!me.customerId) throw new DataError('No customer linked');
    const { data: rows, error } = await sb()
      .from('timesheets')
      .select(
        '*, employee:employees(id, first_name, last_name), job_site:job_sites(id, name), signature:timesheet_signatures(*)',
      )
      .eq('customer_id', me.customerId)
      .order('created_at', { ascending: false });
    throwIf(error);
    return (rows ?? []).map((r) => mapTimesheet(r as Record<string, unknown>));
  },

  async getSettings(): Promise<CompanySettings> {
    const { data: rows, error } = await sb().from('company_settings').select('*').limit(1);
    throwIf(error);
    if (!rows?.length) throw new DataError('Settings not found');
    return mapSettings(rows[0] as Record<string, unknown>);
  },

  async updateSettings(payload: Partial<CompanySettings>): Promise<CompanySettings> {
    const current = await data.getSettings();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.companyName !== undefined) update.company_name = payload.companyName;
    if (payload.officeEmail !== undefined) update.office_email = payload.officeEmail;
    if (payload.dashboardSubdomain !== undefined) update.dashboard_subdomain = payload.dashboardSubdomain;
    const { data: row, error } = await sb()
      .from('company_settings')
      .update(update)
      .eq('id', current.id)
      .select()
      .single();
    throwIf(error);
    return mapSettings(row as Record<string, unknown>);
  },
};

// Alias for drop-in replacement
export const api = data;
