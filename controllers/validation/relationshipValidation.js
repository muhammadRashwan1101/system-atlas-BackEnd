const joi = require("joi")

const relatioshipValidation = joi.object({
    relationships: joi.array().items(
        joi.object({
            targetId: joi.string().hex().length(24).required(),

            type: joi.string()
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

            protocol: joi.string()
                .valid(
                    "HTTP",
                    "HTTPS",
                    "gRPC",
                    "SQL",
                    "AMQP",
                    "WebSocket"
                )
                .allow(null)
        })
    ).default([])
})