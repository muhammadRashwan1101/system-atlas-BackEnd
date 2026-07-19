const joi = require("joi")

const ownerShipValidation = joi.object({
    ownerTeam: Joi.string().hex().length(24).allow(null),

    technicalLead: Joi.string().hex().length(24).allow(null),

    maintainers: Joi.array().items(Joi.string().hex().length(24)).default([]),

    environment: Joi.string().valid(
            "development",
            "staging",
            "production"
        ).required()
})