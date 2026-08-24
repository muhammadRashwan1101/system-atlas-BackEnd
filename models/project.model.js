const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    targetEnvironment: {
        type: String,
        enum: ["production ready", "prototype", "development"],

    },
    systemTopology: {
        type: String,
        enum: ["monolithic", "microservices", "event_driven", "hybrid"],

    },
    tags: [{
        type: String,
        trim: true
    }],
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    ownerTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        default: null
       
    },
    managerName: {
        type: String,
        required: true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace"
    },
status: {
    type: String,
    enum: ["ACTIVE", "CRITICAL", "SUSPENDED", "INACTIVE", "DEVELOPMENT"],
    default: "ACTIVE"
}
}, { timestamps: true })

module.exports = mongoose.model("Project", projectSchema)