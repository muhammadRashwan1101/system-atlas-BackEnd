const Joi = require("joi");

const projectValidation = Joi.object({
    name: Joi.string().trim()  .min(5).max(50) .required() .messages({
            "string.empty": "Project name is required",
            "string.min": "Project name must be at least 5 characters",
            "string.max": "Project name cannot exceed 50 characters",
        }),

    description: Joi.string() .trim() .max(500) .required() .messages({
            "string.empty": "Project description is required",
            "string.max": "Description cannot exceed 500 characters",
        }),

    startDate: Joi.date()
        .required()
        .messages({
            "date.base": "Start date must be a valid date",
            "any.required": "Start date is required",
        }),

    endDate: Joi.date()
        .greater(Joi.ref("startDate"))
        .required()
        .messages({
            "date.base": "End date must be a valid date",
            "date.greater": "End date must be after start date",
            "any.required": "End date is required",
        }),

    targetEnvironment: Joi.string()
        .valid(
            "production ready",
            "prototype",
            "development"
        )
        .required()
        .messages({
            "any.only":
                "Target environment must be production ready, prototype, or development",
            "any.required": "Target environment is required",
        }),

    systemTopology: Joi.string()
        .valid(
            "monolithic",
            "microservices",
            "event_driven",
            "hybrid"
        )
        .required()
        .messages({
            "any.only":
                "System topology must be monolithic, microservices, event_driven, or hybrid",
            "any.required": "System topology is required",
        }),

    department: Joi.string()
        .trim()
        .allow("")
        .optional(),

    tags: Joi.array()
        .items(Joi.string().trim())
        .optional(),

    ownerTeam: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            "string.pattern.base": "Invalid Team ID format",
        }),

    managerName: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Manager name is required",
            "any.required": "Manager name is required",
        }),
});

module.exports = {projectValidation };