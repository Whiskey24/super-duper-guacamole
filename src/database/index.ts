import pgPromise from 'pg-promise';
import config from '../config';

// Initialize pg-promise and define its configuration
const pgp = pgPromise();

// Create the database connection
const db = pgp(config.database);

export async function queryDatabase(query: string, values?: any[]) {
  try {
    const result = await db.any(query, values);
    return result;
  } catch (error) {
    console.error('DB Error:', error);
    throw error;
  }
}