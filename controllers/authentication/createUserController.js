const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../../models/user.model");
const CheckRole = require("../../middlewares/CheckRoleMiddleware");
const createUserValidation = require("../validation/createUserValidation");

const MAX_TEAMS_PER_USER = 3;

// ======================================================
// Create User
// ======================================================

const createUser = async (req, res, next) => {
  if (!CheckRole(req, res, ["admin"])) return;

  try {
    const { error, value } = createUserValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const err = new Error(
        error.details.map((e) => e.message).join(", ")
      );
      err.status = 400;
      return next(err);
    }

    const admin = await User.findById(req.user.id);

    if (!admin || !admin.workspaceId) {
      const err = new Error("Admin workspace not found");
      err.status = 400;
      return next(err);
    }

    value.workspaceId = admin.workspaceId;

    const existingEmail = await User.findOne({
      email: value.email.toLowerCase(),
    });

    if (existingEmail) {
      const err = new Error("Email already exists");
      err.status = 400;
      return next(err);
    }

    const existingUsername = await User.findOne({
      username: value.username.toLowerCase(),
    });

    if (existingUsername) {
      const err = new Error("Username already exists");
      err.status = 400;
      return next(err);
    }

    value.password = await bcrypt.hash(value.password, 12);

    value.email = value.email.toLowerCase();
    value.username = value.username.toLowerCase();

    value.teams = value.teams || [];

    const newUser = await User.create(value);

    const populatedUser = await User.findById(newUser._id)
      .populate("teams", "teamName")
      .populate("reportsTo", "fullName")
      .select("-password");

    res.status(201).json({
      success: true,
      msg: "User created successfully",
      user: populatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// Get Users
// ======================================================

const getUsers = async (req, res, next) => {
  if (!CheckRole(req, res, ["admin"])) return;

  try {
    const admin = await User.findById(req.user.id);

    if (!admin) {
      const err = new Error("Admin not found");
      err.status = 404;
      return next(err);
    }

    const filter = {
      workspaceId: admin.workspaceId,

      // Don't show admins in Add Members
      role: {
        $ne: "admin",
      },

      accountStatus: {
        $ne: "inactive",
      },
    };

    // Used by Add Members
    if (req.query.available === "true") {
      filter.$expr = {
        $lt: [
          {
            $size: "$teams",
          },
          MAX_TEAMS_PER_USER,
        ],
      };
    }

    const users = await User.find(filter)
      .populate("teams", "teamName")
      .populate("reportsTo", "fullName")
      .select("-password")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};
// ======================================================
// Get User By Id
// ======================================================

const getUserById = async (req, res, next) => {
  if (!CheckRole(req, res, ["admin"])) return;

  try {
    const admin = await User.findById(req.user.id);

    if (!admin) {
      const err = new Error("Admin not found");
      err.status = 404;
      return next(err);
    }

    const user = await User.findOne({
      _id: req.params.userId,
      workspaceId: admin.workspaceId,
    })
      .populate("teams")
      .populate("reportsTo", "fullName")
      .select("-password");

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};



const updateUser = async (req, res, next) => {
  if (!CheckRole(req, res, ["admin"])) return;

  try {
    const admin = await User.findById(req.user.id);

    if (!admin) {
      const err = new Error("Admin not found");
      err.status = 404;
      return next(err);
    }

    const user = await User.findOne({
      _id: req.params.userId,
      workspaceId: admin.workspaceId,
    });

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }

    const updateData = { ...req.body };

    // حقول ممنوع تتعدل
    delete updateData.password;
    delete updateData.workspaceId;
    delete updateData.teams;

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();

      const emailExists = await User.findOne({
        email: updateData.email,
        _id: { $ne: user._id },
      });

      if (emailExists) {
        const err = new Error("Email already exists");
        err.status = 400;
        return next(err);
      }
    }

    if (updateData.username) {
      updateData.username = updateData.username.toLowerCase();

      const usernameExists = await User.findOne({
        username: updateData.username,
        _id: { $ne: user._id },
      });

      if (usernameExists) {
        const err = new Error("Username already exists");
        err.status = 400;
        return next(err);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("teams", "teamName")
      .populate("reportsTo", "fullName")
      .select("-password");

    res.status(200).json({
      success: true,
      msg: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};


const deleteUser = async (req, res, next) => {
  if (!CheckRole(req, res, ["admin"])) return;

  try {
    const admin = await User.findById(req.user.id);

    if (!admin) {
      const err = new Error("Admin not found");
      err.status = 404;
      return next(err);
    }

    const user = await User.findOne({
      _id: req.params.userId,
      workspaceId: admin.workspaceId,
    }).populate("teams", "teamName");

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }

    // لا يمكن حذف اليوزر إذا كان عضوًا في أي Team
    if (user.teams.length > 0) {
      const teamNames = user.teams
        .map((team) => team.teamName)
        .join(", ");

      const err = new Error(
        `Cannot delete user. User belongs to: ${teamNames}. Remove them from all teams first.`
      );
      err.status = 400;
      return next(err);
    }

    user.accountStatus = "inactive";
    await user.save();

    res.status(200).json({
      success: true,
      msg: "User deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};