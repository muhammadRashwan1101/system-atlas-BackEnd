const mongoose = require('mongoose') 

const wizardSchema = new mongoose.Schema ({
    currentStep: {
        type: String,
        enum: [
            "basicInfo",
            "techStack",
            "ownership",
            "relationship",
            "completed"
        ],
        required: true,
        default: "basicInfo"
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    status: {
        type: String,
        enum: ["finished", "in_progress", "cancelled"],
        default: "in_progress"
    },
    completedAt:{
        type:Date
    }

}, {timestamps: true})

module.exports = mongoose.model("SetupWizard", wizardSchema)