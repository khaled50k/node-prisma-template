const express = require("express");
const { prisma } = require("../../config/prisma");
const {
  validateUpdateUser,
  validateDeleteUser,
  validateUpdatePassword,
} = require("../../validation/user-validator");
const bcrypt = require("bcryptjs");
const getUserData = async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    // Find user by userId
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data excluding sensitive information
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error in getUserData:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const updateUserData = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { email, username, firstName, lastName, phone, birthdate } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    // Validate input data
    const { error } = validateUpdateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Update user data
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { email, username, firstName, lastName, phone, birthdate },
      });
      const {
        verificationCode,
        emailVerifiedAt,
        googleId,
        active,
        resetToken,
        resetTokenExpiration,
        password,
        role,
        ...user
      } = updatedUser;
      res.status(200).json({ message: "User data updated successfully", user });
  
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint violation
        if (error.meta.target.includes('username')) {
          return res.status(400).json({ message: "Username is already in use" });
        }
        if (error.meta.target.includes('email')) {
          return res.status(400).json({ message: "Email is already in use" });
        }
      }
      throw error; // Rethrow if it's not a unique constraint violation
    }
      } catch (error) {
    console.error("Error in updateUserData:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { newPassword } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    // Validate input data
    const { error } = validateUpdatePassword(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {password:hashedPassword },
    });
    const {
      verificationCode,
      emailVerifiedAt,
      googleId,
      active,
      resetToken,
      resetTokenExpiration,
      password,
      role,
      ...user
    } = updatedUser;
    res.status(200).json({ message: "User data updated successfully", user });
  } catch (error) {
    console.error("Error in updateUserData:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    // Delete user
    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};

module.exports = {
  getUserData,
  updateUserData,
  deleteUser,updatePassword
};
