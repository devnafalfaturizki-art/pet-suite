-- Add read_at tracking for notifications
ALTER TABLE IF EXISTS notifications_log
ADD COLUMN IF NOT EXISTS read_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_notifications_log_read_at
ON notifications_log(read_at)
WHERE read_at IS NULL;
