const { checkAuthentication } = require("../middleware/auth");
const authRouter = require("./auth/index");
const profileRouter = require("./profile/index");
const {authLimiter,profileLimiter} = require("../middleware/limiter/index");
const mountRoutes = (app) => {
  app.use("/api/v1/auth", authLimiter, authRouter);
  app.use("/api/v1/profile",profileLimiter, checkAuthentication, profileRouter);
};

module.exports = mountRoutes;
