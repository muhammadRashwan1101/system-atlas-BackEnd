const Workspace = require("../models/workspace.model");
const {workspaceValidation} = require("./validation/workspaceValidation");
const User = require("../models/user.model");
const createWorkspace = async (req, res) => {
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
    console.log(req.user)
    const workspaceData = {
      ...value,
      ownerId: req.user.id,
    };

    
    const newWorkspace = await Workspace.create(workspaceData);

    //For selective entry ( Dashboard vs New Workspace )
    await User.findByIdAndUpdate(req.user.id, {
      onboardingStatus: "completed"
    })

    res.status(201).json({ msg: "Workspace Created Successfully", workspace: newWorkspace });
  } catch (error) {
    next(error);
  }
};


const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({ ownerId: req.user._id }).populate("ownerId").sort({
      createdAt: -1,
    });

    res.status(200).json({ workspaces });

  } catch (error) {
    next(error);
  }
};


const getWorkspace = async (req, res, next) => {
  try {
    const targetWorkspace = await Workspace.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
    }).populate("ownerId");

    if (!targetWorkspace) {
      return res.status(404).json({
        msg: "Workspace not found",
      });
    }

    res.status(200).json({
      workspace: targetWorkspace,
    });

  } catch (error) {
    next(error);
  }
};


const updateWorkspace = async (req, res, next) => {
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
      _id: { $ne: req.params.id },
    });

    if (duplicateWorkspace) {
      return res.status(400).json({
        msg: "Workspace name already exists",
      });
    }

    const targetWorkspace = await Workspace.findOneAndUpdate(
      {
        _id: req.params.id,
        ownerId: req.user.id,
      },
      value,
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

    res.status(200).json({
      msg: "Workspace Updated Successfully",
      workspace: targetWorkspace,
    });

  } catch (error) {
    next(error);
  }
};


const deleteWorkspace = async (req, res, next) => {
  try {
    const targetWorkspace = await Workspace.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user.id,
    });

    if (!targetWorkspace) {
      return res.status(404).json({
        msg: "Workspace not found",
      });
    }

    res.status(200).json({
      msg: "Workspace Deleted Successfully",
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
};
