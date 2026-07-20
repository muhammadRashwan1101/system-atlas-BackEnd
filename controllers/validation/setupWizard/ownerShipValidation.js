const joi = require("joi")

const ownerShipValidation = joi.object({
    ownerTeam: joi.string().hex().length(24).allow(null),

    technicalLead: joi.string().hex().length(24).allow(null),

    maintainers: joi.array().items(joi.string().hex().length(24)).default([]),

    environment: joi.string().valid(
            "development",
            "staging",
            "production"
        ).required()
})