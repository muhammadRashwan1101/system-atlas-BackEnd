const Joi = require("joi");

const createInvitationValidation = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.empty": "Please enter a work email address",
    "string.email": "Please enter a valid email address",
    "any.required": "Email address is required",
  }),
  role: Joi.string().valid("user", "admin", "manager", "techLead").default("user"),
  workspaceId: Joi.string().hex().length(24).required().messages({
    "string.empty": "Workspace ID is required",
    "string.length": "Workspace ID must be a valid 24-character hexadecimal ObjectId",
    "any.required": "Workspace ID is required",
  }),
  teamId: Joi.string().hex().length(24).allow(null, "").optional(),
  temporaryPassword: Joi.string().min(6).allow(null, "").optional(),
  requirePasswordReset: Joi.boolean().default(true),
  firstName: Joi.string().trim().allow("").optional(),
  lastName: Joi.string().trim().allow("").optional(),
  jobTitle: Joi.string().trim().allow("").optional(),
  level: Joi.string().trim().allow("").optional(),
  department: Joi.string().trim().allow("").optional(),
  sendImmediately: Joi.boolean().default(true),
}).unknown(true);

const acceptInvitationValidation = Joi.object({
  token: Joi.string().trim().required().messages({
    "string.empty": "Invitation token is required",
    "any.required": "Invitation token is required",
  }),
});

module.exports = {
  createInvitationValidation,
  acceptInvitationValidation,
};
