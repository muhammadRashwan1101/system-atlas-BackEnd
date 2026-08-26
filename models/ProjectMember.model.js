const mongoose = require("mongoose");

const projectMemberSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["projectManager", "teamLeader", "member"],
      default: "member",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// يمنع إضافة نفس المستخدم مرتين لنفس الفريق في نفس المشروع
projectMemberSchema.index(
  { project: 1, team: 1, user: 1 },
  { unique: true }
);

module.exports = mongoose.model("ProjectMember", projectMemberSchema);