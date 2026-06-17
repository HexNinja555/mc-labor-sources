-- GPS location labels for attendance (reverse geocoded city/state)
ALTER TABLE attendance_logs
  ADD COLUMN IF NOT EXISTS clock_in_location_label text,
  ADD COLUMN IF NOT EXISTS clock_out_location_label text;
