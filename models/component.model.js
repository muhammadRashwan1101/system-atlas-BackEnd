const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    type: {
        type: String,
        enum: [
            "service",
            "database",
            "api",
            "queue",
            "cache",
            "frontend",
            "third-party"
        ],
        required: true
    },
    technology: {
        type: [String],
        required: true,
        default: []
    },
    ownerTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ["planned", "active", "inactive"],
        default: "active"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, {timestamps: true})

module.exports = mongoose.model("Component", componentSchema)