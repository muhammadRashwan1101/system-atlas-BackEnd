
const joi = require("joi");

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

    tags: joi.array()
        .items(joi.string().trim())
        .default([]),

    types: joi.object({
        apiDocumentation: joi.boolean().default(false),
        architecture: joi.boolean().default(false),
        readme: joi.boolean().default(false),
        deployment: joi.boolean().default(false),
        dependencies: joi.boolean().default(false),
        testing: joi.boolean().default(false),
        security: joi.boolean().default(false),
        database: joi.boolean().default(false),
        examples: joi.boolean().default(false),
        changelog: joi.boolean().default(false)
    }).default({})
});

module.exports = { documentationValidation };

