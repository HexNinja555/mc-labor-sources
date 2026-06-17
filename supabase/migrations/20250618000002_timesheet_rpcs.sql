-- Timesheet entries linked to attendance; daily upsert + weekly rollup RPCs

ALTER TABLE timesheet_entries
  ADD COLUMN IF NOT EXISTS attendance_log_id uuid REFERENCES attendance_logs(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS timesheet_entries_attendance_log_id_key
  ON timesheet_entries (attendance_log_id)
  WHERE attendance_log_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.upsert_daily_timesheet_from_attendance(p_attendance_log_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_att attendance_logs%ROWTYPE;
  v_work_date date;
  v_timesheet_id uuid;
  v_start_time text;
  v_end_time text;
BEGIN
  SELECT * INTO v_att FROM attendance_logs WHERE id = p_attendance_log_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attendance log not found';
  END IF;

  IF NOT public.is_admin() AND v_att.employee_id IS DISTINCT FROM public.get_my_employee_id() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF v_att.clock_out_time IS NULL THEN
    RAISE EXCEPTION 'Attendance not clocked out';
  END IF;

  v_work_date := (v_att.clock_in_time AT TIME ZONE 'UTC')::date;
  v_start_time := to_char(v_att.clock_in_time AT TIME ZONE 'UTC', 'HH24:MI');
  v_end_time := to_char(v_att.clock_out_time AT TIME ZONE 'UTC', 'HH24:MI');

  SELECT id INTO v_timesheet_id
  FROM timesheets
  WHERE employee_id = v_att.employee_id
    AND customer_id = v_att.customer_id
    AND job_site_id = v_att.job_site_id
    AND work_date = v_work_date
    AND status = 'DRAFT'
    AND week_start_date IS NULL
  LIMIT 1;

  IF v_timesheet_id IS NULL THEN
    INSERT INTO timesheets (
      employee_id, customer_id, job_site_id, assignment_id,
      work_date, total_hours, status
    )
    VALUES (
      v_att.employee_id, v_att.customer_id, v_att.job_site_id, v_att.assignment_id,
      v_work_date, 0, 'DRAFT'
    )
    RETURNING id INTO v_timesheet_id;
  END IF;

  INSERT INTO timesheet_entries (
    timesheet_id, work_date, start_time, end_time, break_minutes, hours, attendance_log_id
  )
  VALUES (
    v_timesheet_id, v_work_date, v_start_time, v_end_time, 0,
    COALESCE(v_att.total_hours, 0), p_attendance_log_id
  )
  ON CONFLICT (attendance_log_id) WHERE attendance_log_id IS NOT NULL
  DO UPDATE SET
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    hours = EXCLUDED.hours,
    updated_at = now();

  UPDATE timesheets
  SET total_hours = (
      SELECT COALESCE(SUM(hours), 0) FROM timesheet_entries WHERE timesheet_id = v_timesheet_id
    ),
    updated_at = now()
  WHERE id = v_timesheet_id;

  RETURN v_timesheet_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rollup_weekly_timesheet(
  p_employee_id uuid,
  p_customer_id uuid,
  p_job_site_id uuid,
  p_week_start date,
  p_week_end date,
  p_status timesheet_status DEFAULT 'SUBMITTED'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_timesheet_id uuid;
  v_total numeric(5, 2);
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF p_week_end < p_week_start THEN
    RAISE EXCEPTION 'Week end must be on or after week start';
  END IF;

  SELECT COALESCE(SUM(te.hours), 0) INTO v_total
  FROM timesheet_entries te
  JOIN timesheets t ON t.id = te.timesheet_id
  WHERE t.employee_id = p_employee_id
    AND t.customer_id = p_customer_id
    AND t.job_site_id = p_job_site_id
    AND t.status = 'DRAFT'
    AND t.week_start_date IS NULL
    AND te.work_date BETWEEN p_week_start AND p_week_end;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'No daily draft entries found for this week';
  END IF;

  INSERT INTO timesheets (
    employee_id, customer_id, job_site_id,
    week_start_date, week_end_date, work_date,
    total_hours, status, notes
  )
  VALUES (
    p_employee_id, p_customer_id, p_job_site_id,
    p_week_start, p_week_end, NULL,
    v_total, p_status,
    format('Rolled up from daily drafts %s – %s', p_week_start, p_week_end)
  )
  RETURNING id INTO v_timesheet_id;

  INSERT INTO timesheet_entries (
    timesheet_id, work_date, start_time, end_time, break_minutes, hours, attendance_log_id, notes
  )
  SELECT
    v_timesheet_id, te.work_date, te.start_time, te.end_time, te.break_minutes, te.hours,
    te.attendance_log_id, te.notes
  FROM timesheet_entries te
  JOIN timesheets t ON t.id = te.timesheet_id
  WHERE t.employee_id = p_employee_id
    AND t.customer_id = p_customer_id
    AND t.job_site_id = p_job_site_id
    AND t.status = 'DRAFT'
    AND t.week_start_date IS NULL
    AND te.work_date BETWEEN p_week_start AND p_week_end;

  UPDATE timesheets
  SET status = 'SUBMITTED',
      notes = COALESCE(notes, '') || ' (rolled into weekly timesheet)',
      updated_at = now()
  WHERE employee_id = p_employee_id
    AND customer_id = p_customer_id
    AND job_site_id = p_job_site_id
    AND status = 'DRAFT'
    AND week_start_date IS NULL
    AND work_date BETWEEN p_week_start AND p_week_end;

  RETURN v_timesheet_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_daily_timesheet_from_attendance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rollup_weekly_timesheet(uuid, uuid, uuid, date, date, timesheet_status) TO authenticated;
