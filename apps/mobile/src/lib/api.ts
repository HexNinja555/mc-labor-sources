import { supabase } from './supabase';

export class MobileDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MobileDataError';
  }
}

function throwIf(error: { message: string } | null) {
  if (error) throw new MobileDataError(error.message);
}

export interface MobileUser {
  id: string;
  name: string;
  email: string;
  role: string;
  customerId: string | null;
  employeeId: string | null;
}

export async function getMe(): Promise<MobileUser> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) throw new MobileDataError('Not authenticated');
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', session.session.user.id)
    .single();
  throwIf(error);
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    customerId: data.customer_id,
    employeeId: data.employee_id,
  };
}

function mapAssignment(row: Record<string, unknown>) {
  const jobSite = row.job_site as Record<string, unknown> | null;
  const customer = row.customer as Record<string, unknown> | null;
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
    jobSite: jobSite
      ? {
          id: jobSite.id as string,
          name: jobSite.name as string,
          address: (jobSite.address as string) ?? '',
        }
      : undefined,
    customer: customer
      ? { id: customer.id as string, companyName: customer.company_name as string }
      : undefined,
  };
}

function mapJobOrder(row: Record<string, unknown>) {
  const jobSite = row.job_site as Record<string, unknown> | null;
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    title: row.title as string,
    description: (row.description as string) ?? null,
    startDate: row.start_date as string,
    startTime: (row.start_time as string) ?? null,
    instructions: (row.instructions as string) ?? null,
    safetyNotes: (row.safety_notes as string) ?? null,
    status: row.status as string,
    sentAt: (row.sent_at as string) ?? null,
    acknowledgedAt: (row.acknowledged_at as string) ?? null,
    jobSite: jobSite ? { id: jobSite.id as string, name: jobSite.name as string } : undefined,
  };
}

function mapTimesheet(row: Record<string, unknown>) {
  const jobSite = row.job_site as Record<string, unknown> | null;
  return {
    id: row.id as string,
    totalHours: row.total_hours as string | number,
    status: row.status as string,
    workDate: (row.work_date as string) ?? null,
    jobSite: jobSite ? { name: jobSite.name as string } : undefined,
  };
}

export const mobileApi = {
  getMe,
  getAssignments: async () => {
    const me = await getMe();
    if (!me.employeeId) return [];
    const { data, error } = await supabase
      .from('job_assignments')
      .select(
        '*, job_site:job_sites(id, name, address), customer:customers(id, company_name)',
      )
      .eq('employee_id', me.employeeId)
      .order('assigned_date', { ascending: false });
    throwIf(error);
    return (data ?? []).map((row) => mapAssignment(row as Record<string, unknown>));
  },
  getAssignment: async (id: string) => {
    const { data, error } = await supabase
      .from('job_assignments')
      .select(
        '*, job_site:job_sites(id, name, address), customer:customers(id, company_name)',
      )
      .eq('id', id)
      .single();
    throwIf(error);
    return mapAssignment(data as Record<string, unknown>);
  },
  getActiveClockIn: async () => {
    const me = await getMe();
    if (!me.employeeId) return null;
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*, job_site:job_sites(id, name)')
      .eq('employee_id', me.employeeId)
      .eq('status', 'CLOCKED_IN')
      .order('clock_in_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    throwIf(error);
    if (!data) return null;
    const jobSite = data.job_site as Record<string, unknown> | null;
    return {
      id: data.id as string,
      clockInTime: data.clock_in_time as string,
      jobSiteId: data.job_site_id as string,
      customerId: data.customer_id as string,
      assignmentId: (data.assignment_id as string) ?? null,
      jobSiteName: jobSite?.name as string | undefined,
    };
  },
  clockIn: async (payload: {
    customerId: string;
    jobSiteId: string;
    assignmentId?: string;
    clockInLatitude?: number;
    clockInLongitude?: number;
  }) => {
    const me = await getMe();
    if (!me.employeeId) throw new MobileDataError('Worker profile required');
    const { data, error } = await supabase
      .from('attendance_logs')
      .insert({
        employee_id: me.employeeId,
        customer_id: payload.customerId,
        job_site_id: payload.jobSiteId,
        assignment_id: payload.assignmentId ?? null,
        clock_in_time: new Date().toISOString(),
        clock_in_latitude: payload.clockInLatitude ?? null,
        clock_in_longitude: payload.clockInLongitude ?? null,
        status: 'CLOCKED_IN',
      })
      .select()
      .single();
    throwIf(error);
    return data;
  },
  clockOut: async (payload: {
    attendanceId: string;
    clockOutLatitude?: number;
    clockOutLongitude?: number;
  }) => {
    const { data: existing, error: fetchError } = await supabase
      .from('attendance_logs')
      .select('clock_in_time')
      .eq('id', payload.attendanceId)
      .single();
    throwIf(fetchError);
    if (!existing) throw new Error('Attendance record not found');
    const now = new Date();
    const clockIn = new Date(existing.clock_in_time as string);
    const totalHours = Math.round(((now.getTime() - clockIn.getTime()) / 3600000) * 100) / 100;
    const { data, error } = await supabase
      .from('attendance_logs')
      .update({
        clock_out_time: now.toISOString(),
        clock_out_latitude: payload.clockOutLatitude ?? null,
        clock_out_longitude: payload.clockOutLongitude ?? null,
        total_hours: totalHours,
        status: 'CLOCKED_OUT',
        updated_at: now.toISOString(),
      })
      .eq('id', payload.attendanceId)
      .select()
      .single();
    throwIf(error);
    return data;
  },
  getJobOrders: async () => {
    const me = await getMe();
    if (!me.employeeId) return [];
    const { data, error } = await supabase
      .from('job_orders')
      .select('*, job_site:job_sites(id, name)')
      .eq('employee_id', me.employeeId)
      .order('created_at', { ascending: false });
    throwIf(error);
    return (data ?? []).map((row) => mapJobOrder(row as Record<string, unknown>));
  },
  getJobOrder: async (id: string) => {
    const { data, error } = await supabase
      .from('job_orders')
      .select('*, job_site:job_sites(id, name)')
      .eq('id', id)
      .single();
    throwIf(error);
    return mapJobOrder(data as Record<string, unknown>);
  },
  acknowledgeJobOrder: async (id: string) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('job_orders')
      .update({ status: 'ACKNOWLEDGED', acknowledged_at: now, updated_at: now })
      .eq('id', id)
      .select('*, job_site:job_sites(id, name)')
      .single();
    throwIf(error);
    return mapJobOrder(data as Record<string, unknown>);
  },
  getSafetyBulletins: async () => {
    const { data, error } = await supabase
      .from('safety_bulletins')
      .select('*, job_site:job_sites(id, name)')
      .not('sent_at', 'is', null)
      .order('sent_at', { ascending: false });
    throwIf(error);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      message: row.message as string,
      fileUrl: (row.file_url as string) ?? null,
      sentAt: row.sent_at as string,
      jobSite: row.job_site
        ? { name: (row.job_site as Record<string, unknown>).name as string }
        : undefined,
    }));
  },
  getTimesheets: async () => {
    const me = await getMe();
    if (!me.employeeId) return [];
    const { data, error } = await supabase
      .from('timesheets')
      .select('*, job_site:job_sites(id, name)')
      .eq('employee_id', me.employeeId)
      .order('created_at', { ascending: false });
    throwIf(error);
    return (data ?? []).map((row) => mapTimesheet(row as Record<string, unknown>));
  },
};

export { signIn, signOut, getAccessToken } from './supabase';
