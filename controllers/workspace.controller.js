const Workspace = require("../models/workspace.model");
const User = require("../models/user.model");

const workspaceValidation = require("./validation/workspaceValidation");
const CheckRole = require("../middlewares/CheckRoleMiddleware");

// ================= Create Workspace =================

const createWorkspace = async (req, res, next) => {
  if (!CheckRole(req, res, ["admin"])) return;

  try {
    const { error, value } = workspaceValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        msg: error.details.map((err) => err.message),
      });
    }

    const existingWorkspace = await Workspace.findOne({
      ownerId: req.user.id,
      name: value.name,
    });

    if (existingWorkspace) {
      return res.status(400).json({
        msg: "Workspace name already exists",
      });
    }

    const workspaceData = {
      ...value,
      ownerId: req.user.id,
    };

    const newWorkspace = await Workspace.create(workspaceData);

    // Update Admin User
    await User.findByIdAndUpdate(
      req.user.id,
      {
        workspaceId: newWorkspace._id,
        onboardingStatus: "completed",
      },
      {
        new: true,
      }
    );

    return res.status(201).json({
      msg: "Workspace Created Successfully",
      workspace: newWorkspace,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Get Workspaces =================

const getWorkspaces = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    const userWorkspaceAccess = currentUser.workspaceAccess || [];

    let query;

    if (req.user.role === "admin") {
      query = {
        ownerId: req.user.id,
      };
    } else {
      query = {
        $or: [
          {
            ownerId: req.user.id,
          },
          {
            _id: {
              $in: userWorkspaceAccess,
            },
          },
        ],
      };
    }

    const workspaces = await Workspace.find(query)
      .populate("ownerId")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      workspaces,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Get Single Workspace =================

const getWorkspace = async (req, res, next) => {
  try {
    const targetWorkspace = await Workspace.findById(
      req.params.workspaceId
    ).populate("ownerId");

    if (!targetWorkspace) {
      return res.status(404).json({
        msg: "Workspace not found",
      });
    }

    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    const userWorkspaceAccess =
      currentUser.workspaceAccess || [];

    const isOwner =
      targetWorkspace.ownerId?._id?.toString() ===
        req.user.id.toString() ||
      targetWorkspace.ownerId?.toString() ===
        req.user.id.toString();

    const hasAccess =
      req.user.role === "admin" ||
      isOwner ||
      userWorkspaceAccess
        .map((id) => id.toString())
        .includes(req.params.workspaceId);

    if (!hasAccess) {
      return res.status(403).json({
        msg: "Forbidden: You do not have permission to access this workspace",
      });
    }

    return res.status(200).json({
      workspace: targetWorkspace,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Update Workspace =================

const updateWorkspace = async (req, res, next) => {
  if (!CheckRole(req, res, ["admin"])) return;

  try {
    const { error, value } = workspaceValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        msg: error.details.map((err) => err.message),
      });
    }

    const duplicateWorkspace = await Workspace.findOne({
      ownerId: req.user.id,
      name: value.name,
      _id: {
        $ne: req.params.workspaceId,
      },
    });

    if (duplicateWorkspace) {
      return res.status(400).json({
        msg: "Workspace name already exists",
      });
    }

    const targetWorkspace =
      await Workspace.findOneAndUpdate(
        {
          _id: req.params.workspaceId,
          ownerId: req.user.id,
        },
        {
          $set: value,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!targetWorkspace) {
      return res.status(404).json({
        msg: "Workspace not found",
      });
    }

    return res.status(200).json({
      msg: "Workspace Updated Successfully",
      workspace: targetWorkspace,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Delete Workspace =================

const deleteWorkspace = async (req, res, next) => {
  if (!CheckRole(req, res, ["admin"])) return;

  try {
    const targetWorkspace =
      await Workspace.findOneAndDelete({
        _id: req.params.workspaceId,
        ownerId: req.user.id,
      });

    if (!targetWorkspace) {
      return res.status(404).json({
        msg: "Workspace not found",
      });
    }

    return res.status(200).json({
      msg: "Workspace Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ================= Exports =================

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
};