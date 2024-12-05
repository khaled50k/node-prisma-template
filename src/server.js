const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const sanitizeRequest = require("./validation/sanitize-request");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const Redis = require("ioredis");
const routes = require('./routes/index');
const hpp = require("hpp");
const xssClean = require('xss-clean'); // XSS protection middleware
const app = express();

// Middleware configurations
app.disable("X-Powered-By");
app.disable("etag");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  referrerPolicy: { policy: "no-referrer" },
  featurePolicy: {
    features: {
      geolocation: ["'none'"],
      microphone: ["'none'"],
      camera: ["'none'"]
    }
  }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: "GET,PUT,POST,DELETE",
  credentials: true,
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(sanitizeRequest);
app.use(hpp());
app.use(xssClean()); // Apply XSS protection middleware


// Create a Redis client
const redisClient = new Redis({ host: 'localhost', port: 6379 });

// Log Redis connection status for debugging
redisClient.on("connect", () => {
  console.log("Connected to Redis!");
});
redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});
redisClient.on("ready", () => {
  console.log("Redis is ready!");
});

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

// Session middleware setup with Redis store
app.use(
  session({
    store: redisStore,
    secret: process.env.EXPRESS_SESSION_SEC || "defaultSecret",
    resave: false,
    saveUninitialized: false,
    name: "KH-SN-CE",
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 20 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      httpOnly: true,
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
  })
);

// Route setup
routes(app);

// Test route
app.get("/", (req, res) => {
  return res
    .status(200)
    .json({
      en: "Project is successfully working...",
    })
    .end();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
