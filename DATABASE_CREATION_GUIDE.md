# Create Database - Step by Step Guide

## Problem
The database `summitly-crm` doesn't exist yet in your RDS instance.

## Solution: Create the Database

### Step 1: Connect to Default Database

First, connect to the default `postgres` database (this always exists):

```bash
psql "postgresql://postgres:tw1AUBHNCtD9RBNv@summitly-crm-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/postgres"
```

### Step 2: Create Your Database

Once connected, run:

```sql
CREATE DATABASE "summitly-crm";
```

Then exit:
```sql
\q
```

### Step 3: Run the Migration

Now connect to your new database and run the migration:

```bash
psql "postgresql://postgres:tw1AUBHNCtD9RBNv@summitly-crm-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/summitly-crm" -f database/migrations/001_create_agents_table.sql
```

## Alternative: One-Line Command

You can also do it all in one command:

```bash
# Create database
psql "postgresql://postgres:tw1AUBHNCtD9RBNv@summitly-crm-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/postgres" -c 'CREATE DATABASE "summitly-crm";'

# Then run migration
psql "postgresql://postgres:tw1AUBHNCtD9RBNv@summitly-crm-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/summitly-crm" -f database/migrations/001_create_agents_table.sql
```

## Using a Database Client (Easier)

If you have pgAdmin, DBeaver, or another database client:

1. **Connect to your RDS instance** using:
   - Host: `summitly-crm-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com`
   - Port: `5432`
   - Username: `postgres`
   - Password: `tw1AUBHNCtD9RBNv`
   - Database: `postgres` (default)

2. **Create the database**:
   - Right-click "Databases" → "Create" → "Database"
   - Name: `summitly-crm`
   - Click "Save"

3. **Run the migration**:
   - Connect to the new `summitly-crm` database
   - Open and run `database/migrations/001_create_agents_table.sql`

## Verify Database Created

Check if it was created:

```bash
psql "postgresql://postgres:tw1AUBHNCtD9RBNv@summitly-crm-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/postgres" -c '\l'
```

You should see `summitly-crm` in the list.

## Update Your .env.local

Make sure your `.env.local` has:

```env
DATABASE_URL=postgresql://postgres:tw1AUBHNCtD9RBNv@summitly-crm-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/summitly-crm
```
