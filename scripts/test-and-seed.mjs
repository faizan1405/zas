// Quick MongoDB connection test and admin user setup
// Run: node scripts/test-and-seed.mjs
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env manually
const fs = await import('fs');
const path = join(__dirname, '..', '.env');
const envContent = fs.readFileSync(path, 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [key, ...valParts] = trimmed.split('=');
  if (key && valParts.length) {
    const val = valParts.join('=').replace(/^["']|["']$/g, '');
    envVars[key.trim()] = val.trim();
  }
}

const MONGODB_URI = envVars.MONGODB_URI;
const ADMIN_EMAIL = envVars.ADMIN_EMAIL;
const ADMIN_PASSWORD = envVars.ADMIN_PASSWORD;

console.log('Connecting to MongoDB...');
console.log('URI:', MONGODB_URI.replace(/\/\/.*@/, '//***@'));

try {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB!');
  console.log('Database:', mongoose.connection.db.databaseName);

  // Check existing admin user
  const existingAdmin = await mongoose.connection.db.collection('users').findOne({
    email: ADMIN_EMAIL,
    role: 'admin'
  });

  if (existingAdmin) {
    console.log('\n📋 Existing admin user found:');
    console.log('Email:', existingAdmin.email);
    console.log('Role:', existingAdmin.role);
    console.log('Has password:', !!existingAdmin.password);

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await mongoose.connection.db.collection('users').updateOne(
      { _id: existingAdmin._id },
      {
        $set: {
          password: hashedPassword,
          email: ADMIN_EMAIL.toLowerCase(),
          provider: 'credentials',
          role: 'admin'
        }
      }
    );
    console.log('✅ Admin password updated to match .env credentials');
  } else {
    console.log('\n➕ No admin user found. Creating one...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const result = await mongoose.connection.db.collection('users').insertOne({
      name: 'Admin User',
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      provider: 'credentials',
      role: 'admin',
      isBlocked: false,
      addresses: [],
      wishlist: [],
      createdAt: new Date()
    });
    console.log('✅ Admin user created! ID:', result.insertedId);
  }

  console.log('\n🎉 Setup complete!');
  console.log('  Email:', ADMIN_EMAIL);
  console.log('  Password:', ADMIN_PASSWORD);
  console.log('  URL: https://www.zassports.com/admin/login');

  await mongoose.disconnect();
  console.log('\n✅ Disconnected');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error);
  process.exit(1);
}
