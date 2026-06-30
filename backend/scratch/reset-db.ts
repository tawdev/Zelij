import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

async function resetDatabase() {
  // Connect without specifying a database to allow dropping it
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    // No database here
  });

  try {
    const dbName = process.env.DB_NAME || 'droguerie_db';
    console.log(`Attempting to reset database: ${dbName}`);
    
    // Drop and Recreate
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    console.log(`Dropped database ${dbName}`);
    
    await connection.query(`CREATE DATABASE \`${dbName}\``);
    console.log(`Created database ${dbName}`);
    
    console.log('Database reset complete. TypeORM will now be able to sync cleanly.');
  } catch (error) {
    console.error('Failed to reset database:', error.message);
  } finally {
    await connection.close();
  }
}

resetDatabase();
