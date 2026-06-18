-- Incremental demo data for M3 signing flows (safe to run on remote Supabase)
-- Uses fixed UUIDs with ON CONFLICT DO NOTHING

INSERT INTO timesheets (id, employee_id, customer_id, job_site_id, assignment_id, work_date, week_start_date, week_end_date, total_hours, notes, status) VALUES
('a0000007-0007-4007-8007-000000000003', 'a0000003-0003-4003-8003-000000000003', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000002', 'a0000006-0006-4006-8006-000000000003', CURRENT_DATE, NULL, NULL, 8, 'Warehouse shift', 'DRAFT')
ON CONFLICT (id) DO NOTHING;

INSERT INTO timesheet_entries (id, timesheet_id, work_date, start_time, end_time, break_minutes, hours)
SELECT
  'a0000008-0008-4008-8008-000000000001',
  'a0000007-0007-4007-8007-000000000003',
  CURRENT_DATE,
  '07:00',
  '15:30',
  30,
  8
WHERE NOT EXISTS (
  SELECT 1 FROM timesheet_entries
  WHERE timesheet_id = 'a0000007-0007-4007-8007-000000000003'
    AND work_date = CURRENT_DATE
);

-- Ensure SUBMITTED demo timesheet exists for supervisor signing
INSERT INTO timesheets (id, employee_id, customer_id, job_site_id, assignment_id, work_date, week_start_date, week_end_date, total_hours, notes, status) VALUES
('a0000007-0007-4007-8007-000000000002', 'a0000003-0003-4003-8003-000000000002', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000001', NULL, CURRENT_DATE, NULL, NULL, 32, NULL, 'SUBMITTED')
ON CONFLICT (id) DO NOTHING;

INSERT INTO timesheet_entries (id, timesheet_id, work_date, start_time, end_time, break_minutes, hours)
SELECT
  'a0000008-0008-4008-8008-000000000002',
  'a0000007-0007-4007-8007-000000000002',
  CURRENT_DATE,
  '06:00',
  '14:00',
  30,
  7.5
WHERE NOT EXISTS (
  SELECT 1 FROM timesheet_entries
  WHERE timesheet_id = 'a0000007-0007-4007-8007-000000000002'
);
