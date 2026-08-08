const Team = require("../models/teams.model");
const User = require("../models/user.model");

const MAX_TEAMS_PER_USER = 3;

const addMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { members } = req.body;

    if (!Array.isArray(members) || members.length === 0) {
      const error = new Error("Members array is required");
      error.status = 400;
      return next(error);
    }

    const team = await Team.findById(id);

    if (!team) {
      const error = new Error("Team not found");
      error.status = 404;
      return next(error);
    }

    const users = await User.find({
      _id: { $in: members },
    });

    if (users.length !== members.length) {
      const error = new Error("Some users not found");
      error.status = 404;
      return next(error);
    }

    // التحقق من الحد الأقصى لعدد التيمات
    const exceededUsers = users.filter(
      (user) =>
        !user.teams.some(
          (teamId) => teamId.toString() === team._id.toString()
        ) &&
        user.teams.length >= MAX_TEAMS_PER_USER
    );

    if (exceededUsers.length > 0) {
      const error = new Error(
        `Some users already belong to ${MAX_TEAMS_PER_USER} teams`
      );
      error.status = 400;
      return next(error);
    }

    // إضافة الأعضاء إلى التيم
    members.forEach((memberId) => {
      if (
        !team.members.some(
          (id) => id.toString() === memberId.toString()
        )
      ) {
        team.members.push(memberId);
      }
    });

    await team.save();

    // إضافة التيم إلى كل User
    for (const user of users) {
      if (
        !user.teams.some(
          (teamId) => teamId.toString() === team._id.toString()
        )
      ) {
        user.teams.push(team._id);
        await user.save();
      }
    }

    const updatedTeam = await Team.findById(team._id)
      .populate("members", "fullName username role")
      .populate("teamLead", "fullName");

    res.status(200).json({
      success: true,
      msg: "Members added successfully",
      team: updatedTeam,
    });

  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { teamId, userId } = req.params;

    const team = await Team.findById(teamId);

    if (!team) {
      const error = new Error("Team not found");
      error.status = 404;
      return next(error);
    }

    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    team.members = team.members.filter(
      (member) => member.toString() !== userId
    );

    await team.save();

    user.teams = user.teams.filter(
      (id) => id.toString() !== teamId
    );

    await user.save();

    const updatedTeam = await Team.findById(teamId)
      .populate("members", "fullName username role")
      .populate("teamLead", "fullName");

    res.status(200).json({
      success: true,
      msg: "Member removed successfully",
      team: updatedTeam,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  addMembers,
  removeMember,
};