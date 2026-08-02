const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ["user", "admin", "manager", "techLead"],
        default: "user"
    },
    onboardingStatus: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    avatar: {
        type: String, 
        default: ""
    },
    jobTitle: {
        type: String, 
        default: ""
    },
    level: {
        type: String, 
        default: ""
    },
    department: {
        type: String, 
        default: ""
    },
    location: {
        type: String, 
        default: ""
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ""
    },
    workspaceAccess: {
        type: [String], 
        default: []
    },
    techStack: {
        type: [String], 
        default: []
    },
    reportsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    parentOrg: {
        type: String, 
        default: ""
    },
    accountStatus: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
}, {timestamps: true})

userSchema.virtual("fullName").get(function() {
    return `${this.firstName} ${this.lastName}`
})

userSchema.set("toJSON", { virtuals: true })

module.exports = mongoose.model("User", userSchema)