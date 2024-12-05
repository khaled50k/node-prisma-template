const express = require("express");
const authController = require("../../controllers/profile/index");

const authRouter = express.Router();

// authRouter.get("/google", authHandler.googleLogin);

// authRouter.get("/google/callback", authHandler.googleLoginCallback);
authRouter.get("/user-data", authController.getUserData);
authRouter.put("/user-update", authController.updateUserData);
authRouter.put("/user-update-password", authController.updatePassword);

module.exports = authRouter;
