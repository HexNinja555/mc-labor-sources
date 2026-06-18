-- Demo business data (users linked via scripts/seed-auth-users.mjs)

-- Fixed UUIDs for predictable references
-- Settings
INSERT INTO company_settings (id, company_name, office_email, dashboard_subdomain)
VALUES ('a0000001-0001-4001-8001-000000000001', 'MC Labor Sources', 'office@mclabor.demo', 'portal');

-- Customers
INSERT INTO customers (id, company_name, contact_name, contact_email, contact_phone, office_email, address, status) VALUES
('a0000002-0002-4002-8002-000000000001', 'Summit Construction LLC', 'James Rivera', 'james@summitconstruction.demo', '555-0101', 'office@summitconstruction.demo', '1200 Industrial Blvd, Houston, TX', 'ACTIVE'),
('a0000002-0002-4002-8002-000000000002', 'Gulf Coast Manufacturing', 'Sarah Mitchell', 'sarah@gulfcoast.demo', '555-0102', 'office@gulfcoast.demo', '4500 Port Road, Galveston, TX', 'ACTIVE');

-- Employees
INSERT INTO employees (id, first_name, last_name, email, phone, position, hourly_rate, status) VALUES
('a0000003-0003-4003-8003-000000000001', 'Marcus', 'Johnson', 'marcus.johnson@mclabor.demo', '555-1001', 'General Laborer', 18.50, 'ACTIVE'),
('a0000003-0003-4003-8003-000000000002', 'Elena', 'Garcia', 'elena.garcia@mclabor.demo', '555-1002', 'Welder', 24.00, 'ACTIVE'),
('a0000003-0003-4003-8003-000000000003', 'David', 'Chen', 'david.chen@mclabor.demo', '555-1003', 'Forklift Operator', 20.00, 'ACTIVE'),
('a0000003-0003-4003-8003-000000000004', 'Angela', 'Williams', 'angela.williams@mclabor.demo', '555-1004', 'Safety Coordinator', 22.50, 'ACTIVE'),
('a0000003-0003-4003-8003-000000000005', 'Robert', 'Taylor', 'robert.taylor@mclabor.demo', '555-1005', 'Pipefitter', 26.00, 'INACTIVE');

-- App users (auth_user_id set by seed-auth-users.mjs)
INSERT INTO users (id, name, email, role, status, customer_id, employee_id) VALUES
('a0000004-0004-4004-8004-000000000001', 'System Administrator', 'superadmin@mclabor.demo', 'SUPER_ADMIN', 'ACTIVE', NULL, NULL),
('a0000004-0004-4004-8004-000000000002', 'Admin User', 'admin@mclabor.demo', 'ADMIN', 'ACTIVE', NULL, NULL),
('a0000004-0004-4004-8004-000000000003', 'Site Supervisor', 'supervisor@mclabor.demo', 'SUPERVISOR', 'ACTIVE', NULL, NULL),
('a0000004-0004-4004-8004-000000000004', 'Summit Portal User', 'customer@mclabor.demo', 'CUSTOMER', 'ACTIVE', 'a0000002-0002-4002-8002-000000000001', NULL),
('a0000004-0004-4004-8004-000000000005', 'Marcus Johnson', 'worker@mclabor.demo', 'WORKER', 'ACTIVE', NULL, 'a0000003-0003-4003-8003-000000000001');

-- Job sites
INSERT INTO job_sites (id, customer_id, name, address, city, state, zip_code, foreman_name, foreman_phone, foreman_email, status) VALUES
('a0000005-0005-4005-8005-000000000001', 'a0000002-0002-4002-8002-000000000001', 'Summit Tower Project', '800 Main Street', 'Houston', 'TX', '77002', 'Mike Patterson', '555-2001', 'mike.patterson@summitconstruction.demo', 'ACTIVE'),
('a0000005-0005-4005-8005-000000000002', 'a0000002-0002-4002-8002-000000000001', 'Summit Warehouse Expansion', '2200 Commerce Drive', 'Pasadena', 'TX', '77502', 'Lisa Hammond', '555-2002', 'lisa.hammond@summitconstruction.demo', 'ACTIVE'),
('a0000005-0005-4005-8005-000000000003', 'a0000002-0002-4002-8002-000000000002', 'Gulf Coast Plant #3', '900 Refinery Lane', 'Texas City', 'TX', '77590', 'Tom Bradley', '555-2003', 'tom.bradley@gulfcoast.demo', 'ACTIVE');

INSERT INTO supervisor_job_sites (user_id, job_site_id) VALUES
('a0000004-0004-4004-8004-000000000003', 'a0000005-0005-4005-8005-000000000001'),
('a0000004-0004-4004-8004-000000000003', 'a0000005-0005-4005-8005-000000000002');

INSERT INTO job_assignments (id, employee_id, customer_id, job_site_id, assigned_date, start_time, status, notes) VALUES
('a0000006-0006-4006-8006-000000000001', 'a0000003-0003-4003-8003-000000000001', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000001', CURRENT_DATE, '06:00', 'ACTIVE', 'Primary crew assignment'),
('a0000006-0006-4006-8006-000000000002', 'a0000003-0003-4003-8003-000000000002', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000001', CURRENT_DATE, '06:00', 'ACTIVE', NULL),
('a0000006-0006-4006-8006-000000000003', 'a0000003-0003-4003-8003-000000000003', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000002', CURRENT_DATE, '07:00', 'ACTIVE', NULL),
('a0000006-0006-4006-8006-000000000004', 'a0000003-0003-4003-8003-000000000004', 'a0000002-0002-4002-8002-000000000002', 'a0000005-0005-4005-8005-000000000003', CURRENT_DATE, '06:30', 'ACTIVE', NULL),
('a0000006-0006-4006-8006-000000000005', 'a0000003-0003-4003-8003-000000000001', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000002', CURRENT_DATE - 7, NULL, 'COMPLETED', 'Previous week assignment'),
('a0000006-0006-4006-8006-000000000006', 'a0000003-0003-4003-8003-000000000002', 'a0000002-0002-4002-8002-000000000002', 'a0000005-0005-4005-8005-000000000003', CURRENT_DATE + 2, NULL, 'PENDING', 'Upcoming assignment');

INSERT INTO attendance_logs (employee_id, customer_id, job_site_id, assignment_id, clock_in_time, clock_out_time, clock_in_latitude, clock_in_longitude, clock_out_latitude, clock_out_longitude, total_hours, status) VALUES
('a0000003-0003-4003-8003-000000000001', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000001', 'a0000006-0006-4006-8006-000000000001', date_trunc('day', now()) + interval '6 hours', date_trunc('day', now()) + interval '14 hours 30 minutes', 29.7604, -95.3698, 29.7605, -95.3699, 8.5, 'CLOCKED_OUT'),
('a0000003-0003-4003-8003-000000000002', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000001', 'a0000006-0006-4006-8006-000000000002', date_trunc('day', now()) + interval '7 hours 15 minutes', NULL, 29.761, -95.37, NULL, NULL, NULL, 'CLOCKED_IN'),
('a0000003-0003-4003-8003-000000000003', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000002', 'a0000006-0006-4006-8006-000000000003', date_trunc('day', now()) + interval '7 hours 15 minutes', NULL, 29.69, -95.21, NULL, NULL, NULL, 'CLOCKED_IN'),
('a0000003-0003-4003-8003-000000000004', 'a0000002-0002-4002-8002-000000000002', 'a0000005-0005-4005-8005-000000000003', 'a0000006-0006-4006-8006-000000000004', date_trunc('day', now()) + interval '6 hours', date_trunc('day', now()) + interval '14 hours 30 minutes', NULL, NULL, NULL, NULL, 8.0, 'CLOCKED_OUT');

INSERT INTO job_orders (order_number, customer_id, job_site_id, employee_id, title, description, start_date, start_time, required_position, instructions, safety_notes, status, sent_at, acknowledged_at, created_by_id) VALUES
('JO-2026-001', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000001', 'a0000003-0003-4003-8003-000000000001', 'Steel Frame Assembly - Level 4', 'Assist with steel frame assembly on level 4 east wing', CURRENT_DATE, '06:00', 'General Laborer', 'Report to east gate. Bring hard hat and safety vest.', 'Fall protection required above 6 feet.', 'ACKNOWLEDGED', now(), now(), 'a0000004-0004-4004-8004-000000000002'),
('JO-2026-002', 'a0000002-0002-4002-8002-000000000002', 'a0000005-0005-4005-8005-000000000003', 'a0000003-0003-4003-8003-000000000004', 'Safety Walkthrough - Plant #3', 'Conduct morning safety walkthrough', CURRENT_DATE, '06:30', 'Safety Coordinator', 'Check all PPE stations and report hazards.', 'High-visibility vest required in plant area.', 'SENT', now(), NULL, 'a0000004-0004-4004-8004-000000000002');

INSERT INTO safety_bulletins (title, message, audience, job_site_id, sent_at, created_by_id) VALUES
('Heat Safety Advisory', 'Temperatures expected above 95°F this week. Take mandatory water breaks every hour.', 'ALL_EMPLOYEES', NULL, now(), 'a0000004-0004-4004-8004-000000000002'),
('Summit Tower - Crane Operations', 'Crane operations scheduled for Tuesday 6AM-2PM. Stay clear of swing radius.', 'SPECIFIC_JOB_SITE', 'a0000005-0005-4005-8005-000000000001', now(), 'a0000004-0004-4004-8004-000000000002');

INSERT INTO timesheets (id, employee_id, customer_id, job_site_id, assignment_id, work_date, week_start_date, week_end_date, total_hours, notes, status) VALUES
('a0000007-0007-4007-8007-000000000001', 'a0000003-0003-4003-8003-000000000001', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000001', 'a0000006-0006-4006-8006-000000000001', CURRENT_DATE, CURRENT_DATE - 6, CURRENT_DATE, 40, 'Regular week', 'SIGNED'),
('a0000007-0007-4007-8007-000000000002', 'a0000003-0003-4003-8003-000000000002', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000001', NULL, CURRENT_DATE, NULL, NULL, 32, NULL, 'SUBMITTED'),
('a0000007-0007-4007-8007-000000000003', 'a0000003-0003-4003-8003-000000000003', 'a0000002-0002-4002-8002-000000000001', 'a0000005-0005-4005-8005-000000000002', 'a0000006-0006-4006-8006-000000000003', CURRENT_DATE, NULL, NULL, 8, 'Warehouse shift', 'DRAFT');

INSERT INTO timesheet_entries (timesheet_id, work_date, start_time, end_time, break_minutes, hours) VALUES
('a0000007-0007-4007-8007-000000000001', CURRENT_DATE - 4, '06:00', '14:30', 30, 8),
('a0000007-0007-4007-8007-000000000001', CURRENT_DATE - 3, '06:00', '14:30', 30, 8),
('a0000007-0007-4007-8007-000000000002', CURRENT_DATE, '06:00', '14:00', 30, 7.5),
('a0000007-0007-4007-8007-000000000003', CURRENT_DATE, '07:00', '15:30', 30, 8);

INSERT INTO timesheet_signatures (timesheet_id, foreman_name, foreman_email, signature_image_url, sent_to_customer_office, sent_to_mc_labor_office) VALUES
('a0000007-0007-4007-8007-000000000001', 'Mike Patterson', 'mike.patterson@summitconstruction.demo', 'signatures/demo/demo-signature.png', true, false);

INSERT INTO documents (title, description, file_url, category, uploaded_by_id) VALUES
('Employee Safety Handbook 2026', 'Company-wide safety policies and procedures', 'documents/demo/safety-handbook.pdf', 'HANDBOOK', 'a0000004-0004-4004-8004-000000000002');

INSERT INTO notifications (user_id, employee_id, title, message, type) VALUES
(NULL, 'a0000003-0003-4003-8003-000000000001', 'Job Order: JO-2026-001', 'Steel Frame Assembly - Level 4', 'JOB_ORDER'),
('a0000004-0004-4004-8004-000000000004', NULL, 'Timesheet Signed', 'A timesheet has been signed for Summit Tower Project', 'SYSTEM'),
(NULL, 'a0000003-0003-4003-8003-000000000002', 'Heat Safety Advisory', 'Temperatures expected above 95°F this week.', 'SAFETY');
