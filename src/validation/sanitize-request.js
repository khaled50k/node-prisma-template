const { sanitize } = require("express-xss-sanitizer");

// Middleware function to sanitize various parts of the request
const sanitizeRequest = (req, res, next) => {
  // Sanitize request parameters
  for (const param in req.params) {
    const sanitizedValue = sanitize(req.params[param] || "");
    if (sanitizedValue !== req.params[param]) {
      return res.status(403).json({ status: 403, msg: "Access denied: Potential XSS attack detected in request parameters", data: null });
    }
    req.params[param] = sanitizedValue;
  }

  // Sanitize request body
  for (const key in req.body) {
  
    const sanitizedValue = sanitize(req.body[key] || "");
    if (sanitizedValue !== req.body[key]) {
      return res.status(403).json({ status: 403, msg: "Access denied: Potential XSS attack detected in request body", data: null });
    }
    req.body[key] = sanitizedValue;
  }

  // Sanitize query parameters
  for (const queryParam in req.query) {
    const sanitizedValue = sanitize(req.query[queryParam] || "");
    if (sanitizedValue !== req.query[queryParam]) {
      return res.status(403).json({ status: 403, msg: "Access denied: Potential XSS attack detected in query parameters", data: null });
    }
    req.query[queryParam] = sanitizedValue;
  }

  // Sanitize request headers
  for (const header in req.headers) {
    const sanitizedValue = sanitize(req.headers[header] || "");
    if (sanitizedValue !== req.headers[header]) {
      return res.status(403).json({ status: 403, msg: "Access denied: Potential XSS attack detected in request headers", data: null });
    }
    req.headers[header] = sanitizedValue;
  }

  // Sanitize cookies
  for (const cookie in req.cookies) {
    const sanitizedValue = sanitize(req.cookies[cookie] || "");
    if (sanitizedValue !== req.cookies[cookie]) {
      return res.status(403).json({ status: 403, msg: "Access denied: Potential XSS attack detected in cookies", data: null });
    }
    req.cookies[cookie] = sanitizedValue;
  }

  // Move to the next middleware if no XSS attack detected
  next();
};

module.exports = sanitizeRequest;
