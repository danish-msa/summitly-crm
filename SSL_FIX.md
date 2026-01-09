# Fix SSL Connection Error

## Problem
Error: "no pg_hba.conf entry for host ..., no encryption"

This means AWS RDS requires SSL encryption, but your connection isn't using it.

## Solution

Add `?sslmode=require` to the end of your DATABASE_URL in `.env.local`:

### Before:
```env
DATABASE_URL=postgresql://postgres:tw1AUBHNCtD9RBNv@summitly-crm-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/summitly-crm
```

### After:
```env
DATABASE_URL=postgresql://postgres:tw1AUBHNCtD9RBNv@summitly-crm-instance-1.cz6ky2oakyaf.ca-central-1.rds.amazonaws.com:5432/summitly-crm?sslmode=require
```

## Steps

1. **Update `.env.local`** - Add `?sslmode=require` at the end
2. **Restart dev server** - Stop (Ctrl+C) and run `npm run dev` again
3. **Test** - Try accessing `/crm/agents-list` again

## Why This Happens

AWS RDS PostgreSQL instances require SSL connections by default for security. The `sslmode=require` parameter tells PostgreSQL to use SSL encryption.

## Alternative SSL Modes

- `sslmode=require` - Requires SSL (recommended for AWS RDS)
- `sslmode=prefer` - Prefers SSL but allows non-SSL
- `sslmode=disable` - No SSL (not recommended, won't work with AWS RDS)
