-- MC Labor Sources schema (snake_case, Supabase-native)

CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR', 'WORKER', 'CUSTOMER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE employee_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE customer_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE job_site_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE assignment_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE attendance_status AS ENUM ('CLOCKED_IN', 'CLOCKED_OUT', 'PENDING_REVIEW');
CREATE TYPE job_order_status AS ENUM ('DRAFT', 'SENT', 'ACKNOWLEDGED', 'COMPLETED', 'CANCELLED');
CREATE TYPE timesheet_status AS ENUM ('DRAFT', 'SUBMITTED', 'SIGNED', 'SENT', 'APPROVED');
CREATE TYPE document_category AS ENUM ('SAFETY', 'HANDBOOK', 'SITE_INSTRUCTION', 'COMPANY_FORM', 'OTHER');
CREATE TYPE safety_audience AS ENUM ('ALL_EMPLOYEES', 'SPECIFIC_JOB_SITE', 'SPECIFIC_WORKERS');
CREATE TYPE notification_type AS ENUM ('JOB_ORDER', 'SAFETY', 'ATTENDANCE', 'SYSTEM', 'EMERGENCY');

CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  position text,
  hourly_rate numeric(10, 2),
  status employee_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  office_email text,
  address text,
  status customer_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  role user_role NOT NULL,
  status user_status NOT NULL DEFAULT 'ACTIVE',
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE job_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  city text,
  state text,
  zip_code text,
  foreman_name text,
  foreman_phone text,
  foreman_email text,
  status job_site_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE supervisor_job_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_site_id uuid NOT NULL REFERENCES job_sites(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_site_id)
);

CREATE TABLE job_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  job_site_id uuid NOT NULL REFERENCES job_sites(id) ON DELETE CASCADE,
  assigned_date date NOT NULL,
  start_time text,
  end_time text,
  status assignment_status NOT NULL DEFAULT 'PENDING',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE attendance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  job_site_id uuid NOT NULL REFERENCES job_sites(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES job_assignments(id) ON DELETE SET NULL,
  clock_in_time timestamptz NOT NULL,
  clock_out_time timestamptz,
  clock_in_latitude numeric(10, 7),
  clock_in_longitude numeric(10, 7),
  clock_out_latitude numeric(10, 7),
  clock_out_longitude numeric(10, 7),
  total_hours numeric(5, 2),
  status attendance_status NOT NULL DEFAULT 'CLOCKED_IN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE job_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  job_site_id uuid NOT NULL REFERENCES job_sites(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  start_time text,
  required_position text,
  instructions text,
  safety_notes text,
  status job_order_status NOT NULL DEFAULT 'DRAFT',
  sent_at timestamptz,
  acknowledged_at timestamptz,
  created_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  job_site_id uuid NOT NULL REFERENCES job_sites(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES job_assignments(id) ON DELETE SET NULL,
  work_date date,
  week_start_date date,
  week_end_date date,
  total_hours numeric(5, 2) NOT NULL,
  notes text,
  status timesheet_status NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE timesheet_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id uuid NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
  work_date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  break_minutes int NOT NULL DEFAULT 0,
  hours numeric(5, 2) NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE timesheet_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id uuid NOT NULL UNIQUE REFERENCES timesheets(id) ON DELETE CASCADE,
  foreman_name text NOT NULL,
  foreman_email text,
  signature_image_url text NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now(),
  sent_to_customer_office boolean NOT NULL DEFAULT false,
  sent_to_mc_labor_office boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  category document_category NOT NULL,
  uploaded_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE safety_bulletins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  file_url text,
  audience safety_audience NOT NULL,
  job_site_id uuid REFERENCES job_sites(id) ON DELETE SET NULL,
  sent_at timestamptz,
  created_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type notification_type NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  office_email text,
  dashboard_subdomain text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_customer_id ON users(customer_id);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_job_sites_customer_id ON job_sites(customer_id);
CREATE INDEX idx_job_assignments_employee_id ON job_assignments(employee_id);
CREATE INDEX idx_job_assignments_customer_id ON job_assignments(customer_id);
CREATE INDEX idx_attendance_logs_clock_in ON attendance_logs(clock_in_time);
CREATE INDEX idx_attendance_logs_customer_id ON attendance_logs(customer_id);
