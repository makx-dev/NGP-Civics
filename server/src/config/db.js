const mongoose = require('mongoose');
const { startMongoKeepAlive } = require('../utils/mongoPing');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Automatically start background keep-alive ping service to keep DB server awake
    startMongoKeepAlive();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  // eslint-disable-next-line no-console
  console.warn('MongoDB disconnected. Retrying connection when requested...');
});

mongoose.connection.on('reconnected', () => {
  // eslint-disable-next-line no-console
  console.log('MongoDB reconnected successfully.');
});

module.exports = connectDB;

