# Database Setup - Using DATABASE_URL (Recommended)

## ✅ Easiest Method: Use DATABASE_URL

You already have your database connection string set up! This is the **simplest and most standard** approach.

### Your Current Setup

Add this to your `.env.local` file:

```env
DATABASE_URL=postgresql://postgres:hwHdF2nV4dM75MC5vu@summitly-db-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/summitly
```

That's it! The application will automatically use this connection string.

### Why DATABASE_URL is Better

✅ **Simpler** - One variable instead of multiple  
✅ **Standard** - Used by Heroku, Vercel, Railway, and most platforms  
✅ **Less error-prone** - No need to match individual variables  
✅ **Already working** - You're already using this format  

### Alternative: Individual Variables (If Needed)

If you prefer separate variables, you can use:

```env
DB_HOST=summitly-db-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=summitly
DB_USER=postgres
DB_PASSWORD=hwHdF2nV4dM75MC5vu
DB_SSL=true
```

But **DATABASE_URL is recommended** - it's simpler and what you're already using!

## 🚀 Next Steps

1. **Add DATABASE_URL to `.env.local`**:
   ```env
   DATABASE_URL=postgresql://postgres:hwHdF2nV4dM75MC5vu@summitly-db-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/summitly
   ```

2. **Run the database migration**:
   ```bash
   psql "postgresql://postgres:hwHdF2nV4dM75MC5vu@summitly-db-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/summitly" -f database/migrations/001_create_agents_table.sql
   ```

3. **Start your app**:
   ```bash
   npm run dev
   ```

4. **Test the Agents module**:
   - Navigate to `/crm/agents-list`
   - Try creating, viewing, editing, and deleting agents

## 📝 Note

The code has been updated to automatically detect and use `DATABASE_URL` if available, with fallback to individual `DB_*` variables. This gives you flexibility while keeping it simple!
