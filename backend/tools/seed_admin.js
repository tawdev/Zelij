const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'droguerie_db',
  });

  try {
    const email = 'admin@moltrotinnette.com';
    const plainPassword = 'password';
    
    // Hash password (assuming nestjs default bcrypt salt rounds, usually 10)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const [existing] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('Admin user already exists. Updating password...');
      await connection.execute(
        'UPDATE users SET password = ?, role = "admin" WHERE email = ?',
        [hashedPassword, email]
      );
    } else {
      console.log('Creating new admin user...');
      await connection.execute(
        'INSERT INTO users (email, password, full_name, role, isActive) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, 'Admin Moltrotinnette', 'admin', 1]
      );
    }

    console.log('Admin user created/updated successfully!');
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    await connection.end();
  }
}

seedAdmin();
