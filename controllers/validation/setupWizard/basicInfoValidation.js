const joi = require("joi")

const basicInfoValidation = joi.object({
    name: joi.string().trim().min(5).max(50).required().messages({
        "string.empty": "Component name is required",
        "string.min": "Component name must be at least 5 characters",
        "string.max": "Component name cannot exceed 50 characters",
    }),
    description: joi.string().max(500).messages({
        "string.empty": "Component description is required",
        "string.max": "Description cannot exceed 500 characters",
    }),
     type: joi.string().valid(
            "cloud-service",
            "database",
            "api-gateway",
            "queue",
            "cache",
            "frontend",
            "backend",
            "third-party",
            "Data Science"
        ).required().messages({
            "string.empty": "Component type is required",
            "any.only": "Component type must be one of the supported types",
        }),
})

module.exports = {
    basicInfoValidation
}