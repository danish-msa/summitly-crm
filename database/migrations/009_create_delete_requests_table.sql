-- Migration: Create Delete Requests Table
-- Description: Creates delete_requests table for user account deletion requests

CREATE TABLE IF NOT EXISTS delete_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(255),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for delete_requests
CREATE INDEX IF NOT EXISTS idx_delete_requests_user_id ON delete_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_delete_requests_status ON delete_requests(status);
CREATE INDEX IF NOT EXISTS idx_delete_requests_requested_at ON delete_requests(requested_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION trigger_update_delete_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_delete_requests_updated_at ON delete_requests;
CREATE TRIGGER trigger_update_delete_requests_updated_at
  BEFORE UPDATE ON delete_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_delete_requests_updated_at();
