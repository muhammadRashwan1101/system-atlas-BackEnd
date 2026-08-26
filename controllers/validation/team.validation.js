const Joi = require('joi');

// 1. Create Team Schema (All required fields for creating a new team)
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

    teamLead: Joi.string()
        .hex()
        .length(24)
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
        .valid("active", "inactive", "archived")
        .default("active")
});


const updateTeamSchema = Joi.object({
    teamName: Joi.string().trim().min(2).max(100),
    teamCode: Joi.string().trim().uppercase().min(2).max(10),
    description: Joi.string().trim().min(10).max(500),
    category: Joi.string().valid(
        "Platform", "Frontend", "Backend", "DevOps", "Cloud", 
        "Mobile", "Security", "Data Science", "AI/ML", "UI/UX", 
        "QA", "Other"
    ),
    teamLead: Joi.string().hex().length(24).messages({
        'string.length': 'teamLead must be a valid 24-character MongoDB ObjectId'
    }),
    responsibilities: Joi.array().items(Joi.string().trim().min(3)),
    members: Joi.array().items(Joi.string().hex().length(24)),
    status: Joi.string().valid("active", "inactive", "archived")
}).min(1); 


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
const addTeamMemberSchema = Joi.object({
  userId:Joi.string().required(),

role:Joi.string()
.valid(
"member",
"teamLead",
"developer",
"reviewer",
"manager"
)
.default("member")

})






module.exports = {
    createTeamSchema,
    updateTeamSchema,
    validateTeamIdSchema,
    addTeamMemberSchema 
};