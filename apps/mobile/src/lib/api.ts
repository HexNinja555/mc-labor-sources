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

export async function getMe() {
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
    return data ?? [];
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
    const now = new Date();
    const { data, error } = await supabase
      .from('attendance_logs')
      .update({
        clock_out_time: now.toISOString(),
        clock_out_latitude: payload.clockOutLatitude ?? null,
        clock_out_longitude: payload.clockOutLongitude ?? null,
        status: 'CLOCKED_OUT',
        updated_at: now.toISOString(),
      })
      .eq('id', payload.attendanceId)
      .select()
      .single();
    throwIf(error);
    return data;
  },
};

// Re-export auth helpers
export { signIn, signOut, getAccessToken } from './supabase';
