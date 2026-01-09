# How to Get AWS RDS DB_USER and DB_PASSWORD

## Method 1: Check AWS RDS Console (If You Set Them During Creation)

1. **Go to AWS RDS Console**:
   - Log in to AWS Console
   - Navigate to **RDS** service
   - Click on **Databases** in the left sidebar
   - Find your database instance (db.t3.medium)

2. **View Master Username**:
   - Click on your database instance
   - Look at the **Configuration** tab
   - Find **Master username** - this is your `DB_USER`
   - Common defaults:
     - **PostgreSQL**: `postgres`
     - **MySQL**: `admin` (or what you set during creation)

3. **Get Password**:
   - If you set a password during creation, you should have saved it
   - If you used AWS Secrets Manager, follow Method 2 below
   - If you forgot it, you'll need to reset it (Method 3)

## Method 2: Using AWS Secrets Manager (If Enabled)

If you enabled Secrets Manager during RDS creation:

1. Go to **AWS Secrets Manager** console
2. Find the secret associated with your RDS instance
3. Click **Retrieve secret value**
4. You'll see both username and password there

## Method 3: Reset Master Password (If You Forgot)

1. **In RDS Console**:
   - Select your database instance
   - Click **Modify**
   - Scroll to **Settings** section
   - Find **Master password**
   - Click **Change master password**
   - Enter a new password (save it securely!)
   - Click **Continue**
   - Choose **Apply immediately** or schedule for maintenance window
   - Click **Modify DB instance**

2. **Wait for modification to complete** (usually a few minutes)

3. **Update your .env.local** with the new password

## Method 4: Check Your Notes/Password Manager

- Check where you saved credentials during RDS creation
- Check AWS CloudFormation stack if created via template
- Check any documentation or notes you made

## Default Usernames by Database Engine

- **PostgreSQL**: Usually `postgres` (unless you changed it)
- **MySQL/MariaDB**: Usually `admin` (unless you changed it)
- **SQL Server**: Usually `admin` (unless you changed it)

## Important Notes

⚠️ **Security Best Practices**:
- Never commit `.env.local` to version control
- Use strong passwords (at least 16 characters, mixed case, numbers, symbols)
- Consider using AWS Secrets Manager for production
- Rotate passwords regularly

## Your .env.local Should Look Like:

```env
# Database Configuration
DB_HOST=your-db-instance.xxxxx.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=summitly_crm
DB_USER=postgres  # or admin, or your custom username
DB_PASSWORD=your_secure_password_here
DB_SSL=true
DB_CONNECTION_TIMEOUT=10000
```

## Next Steps After Getting Credentials

1. Add credentials to `.env.local`
2. Test connection (you may need to install database client library)
3. Create the database schema
4. Update your application to use the database
