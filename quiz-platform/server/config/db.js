const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/quizplatform';
const DEFAULT_SERVER_SELECTION_TIMEOUT_MS = 10000;
const DEFAULT_CONNECT_TIMEOUT_MS = 10000;
const DEFAULT_SOCKET_TIMEOUT_MS = 45000;
const DEFAULT_RECONNECT_DELAY_MS = 5000;
const DEFAULT_WAIT_FOR_READY_MS = 5000;

let connectPromise = null;
let reconnectTimer = null;
let listenersBound = false;

const resolveMongoUri = () => (
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  (process.env.NODE_ENV !== 'production' ? DEFAULT_LOCAL_URI : '')
);

const toMs = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getMongoOptions = () => ({
  serverSelectionTimeoutMS: toMs(
    process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS,
    DEFAULT_SERVER_SELECTION_TIMEOUT_MS
  ),
  connectTimeoutMS: toMs(process.env.MONGO_CONNECT_TIMEOUT_MS, DEFAULT_CONNECT_TIMEOUT_MS),
  socketTimeoutMS: toMs(process.env.MONGO_SOCKET_TIMEOUT_MS, DEFAULT_SOCKET_TIMEOUT_MS),
  maxPoolSize: toMs(process.env.MONGO_MAX_POOL_SIZE, 10),
  minPoolSize: toMs(process.env.MONGO_MIN_POOL_SIZE, 1),
  family: 4,
});

const getReconnectDelayMs = () =>
  toMs(process.env.MONGO_RECONNECT_DELAY_MS, DEFAULT_RECONNECT_DELAY_MS);

const getWaitForReadyMs = () =>
  toMs(process.env.MONGO_WAIT_FOR_READY_MS, DEFAULT_WAIT_FOR_READY_MS);

const scheduleReconnect = () => {
  if (reconnectTimer) {
    return;
  }

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;

    try {
      await connectDB({ silent: true });
      console.log('MongoDB reconnect successful.');
    } catch (error) {
      console.error(`MongoDB reconnect failed: ${error.message}`);
      scheduleReconnect();
    }
  }, getReconnectDelayMs());
};

const bindConnectionListeners = () => {
  if (listenersBound) {
    return;
  }

  listenersBound = true;

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Retrying connection...');
    scheduleReconnect();
  });

  mongoose.connection.on('error', (error) => {
    console.error(`MongoDB error: ${error.message}`);
  });
};

const connectDB = async ({ silent = false } = {}) => {
  bindConnectionListeners();

  const mongoUri = resolveMongoUri();

  if (!mongoUri) {
    throw new Error('MongoDB URI is missing. Add MONGO_URI (or MONGODB_URI) in server/.env.');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectPromise) {
    connectPromise = mongoose
      .connect(mongoUri, getMongoOptions())
      .then((conn) => {
        if (!silent) {
          console.log(`MongoDB Connected: ${conn.connection.host}`);
        }
        return conn;
      })
      .finally(() => {
        connectPromise = null;
      });
  }

  return connectPromise;
};

const waitForDbReady = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  const startedAt = Date.now();
  const waitTimeoutMs = getWaitForReadyMs();

  while (Date.now() - startedAt < waitTimeoutMs) {
    if (mongoose.connection.readyState === 1) {
      return true;
    }

    if (mongoose.connection.readyState === 0 && !connectPromise) {
      connectDB({ silent: true }).catch(() => {
        // Retry attempts are handled by polling window and reconnect scheduler.
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  waitForDbReady,
  resolveMongoUri,
};
