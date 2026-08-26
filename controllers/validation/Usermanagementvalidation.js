const Joi = require("joi");

const createUserByAdminValidation = Joi.object({
  firstName: Joi.string().required().messages({
    "string.empty": "Please Enter the First Name",
  }),
  lastName: Joi.string().required().messages({
    "string.empty": "Please Enter the Last Name",
  }),
  username: Joi.string().trim().required().messages({
    "string.empty": "Please Enter a Username",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please Enter a Valid Email",
  }),
  role: Joi.string()
    .valid("user", "admin", "manager", "techLead", "developer")
    .required()
    .messages({
      "any.only": "Please Select a Valid Role",
    }),
  level: Joi.string().allow("").default(""),
  workspace: Joi.string().hex().length(24).allow(null, "").messages({
    "string.length": "Workspace must be a valid id",
    "string.hex": "Workspace must be a valid id",
  }),
  team: Joi.string().hex().length(24).allow(null, "").messages({
    "string.length": "Team must be a valid id",
    "string.hex": "Team must be a valid id",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/)
    .required()
    .messages({
      "string.empty": "Please Enter a Temporary Password",
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
    }),
  requirePasswordReset: Joi.boolean().default(true),
  invitationOption: Joi.string()
    .valid("send", "pending")
    .default("send"),
});

module.exports = { createUserByAdminValidation };
