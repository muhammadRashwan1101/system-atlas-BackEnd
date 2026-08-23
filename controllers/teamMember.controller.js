const Team = require("../models/teams.model");
const User = require("../models/user.model");

const MAX_TEAMS_PER_USER = 3;

const addMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { members } = req.body;

    // Validate members
    if (!Array.isArray(members) || members.length === 0) {
      const error = new Error("Members array is required");
      error.status = 400;
      return next(error);
    }

    // Find team
    const team = await Team.findById(id);

    if (!team) {
      const error = new Error("Team not found");
      error.status = 404;
      return next(error);
    }

    // Find users
    const users = await User.find({
      _id: { $in: members },
    });

    if (users.length !== members.length) {
      const error = new Error("Some users not found");
      error.status = 404;
      return next(error);
    }

    // =========================================
    // Prevent admins from being team members
    // =========================================

    const adminUsers = users.filter(
      (user) => user.role === "admin"
    );

    if (adminUsers.length > 0) {
      const adminNames = adminUsers.map(
        (user) =>
          user.fullName ||
          user.username ||
          user.email
      );

      const error = new Error(
        `Admin users cannot be added to teams: ${adminNames.join(", ")}`
      );

      error.status = 400;
      return next(error);
    }

    // =========================================
    // Check maximum teams per user
    // =========================================

    const exceededUsers = users.filter((user) => {
      const alreadyInThisTeam = user.teams.some(
        (teamId) =>
          teamId.toString() === team._id.toString()
      );

      return (
        !alreadyInThisTeam &&
        user.teams.length >= MAX_TEAMS_PER_USER
      );
    });

    if (exceededUsers.length > 0) {
      const userNames = exceededUsers.map(
        (user) =>
          user.fullName ||
          user.username ||
          user.email
      );

      const error = new Error(
        `These users already belong to ${MAX_TEAMS_PER_USER} teams: ${userNames.join(
          ", "
        )}`
      );

      error.status = 400;
      return next(error);
    }

    // =========================================
    // Add members to team
    // =========================================

    for (const memberId of members) {
      const alreadyMember = team.members.some(
        (id) =>
          id.toString() === memberId.toString()
      );

      if (!alreadyMember) {
        team.members.push(memberId);
      }
    }

    await team.save();

    // =========================================
    // Add team to users
    // =========================================

    for (const user of users) {
      const alreadyInTeam = user.teams.some(
        (teamId) =>
          teamId.toString() === team._id.toString()
      );

      if (!alreadyInTeam) {
        user.teams.push(team._id);
        await user.save();
      }
    }

    // =========================================
    // Get updated team
    // =========================================

    const updatedTeam = await Team.findById(team._id)
      .populate(
        "members",
        "fullName username role"
      )
      .populate(
        "teamLead",
        "fullName"
      );

    return res.status(200).json({
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

    // Remove user from team
    team.members = team.members.filter(
      (member) => member.toString() !== userId
    );

    await team.save();

    // Remove team from user
    user.teams = user.teams.filter(
      (id) => id.toString() !== teamId
    );

    await user.save();

    const updatedTeam = await Team.findById(teamId)
      .populate("members", "fullName username role")
      .populate("teamLead", "fullName");

    return res.status(200).json({
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