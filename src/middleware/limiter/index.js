// middleware/authLimiter.js
const rateLimit = require("express-rate-limit");

// Define the auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window` (15 min)
  message: {
    message:
      "Too many authentication requests from this IP, please try again after 15 minutes",
  },
  headers: true, // Sends information about the rate limit in response headers
});
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (15 min)
  message: {
    message:
      "Too many profile requests from this IP, please try again after 15 minutes",
  },
  headers: true, // Sends information about the rate limit in response headers
});

module.exports = { authLimiter, profileLimiter };
