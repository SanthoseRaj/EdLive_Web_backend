import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Debug environment variables
console.log('PostgreSQL Connection Config:', {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
  maxConnections: process.env.PG_MAX_CONNECTIONS || 20
});

const { Pool } = pg;

// Connection pool configuration
const poolConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT) || 5432,
  max: parseInt(process.env.PG_MAX_CONNECTIONS) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  allowExitOnIdle: true,

  ssl: {
    rejectUnauthorized: false,
  },
};

// Create the connection pool
export const pool = new Pool(poolConfig);

// Event listeners for connection pool
pool.on('connect', () => {
  console.log('New client connected to the pool');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Optionally: implement reconnection logic here
});

pool.on('remove', () => {
  console.log('Client removed from the pool');
});

// Test connection function
export const connectDBpg = async () => {
  let client;
  try {
    client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('PostgreSQL Connected Successfully at:', res.rows[0].now);
    return true;
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
    throw error; // Re-throw to allow handling at higher level
  } finally {
    if (client) client.release();
  }
};

// Enhanced executeQuery function with transaction support
export const executeQuery = async (queryText, params = [], maxRetries = 3) => {
  let retries = 0;
  let lastError;
  
  while (retries < maxRetries) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(queryText, params);
      return result;
    } catch (error) {
      lastError = error;
      retries++;
      console.warn(`Query attempt ${retries} failed:`, error.message);
      
      if (retries === maxRetries) {
        throw new Error(`Query failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    } finally {
      if (client) client.release();
    }
  }
};

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('Starting graceful shutdown...');
  try {
    await pool.end();
    console.log('PostgreSQL connection pool has been closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default {
  pool,
  connectDBpg,
  executeQuery,
  query: pool.query.bind(pool) // Expose direct query method
};