/**
 * Database Configuration for AWS RDS
 * 
 * Supports both DATABASE_URL (recommended) and individual DB_* variables
 */

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  connectionTimeout?: number;
}

/**
 * Get database connection string
 * Priority: DATABASE_URL > Individual DB_* variables
 */
export const getConnectionString = (): string => {
  // Method 1: Use DATABASE_URL if available (easiest and most common)
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Method 2: Build from individual variables (fallback)
  const config = getDatabaseConfig();
  return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}${config.ssl ? "?sslmode=require" : ""}`;
};

/**
 * Get database configuration from environment variables
 * Only used if DATABASE_URL is not provided
 */
export const getDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "summitly-crm",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    ssl: process.env.DB_SSL === "true" || false,
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || "10000"),
  };
};
