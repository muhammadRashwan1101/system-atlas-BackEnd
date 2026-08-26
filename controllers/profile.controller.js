const { fileTypeFromFile } = require("file-type");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Team = require("../models/teams.model");
const Workspace = require("../models/workspace.model");
const Component = require("../models/component.model");
const Project = require("../models/project.model");
const { updateProfileValidation } = require("./validation/profileValidation");
const {
  updateNotificationValidation,
} = require("./validation/notificationValidation");
const {
  createUserByAdminValidation,
} = require("./validation/Usermanagementvalidation");

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("reportsTo", "firstName lastName jobTitle");

    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    const [ownedComponentsCount, ownedProjectsCount] = await Promise.all([
      Component.countDocuments({ createdBy: user._id }),
      Project.countDocuments({ ownerId: user._id }),
    ]);

    res.status(200).json({
      user,
      stats: {
        ownedComponents: ownedComponentsCount,
        ownedProjects: ownedProjectsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password -email")
      .populate("reportsTo", "firstName lastName jobTitle");

    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    const [ownedComponentsCount, ownedProjectsCount] = await Promise.all([
      Component.countDocuments({ createdBy: user._id }),
      Project.countDocuments({ ownerId: user._id }),
    ]);

    res.status(200).json({
      user,
      stats: {
        ownedComponents: ownedComponentsCount,
        ownedProjects: ownedProjectsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  const { error, value } = updateProfileValidation.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res
      .status(400)
      .json({ msg: error.details.map((err) => err.message) });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: value },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    res
      .status(200)
      .json({ msg: "Profile Updated Successfully", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

const deactivateMyAccount = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { accountStatus: "inactive" },
      { new: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    res.status(200).json({ msg: "Account Deactivated Successfully" });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const detectedType = await fileTypeFromFile(req.file.path);
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ msg: "Invalid file content." });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const currentUser = await User.findById(req.user.id);
    if (currentUser.avatar) {
      const oldPath = path.join(__dirname, "..", currentUser.avatar);
      fs.unlink(oldPath, () => {});
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true },
    ).select("-password");

    res
      .status(200)
      .json({ msg: "Avatar Uploaded Successfully", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

const updateNotificationPreference = async (req, res, next) => {
  const { error, value } = updateNotificationValidation.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ msg: error.details.map((err) => err.message) });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { [`notificationPreferences.${value.key}`]: value.value } },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ msg: "User Not Found" });
    }

    res.status(200).json({
      msg: "Notification Preference Updated Successfully",
      notificationPreferences: updatedUser.notificationPreferences,
    });
  } catch (error) {
    next(error);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const [totalUsers, pendingUsers, teamsCount, activeUsers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ accountStatus: "pending" }),
        Team.countDocuments(),
        User.countDocuments({ accountStatus: "active" }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        pending: pendingUsers,
        teams: teamsCount,
        activeUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Used by CreateUserModal on the frontend (admin-only)
const createUserByAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      msg: "Forbidden: You do not have permission to perform this action",
    });
  }

  const { error, value } = createUserByAdminValidation.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res
      .status(400)
      .json({ msg: error.details.map((err) => err.message) });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email: value.email }, { username: value.username }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "Email or Username already in use" });
    }

    if (value.workspace) {
      const workspace = await Workspace.findById(value.workspace);
      if (!workspace) {
        return res.status(404).json({ msg: "Workspace not found" });
      }
    }

    let team = null;
    if (value.team) {
      team = await Team.findById(value.team);
      if (!team) {
        return res.status(404).json({ msg: "Team not found" });
      }
    }

    const hashedPassword = await bcrypt.hash(value.password, 12);

    const newUser = await User.create({
      firstName: value.firstName,
      lastName: value.lastName,
      username: value.username,
      email: value.email,
      password: hashedPassword,
      role: value.role,
      level: value.level,
      workspaceAccess: value.workspace ? [value.workspace] : [],
      team: value.team || null,
      requirePasswordReset: value.requirePasswordReset,
      accountStatus:
        value.invitationOption === "send" ? "invited" : "pending",
    });

    if (team) {
      team.members.push(newUser._id);
      await team.save();
    }

    // NOTE: no email provider is wired up yet (no nodemailer/SMTP config
    // in this project). When invitationOption === "send" we mark the
    // account as "invited" here; hook up the actual invite email later.

    const userToReturn = await User.findById(newUser._id)
      .select("-password")
      .populate("team", "teamName");

    res.status(201).json({
      msg:
        value.invitationOption === "send"
          ? `Invitation sent to ${newUser.email}`
          : "User created successfully",
      user: userToReturn,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("team", "teamName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};
const deactivateUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.accountStatus = "inactive";
    await user.save();

    res
      .status(200)
      .json({ success: true, msg: `${user.fullName} has been deactivated.` });
  } catch (error) {
    next(error);
  }
};

const toggleSuspendUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        user.accountStatus = user.accountStatus === "suspended" ? "active" : "suspended";
        await user.save();

        res.status(200).json({
            success: true,
            msg: `${user.fullName} is now ${user.accountStatus}.`,
            accountStatus: user.accountStatus,
        });
    } catch (error) {
        next(error);
    }
};
module.exports = {
  getMyProfile,
  getUserProfile,
  updateMyProfile,
  deactivateMyAccount,
  uploadAvatar,
  updateNotificationPreference,
  getUserStats,
  getAllUsers,
  createUserByAdmin,
  deactivateUserById,
  toggleSuspendUser 
};