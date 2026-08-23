const Joi = require("joi");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

const createUserValidation = Joi.object({
  // ================= Basic Information =================

  fullName: Joi.string()
    .trim()
    .min(3)
    .required()
    .messages({
      "string.empty": "Full Name is required",
      "any.required": "Full Name is required",
    }),

  username: Joi.string()
    .trim()
    .min(3)
    .required(),

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(8)
    .pattern(passwordRegex)
    .required(),

  // ================= Organization =================

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

  parentOrg: Joi.string()
    .allow("")
    .optional(),

  // ================= Workspace =================

  workspaceId: Joi.string()
    .hex()
    .length(24)
    .required(),

  // ================= Teams =================

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

  // ================= Reporting =================

  reportsTo: Joi.string()
    .hex()
    .length(24)
    .allow("", null),

  // ================= Security =================

  mustResetPassword: Joi.boolean()
    .default(true),

  // ================= Account =================

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