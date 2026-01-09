# Agents Module Setup - Summary

## ✅ Completed Setup

### 1. Database Configuration
- **File**: `src/core/database/config.ts`
- **Purpose**: Database connection configuration for AWS RDS
- **Environment Variables Needed**:
  - `DB_HOST` - Your AWS RDS endpoint
  - `DB_PORT` - Database port (default: 5432 for PostgreSQL)
  - `DB_NAME` - Database name
  - `DB_USER` - Database username
  - `DB_PASSWORD` - Database password
  - `DB_SSL` - Set to "true" for AWS RDS

### 2. Agent Interface & Types
- **File**: `src/core/data/interface/agent.interface.ts`
- **Purpose**: TypeScript interfaces for Agent data structure
- **Note**: Includes all Contact fields plus extensible structure for custom fields

### 3. Sample Data
- **File**: `src/core/json/agentsListData.ts`
- **Purpose**: Sample data for testing (will be replaced with database queries)

### 4. Routes Added
- `/crm/agents-list` - Agents list view
- `/crm/agents-grid` - Agents grid view
- `/crm/agents-details` - Agent details view

### 5. Pages Created
- `src/app/(feature-module)/(crm)/crm/agents-list/page.tsx`
- `src/app/(feature-module)/(crm)/crm/agents-details/page.tsx`
- `src/app/(feature-module)/(crm)/crm/agents-grid/page.tsx`

### 6. Components Created
- `src/components/Pages/crm-module/agents/agentsList.tsx` - List view component
- `src/components/Pages/crm-module/agents/agentsDetails.tsx` - Details view component
- `src/components/Pages/crm-module/agents/agents.tsx` - Grid view component
- `src/components/Pages/crm-module/agents/modals/modalAgents.tsx` - Add/Edit modal
- `src/components/Pages/crm-module/agents/modals/modalAgentsDetails.tsx` - Edit details modal

## 🔧 Next Steps

### 1. Database Setup (AWS RDS)

1. **Create AWS RDS Instance**:
   - Choose PostgreSQL or MySQL
   - Note the endpoint, port, and credentials
   - Ensure security group allows connections from your application

2. **Create Environment File**:
   - Create `.env.local` in the project root
   - Add your database credentials:
   ```env
   DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=summitly_crm
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_SSL=true
   DB_CONNECTION_TIMEOUT=10000
   ```

3. **Create Database Schema**:
   - You'll need to create the `agents` table in your database
   - The schema should match the `Agent` interface structure
   - Example SQL (PostgreSQL):
   ```sql
   CREATE TABLE agents (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     first_name VARCHAR(255) NOT NULL,
     last_name VARCHAR(255) NOT NULL,
     job_title VARCHAR(255),
     company_name VARCHAR(255),
     email VARCHAR(255) NOT NULL,
     email_opt_out BOOLEAN DEFAULT false,
     phone1 VARCHAR(50),
     phone2 VARCHAR(50),
     fax VARCHAR(50),
     status VARCHAR(20) DEFAULT 'Active',
     rating DECIMAL(3,2),
     image VARCHAR(500),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 2. Database Integration

You'll need to:
1. Install a database client library (e.g., `pg` for PostgreSQL or `mysql2` for MySQL)
2. Create API routes in Next.js to handle CRUD operations
3. Replace the sample data with actual database queries

### 3. Custom Fields

The Agent interface is designed to be extensible. You can add custom fields by:
1. Updating the `Agent` interface in `agent.interface.ts`
2. Adding the fields to your database schema
3. Updating the modal components to include form fields for new properties

## 📝 Notes

- All components follow the same structure as the Contact module
- The Agents module currently uses sample data from `agentsListData.ts`
- You can expand the modals to include all fields from the Contact module
- The interface is ready for additional custom fields as needed

## 🚀 Testing

1. Start the development server: `npm run dev`
2. Navigate to `/crm/agents-list` to see the agents list
3. Navigate to `/crm/agents-grid` to see the grid view
4. Click on an agent to see details at `/crm/agents-details`

## 📚 Related Files

- Contact module (reference): `src/components/Pages/crm-module/contacts/`
- Routes: `src/router/all_routes.tsx`
- Database config: `src/core/database/config.ts`
- Agent interface: `src/core/data/interface/agent.interface.ts`
