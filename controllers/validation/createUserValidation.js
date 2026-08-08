const Joi = require("joi");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

const createUserValidation = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(3)
    .required()
    .messages({
      "string.empty": "Full Name is required",
    }),

  username: Joi.string()
    .trim()
    .min(3)
    .required()
    .messages({
      "string.empty": "Username is required",
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please Enter a Valid Email",
      "string.empty": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .pattern(passwordRegex)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number and special character.",
    }),

  role: Joi.string()
    .valid(
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

teams: Joi.array()
  .items(
    Joi.string()
      .hex()
      .length(24)
  )
  .default([]),

maxTeams: Joi.number()
  .integer()
  .min(1)
  .default(3),

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
    .allow("", null),

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

module.exports = createUserValidation;