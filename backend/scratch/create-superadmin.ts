import { createConnection } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

async function createSuperAdmin() {
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [join(__dirname, '../src/**/*.entity{.ts,.js}')],
    synchronize: false,
  });

  try {
    const email = 'admin@mol.ma';
    const password = 'password123';
    const fullName = 'Super Admin';
    const role = 'super_admin';

    console.log(`Checking if user ${email} exists...`);
    const userRepository = connection.getRepository('users');
    const existing = await userRepository.findOne({ where: { email } });

    if (existing) {
      console.log('User already exists. Updating role to super_admin...');
      await userRepository.update(existing.id, { role });
      console.log('Role updated successfully.');
    } else {
      console.log('Creating new super_admin user...');
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      await userRepository.insert({
        email,
        password: hashedPassword,
        fullName,
        role,
        isActive: true,
      });
      console.log(`Super Admin created!`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    }
  } catch (error) {
    console.error('Error creating Super Admin:', error.message);
  } finally {
    await connection.close();
  }
}

createSuperAdmin();
