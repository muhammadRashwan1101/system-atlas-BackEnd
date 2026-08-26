const Team = require("../models/teams.model");
const User = require("../models/user.model");
const TeamMember = require("../models/teamMember.model");
const {
  createTeamSchema,
  updateTeamSchema,
  validateTeamIdSchema,
  addTeamMemberSchema
} = require("./validation/team.validation");

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
      .populate("teamLead", "firstName lastName email role")
      .populate("members", "firstName lastName email role");

    res.status(200).json({ success: true, count: teams.length, data: teams });
  } catch (err) {
    res.status(500).json({ msg: err.message, source: "getTeams" });
  }
};

// 3. Get Single Team by ID 
const getTeamById = async (req, res) => {
  const { error } = validateTeamIdSchema.validate({ id: req.params.id });
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  try {
    const team = await Team.findById(req.params.id)
      .populate("teamLead", "firstName lastName email role")
      .populate("members", "firstName lastName email role");

    if (!team) {
      return res.status(404).json({ msg: "Team not found" });
    }

    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ msg: err.message });
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
    return res.status(400).json({ msg: error.details[0].message });
  }

  try {
    const deletedTeam = await Team.findByIdAndDelete(req.params.id);

    if (!deletedTeam) {
      return res.status(404).json({ msg: "Team not found" });
    }

    res.status(200).json({
      success: true,
      msg: "Team deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
const addMember = async (req, res, next) => {

  try {

    const { teamId } = req.params;

    const { error, value } = addTeamMemberSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        msg: error.details.map(e => e.message)
      });
    }


    const { userId, role } = value;


    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        msg: "Team not found"
      });
    }


    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        msg: "User not found"
      });
    }


    const existingMember = await TeamMember.findOne({
      team: teamId,
      user: userId
    });


    if (existingMember) {
      return res.status(400).json({
        msg: "User already exists in this team"
      });
    }



    const member = await TeamMember.create({
      team: teamId,
      user: userId,
      role
    });


    await member.populate([
      {
        path: "user",
        select: "firstName lastName email role"
      },
      {
        path: "team",
        select: "teamName category"
      }
    ]);



    res.status(201).json({
      msg: "Member added successfully",
      member
    });


  } catch(error) {

    if(error.code === 11000){
      return res.status(400).json({
        msg:"User already exists in this team"
      });
    }

    next(error);
  }

};
const getTeamMembers = async (req,res,next)=>{

    try {

        const {teamId} = req.params;


        // check team exists
        const team = await Team.findById(teamId);


        if(!team){

            return res.status(404).json({
                msg:"Team not found"
            });

        }



        const members = await TeamMember.find({
            team:teamId
        })
        .populate(
            "user",
            "firstName lastName email role"
        )
        .populate(
            "team",
            "teamName category"
        );



        res.status(200).json({

            success:true,

            count:members.length,

            members

        });



    } catch(error){

        next(error);

    }

}
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

    const invalidCategories = categories.filter(
      (item) => !validCategories.includes(item)
    );

    if (invalidCategories.length > 0) {
      return res.status(400).json({
        msg: `Invalid category: ${invalidCategories.join(", ")}`,
      });
    }

    const teams = await Team.find({
      category: { $in: categories },
      status: "active",
    })
      .populate("teamLead", "firstName lastName email role")
      .populate("members", "firstName lastName email role");

    return res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  createTeam,
  getTeams,
  getTeamsByCategory,
  getTeamById,
  updateTeam,
  deleteTeam,
  addMember,
  getTeamMembers
};

