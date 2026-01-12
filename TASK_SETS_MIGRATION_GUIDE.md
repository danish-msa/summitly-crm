# Task Sets Migration Guide

## 📋 Overview

This guide explains how to run the database migration for the new **Task Sets** feature, which allows you to group multiple task templates into sets and assign them to agents.

## 🚀 Step-by-Step Instructions

### Option 1: Using psql Command Line (Recommended)

1. **Get your database connection string** from `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:password@host:5432/summitly
   ```

2. **Run the migration** using psql:
   ```bash
   psql "postgresql://postgres:your_password@your_host:5432/summitly" -f database/migrations/005_create_task_sets_tables.sql
   ```

   **Example** (replace with your actual credentials):
   ```bash
   psql "postgresql://postgres:hwHdF2nV4dM75MC5vu@summitly-db-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/summitly" -f database/migrations/005_create_task_sets_tables.sql
   ```

### Option 2: Using a Database Client (pgAdmin, DBeaver, etc.)

1. **Connect to your database** using your database client
2. **Open the migration file**: `database/migrations/005_create_task_sets_tables.sql`
3. **Copy and paste** the entire SQL content into your database client
4. **Execute** the SQL script

### Option 3: Using psql with Connection String from .env.local

If you have your `DATABASE_URL` in `.env.local`, you can use:

```bash
# Windows PowerShell
$env:DATABASE_URL = Get-Content .env.local | Select-String "DATABASE_URL" | ForEach-Object { $_.Line -replace "DATABASE_URL=", "" }
psql $env:DATABASE_URL -f database/migrations/005_create_task_sets_tables.sql

# Linux/Mac
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2)
psql "$DATABASE_URL" -f database/migrations/005_create_task_sets_tables.sql
```

## ✅ Step 2: Generate Prisma Client

After running the migration, you need to regenerate the Prisma client to include the new TaskSet models:

```bash
npx prisma generate
```

This will update the Prisma client with the new `TaskSet` and `TaskSetTemplate` models.

## 🔍 Verify the Migration

After running the migration, verify that the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('task_sets', 'task_set_templates');

-- Check if default task sets were created
SELECT * FROM task_sets;

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('task_sets', 'task_set_templates');
```

## 📝 What the Migration Creates

1. **`task_sets` table** - Stores task set definitions
2. **`task_set_templates` table** - Join table linking task sets to task templates (many-to-many)
3. **Indexes** - For performance optimization
4. **Triggers** - For automatic `updated_at` timestamp updates
5. **Default Task Sets** - Three sample task sets:
   - Onboarding Set
   - Compliance Set
   - Training Set

## 🎯 Next Steps

After running the migration:

1. ✅ **Migration complete** - Tables are created
2. ✅ **Prisma client generated** - TypeScript types are available
3. 🔄 **Restart your dev server** (if running):
   ```bash
   npm run dev
   ```
4. 🧪 **Test the API endpoints**:
   - `GET /api/tasks/sets` - List all task sets
   - `POST /api/tasks/sets` - Create a new task set
   - `GET /api/tasks/sets/[id]` - Get a specific task set

## ⚠️ Troubleshooting

### Error: "relation already exists"
If you see this error, the tables might already exist. You can:
- Skip the migration if tables already exist
- Or drop and recreate (⚠️ **WARNING**: This will delete data):
  ```sql
  DROP TABLE IF EXISTS task_set_templates CASCADE;
  DROP TABLE IF EXISTS task_sets CASCADE;
  ```
  Then run the migration again.

### Error: "permission denied"
Make sure your database user has CREATE TABLE permissions.

### Error: "connection refused"
- Check your `DATABASE_URL` is correct
- Verify your database is running
- Check firewall/security group settings for RDS

## 📚 Related Files

- **Migration SQL**: `database/migrations/005_create_task_sets_tables.sql`
- **Prisma Schema**: `prisma/schema.prisma` (TaskSet models)
- **API Routes**: 
  - `src/app/api/tasks/sets/route.ts`
  - `src/app/api/tasks/sets/[id]/route.ts`
  - `src/app/api/tasks/sets/[id]/assign/route.ts`
- **Service Functions**: `src/core/services/tasks.service.ts`
- **Interfaces**: `src/core/data/interface/task.interface.ts`

## 🎉 Success!

Once the migration is complete and Prisma client is generated, you can:
- Create task sets via API
- Add multiple task templates to sets
- Assign entire task sets to agents
- Manage task sets through the UI (when implemented)
