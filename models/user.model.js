const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ================= Basic Information =================
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // ================= Organization =================
    role: {
      type: String,
      enum: [
        "admin",
        "developer",
        "architect",
        "manager",
        "techLead",
        "viewer",
      ],
      default: "developer",
    },

    level: {
      type: String,
      enum: [
        "intern",
        "junior",
        "mid",
        "senior",
        "lead",
      ],
      default: "junior",
    },

    department: {
      type: String,
      default: "",
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],

    maxTeams: {
      type: Number,
      default: 3,
      min: 1,
    },

    reportsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    parentOrg: {
      type: String,
      default: "",
    },

    // ================= Profile =================
    avatar: {
      type: String,
      default: "",
    },

    jobTitle: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },

    techStack: {
      type: [String],
      default: [],
    },

    // ================= Security =================
    mustResetPassword: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // ================= Invitation =================
    invitationSent: {
      type: Boolean,
      default: false,
    },

    invitationSentAt: {
      type: Date,
      default: null,
    },

    // ================= Account =================
    accountStatus: {
      type: String,
      enum: [
        "pending",
        "invited",
        "active",
        "inactive",
      ],
      default: "pending",
    },

    onboardingStatus: {
      type: String,
      enum: [
        "pending",
        "completed",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);