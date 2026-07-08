const Joi = require("joi")

const projectValidation = Joi.object ({
    name: Joi.string().trim().min(5).max(50).required().messages({
        "string.empty": "Project name is required",
        "string.min": "Project name must be at least 5 characters",
        "string.max": "Project name cannot exceed 50 characters",
    }),
    description: Joi.string().max(500).required().messages({
        "string.empty": "Project description is required",
        "string.max": "Description cannot exceed 500 characters",
    })
})

module.exports = { projectValidation }