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
            "cloud-service",
            "database",
            "api-gateway",
            "queue",
            "cache",
            "frontend",
            "backend",
            "third-party",
            "Data Science"
        ],
        required: true
    },
    technologies: {
        type: [String],
        default: []
    },
    ownerTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        default: null
    },
    technicalLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    maintainers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }],
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
    deploymentEnvironment:{
        type:String,
        enum:[
            "development",
            "staging",
            "production"
        ],
        default:"development"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, {timestamps: true})

module.exports = mongoose.model("Component", componentSchema)