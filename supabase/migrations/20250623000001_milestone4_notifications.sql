-- Milestone 4: SMTP settings, push device tokens, email delivery log

ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS smtp_host text,
  ADD COLUMN IF NOT EXISTS smtp_port int,
  ADD COLUMN IF NOT EXISTS smtp_user text,
  ADD COLUMN IF NOT EXISTS smtp_from_email text,
  ADD COLUMN IF NOT EXISTS smtp_from_name text,
  ADD COLUMN IF NOT EXISTS email_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS push_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE push_device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expo_push_token text NOT NULL,
  platform text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, expo_push_token)
);

CREATE INDEX idx_push_device_tokens_user_id ON push_device_tokens(user_id);
CREATE INDEX idx_push_device_tokens_employee_lookup ON push_device_tokens(user_id);

CREATE TABLE email_delivery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template text NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  error_message text,
  related_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_delivery_log_status ON email_delivery_log(status);
CREATE INDEX idx_email_delivery_log_created_at ON email_delivery_log(created_at DESC);

ALTER TABLE push_device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_delivery_log ENABLE ROW LEVEL SECURITY;

-- Users manage their own push tokens
CREATE POLICY push_tokens_self_select ON push_device_tokens
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = push_device_tokens.user_id AND u.auth_user_id = auth.uid())
  );

CREATE POLICY push_tokens_self_insert ON push_device_tokens
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = push_device_tokens.user_id AND u.auth_user_id = auth.uid())
  );

CREATE POLICY push_tokens_self_update ON push_device_tokens
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = push_device_tokens.user_id AND u.auth_user_id = auth.uid())
  );

CREATE POLICY push_tokens_self_delete ON push_device_tokens
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = push_device_tokens.user_id AND u.auth_user_id = auth.uid())
  );

CREATE POLICY push_tokens_admin ON push_device_tokens
  FOR ALL USING (public.is_admin());

-- Email log: admin only
CREATE POLICY email_delivery_log_admin ON email_delivery_log
  FOR ALL USING (public.is_admin());
