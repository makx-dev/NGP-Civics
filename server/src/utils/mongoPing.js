const mongoose = require('mongoose');

let pingIntervalId = null;
let initialPingTimeoutId = null;
let selfPingIntervalId = null;

const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
  99: 'uninitialized',
};

/**
 * Executes a direct ping command to the MongoDB server.
 * @returns {Promise<{ ok: boolean, status: string, latencyMs: number|null, error?: string, host?: string, dbName?: string, timestamp: string }>}
 */
const pingDatabase = async () => {
  const stateCode = mongoose.connection.readyState;
  const status = CONNECTION_STATES[stateCode] || 'unknown';

  if (stateCode !== 1 || !mongoose.connection.db) {
    return {
      ok: false,
      status,
      latencyMs: null,
      error: `MongoDB is not connected (state: ${status})`,
      host: mongoose.connection.host || null,
      dbName: mongoose.connection.name || null,
      timestamp: new Date().toISOString(),
    };
  }

  const startTime = Date.now();
  try {
    // Send ping command to MongoDB database
    await mongoose.connection.db.admin().command({ ping: 1 });
    const latencyMs = Date.now() - startTime;

    return {
      ok: true,
      status: 'connected',
      latencyMs,
      host: mongoose.connection.host,
      dbName: mongoose.connection.name,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      ok: false,
      status: 'error',
      latencyMs,
      error: err.message,
      host: mongoose.connection.host || null,
      dbName: mongoose.connection.name || null,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Starts a recurring background ping to keep the MongoDB connection active.
 * @param {Object} options
 * @param {number} [options.intervalMinutes] - Interval in minutes (default 5 min or MONGO_PING_INTERVAL_MINUTES env)
 * @param {boolean} [options.verbose] - Whether to log every ping
 */
const startMongoKeepAlive = (options = {}) => {
  if (pingIntervalId) {
    return; // Already running
  }

  const intervalMinutes = Number(
    options.intervalMinutes || process.env.MONGO_PING_INTERVAL_MINUTES || 5
  );
  const intervalMs = Math.max(intervalMinutes * 60 * 1000, 30 * 1000); // Minimum 30s
  const verbose = options.verbose !== undefined
    ? options.verbose
    : process.env.MONGO_PING_LOGS !== 'false';

  // eslint-disable-next-line no-console
  console.log(`[MongoDB Keep-Alive] Started background ping service (interval: ${intervalMinutes} min).`);

  // Initial ping shortly after startup
  initialPingTimeoutId = setTimeout(async () => {
    initialPingTimeoutId = null;
    try {
      const result = await pingDatabase();
      if (result.ok) {
        if (verbose) {
          // eslint-disable-next-line no-console
          console.log(`[MongoDB Keep-Alive] Initial Ping OK (${result.latencyMs}ms) to ${result.host}/${result.dbName}`);
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn(`[MongoDB Keep-Alive] Initial Ping Warning: ${result.error || result.status}`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[MongoDB Keep-Alive] Initial ping error:', err.message);
    }
  }, 2000);

  pingIntervalId = setInterval(async () => {
    try {
      const result = await pingDatabase();
      if (result.ok) {
        if (verbose) {
          // eslint-disable-next-line no-console
          console.log(`[MongoDB Keep-Alive] Ping OK (${result.latencyMs}ms) to ${result.host}/${result.dbName}`);
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn(`[MongoDB Keep-Alive] Ping Warning: ${result.error || result.status}`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[MongoDB Keep-Alive] Ping error:', err.message);
    }
  }, intervalMs);

  if (pingIntervalId.unref) {
    pingIntervalId.unref();
  }

  // Optional: If self ping URL is configured (e.g. for free web host keep-alive)
  const selfPingUrl = process.env.KEEP_ALIVE_URL || process.env.SERVER_URL;
  if (selfPingUrl && !selfPingIntervalId) {
    const url = selfPingUrl.endsWith('/api/ping') ? selfPingUrl : `${selfPingUrl.replace(/\/$/, '')}/api/ping`;
    // eslint-disable-next-line no-console
    console.log(`[Server Keep-Alive] HTTP Self-ping enabled for ${url}`);

    selfPingIntervalId = setInterval(async () => {
      try {
        if (typeof fetch === 'function') {
          const res = await fetch(url);
          if (verbose) {
            // eslint-disable-next-line no-console
            console.log(`[Server Keep-Alive] HTTP Self-ping response: ${res.status}`);
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[Server Keep-Alive] HTTP Self-ping failed:', err.message);
      }
    }, intervalMs);

    if (selfPingIntervalId.unref) {
      selfPingIntervalId.unref();
    }
  }
};

/**
 * Stops the background keep-alive ping loop.
 */
const stopMongoKeepAlive = () => {
  if (initialPingTimeoutId) {
    clearTimeout(initialPingTimeoutId);
    initialPingTimeoutId = null;
  }
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
    // eslint-disable-next-line no-console
    console.log('[MongoDB Keep-Alive] Stopped background ping service.');
  }
  if (selfPingIntervalId) {
    clearInterval(selfPingIntervalId);
    selfPingIntervalId = null;
    // eslint-disable-next-line no-console
    console.log('[Server Keep-Alive] Stopped HTTP self-ping service.');
  }
};

module.exports = {
  pingDatabase,
  startMongoKeepAlive,
  stopMongoKeepAlive,
};
