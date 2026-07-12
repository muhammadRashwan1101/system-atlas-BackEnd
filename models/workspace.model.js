const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    visibility: {
        type: String,
        enum: ["private", "internal"],
        required: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
}, {timestamps: true})

module.exports = mongoose.model("Workspace", workspaceSchema)