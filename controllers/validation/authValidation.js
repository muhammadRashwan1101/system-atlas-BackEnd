
const Joi = require("joi");

const loginValidation = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Please enter your email",
            "string.email": "Please enter a valid email",
            "any.required": "Please enter your email",
        }),

    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Please enter your password",
            "any.required": "Please enter your password",
        }),
});

const signUpValidation = Joi.object({
    firstName: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Please enter your first name",
            "any.required": "Please enter your first name",
        }),

    lastName: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Please enter your last name",
            "any.required": "Please enter your last name",
        }),

    email: Joi.string()
        .email()
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.empty": "Please enter your email",
            "string.email": "Please enter a valid email",
            "any.required": "Please enter your email",
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.empty": "Please enter your password",
            "string.min": "Password must be at least 6 characters long",
            "any.required": "Please enter your password",
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "any.required": "Please confirm your password",
        }),

    role: Joi.string()
        .valid("user", "admin", "manager", "techLead")
        .default("user"),

    jobTitle: Joi.string().allow("").optional(),

    department: Joi.string().allow("").optional(),

    level: Joi.string().allow("").optional(),

    location: Joi.string().allow("").optional(),

    bio: Joi.string().allow("").optional(),

    avatar: Joi.string().allow("").optional(),

    workspaceAccess: Joi.array()
        .items(Joi.string())
        .optional(),

    techStack: Joi.array()
        .items(Joi.string())
        .optional(),

    onboardingStatus: Joi.string()
        .valid("pending", "completed")
        .default("pending"),

    mustChangePassword: Joi.boolean()
        .default(false),

    accountStatus: Joi.string()
        .valid("active", "inactive")
        .default("active"),
}).unknown(true);

module.exports = {
    loginValidation,
    signUpValidation,
};

