const joi = require("joi")

const ownerShipValidation = joi.object({
    ownerRefCode: joi.string(),
    
    ownerTeam: joi.string().hex().length(24).allow(null).required(),

    technicalLead: joi.string().hex().length(24).allow(null),

    maintainers: joi.array().items(joi.string().hex().length(24)).default([]),

    environment: joi.string().valid(
            "development",
            "staging",
            "production"
        ).required()
})

module.exports = { ownerShipValidation }