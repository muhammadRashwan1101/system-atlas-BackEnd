const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ================= Basic Information =================

    firstName: {
      type: String,
      trim: true,
      default: "",
    },

    lastName: {
      type: String,
      trim: true,
      default: "",
    },

    fullName: {
      type: String,
      trim: true,
      default: "",
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
        "user",
        "admin",
        "developer",
        "architect",
        "manager",
        "techLead",
        "viewer",
      ],
      default: "user",
    },

    jobTitle: {
      type: String,
      default: "",
    },

    level: {
      type: String,
      enum: [
        "intern",
        "junior",
        "mid",
        "senior",
        "lead",
        "",
      ],
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    parentOrg: {
      type: String,
      default: "",
    },

    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // ================= Workspace =================

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },

    workspaceAccess: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Workspace",
        },
      ],
      default: [],
    },

    // ================= Teams =================

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

    // ================= Reporting =================

    reportsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ================= Profile =================

    avatar: {
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

    mustChangePassword: {
      type: Boolean,
      default: false,
    },

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

    // ================= Notifications =================

    notificationPreferences: {
      ownershipChanges: {
        type: Boolean,
        default: true,
      },

      projectAssignment: {
        type: Boolean,
        default: true,
      },

      relationshipChanges: {
        type: Boolean,
        default: true,
      },

      criticalAlerts: {
        type: Boolean,
        default: true,
      },

      documentationAlerts: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// ================= Virtual Full Name =================

userSchema.virtual("displayName").get(function () {
  if (this.fullName) {
    return this.fullName;
  }

  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

// ================= JSON =================

userSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("User", userSchema);