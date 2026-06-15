-- RLS helper functions (security definer)

CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_customer_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT customer_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_employee_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT employee_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid()
      AND role IN ('SUPER_ADMIN', 'ADMIN')
      AND status = 'ACTIVE'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_supervisor_of_job_site(p_job_site_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM supervisor_job_sites sjs
    JOIN users u ON u.id = sjs.user_id
    WHERE u.auth_user_id = auth.uid()
      AND sjs.job_site_id = p_job_site_id
      AND u.status = 'ACTIVE'
  );
$$;

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_job_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- users: read own profile; admins read all; update own
CREATE POLICY users_select ON users FOR SELECT USING (
  auth_user_id = auth.uid() OR public.is_admin()
);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY users_update ON users FOR UPDATE USING (
  auth_user_id = auth.uid() OR public.is_admin()
);
CREATE POLICY users_delete ON users FOR DELETE USING (public.is_admin());

-- employees
CREATE POLICY employees_admin ON employees FOR ALL USING (public.is_admin());
CREATE POLICY employees_customer_read ON employees FOR SELECT USING (
  public.get_my_role() = 'CUSTOMER'
  AND EXISTS (
    SELECT 1 FROM job_assignments ja
    WHERE ja.employee_id = employees.id
      AND ja.customer_id = public.get_my_customer_id()
  )
);
CREATE POLICY employees_worker_read ON employees FOR SELECT USING (
  public.get_my_role() = 'WORKER' AND employees.id = public.get_my_employee_id()
);
CREATE POLICY employees_supervisor_read ON employees FOR SELECT USING (
  public.get_my_role() = 'SUPERVISOR'
  AND EXISTS (
    SELECT 1 FROM job_assignments ja
    JOIN supervisor_job_sites sjs ON sjs.job_site_id = ja.job_site_id
    JOIN users u ON u.id = sjs.user_id
    WHERE ja.employee_id = employees.id AND u.auth_user_id = auth.uid()
  )
);

-- customers
CREATE POLICY customers_admin ON customers FOR ALL USING (public.is_admin());
CREATE POLICY customers_self_read ON customers FOR SELECT USING (
  public.get_my_role() = 'CUSTOMER' AND customers.id = public.get_my_customer_id()
);

-- job_sites
CREATE POLICY job_sites_admin ON job_sites FOR ALL USING (public.is_admin());
CREATE POLICY job_sites_customer ON job_sites FOR SELECT USING (
  public.get_my_role() = 'CUSTOMER' AND job_sites.customer_id = public.get_my_customer_id()
);
CREATE POLICY job_sites_supervisor ON job_sites FOR SELECT USING (
  public.is_supervisor_of_job_site(job_sites.id)
);
CREATE POLICY job_sites_worker ON job_sites FOR SELECT USING (
  public.get_my_role() = 'WORKER'
  AND EXISTS (
    SELECT 1 FROM job_assignments ja
    WHERE ja.job_site_id = job_sites.id AND ja.employee_id = public.get_my_employee_id()
  )
);

-- supervisor_job_sites
CREATE POLICY supervisor_job_sites_admin ON supervisor_job_sites FOR ALL USING (public.is_admin());
CREATE POLICY supervisor_job_sites_self ON supervisor_job_sites FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = supervisor_job_sites.user_id AND u.auth_user_id = auth.uid())
);

-- job_assignments
CREATE POLICY job_assignments_admin ON job_assignments FOR ALL USING (public.is_admin());
CREATE POLICY job_assignments_customer ON job_assignments FOR SELECT USING (
  public.get_my_role() = 'CUSTOMER' AND job_assignments.customer_id = public.get_my_customer_id()
);
CREATE POLICY job_assignments_supervisor ON job_assignments FOR SELECT USING (
  public.is_supervisor_of_job_site(job_assignments.job_site_id)
);
CREATE POLICY job_assignments_worker ON job_assignments FOR SELECT USING (
  public.get_my_role() = 'WORKER' AND job_assignments.employee_id = public.get_my_employee_id()
);

-- attendance_logs
CREATE POLICY attendance_admin ON attendance_logs FOR ALL USING (public.is_admin());
CREATE POLICY attendance_customer ON attendance_logs FOR SELECT USING (
  public.get_my_role() = 'CUSTOMER' AND attendance_logs.customer_id = public.get_my_customer_id()
);
CREATE POLICY attendance_supervisor ON attendance_logs FOR SELECT USING (
  public.is_supervisor_of_job_site(attendance_logs.job_site_id)
);
CREATE POLICY attendance_worker_read ON attendance_logs FOR SELECT USING (
  public.get_my_role() = 'WORKER' AND attendance_logs.employee_id = public.get_my_employee_id()
);
CREATE POLICY attendance_worker_write ON attendance_logs FOR INSERT WITH CHECK (
  public.get_my_role() = 'WORKER' AND attendance_logs.employee_id = public.get_my_employee_id()
);
CREATE POLICY attendance_worker_update ON attendance_logs FOR UPDATE USING (
  public.get_my_role() = 'WORKER' AND attendance_logs.employee_id = public.get_my_employee_id()
);

-- job_orders
CREATE POLICY job_orders_admin ON job_orders FOR ALL USING (public.is_admin());
CREATE POLICY job_orders_customer ON job_orders FOR SELECT USING (
  public.get_my_role() = 'CUSTOMER' AND job_orders.customer_id = public.get_my_customer_id()
);
CREATE POLICY job_orders_worker ON job_orders FOR SELECT USING (
  public.get_my_role() = 'WORKER' AND job_orders.employee_id = public.get_my_employee_id()
);

-- timesheets
CREATE POLICY timesheets_admin ON timesheets FOR ALL USING (public.is_admin());
CREATE POLICY timesheets_customer ON timesheets FOR SELECT USING (
  public.get_my_role() = 'CUSTOMER' AND timesheets.customer_id = public.get_my_customer_id()
);
CREATE POLICY timesheets_worker ON timesheets FOR SELECT USING (
  public.get_my_role() = 'WORKER' AND timesheets.employee_id = public.get_my_employee_id()
);

-- timesheet_entries (via timesheet access)
CREATE POLICY timesheet_entries_admin ON timesheet_entries FOR ALL USING (public.is_admin());
CREATE POLICY timesheet_entries_read ON timesheet_entries FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM timesheets t WHERE t.id = timesheet_entries.timesheet_id
    AND (
      public.is_admin()
      OR (public.get_my_role() = 'CUSTOMER' AND t.customer_id = public.get_my_customer_id())
      OR (public.get_my_role() = 'WORKER' AND t.employee_id = public.get_my_employee_id())
    )
  )
);

-- timesheet_signatures
CREATE POLICY timesheet_signatures_admin ON timesheet_signatures FOR ALL USING (public.is_admin());
CREATE POLICY timesheet_signatures_read ON timesheet_signatures FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM timesheets t WHERE t.id = timesheet_signatures.timesheet_id
    AND (
      public.is_admin()
      OR (public.get_my_role() = 'CUSTOMER' AND t.customer_id = public.get_my_customer_id())
    )
  )
);

-- documents
CREATE POLICY documents_admin ON documents FOR ALL USING (public.is_admin());
CREATE POLICY documents_read ON documents FOR SELECT USING (
  public.is_admin() OR auth.uid() IS NOT NULL
);

-- safety_bulletins
CREATE POLICY safety_bulletins_admin ON safety_bulletins FOR ALL USING (public.is_admin());
CREATE POLICY safety_bulletins_read ON safety_bulletins FOR SELECT USING (
  auth.uid() IS NOT NULL
);

-- notifications
CREATE POLICY notifications_admin ON notifications FOR ALL USING (public.is_admin());
CREATE POLICY notifications_self ON notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = notifications.user_id AND u.auth_user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM users u WHERE u.employee_id = notifications.employee_id AND u.auth_user_id = auth.uid())
);

-- company_settings
CREATE POLICY company_settings_admin ON company_settings FOR ALL USING (public.is_admin());
CREATE POLICY company_settings_read ON company_settings FOR SELECT USING (auth.uid() IS NOT NULL);
