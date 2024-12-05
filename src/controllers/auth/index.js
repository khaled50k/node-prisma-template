const express = require("express");
const { prisma } = require("../../config/prisma");
const crypto = require("crypto");
const {
  validateRegister,
  validateLogin,
  validateResestPassword,
  validateForgotPassword,
} = require("../../validation/user-validator");
const bcrypt = require("bcryptjs");
const { generateResetToken, sendResetEmail } = require("../../utils/email");

const registerUser = async (req, res) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, username, password, firstName, lastName, phone, birthdate } =
      req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      const errorMessages = [];
      if (existingUser.email === email) {
        errorMessages.push("Email is already registered");
      }
      if (existingUser.username === username) {
        errorMessages.push("Username is already taken");
      }
      return res.status(400).json({ error: errorMessages.join(", ") });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id =
      crypto.randomBytes(2).toString("hex").toUpperCase() +
      crypto.randomBytes(2).toString("hex") +
      crypto.randomBytes(2).toString("hex").toUpperCase() +
      crypto.randomBytes(2).toString("hex");
    const user = await prisma.user.create({
      data: {
        id,
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        birthdate,
        role: "user",
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res
      .status(500)
      .json({ error: "Internal server error during registration" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const sessionId =
      "KH" +
      crypto.randomBytes(6).toString("hex").toUpperCase() +
      "OO" +
      crypto.randomBytes(6).toString("hex").toUpperCase() +
      "V&X";

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      sessionId: sessionId,
    };
    req.session.authenticated = true;

    res.json({ message: "Login successful", user: req.session.user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
};

const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res
        .status(500)
        .json({ error: "Internal server error during logout" });
    }
    res.json({ message: "Logout successful" });
  });
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    const { error } = validateForgotPassword(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = generateResetToken();

    const resetTokenExpiration = new Date(Date.now() + 3600000); // Token valid for 1 hour
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiration,
      },
    });

    // Send reset email
    await sendResetEmail(email, resetToken);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { resetToken } = req.query;
    // Validate email
    const { error } = validateResestPassword(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // Find user by reset token
    const user = await prisma.user.findUnique({
      where: { resetToken },
    });
    if (!user || user.resetTokenExpiration < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiration: null,
      },
    });

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
};
