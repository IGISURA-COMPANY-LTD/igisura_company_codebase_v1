import { prisma } from '../app';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv'
dotenv.config
async function createAdmin() {
    const password = process.env.ADMIN_PASSWORD
  const hashedPassword = await bcrypt.hash(password, 12);
  
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });
  
  console.log('Admin user created successfully');
}

createAdmin().catch(console.error);