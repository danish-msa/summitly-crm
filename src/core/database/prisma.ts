/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client is created
 * Uses pg adapter for better performance and connection pooling with AWS RDS
 */

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const globalForPool = globalThis as unknown as {
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not defined in environment variables');
  throw new Error('DATABASE_URL is not defined');
}

// Ensure we strip sslmode from the connection string for the pg driver
// so it doesn't conflict with our explicit ssl config
let cleanConnectionString = connectionString;
try {
  const url = new URL(connectionString);
  url.searchParams.delete('sslmode');
  url.searchParams.delete('sslrootcert');
  url.searchParams.delete('sslcert');
  url.searchParams.delete('sslkey');
  cleanConnectionString = url.toString();
} catch (error) {
  console.warn('Failed to parse DATABASE_URL, using original string', error);
}

// AWS RDS Configuration
// We use the pg adapter for better performance and connection pooling
const pool =
  globalForPool.pool ??
  new Pool({
    connectionString: cleanConnectionString,
    // AWS RDS often requires SSL in production.
    // We bypass CA verification for RDS to avoid "unable to get local issuer certificate"
    ssl: { rejectUnauthorized: false },
    max: process.env.NODE_ENV === 'development' ? 10 : 20,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 20000,
    allowExitOnIdle: false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPool.pool = pool;
}

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
if (typeof window === 'undefined') {
  const cleanup = async () => {
    try {
      await prisma.$disconnect();
      await pool.end();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  // Handle process termination
  if (!process.listenerCount('SIGINT')) {
    process.on('SIGINT', cleanup);
  }
  if (!process.listenerCount('SIGTERM')) {
    process.on('SIGTERM', cleanup);
  }
}
