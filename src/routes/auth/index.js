const express = require("express");
const authController = require("../../controllers/auth/index");

const authRouter = express.Router();

// authRouter.get("/google", authHandler.googleLogin);

// authRouter.get("/google/callback", authHandler.googleLoginCallback);
authRouter.post("/register", authController.registerUser);
authRouter.post("/login", authController.loginUser);
authRouter.post("/logout", authController.logoutUser);
authRouter.post("/request-reset", authController.requestPasswordReset);
authRouter.get("/reset-password", authController.resetPassword);


module.exports = authRouter;
