const joi = require("joi")

const relatioshipValidation = Joi.object({
    relationships: Joi.array().items(
        Joi.object({
            targetId: Joi.string().hex().length(24).required(),

            type: Joi.string()
                .valid(
                    "calls",
                    "reads-from",
                    "writes-to",
                    "publishes-to",
                    "subscribes-to",
                    "consumes-from",
                    "depends-on"
                )
                .required(),

            protocol: Joi.string()
                .valid(
                    "HTTP",
                    "HTTPS",
                    "gRPC",
                    "SQL",
                    "AMQP",
                    "WebSocket"
                )
                .required()
        })
    )
})