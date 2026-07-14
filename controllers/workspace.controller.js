const Workspace = require("../models/workspace.model");
const {workspaceValidation} = require("./validation/workspaceValidation");
const CheckRole=require("../middlewares/CheckRoleMiddleware")
const createWorkspace = async (req, res) => {
  try {
 
    const { error, value } = workspaceValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      console.log(error.details.map((err) => err.message));
      return res.status(400).json({ msg: error.details.map((err) => err.message) });
    }

    const existingWorkspace = await Workspace.findOne({
      ownerId: req.user._id,
      name: value.name,
    });

    //Prevent Duplicates
    if (existingWorkspace) {
      return res.status(400).json({
        msg: "Workspace name already exists",
      });
    }

    const workspaceData = {
      ...value,
      ownerId: req.user._id,
    };

    const newWorkspace = await Workspace.create(workspaceData);
    res
      .status(201)
      .json({ msg: "Workspace Created Successfully", workspace: newWorkspace });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ ownerId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ workspaces });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getWorkspace = async (req, res) => {
  try {
    const targetWorkspace = await Workspace.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!targetWorkspace) {
      return res.status(404).json({ msg: "Workspace not found" });
    }

    res.status(200).json({ workspace: targetWorkspace });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const updateWorkspace = async (req, res) => {
  try {
   
    const { error, value } = workspaceValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res
        .status(400)
        .json({ msg: error.details.map((err) => err.message) });
    }

    const duplicateWorkspace = await Workspace.findOne({
      ownerId: req.user._id,
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
        ownerId: req.user._id,
      },
      value,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!targetWorkspace) {
      return res.status(404).json({ msg: "Workspace not found" });
    }

    res.status(200).json({
      msg: "Workspace Updated Successfully",
      workspace: targetWorkspace,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const deleteWorkspace = async (req, res) => {
  try {

    const targetWorkspace = await Workspace.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!targetWorkspace) {
      return res.status(404).json({ msg: "Workspace not found" });
    }

    res.status(200).json({ msg: "Workspace Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
};
