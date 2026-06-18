-- Fix supervisor RPCs: array_agg over SETOF uuid must use aliased column name

CREATE OR REPLACE FUNCTION public.get_supervisor_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  day_start timestamptz;
  site_ids uuid[];
BEGIN
  IF public.get_my_role() IS DISTINCT FROM 'SUPERVISOR'
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Supervisor access required';
  END IF;

  SELECT array_agg(site_id) INTO site_ids
  FROM public.get_my_supervisor_job_site_ids() AS t(site_id);

  IF site_ids IS NULL OR array_length(site_ids, 1) IS NULL THEN
    SELECT json_build_object(
      'assignedJobSites', 0,
      'workersAssigned', 0,
      'clockedInToday', 0,
      'pendingTimesheets', 0,
      'signedTimesheets', 0
    ) INTO result;
    RETURN result;
  END IF;

  day_start := date_trunc('day', now());

  SELECT json_build_object(
    'assignedJobSites', (
      SELECT count(*)::int FROM job_sites
      WHERE id = ANY(site_ids) AND status = 'ACTIVE'
    ),
    'workersAssigned', (
      SELECT count(DISTINCT employee_id)::int FROM job_assignments
      WHERE job_site_id = ANY(site_ids) AND status IN ('ACTIVE', 'ACCEPTED')
    ),
    'clockedInToday', (
      SELECT count(*)::int FROM attendance_logs
      WHERE job_site_id = ANY(site_ids)
        AND status = 'CLOCKED_IN'
        AND clock_in_time >= day_start
    ),
    'pendingTimesheets', (
      SELECT count(*)::int FROM timesheets t
      WHERE t.job_site_id = ANY(site_ids)
        AND t.status IN ('DRAFT', 'SUBMITTED')
        AND NOT EXISTS (
          SELECT 1 FROM timesheet_signatures ts WHERE ts.timesheet_id = t.id
        )
    ),
    'signedTimesheets', (
      SELECT count(*)::int FROM timesheets t
      WHERE t.job_site_id = ANY(site_ids)
        AND t.status IN ('SIGNED', 'SENT', 'APPROVED')
    )
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_supervisor_hours_report(
  p_from date,
  p_to date,
  p_job_site_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  site_ids uuid[];
BEGIN
  IF public.get_my_role() IS DISTINCT FROM 'SUPERVISOR'
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Supervisor access required';
  END IF;

  SELECT array_agg(site_id) INTO site_ids
  FROM public.get_my_supervisor_job_site_ids() AS t(site_id);

  IF site_ids IS NULL OR array_length(site_ids, 1) IS NULL THEN
    RETURN '[]'::json;
  END IF;

  IF p_job_site_id IS NOT NULL THEN
    IF NOT (p_job_site_id = ANY(site_ids)) AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Job site not assigned to supervisor';
    END IF;
    site_ids := ARRAY[p_job_site_id];
  END IF;

  SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
  INTO result
  FROM (
    SELECT
      e.id AS employee_id,
      e.first_name,
      e.last_name,
      js.id AS job_site_id,
      js.name AS job_site_name,
      COALESCE(sum(t.total_hours), 0)::numeric(10, 2) AS total_hours,
      count(t.id)::int AS timesheet_count
    FROM timesheets t
    JOIN employees e ON e.id = t.employee_id
    JOIN job_sites js ON js.id = t.job_site_id
    WHERE t.job_site_id = ANY(site_ids)
      AND (
        (t.work_date IS NOT NULL AND t.work_date BETWEEN p_from AND p_to)
        OR (
          t.week_start_date IS NOT NULL
          AND t.week_end_date IS NOT NULL
          AND t.week_start_date <= p_to
          AND t.week_end_date >= p_from
        )
      )
    GROUP BY e.id, e.first_name, e.last_name, js.id, js.name
    ORDER BY js.name, e.last_name, e.first_name
  ) r;

  RETURN result;
END;
$$;
