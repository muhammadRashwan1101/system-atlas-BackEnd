const Team = require("../models/teams.model");
const User = require("../models/user.model");
const Component = require("../models/component.model");
const Project = require("../models/project.model");
const TeamMember = require("../models/teamMember.model");

const {
  createTeamSchema,
  updateTeamSchema,
  validateTeamIdSchema,
  addTeamMemberSchema,
} = require("./validation/team.validation");

const {
  calculateDocumentationCoverage,
  calculateTeamDocumentationCoverage,
} = require("./utils/documentationCoverage");

// ================= Create Team =================

const createTeam = async (req, res, next) => {
  try {
    const { error, value } = createTeamSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        msg: error.details.map((err) => err.message),
      });
    }

    const existingTeam = await Team.findOne({
      $or: [
        {
          teamName: value.teamName,
        },
        {
          teamCode: value.teamCode,
        },
      ],
    });

    if (existingTeam) {
      return res.status(400).json({
        msg: "Team name or Team code already exists",
      });
    }

    const newTeam = await Team.create(value);

    return res.status(201).json({
      success: true,
      msg: "Team created successfully",
      team: newTeam,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Get All Teams =================

const getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate(
        "teamLead",
        "firstName lastName fullName username email role avatar"
      )
      .populate(
        "members",
        "firstName lastName fullName username email role avatar"
      )
      .sort({
        createdAt: -1,
      });

    const teamsWithCounts = await Promise.all(
      teams.map(async (team) => {
        // Components owned by this team
        const components = await Component.find({
          ownerTeam: team._id,
        }).lean();

        // Projects owned by this team
        const projectsCount =
          await Project.countDocuments({
            ownerTeam: team._id,
          });

        // Documentation coverage for components
        const componentsWithCoverage =
          components.map((component) => ({
            ...component,
            documentationCoverage:
              calculateDocumentationCoverage(
                component.documentation
              ),
          }));

        // Team documentation coverage
        const documentationCoverage =
          calculateTeamDocumentationCoverage(
            componentsWithCoverage
          );

        return {
          ...team.toObject(),

          developersCount: team.members?.length || 0,

          componentsCount: components.length,

          projectsCount,

          documentationCoverage,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: teamsWithCounts.length,
      data: teamsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Get Team By ID =================

const getTeamById = async (req, res, next) => {
  try {
    const { error } = validateTeamIdSchema.validate({
      id: req.params.id,
    });

    if (error) {
      return res.status(400).json({
        msg: error.details[0].message,
      });
    }

    const team = await Team.findById(req.params.id)
      .populate(
        "teamLead",
        "firstName lastName fullName username email role avatar"
      )
      .populate(
        "members",
        "firstName lastName fullName username email role avatar"
      );

    if (!team) {
      return res.status(404).json({
        msg: "Team not found",
      });
    }

    const components = await Component.find({
      ownerTeam: team._id,
    }).lean();

    const projectsCount =
      await Project.countDocuments({
        ownerTeam: team._id,
      });

    const componentsWithCoverage =
      components.map((component) => ({
        ...component,
        documentationCoverage:
          calculateDocumentationCoverage(
            component.documentation
          ),
      }));

    const documentationCoverage =
      calculateTeamDocumentationCoverage(
        componentsWithCoverage
      );

    return res.status(200).json({
      success: true,
      data: {
        ...team.toObject(),

        developersCount: team.members?.length || 0,

        componentsCount: components.length,

        projectsCount,

        documentationCoverage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ================= Update Team =================

const updateTeam = async (req, res, next) => {
  try {
    const idValidation =
      validateTeamIdSchema.validate({
        id: req.params.id,
      });

    if (idValidation.error) {
      return res.status(400).json({
        msg: idValidation.error.details[0].message,
      });
    }

    const { error, value } =
      updateTeamSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

    if (error) {
      return res.status(400).json({
        msg: error.details.map((err) => err.message),
      });
    }

    if (value.teamName || value.teamCode) {
      const existingTeam = await Team.findOne({
        _id: {
          $ne: req.params.id,
        },
        $or: [
          ...(value.teamName
            ? [{ teamName: value.teamName }]
            : []),

          ...(value.teamCode
            ? [{ teamCode: value.teamCode }]
            : []),
        ],
      });

      if (existingTeam) {
        return res.status(400).json({
          msg: "Team name or Team code is already used by another team",
        });
      }
    }

    const updatedTeam =
      await Team.findByIdAndUpdate(
        req.params.id,
        {
          $set: value,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "teamLead",
          "firstName lastName fullName email avatar"
        )
        .populate(
          "members",
          "firstName lastName fullName email avatar"
        );

    if (!updatedTeam) {
      return res.status(404).json({
        msg: "Team not found",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Team updated successfully",
      team: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Delete Team =================

const deleteTeam = async (req, res, next) => {
  try {
    const { error } = validateTeamIdSchema.validate({
      id: req.params.id,
    });

    if (error) {
      return res.status(400).json({
        msg: error.details[0].message,
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        msg: "Team not found",
      });
    }

    // Remove team from users
    await User.updateMany(
      {
        teams: req.params.id,
      },
      {
        $pull: {
          teams: req.params.id,
        },
      }
    );

    // Delete TeamMember records
    await TeamMember.deleteMany({
      team: req.params.id,
    });

    // Delete team
    await Team.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      msg: "Team deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ================= Add Member =================

const addMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const { error, value } =
      addTeamMemberSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        msg: error.details.map((e) => e.message),
      });
    }

    const { userId, role } = value;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        msg: "Team not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    const existingMember =
      await TeamMember.findOne({
        team: teamId,
        user: userId,
      });

    if (existingMember) {
      return res.status(400).json({
        msg: "User already exists in this team",
      });
    }

    const member = await TeamMember.create({
      team: teamId,
      user: userId,
      role,
    });

    // Keep User.teams synchronized
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        teams: teamId,
      },
    });

    await member.populate([
      {
        path: "user",
        select:
          "firstName lastName fullName email role avatar",
      },
      {
        path: "team",
        select: "teamName category",
      },
    ]);

    return res.status(201).json({
      success: true,
      msg: "Member added successfully",
      member,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        msg: "User already exists in this team",
      });
    }

    next(error);
  }
};

// ================= Get Team Members =================

const getTeamMembers = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        msg: "Team not found",
      });
    }

    const members = await TeamMember.find({
      team: teamId,
    })
      .populate(
        "user",
        "firstName lastName fullName email role avatar"
      )
      .populate(
        "team",
        "teamName category"
      );

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Get Teams By Category =================

const getTeamsByCategory = async (req, res, next) => {
  try {
    const { category } = req.query;

    if (!category || !category.trim()) {
      return res.status(400).json({
        msg: "Category is required",
      });
    }

    const categories = category
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const validCategories = [
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
    ];

    const invalidCategories =
      categories.filter(
        (item) => !validCategories.includes(item)
      );

    if (invalidCategories.length > 0) {
      return res.status(400).json({
        msg: `Invalid category: ${invalidCategories.join(
          ", "
        )}`,
      });
    }

    const teams = await Team.find({
      category: {
        $in: categories,
      },
      status: "active",
    })
      .populate(
        "teamLead",
        "firstName lastName fullName email role avatar"
      )
      .populate(
        "members",
        "firstName lastName fullName email role avatar"
      );

    return res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Exports =================

module.exports = {
  createTeam,
  getTeams,
  getTeamsByCategory,
  getTeamById,
  updateTeam,
  deleteTeam,
  addMember,
  getTeamMembers,
};