/**
 * Database Connection Utility
 * Handles connection pooling and query execution
 */

import { Pool, PoolClient } from 'pg';
import { getConnectionString } from './config';

let pool: Pool | null = null;

/**
 * Get or create database connection pool
 * Uses DATABASE_URL if available, otherwise builds from individual config
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = getConnectionString();
    
    // Parse connection string to extract components
    const url = new URL(connectionString);
    const database = url.pathname.replace('/', '');
    
    // Debug: Log connection info (without password)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔌 Database Connection:', {
        host: url.hostname,
        port: url.port,
        database: database,
        usingDATABASE_URL: !!process.env.DATABASE_URL
      });
    }
    
    // For AWS RDS, we need SSL but can skip certificate validation
    // Remove sslmode from connection string if present to avoid conflicts
    const cleanConnectionString = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
    
    // Always use SSL for AWS RDS (detected by hostname)
    const isAWSRDS = url.hostname.includes('rds.amazonaws.com');
    const sslConfig = isAWSRDS 
      ? { 
          rejectUnauthorized: false, // Skip certificate validation for AWS RDS
        } 
      : false;

    pool = new Pool({
      connectionString: cleanConnectionString,
      ssl: sslConfig,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

/**
 * Execute a query with automatic connection management
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows as T[];
}

/**
 * Execute a query and return a single row
 */
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const results = await query<T>(text, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close all database connections
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
