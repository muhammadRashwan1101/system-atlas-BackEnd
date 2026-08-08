const Joi = require("joi")

const componentValidation = Joi.object ({
    name: Joi.string().trim().min(5).max(50).required().messages({
        "string.empty": "Component name is required",
        "string.min": "Component name must be at least 5 characters",
        "string.max": "Component name cannot exceed 50 characters",
    }),
    description: Joi.string().max(500).required().messages({
        "string.empty": "Component description is required",
        "string.max": "Description cannot exceed 500 characters",
    }),
    projectId: Joi.string().hex().length(24).allow(null).required(),

    type: Joi.string().valid(
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
    technologies: Joi.array().items(Joi.string().trim().min(2).max(50)).min(1).unique().required().messages({
        "array.base": "Technologies must be an array",
        "array.min": "Please select at least one technology",
        "array.unique": "Duplicate technologies are not allowed",
        "any.required": "Technologies are required"
    }),
    ownerRefCode: Joi.string().trim().min(5).max(50).allow(null, "").messages({
        "string.min": "Owner reference code must be at least 5 characters",
        "string.max": "Owner reference code cannot exceed 50 characters",
    }),
    ownerTeam: Joi.string().hex().length(24).allow(null, "").messages({
        "string.length": "Invalid Owner Team ID",
        "string.hex": "Invalid Owner Team ID"
    }),
    technicalLead: Joi.string().hex().length(24).allow(null, "").messages({
        "string.length": "Invalid Technical Lead ID",
        "string.hex": "Invalid Technical Lead ID"
    }),
    maintainers: Joi.array().items(Joi.string().hex().length(24)).unique().messages({
        "string.length": "Invalid Maintainer ID",
        "string.hex": "Invalid Maintainer ID"
    }).messages({
        "array.base": "Maintainers must be an array",
    }),
    tags: Joi.array().items(Joi.string()).default([]).messages({
        "string.empty": "No tags selected",
    }),
    documentation: Joi.object().unknown(true).default({}),
    status: Joi.string().valid("active", "inactive","planned").default("active").messages({
        "string.empty": "Please, choose the component status",
        "any.only": "Component statues must be one of the supported status",
    }),
    deploymentEnvironment: Joi.string().valid("development", "staging", "production").default("development").messages({
        "string.empty": "Please, choose the component environment",
        "any.only": "Component environment must be one of the supported environments",
    }),
    createdBy: Joi.string().hex().length(24).required().messages({
        "string.length": "Invalid Curator ID",
        "string.hex": "Invalid Curator ID"
    })
})

module.exports = { componentValidation }