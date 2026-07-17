require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

const DEFAULT_ADMIN = {
  name: 'NGP Civics Authority',
  email: 'admin@nmcnagpur.gov.in',
  password: 'Admin@123',
  department: 'Authority',
};

async function seedAdmin() {
  await connectDB();

  const email = String(DEFAULT_ADMIN.email || '').toLowerCase().trim();
  if (!email) throw new Error('DEFAULT_ADMIN.email is missing');

  const existing = await Admin.findOne({ email });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Admin already exists for ${email}`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
  await Admin.create({
    name: DEFAULT_ADMIN.name,
    email,
    passwordHash,
    department: DEFAULT_ADMIN.department,
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded default admin: ${email}`);
  process.exit(0);
}

seedAdmin().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

