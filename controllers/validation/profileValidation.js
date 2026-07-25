const Joi = require("joi")

const updateProfileValidation = Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    jobTitle: Joi.string().max(100).allow(""),
    level: Joi.string().max(30).allow(""),
    department: Joi.string().max(100).allow(""),
    location: Joi.string().max(150).allow(""),
    bio: Joi.string().max(500).allow(""),
    avatar: Joi.string().uri().allow(""),
    workspaceAccess: Joi.array().items(Joi.string()),
    techStack: Joi.array().items(Joi.string()),
    parentOrg: Joi.string().max(100).allow("")
}).min(1).messages({
    "object.min": "Please provide at least one field to update."
})

module.exports = { updateProfileValidation }