-- Migration: Create Agent Onboarding System Tables
-- This migration creates all tables needed for the agent onboarding workflow

-- ============================================
-- Agent Onboarding Main Table
-- ============================================
CREATE TABLE IF NOT EXISTS agent_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID UNIQUE NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Onboarding Status
  status VARCHAR(50) DEFAULT 'Invited' CHECK (status IN ('Invited', 'Onboarding Started', 'Profile Complete', 'Compliance Pending', 'Awaiting Approval', 'Active', 'Suspended', 'Terminated')),
  onboarding_started_at TIMESTAMP,
  completed_at TIMESTAMP,
  activated_at TIMESTAMP,
  activated_by VARCHAR(255),
  
  -- Invitation
  invitation_token VARCHAR(255) UNIQUE,
  invitation_sent_at TIMESTAMP,
  invitation_expires_at TIMESTAMP,
  invitation_accepted_at TIMESTAMP,
  invited_by VARCHAR(255),
  
  -- Role & Assignment
  role VARCHAR(50) CHECK (role IN ('Salesperson', 'Broker', 'Team Leader')),
  assigned_office VARCHAR(255),
  assigned_team VARCHAR(255),
  
  -- Profile Completion
  profile_completed BOOLEAN DEFAULT FALSE,
  profile_completed_at TIMESTAMP,
  
  -- Compliance Status
  compliance_status VARCHAR(50) CHECK (compliance_status IN ('Pending', 'In Review', 'Approved', 'Rejected')),
  compliance_completed_at TIMESTAMP,
  
  -- Training Status
  training_completed BOOLEAN DEFAULT FALSE,
  training_completed_at TIMESTAMP,
  
  -- Financial Setup
  financial_setup BOOLEAN DEFAULT FALSE,
  financial_approved_at TIMESTAMP,
  financial_approved_by VARCHAR(255),
  
  -- Admin Notes
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for agent_onboarding
CREATE INDEX IF NOT EXISTS idx_onboarding_agent_id ON agent_onboarding(agent_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON agent_onboarding(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_invitation_token ON agent_onboarding(invitation_token);
CREATE INDEX IF NOT EXISTS idx_onboarding_invitation_expires ON agent_onboarding(invitation_expires_at);

-- ============================================
-- Onboarding Checklist
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES agent_onboarding(id) ON DELETE CASCADE,
  
  step VARCHAR(100) NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  step_order INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  completed_by VARCHAR(255),
  
  -- Step-specific data (JSONB for flexibility)
  step_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for onboarding_checklist
CREATE INDEX IF NOT EXISTS idx_checklist_onboarding_id ON onboarding_checklist(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_checklist_step ON onboarding_checklist(step);
CREATE INDEX IF NOT EXISTS idx_checklist_completed ON onboarding_checklist(is_completed);

-- ============================================
-- Onboarding Documents
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES agent_onboarding(id) ON DELETE CASCADE,
  
  document_type VARCHAR(100) NOT NULL, -- RECO, E&O Insurance, FINTRAC, PIPEDA, Government ID, etc.
  document_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- Encrypted storage path
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Expiry & Compliance
  expiry_date DATE,
  is_expired BOOLEAN DEFAULT FALSE,
  is_required BOOLEAN DEFAULT TRUE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  status_changed_at TIMESTAMP,
  status_changed_by VARCHAR(255),
  
  -- Admin Review
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Version Control
  version INTEGER DEFAULT 1,
  previous_version UUID REFERENCES onboarding_documents(id),
  
  -- Upload Info
  uploaded_by VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  upload_ip VARCHAR(45),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for onboarding_documents
CREATE INDEX IF NOT EXISTS idx_documents_onboarding_id ON onboarding_documents(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON onboarding_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON onboarding_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_documents_status ON onboarding_documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_expired ON onboarding_documents(is_expired);

-- ============================================
-- Onboarding Agreements (E-Signatures)
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES agent_onboarding(id) ON DELETE CASCADE,
  
  agreement_type VARCHAR(100) NOT NULL, -- Independent Contractor, Brokerage Policies, Code of Ethics, AML Policy
  agreement_name VARCHAR(255) NOT NULL,
  
  -- Document Reference
  document_id UUID REFERENCES onboarding_documents(id),
  document_version VARCHAR(50),
  
  -- E-Signature
  signed_by VARCHAR(255),
  signed_at TIMESTAMP,
  signature_ip VARCHAR(45),
  signature_data JSONB, -- Signature image/data
  
  -- Status
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Signed', 'Expired')),
  is_required BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for onboarding_agreements
CREATE INDEX IF NOT EXISTS idx_agreements_onboarding_id ON onboarding_agreements(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_agreements_type ON onboarding_agreements(agreement_type);
CREATE INDEX IF NOT EXISTS idx_agreements_status ON onboarding_agreements(status);

-- ============================================
-- Onboarding Training
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES agent_onboarding(id) ON DELETE CASCADE,
  
  training_type VARCHAR(100) NOT NULL, -- Brokerage Policies, Compliance, CRM Usage, Marketing Guidelines
  training_name VARCHAR(255) NOT NULL,
  training_url VARCHAR(500),
  
  -- Completion
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  completed_by VARCHAR(255),
  
  -- Optional Quiz/Assessment
  quiz_score DECIMAL(5, 2),
  quiz_passed BOOLEAN,
  quiz_attempts INTEGER DEFAULT 0,
  
  -- Requirements
  is_required BOOLEAN DEFAULT TRUE,
  is_mandatory BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for onboarding_training
CREATE INDEX IF NOT EXISTS idx_training_onboarding_id ON onboarding_training(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_training_type ON onboarding_training(training_type);
CREATE INDEX IF NOT EXISTS idx_training_completed ON onboarding_training(is_completed);

-- ============================================
-- Onboarding Audit Log
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES agent_onboarding(id) ON DELETE CASCADE,
  
  action VARCHAR(100) NOT NULL, -- Action performed
  action_type VARCHAR(100) NOT NULL, -- status_change, document_upload, document_approval, etc.
  description TEXT,
  
  -- Actor
  performed_by VARCHAR(255),
  performed_by_role VARCHAR(50),
  ip_address VARCHAR(45),
  
  -- Changes
  old_value JSONB,
  new_value JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for onboarding_audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_onboarding_id ON onboarding_audit_logs(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_audit_action_type ON onboarding_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON onboarding_audit_logs(created_at);

-- ============================================
-- Update Trigger for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_agent_onboarding_updated_at BEFORE UPDATE ON agent_onboarding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_checklist_updated_at BEFORE UPDATE ON onboarding_checklist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_documents_updated_at BEFORE UPDATE ON onboarding_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_agreements_updated_at BEFORE UPDATE ON onboarding_agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_training_updated_at BEFORE UPDATE ON onboarding_training
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function to Check Document Expiry
-- ============================================
CREATE OR REPLACE FUNCTION check_document_expiry()
RETURNS void AS $$
BEGIN
  UPDATE onboarding_documents
  SET is_expired = TRUE, updated_at = CURRENT_TIMESTAMP
  WHERE expiry_date < CURRENT_DATE
    AND is_expired = FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments for Documentation
-- ============================================
COMMENT ON TABLE agent_onboarding IS 'Main onboarding record for each agent';
COMMENT ON TABLE onboarding_checklist IS 'Tracks completion of onboarding steps';
COMMENT ON TABLE onboarding_documents IS 'Stores compliance documents with expiry tracking';
COMMENT ON TABLE onboarding_agreements IS 'Tracks e-signed agreements';
COMMENT ON TABLE onboarding_training IS 'Tracks training completion';
COMMENT ON TABLE onboarding_audit_logs IS 'Complete audit trail of all onboarding actions';
