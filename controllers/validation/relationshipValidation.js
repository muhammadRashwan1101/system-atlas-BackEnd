const Joi = require("joi");

const ALLOWED_TYPES = [
    "calls",
    "reads-from",
    "writes-to",
    "publishes-to",
    "subscribes-to",
    "consumes-from",
    "depends-on"
];

const ALLOWED_PROTOCOLS = [
    "HTTP",
    "HTTPS",
    "gRPC",
    "SQL",
    "AMQP",
    "WebSocket"
];

const relationshipValidation = Joi.object({
    relationships: Joi.array().items(
        Joi.object({
            targetId: Joi.string().hex().length(24).required().messages({
                "string.empty": "targetId is required",
                "string.length": "Invalid target component ID",
                "string.hex": "Invalid target component ID"
            }),
            sourceId: Joi.string().hex().length(24).optional().messages({
                "string.length": "Invalid source component ID",
                "string.hex": "Invalid source component ID"
            }),
            type: Joi.string()
                .valid(...ALLOWED_TYPES)
                .required()
                .messages({
                    "any.only": "Relationship type must be one of the supported types",
                    "any.required": "Relationship type is required"
                }),
            protocol: Joi.string()
                .valid(...ALLOWED_PROTOCOLS)
                .required()
                .messages({
                    "any.only": "Protocol must be one of the supported protocols",
                    "any.required": "Protocol is required"
                })
        })
    ).default([])
});

const createRelationshipValidation = Joi.object({
    sourceId: Joi.string().hex().length(24).required().messages({
        "string.empty": "sourceId is required",
        "string.length": "Invalid source component ID",
        "string.hex": "Invalid source component ID",
        "any.required": "sourceId is required"
    }),
    targetId: Joi.string().hex().length(24).required().messages({
        "string.empty": "targetId is required",
        "string.length": "Invalid target component ID",
        "string.hex": "Invalid target component ID",
        "any.required": "targetId is required"
    }),
    type: Joi.string()
        .valid(...ALLOWED_TYPES)
        .required()
        .messages({
            "any.only": "Relationship type must be one of the supported types",
            "any.required": "Relationship type is required"
        }),
    protocol: Joi.string()
        .valid(...ALLOWED_PROTOCOLS)
        .required()
        .messages({
            "any.only": "Protocol must be one of the supported protocols",
            "any.required": "Protocol is required"
        })
});

const updateRelationshipValidation = Joi.object({
    sourceId: Joi.string().hex().length(24).optional().messages({
        "string.length": "Invalid source component ID",
        "string.hex": "Invalid source component ID"
    }),
    targetId: Joi.string().hex().length(24).optional().messages({
        "string.length": "Invalid target component ID",
        "string.hex": "Invalid target component ID"
    }),
    type: Joi.string()
        .valid(...ALLOWED_TYPES)
        .optional()
        .messages({
            "any.only": "Relationship type must be one of the supported types"
        }),
    protocol: Joi.string()
        .valid(...ALLOWED_PROTOCOLS)
        .optional()
        .messages({
            "any.only": "Protocol must be one of the supported protocols"
        })
}).min(1).messages({
    "object.min": "At least one field (sourceId, targetId, type, protocol) must be provided for update"
});

module.exports = {
    relationshipValidation,
    relatioshipValidation: relationshipValidation,
    createRelationshipValidation,
    updateRelationshipValidation,
    ALLOWED_TYPES,
    ALLOWED_PROTOCOLS
};