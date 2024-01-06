import pgPromise from 'pg-promise';
import fs from 'fs';
import path from 'path';

// Initialize pg-promise and define its configuration
const pgp = pgPromise();

const configPath = path.join(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Create the database connection
const db = pgp(config);

export async function queryDatabase(query: string, values?: any[]) {
  try {
    const result = await db.any(query, values);
    return result;
  } catch (error) {
    console.error('DB Error:', error);
    throw error;
  }
}