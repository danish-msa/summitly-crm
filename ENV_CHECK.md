# Environment Variable Check

## Issue
The error shows it's looking for `summitly_crm` but your database is `summitly-crm`.

## Solution

### 1. Make sure your `.env.local` file exists and has:

```env
DATABASE_URL=postgresql://postgres:tw1AUBHNCtD9RBNv@summitly-crm-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/summitly-crm
```

**Important**: 
- File must be named `.env.local` (not `.env`)
- Must be in the **root** of your project (same level as `package.json`)
- No spaces around the `=` sign
- Restart your dev server after adding/changing it

### 2. Restart Your Dev Server

After adding/updating `.env.local`:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Verify It's Loading

Add this temporarily to see if it's loading:

In `src/core/database/db.ts`, you can add a console.log (temporarily):

```typescript
export function getPool(): Pool {
  if (!pool) {
    const connectionString = getConnectionString();
    console.log('Database URL:', connectionString.substring(0, 50) + '...'); // Don't log full password!
    
    // ... rest of code
  }
}
```

### 4. Alternative: Use Individual Variables

If DATABASE_URL isn't working, you can use:

```env
DB_HOST=summitly-crm-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=summitly-crm
DB_USER=postgres
DB_PASSWORD=tw1AUBHNCtD9RBNv
DB_SSL=true
```

But DATABASE_URL is simpler and recommended.

## Common Issues

1. **File location**: `.env.local` must be in project root
2. **File name**: Must be exactly `.env.local` (not `.env.local.txt`)
3. **Server restart**: Must restart `npm run dev` after changes
4. **Spaces**: No spaces around `=` in `.env.local`
5. **Quotes**: Don't wrap values in quotes unless needed
