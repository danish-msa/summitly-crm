-- Create agents table
-- Run this SQL script in your database to create the agents table

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255),
  company_name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  email_opt_out BOOLEAN DEFAULT false,
  phone1 VARCHAR(50),
  phone2 VARCHAR(50),
  fax VARCHAR(50),
  
  -- Location Information
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(255),
  country VARCHAR(255),
  zip_code VARCHAR(20),
  
  -- Additional Fields
  deals TEXT[], -- Array of deal IDs
  date_of_birth DATE,
  reviews DECIMAL(3,2),
  owner VARCHAR(255),
  tags TEXT[], -- Array of tags
  source VARCHAR(255),
  industry VARCHAR(255),
  currency VARCHAR(10),
  language VARCHAR(50),
  description TEXT,
  
  -- Status & Rating
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  rating DECIMAL(3,2),
  
  -- Image
  image VARCHAR(500),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
