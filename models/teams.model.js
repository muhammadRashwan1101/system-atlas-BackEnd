const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    teamCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
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
        "Other",
      ],
    },

    teamLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);