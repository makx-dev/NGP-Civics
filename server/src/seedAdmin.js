require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

async function seedAdmin() {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'NGP Civics Authority';
  const department = process.env.ADMIN_DEPARTMENT || 'Authority';

  if (!email || !password) {
    console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be configured in your environment/.env file.');
    console.error('Example: ADMIN_EMAIL=admin@nmcnagpur.gov.in ADMIN_PASSWORD=your-secure-password node src/seedAdmin.js');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Error: ADMIN_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Admin already exists for ${email}`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({
    name,
    email,
    passwordHash,
    department,
  });

  console.log(`Successfully seeded admin: ${email}`);
  process.exit(0);
}

seedAdmin().catch(async (err) => {
  console.error('Admin seeding failed:', err);
  process.exit(1);
});

