const Joi = require("joi");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

// ================= Login Validation =================

const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please Enter a Valid Email",
    "any.required": "Please Enter your Email",
  }),

  password: Joi.string().required().messages({
    "any.required": "Please Enter your Password",
  }),
});

// ================= Sign Up Validation =================

const signUpValidation = Joi.object({
  firstName: Joi.string().trim().required().messages({
    "any.required": "Please Enter your First Name",
  }),

  lastName: Joi.string().trim().required().messages({
    "any.required": "Please Enter your Last Name",
  }),
  username: Joi.string()
    .trim()
    .lowercase()
    .required()
    .messages({
      "any.required": "Please Enter your Username",
      "string.empty": "Please Enter your Username",
    }),
  email: Joi.string().email().required().messages({
    "string.email": "Please Enter a Valid Email",
    "any.required": "Please Enter your Email",
  }),

  password: Joi.string()
    .min(8)
    .pattern(passwordRegex)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      "any.required": "Please Enter your Password",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Please Confirm your Password",
    }),

  role: Joi.string()
    .valid(
      "user",
      "admin",
      "developer",
      "architect",
      "manager",
      "techLead",
      "viewer"
    )
    .default("user"),
});

// ================= Create User Validation =================

const createUserValidation = Joi.object({
  firstName: Joi.string().trim().required(),

  lastName: Joi.string().trim().required(),

  username: Joi.string().trim().min(3).required(),

  email: Joi.string().email().required(),

  password: Joi.string()
    .min(8)
    .pattern(passwordRegex)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    }),

  role: Joi.string()
    .valid(
      "user",
      "admin",
      "developer",
      "architect",
      "manager",
      "techLead",
      "viewer"
    )
    .required(),

  level: Joi.string()
    .valid(
      "intern",
      "junior",
      "mid",
      "senior",
      "lead"
    )
    .required(),

  workspaceId: Joi.string()
    .hex()
    .length(24)
    .required(),

  teamId: Joi.string()
    .hex()
    .length(24)
    .allow(null, ""),

  department: Joi.string()
    .allow("")
    .optional(),

  jobTitle: Joi.string()
    .allow("")
    .optional(),

  location: Joi.string()
    .allow("")
    .optional(),

  bio: Joi.string()
    .max(500)
    .allow("")
    .optional(),

  techStack: Joi.array()
    .items(Joi.string())
    .default([]),

  reportsTo: Joi.string()
    .hex()
    .length(24)
    .allow(null, ""),

  parentOrg: Joi.string()
    .allow("")
    .optional(),

  mustResetPassword: Joi.boolean()
    .default(true),

  accountStatus: Joi.string()
    .valid(
      "pending",
      "invited",
      "active",
      "inactive"
    )
    .default("pending"),
});

// ================= Exports =================

module.exports = {
  loginValidation,
  signUpValidation,
  createUserValidation,
};