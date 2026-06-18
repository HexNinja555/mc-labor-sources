-- Admin hours report across all customers (M3 polish)

CREATE OR REPLACE FUNCTION public.get_admin_hours_report(
  p_from date,
  p_to date,
  p_customer_id uuid DEFAULT NULL,
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
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
  INTO result
  FROM (
    SELECT
      e.id AS employee_id,
      e.first_name,
      e.last_name,
      c.id AS customer_id,
      c.company_name,
      js.id AS job_site_id,
      js.name AS job_site_name,
      COALESCE(sum(t.total_hours), 0)::numeric(10, 2) AS total_hours,
      count(t.id)::int AS timesheet_count
    FROM timesheets t
    JOIN employees e ON e.id = t.employee_id
    JOIN job_sites js ON js.id = t.job_site_id
    JOIN customers c ON c.id = t.customer_id
    WHERE (p_customer_id IS NULL OR t.customer_id = p_customer_id)
      AND (p_job_site_id IS NULL OR t.job_site_id = p_job_site_id)
      AND (
        (t.work_date IS NOT NULL AND t.work_date BETWEEN p_from AND p_to)
        OR (
          t.week_start_date IS NOT NULL
          AND t.week_end_date IS NOT NULL
          AND t.week_start_date <= p_to
          AND t.week_end_date >= p_from
        )
      )
    GROUP BY e.id, e.first_name, e.last_name, c.id, c.company_name, js.id, js.name
    ORDER BY c.company_name, js.name, e.last_name, e.first_name
  ) r;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_hours_report(date, date, uuid, uuid) TO authenticated;
