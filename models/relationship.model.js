const mongoose = require("mongoose")

const relationShipSchema = new mongoose.Schema({
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
        required: true
    },
    sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    type: {
        type: String,
        enum: [
            "calls",
            "reads-from",
            "writes-to",
            "publishes-to",
            "subscribes-to",
            "consumes-from",
            "depends-on",
        ],
        required: true
    },

    protocol: {
        type: String,
        enum: [
            "HTTP",
            "HTTPS",
            "gRPC",
            "SQL",
            "AMQP",
            "WebSocket",
        ],
        required: true
    }
    
}, {timestamps: true})

relationShipSchema.index(
    { projectId: 1, sourceId: 1, targetId: 1, type: 1, protocol: 1 },
    { unique: true }
);

module.exports = mongoose.model("Relationship", relationShipSchema)