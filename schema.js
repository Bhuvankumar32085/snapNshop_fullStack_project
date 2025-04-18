const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'Name is required.',
  }),
  u_email: Joi.string().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Email must be a valid email address.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required.',
    'string.min': 'Password must be at least 6 characters long.',
  }),
  u_phone_num: Joi.string().required().length(10).pattern(/^\d+$/).messages({
    'string.length': 'Phone number must be exactly 10 digits.',
    'string.pattern.base': 'Phone number must contain only digits.',
    'any.required': 'Phone number is required.',
  }),
  u_location: Joi.string().required().messages({
    'string.empty': 'Location is required.',
  })
});

const shopkeeperSchema=Joi.object({
  s_name: Joi.string().required().messages({
    'string.empty': 'Name is required.',
  }),
  s_email: Joi.string().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Email must be a valid email address.',
  }),
  s_password: Joi.string().min(5).required().messages({
    'string.empty': 'Password is required.',
    'string.min': 'Password must be at least 5 characters long.',
  }),
});

module.exports = {userSchema,shopkeeperSchema};
