const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/quizplatform';

const resolveMongoUri = () => (
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  (process.env.NODE_ENV !== 'production' ? DEFAULT_LOCAL_URI : '')
);

const connectDB = async () => {
  const mongoUri = resolveMongoUri();

  if (!mongoUri) {
    throw new Error('MongoDB URI is missing. Add MONGO_URI (or MONGODB_URI) in server/.env.');
  }

  const conn = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || '3000', 10),
    connectTimeoutMS: parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS || '3000', 10),
    socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS || '10000', 10),
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '10', 10),
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '1', 10),
    family: 4,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
