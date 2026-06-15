-- Dashboard RPC for admin portal

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  day_start timestamptz;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  day_start := date_trunc('day', now());

  SELECT json_build_object(
    'totalEmployees', (SELECT count(*)::int FROM employees WHERE status = 'ACTIVE'),
    'activeJobSites', (SELECT count(*)::int FROM job_sites WHERE status = 'ACTIVE'),
    'clockedInToday', (
      SELECT count(*)::int FROM attendance_logs
      WHERE status = 'CLOCKED_IN' AND clock_in_time >= day_start
    ),
    'pendingJobOrders', (
      SELECT count(*)::int FROM job_orders WHERE status IN ('DRAFT', 'SENT')
    ),
    'signedTimesheets', (
      SELECT count(*)::int FROM timesheets WHERE status IN ('SIGNED', 'SENT', 'APPROVED')
    )
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_customer_dashboard_stats(p_customer_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  day_start timestamptz;
BEGIN
  IF public.get_my_customer_id() IS DISTINCT FROM p_customer_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  day_start := date_trunc('day', now());

  SELECT json_build_object(
    'activeJobSites', (SELECT count(*)::int FROM job_sites WHERE customer_id = p_customer_id AND status = 'ACTIVE'),
    'workersAssigned', (
      SELECT count(DISTINCT employee_id)::int FROM job_assignments
      WHERE customer_id = p_customer_id AND status IN ('ACTIVE', 'ACCEPTED')
    ),
    'clockedInToday', (
      SELECT count(*)::int FROM attendance_logs
      WHERE customer_id = p_customer_id AND status = 'CLOCKED_IN' AND clock_in_time >= day_start
    ),
    'signedTimesheets', (
      SELECT count(*)::int FROM timesheets
      WHERE customer_id = p_customer_id AND status IN ('SIGNED', 'SENT', 'APPROVED')
    )
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_customer_dashboard_stats(uuid) TO authenticated;
