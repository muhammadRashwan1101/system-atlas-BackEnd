const Joi = require("joi")

const workspaceValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": "Workspace name is required",
            "string.min": "Workspace name must be at least 3 characters",
            "string.max": "Workspace name cannot exceed 50 characters",
        }),

    description: Joi.string()
        .max(500)
        .required()
        .messages({
            "string.empty": "Workspace description is required",
            "string.max": "Description cannot exceed 500 characters",
        })
});

module.exports =  workspaceValidation