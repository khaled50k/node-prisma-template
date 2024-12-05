const Joi = require("joi");

function validateRegister(body) {
  const schema = Joi.object({
    email: Joi.string().email().min(3).required(),
    password: Joi.string().min(6).max(20).required(),
    username: Joi.string().min(3).max(15).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().min(10).max(15),
    birthdate: Joi.date(),
    // verificationCode: Joi.string().length(6).required(),
  });
  return schema.validate(body);
}
function validateUpdateUser(body) {
  const schema = Joi.object({
    email: Joi.string().email().min(3).required(),
    username: Joi.string().min(3).max(15).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().min(10).max(15).required(),
    birthdate: Joi.date().required(),
    // verificationCode: Joi.string().length(6).required(),
  });
  return schema.validate(body);
}

function validateLogin(body) {
  const schema = Joi.object({
    email: Joi.string().email().min(3).required(),
    password: Joi.string().min(6).max(20).required(),
  });
  return schema.validate(body);
}

function validateSendVerificationCode(body) {
  const schema = Joi.object({
    email: Joi.string().email().min(3).required(),
  });
  return schema.validate(body);
}

function validateVerifyEmail(body) {
  const schema = Joi.object({
    token: Joi.string().min(10).required(),
    code: Joi.string().length(4).required(),
  });
  return schema.validate(body);
}

function validateForgotPassword(body) {
  const schema = Joi.object({
    email: Joi.string().email().min(3).required(),
  });
  return schema.validate(body);
}

function validateResestPassword(body, token) {
  const schema = Joi.object({
    newPassword: Joi.string().min(6).max(20).required(),
  });
  return schema.validate(body);
}

function validateUpdatePassword(body) {
  const schema = Joi.object({
    newPassword: Joi.string().min(6).max(20).required(),
  });
  return schema.validate(body);
}

module.exports = {
  validateRegister,
  validateLogin,
  validateSendVerificationCode,
  validateVerifyEmail,
  validateForgotPassword,
  validateResestPassword,
  validateUpdateUser,
  validateUpdatePassword,
};
