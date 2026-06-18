-- Safety bulletin worker targeting (SPECIFIC_WORKERS audience)

CREATE TABLE safety_bulletin_recipients (
  bulletin_id uuid NOT NULL REFERENCES safety_bulletins(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (bulletin_id, employee_id)
);

CREATE INDEX idx_safety_bulletin_recipients_employee ON safety_bulletin_recipients(employee_id);

ALTER TABLE safety_bulletin_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY safety_bulletin_recipients_admin ON safety_bulletin_recipients
  FOR ALL USING (public.is_admin());

CREATE POLICY safety_bulletin_recipients_read ON safety_bulletin_recipients
  FOR SELECT USING (auth.uid() IS NOT NULL);
