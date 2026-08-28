const Joi = require('joi');

const validStatuses = [
    "ACTIVE", "REVIEW", "SUSPENDED", "INACTIVE",
    "active", "review", "suspended", "inactive", "archived"
];

// 1. Create Team Schema
const createTeamSchema = Joi.object({
    teamName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Team name is required and cannot be empty',
            'any.required': 'teamName field is required'
        }),

    teamCode: Joi.string()
        .trim()
        .uppercase()
        .min(2)
        .max(10)
        .required()
        .messages({
            'string.empty': 'Team code is required and cannot be empty',
            'any.required': 'teamCode field is required'
        }),

    description: Joi.string()
        .trim()
        .min(10)
        .max(500)
        .required()
        .messages({
            'string.empty': 'Description is required and cannot be empty',
            'any.required': 'description field is required'
        }),

    category: Joi.string()
        .valid(
            "Platform", "Frontend", "Backend", "DevOps", "Cloud", 
            "Mobile", "Security", "Data Science", "AI/ML", "UI/UX", 
            "QA", "Other"
        )
        .required()
        .messages({
            'any.only': 'Selected category is invalid, must be one of the pre-defined options',
            'any.required': 'category field is required'
        }),

    workspaceId: Joi.string()
        .hex()
        .length(24)
        .allow(null, '')
        .messages({
            'string.length': 'workspaceId must be a valid 24-character MongoDB ObjectId'
        }),

    teamLead: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'string.length': 'teamLead must be a valid 24-character MongoDB ObjectId',
            'string.hex': 'teamLead must be a valid hexadecimal string'
        }),

    responsibilities: Joi.array()
        .items(Joi.string().trim().min(3))
        .default([]),

    members: Joi.array()
        .items(Joi.string().hex().length(24).messages({
            'string.length': 'Each member ID must be a valid 24-character MongoDB ObjectId'
        }))
        .default([]),

    status: Joi.string()
        .valid(...validStatuses)
        .default("ACTIVE"),

    docCoverage: Joi.number()
        .min(0)
        .max(100)
        .default(85)
});

// 2. Update Team Schema
const updateTeamSchema = Joi.object({
    teamName: Joi.string().trim().min(2).max(100),
    teamCode: Joi.string().trim().uppercase().min(2).max(10),
    description: Joi.string().trim().min(10).max(500),
    category: Joi.string().valid(
        "Platform", "Frontend", "Backend", "DevOps", "Cloud", 
        "Mobile", "Security", "Data Science", "AI/ML", "UI/UX", 
        "QA", "Other"
    ),
    workspaceId: Joi.string().hex().length(24).allow(null, ''),
    teamLead: Joi.string().hex().length(24).messages({
        'string.length': 'teamLead must be a valid 24-character MongoDB ObjectId'
    }),
    responsibilities: Joi.array().items(Joi.string().trim().min(3)),
    members: Joi.array().items(Joi.string().hex().length(24)),
    status: Joi.string().valid(...validStatuses),
    docCoverage: Joi.number().min(0).max(100)
}).min(1); 

// 3. Validate ID Parameter Schema
const validateTeamIdSchema = Joi.object({
    id: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'string.length': 'The team ID in request parameters must be a valid 24-character MongoDB ObjectId',
            'any.required': 'Team ID parameter is required'
        })
});

module.exports = {
    createTeamSchema,
    updateTeamSchema,
    validateTeamIdSchema
};
