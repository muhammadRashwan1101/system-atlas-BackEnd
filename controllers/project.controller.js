const Project = require("../models/project.model");
const { projectValidation } = require("../controllers/validation/projectValidation");
const Workspace = require("../models/workspace.model");
const CheckRole = require("../middlewares/CheckRoleMiddleware");

const createProject = async (req, res) => {
    try {
        if (!CheckRole(req, res, ["admin", "manager"])) return;

        const { workspaceId } = req.params;

        if (!workspaceId) {
            return res.status(400).json({
                msg: "workspaceId is required in URL"
            });
        }

        const { error, value } = projectValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                msg: error.details.map(err => err.message)
            });
        }

        const workspace = await Workspace.findOne({
            _id: workspaceId,
            ownerId: req.user.id
        });

        if (!workspace) {
            return res.status(404).json({
                msg: "Workspace not found or access denied"
            });
        }

        const projectExists = await Project.findOne({
            workspaceId,
            name: value.name
        });

        if (projectExists) {
            return res.status(400).json({
                msg: "Project name already exists in this workspace"
            });
        }

        const project = await Project.create({
            ...value,
            ownerId: req.user.id,
            workspaceId,
            status: "active"
        });

        return res.status(201).json({
            success: true,
            msg: "Project initialized successfully",
            project
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            msg: error.message
        });
    }
};


const getProjects = async (req, res) => {
    try {
        if (!CheckRole(req, res, ["admin", "manager", "techLead"])) return;

        let query = { workspaceId: req.params.workspaceId };

        const restrictedRoles = ["user", "techLead"];

        if (restrictedRoles.includes(req.user.role)) {

            const userTeams = await Team.find({
                $or: [
                    { members: req.user._id },
                    { teamLead: req.user._id }
                ]
            }).select("_id");

            const teamIds = userTeams.map(team => team._id);

            query.$or = [
                { ownerId: req.user._id },
                { ownerTeam: { $in: teamIds } }
            ];
        }
        const allProjects = await Project.find({
            workspaceId: req.params.workspaceId,
            ownerId: req.user._id
        }).sort({
            createdAt: -1
        });


        res.status(200).json({
            projects: allProjects
        });

    } catch (error) {
        next(error);
    }
};

const getProjectById = async (req, res) => {
    try {
        if (!CheckRole(req, res, ["admin", "manager", "techLead"])) return;
        let query = {
            _id: req.params.projectId,
            workspaceId: req.params.workspaceId
        };
        const restrictedRoles = ["user", "techLead"];

        if (restrictedRoles.includes(req.user.role)) {

            const userTeams = await Team.find({
                $or: [
                    { members: req.user._id },
                    { teamLead: req.user._id }
                ]
            }).select("_id");

            const teamIds = userTeams.map(team => team._id);


            query.$or = [
                { ownerId: req.user._id },
                { ownerTeam: { $in: teamIds } }
            ];
        }
        const project = await Project.findOne(query);

        if (!project) {
            return res.status(404).json({ msg: "Project not found or unauthorized" });
        }

        return res.status(200).json({ project });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};
const updateProject = async (req, res) => {
    try {

        if (!CheckRole(req, res, ["admin", "manager", "techLead"])) return;


        const { error, value } = projectValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({ msg: error.details.map((err) => err.message) });
        }


        const updatedProject = await Project.findOneAndUpdate(
            {
                _id: req.params.projectId,
                workspaceId: req.params.workspaceId,
                ownerId: req.user._id
            },
            { $set: value },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ msg: "Project not found or unauthorized" });
        }

        return res.status(200).json({ msg: "Project updated successfully", project: updatedProject });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        if (!CheckRole(req, res, ["admin", "manager"])) return;

        const deletedProject = await Project.findOneAndDelete({
            _id: req.params.projectId,
            workspaceId: req.params.workspaceId,
            ownerId: req.user._id
        });

        if (!deletedProject) {
            return res.status(404).json({ msg: "Project not found or unauthorized" });
        }

        return res.status(200).json({ msg: "Project deleted successfully" });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};
module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject }
