/**
 * In-memory sliding-window rate limiter for AI endpoints.
 * Protects against upstream quota exhaustion and rapid repetitive requests.
 */

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 15; // Max 15 AI calls per minute per user

// Map: userId -> array of timestamps [t1, t2, ...]
const userRequests = new Map();

// Periodic cleanup of expired user records every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of userRequests.entries()) {
    const active = timestamps.filter((t) => now - t < WINDOW_MS);
    if (active.length === 0) {
      userRequests.delete(key);
    } else {
      userRequests.set(key, active);
    }
  }
}, CLEANUP_INTERVAL_MS).unref(); // unref so it does not keep Node process alive during tests

const aiRateLimiter = (req, res, next) => {
  const userId = req.user?._id?.toString() || req.ip || "anonymous";
  const now = Date.now();

  const timestamps = userRequests.get(userId) || [];
  const activeTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);

  if (activeTimestamps.length >= MAX_REQUESTS) {
    const oldest = activeTimestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));

    res.set("Retry-After", String(retryAfterSeconds));
    res.set("X-RateLimit-Limit", String(MAX_REQUESTS));
    res.set("X-RateLimit-Remaining", "0");

    return res.status(429).json({
      success: false,
      message: `AI request rate limit reached (${MAX_REQUESTS} requests/min). Please wait ${retryAfterSeconds} seconds before trying again.`,
      retryAfter: retryAfterSeconds,
    });
  }

  activeTimestamps.push(now);
  userRequests.set(userId, activeTimestamps);

  const remaining = Math.max(0, MAX_REQUESTS - activeTimestamps.length);
  res.set("X-RateLimit-Limit", String(MAX_REQUESTS));
  res.set("X-RateLimit-Remaining", String(remaining));

  next();
};

module.exports = aiRateLimiter;
