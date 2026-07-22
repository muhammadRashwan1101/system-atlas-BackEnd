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
    }
}, {timestamps: true})

userSchema.virtual("fullName").get(function() {
    return `${this.firstName} ${this.lastName}`
})

module.exports = mongoose.model("User", userSchema)