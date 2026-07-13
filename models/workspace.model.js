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
    status: {
        type: String,
        enum: ["active", "archived"],
        default: "active"
    }
}, {timestamps: true})

module.exports = mongoose.model("Workspace", workspaceSchema)