-- Milestone 2: worker job order acknowledge, notification read, storage policies

-- Workers can acknowledge assigned job orders
CREATE POLICY job_orders_worker_ack ON job_orders
  FOR UPDATE
  USING (public.get_my_role() = 'WORKER' AND employee_id = public.get_my_employee_id())
  WITH CHECK (status = 'ACKNOWLEDGED');

-- Users can mark their own notifications as read
CREATE POLICY notifications_self_update ON notifications
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = notifications.user_id AND u.auth_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.employee_id = notifications.employee_id AND u.auth_user_id = auth.uid())
  );

-- Ensure storage buckets exist (public read for MVP demo)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('documents', 'documents', true),
  ('signatures', 'signatures', true),
  ('safety-bulletins', 'safety-bulletins', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Authenticated users can upload to buckets
CREATE POLICY storage_authenticated_upload ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('documents', 'signatures', 'safety-bulletins'));

-- Public read for MVP (buckets marked public)
CREATE POLICY storage_public_read ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id IN ('documents', 'signatures', 'safety-bulletins'));

-- Admins can delete storage objects
CREATE POLICY storage_admin_delete ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('documents', 'signatures', 'safety-bulletins')
    AND public.is_admin()
  );
