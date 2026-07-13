require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');

const defaultCategories = [
  'Road Damage (Potholes)',
  'Streetlights',
  'Garbage',
  'Water Leakage',
  'Public Washroom Hygeine',
  'Drainage',
  'Traffic Signal',
  'Spitting',
  'Public Property Damage',
  'Animal Wellfare',
  'Encroachment',
  'Others',
];

const seed = async () => {
  await connectDB();

  await Promise.all(
    defaultCategories.map((name) =>
      Category.updateOne(
        { name },
        { $setOnInsert: { name, description: `${name} related civic issues` } },
        { upsert: true }
      )
    )
  );

  // eslint-disable-next-line no-console
  console.log('Default categories seeded successfully.');
  await mongoose.connection.close();
};

seed().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
