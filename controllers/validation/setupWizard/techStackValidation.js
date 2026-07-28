const joi = require("joi")

const techStackValidation = joi.object({

technologies: joi.array().items(joi.string().trim().min(2).max(50)).min(1).unique().required().messages({
        "array.base": "Technologies must be an array",
        "array.min": "Please select at least one technology",
        "array.unique": "Duplicate technologies are not allowed",
        "any.required": "Technologies are required"
    }),
})

module.exports = { techStackValidation }