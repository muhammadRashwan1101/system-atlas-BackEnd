const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        unique: true
    },
    teamCode: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [
            "Platform",
            "Frontend",
            "Backend",
            "DevOps",
            "Cloud",
            "Mobile",
            "Security",
            "Data Science",
            "AI/ML",
            "UI/UX",
            "QA",
            "Other"
        ],
        required: true   
    },

    teamLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    responsibilities: {
        type: [String],
        default: []
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    status: {
        type: String,
        enum: ["active", "inactive", "archived"],
        default: "active"
    }
}, {timestamps: true});



module.exports = mongoose.model('Team', teamSchema);