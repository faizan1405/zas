const rateLimitMap = new Map();

/**
 * A simple in-memory rate limiter for Hostinger standalone Node.js deployments.
 * NOTE: This relies on in-memory storage, meaning if the application scales horizontally
 * across multiple Node processes, limits are per-process, not global. For a single VPS, this is adequate.
 * 
 * @param {string} ip - The IP address to limit
 * @param {number} limit - Max requests per window
 * @param {number} windowMs - Window size in milliseconds
 * @returns {boolean} - true if allowed, false if rate limited
 */
export function checkRateLimit(ip, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  let requestData = rateLimitMap.get(ip);

  if (!requestData) {
    rateLimitMap.set(ip, [now]);
    return true;
  }

  // Filter out old requests
  requestData = requestData.filter(timestamp => timestamp > windowStart);

  if (requestData.length >= limit) {
    rateLimitMap.set(ip, requestData); // Keep the window updated
    return false;
  }

  requestData.push(now);
  rateLimitMap.set(ip, requestData);
  return true;
}
