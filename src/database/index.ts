/* TODO
import pgPromise from 'pg-promise';

// Initialize pg-promise and define its configuration
const pgp = pgPromise();

// Use environment variables for database connection configuration
const dbConfig = {
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT ? parseInt(process.env.RDS_PORT) : 3306,
  database: process.env.RDS_DATABASE,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
};

// Create the database connection
const db = pgp(dbConfig);

export async function queryDatabase(query: string, values?: any[]) {
  try {
    const result = await db.any(query, values);
    return result;
  } catch (error) {
    console.error('DB Error:', error);
    throw error;
  }
}
*/