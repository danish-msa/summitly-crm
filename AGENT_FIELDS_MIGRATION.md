# Agent Module - New Fields Migration Guide

## ✅ New Fields Added

The Agent module now includes the following new fields:

### 1. License Information
- **License Number (RECO)**: String field for real estate license number
- **License Expiry Date**: Date field for license expiration tracking

### 2. Brokerage Information
- **Brokerage Start Date**: Date when agent started with the brokerage

### 3. Status
- Updated from `Active | Inactive` to `Active | Suspended | Terminated`

### 4. Team/Office Assignment
- **Team / Office**: String field for team or office assignment

### 5. Commission Split Configuration
- **Commission Percentage**: Number (0-100)
- **Split Structure**: String (e.g., "50/50", "60/40", "Tiered")
- **Commission Notes**: Text field for additional details
- Stored as JSONB in database for flexibility

### 6. Banking Information (Secured)
- **Account Holder Name**: String
- **Bank Name**: String
- **Account Number**: String (should be encrypted in production)
- **Routing Number**: String (should be encrypted in production)
- **Account Type**: "Checking" | "Savings"
- Stored as JSONB in database
- ⚠️ **Note**: Currently stored as plain JSON. For production, implement encryption at the application level.

### 7. Emergency Contact
- **Name**: String (required)
- **Phone**: String (required)
- **Relationship**: String (required)
- **Email**: String (optional)
- Stored as JSONB in database

### 8. Internal Notes
- **Notes**: Text field for internal comments/notes
- Only visible to internal staff

## 📋 Database Migration

### Step 1: Run the Migration SQL

Execute the migration script to add the new columns:

```bash
psql "postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/summitly-crm?sslmode=require" -f database/migrations/002_add_agent_specific_fields.sql
```

Or manually run the SQL in your database client.

### Step 2: Verify Migration

Check that all columns were added:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'agents' 
AND column_name IN (
  'license_number', 
  'license_expiry_date', 
  'brokerage_start_date', 
  'team_office', 
  'commission_split', 
  'banking_info', 
  'emergency_contact', 
  'notes'
);
```

## 🔄 Code Changes Made

### 1. Prisma Schema (`prisma/schema.prisma`)
- Added all new fields to the Agent model
- Updated status field documentation

### 2. TypeScript Interface (`src/core/data/interface/agent.interface.ts`)
- Updated `status` type to include "Suspended" and "Terminated"
- Added all new field definitions with proper types

### 3. API Routes
- **POST `/api/agents`**: Updated to accept new fields
- **PUT `/api/agents/[id]`**: Updated to accept new fields

### 4. Modal Forms
- **Add Agent Modal**: Added accordion sections for all new fields
- **Edit Agent Modal**: Needs to be updated (see TODO below)

### 5. Select Options (`src/core/json/selectOption.ts`)
- Added `AgentStatus` array with new status options

## 🚀 Next Steps

1. **Run the database migration** (see Step 1 above)
2. **Update Edit Modal**: Add the same fields to `modalAgentsDetails.tsx`
3. **Update List/Grid Views**: Display relevant new fields (license number, status, team)
4. **Add Encryption**: Implement encryption for banking information in production
5. **Add Validation**: Add form validation for required fields
6. **Add Filters**: Add filters for status, team, license expiry date

## 🔒 Security Considerations

### Banking Information
- Currently stored as plain JSONB
- **For Production**: 
  - Implement field-level encryption before storing
  - Use environment variables for encryption keys
  - Consider using a service like AWS KMS or similar
  - Never log banking information
  - Restrict access to banking fields in API responses

### Emergency Contact
- Consider if this should also be encrypted
- Ensure proper access controls

## 📝 Field Usage Examples

### Commission Split
```json
{
  "percentage": 50,
  "structure": "50/50",
  "notes": "Standard split for new agents"
}
```

### Banking Info
```json
{
  "accountHolderName": "John Doe",
  "bankName": "TD Bank",
  "accountNumber": "1234567890",
  "routingNumber": "021000021",
  "accountType": "Checking"
}
```

### Emergency Contact
```json
{
  "name": "Jane Doe",
  "phone": "+1-555-123-4567",
  "relationship": "Spouse",
  "email": "jane@example.com"
}
```

## ⚠️ Important Notes

1. **Backward Compatibility**: Existing agents with status "Inactive" will still work, but new agents should use the new status options.

2. **Data Migration**: If you have existing agents, you may want to:
   - Update "Inactive" status to "Terminated" if appropriate
   - Populate team/office assignments
   - Add license information

3. **Required Fields**: 
   - Emergency contact name, phone, and relationship are marked as required in the form
   - License number and dates are optional
   - Banking info is optional

4. **Date Formats**: All dates should be in ISO format (YYYY-MM-DD) when sent to the API.
