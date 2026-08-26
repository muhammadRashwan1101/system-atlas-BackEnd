const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "manager", "techLead", "developer"],
      default: "user",
    },
    requirePasswordReset: {
      type: Boolean,
      default: false,
    },
    onboardingStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    avatar: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      default: "",
    },
    level: {
      type: String,
      default: "",
    },
    department: {
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
    workspaceAccess: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
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
    accountStatus: {
      type: String,
      enum: ["active", "pending", "invited", "suspended", "inactive"],
      default: "pending",
    },
    notificationPreferences: {
      ownershipChanges: { type: Boolean, default: true },
      projectAssignment: { type: Boolean, default: true },
      relationshipChanges: { type: Boolean, default: true },
      criticalAlerts: { type: Boolean, default: true },
      documentationAlerts: { type: Boolean, default: true },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
