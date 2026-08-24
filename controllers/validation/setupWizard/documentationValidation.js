const joi = require("joi")

const documentationValidation = joi.object({
    repoURL: joi.string().uri().allow(null).messages({
        "string.uri": "Invalid URL, Please provide a valid URL for your repository."
    }),
    
    docsURL: joi.string().uri().allow(null).messages({
        "string.uri": "Invalid URL, Please provide a valid URL for the documentation."
    }),

    monitorURL: joi.string().uri().allow(null).messages({
        "string.uri": "Invalid URL, Please provide a valid URL for your monitoring tool."
    }),

    deploymentURL: joi.string().uri().allow(null).messages({
        "string.uri": "Invalid URL, Please provide a valid URL for the deployment."
    }),

    tags: joi.array().items(joi.string().trim()).default([])
})

module.exports = { documentationValidation }