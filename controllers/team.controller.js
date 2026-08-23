const Team = require("../models/teams.model");
const User = require("../models/user.model");
const Component = require("../models/component.model");
const Project = require("../models/project.model");
const { createTeamSchema, updateTeamSchema, validateTeamIdSchema } = require("./validation/team.validation");
const {calculateDocumentationCoverage,calculateTeamDocumentationCoverage} = require("./utils/documentationCoverage");
// 1. Create Team 
const createTeam = async (req, res) => {
  const { error, value } = createTeamSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      msg: error.details.map(err => err.message)
    });
  }

  try {
    const existingTeam = await Team.findOne({
      $or: [{ teamName: value.teamName }, { teamCode: value.teamCode }]
    });

    if (existingTeam) {
      return res.status(400).json({ msg: "Team name or Team code already exists" });
    }

    const newTeam = await Team.create(value);

    res.status(201).json({
      success: true,
      msg: "Team created successfully",
      team: newTeam
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 2. Get All Teams 
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate(
        "teamLead",
        "firstName lastName fullName username email role"
      )
      .populate(
        "members",
        "firstName lastName fullName username email role"
      )
      .sort({ createdAt: -1 });

    const teamsWithCounts = await Promise.all(
      teams.map(async (team) => {

        // Components owned by this team
        const components = await Component.find({
          ownerTeam: team._id
        }).lean();

        // Projects owned by this team
        const projectsCount = await Project.countDocuments({
          ownerTeam: team._id
        });

        // Calculate documentation coverage for each component
        const componentsWithCoverage = components.map((component) => ({
          ...component,
          documentationCoverage:
            calculateDocumentationCoverage(component.documentation)
        }));

        // Calculate team documentation coverage
        const documentationCoverage =
          calculateTeamDocumentationCoverage(componentsWithCoverage);

        return {
          ...team.toObject(),

          componentsCount: components.length,

          projectsCount,

          documentationCoverage
        };
      })
    );

    res.status(200).json({
      success: true,
      count: teamsWithCounts.length,
      data: teamsWithCounts
    });

  } catch (err) {
    res.status(500).json({
      msg: err.message,
      source: "getTeams"
    });
  }
};
// 3. Get Single Team by ID 
const getTeamById = async (req, res) => {
  const { error } = validateTeamIdSchema.validate({
    id: req.params.id
  });

  if (error) {
    return res.status(400).json({
      msg: error.details[0].message
    });
  }

  try {
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
        msg: "Team not found"
      });
    }

    // Get components owned by this team
    const components = await Component.find({
      ownerTeam: team._id
    }).lean();

    // Get projects count
    const projectsCount = await Project.countDocuments({
      ownerTeam: team._id
    });

    // Calculate coverage for every component
    const componentsWithCoverage = components.map((component) => ({
      ...component,
      documentationCoverage:
        calculateDocumentationCoverage(component.documentation)
    }));

    // Calculate team coverage
    const documentationCoverage =
      calculateTeamDocumentationCoverage(componentsWithCoverage);

    res.status(200).json({
      success: true,
      data: {
        ...team.toObject(),

        componentsCount: components.length,

        projectsCount,

        documentationCoverage
      }
    });

  } catch (err) {
    res.status(500).json({
      msg: err.message
    });
  }
};

// 4. Update Team 
const updateTeam = async (req, res) => {
  // 1. Validate ID Parameter
  const idValidation = validateTeamIdSchema.validate({ id: req.params.id });
  if (idValidation.error) {
    return res.status(400).json({ msg: idValidation.error.details[0].message });
  }

  // 2. Validate Body Data
  const { error, value } = updateTeamSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      msg: error.details.map(err => err.message)
    });
  }

  try {

    if (value.teamName || value.teamCode) {
      const existingTeam = await Team.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(value.teamName ? [{ teamName: value.teamName }] : []),
          ...(value.teamCode ? [{ teamCode: value.teamCode }] : [])
        ]
      });

      if (existingTeam) {
        return res.status(400).json({ msg: "Team name or Team code is already used by another team" });
      }
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    )
      .populate("teamLead", "firstName lastName email")
      .populate("members", "firstName lastName email");

    if (!updatedTeam) {
      return res.status(404).json({ msg: "Team not found" });
    }

    res.status(200).json({
      success: true,
      msg: "Team updated successfully",
      team: updatedTeam
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 5. Delete Team 


const deleteTeam = async (req, res) => {
  const { error } = validateTeamIdSchema.validate({ id: req.params.id });

  if (error) {
    return res.status(400).json({
      msg: error.details[0].message,
    });
  }

  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        msg: "Team not found",
      });
    }

    // إزالة التيم من جميع الأعضاء
    await User.updateMany(
      {
        teamId: req.params.id,
      },
      {
        $set: {
          teamId: null,
        },
      }
    );

    // حذف التيم
    await Team.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      msg: "Team deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
};
module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam
};