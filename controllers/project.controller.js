
const Project = require("../models/project.model");
const {
    projectValidation,
} = require("../controllers/validation/projectValidation");

const Workspace = require("../models/workspace.model");
const Team = require("../models/teams.model");
const CheckRole = require("../middlewares/CheckRoleMiddleware");

// =====================================================
// Create Project
// =====================================================

const createProject = async (req, res, next) => {
    try {
        if (!CheckRole(req, res, ["admin", "manager"])) {
            return;
        }

        const { workspaceId } = req.params;

        if (!workspaceId) {
            return res.status(400).json({
                msg: "workspaceId is required in URL",
            });
        }

        const { error, value } = projectValidation.validate(
            req.body,
            {
                abortEarly: false,
                stripUnknown: true,
            }
        );

        if (error) {
            return res.status(400).json({
                msg: error.details.map((err) => err.message),
            });
        }

        // =====================================================
        // Debug
        // =====================================================

        console.log("========== CREATE PROJECT DEBUG ==========");
        console.log("USER:", req.user);
        console.log("USER ID:", req.user?.id);
        console.log("USER _ID:", req.user?._id);
        console.log("USER ROLE:", req.user?.role);
        console.log("WORKSPACE ID:", workspaceId);

        // =====================================================
        // Find Workspace
        // =====================================================

        const workspaceCheck = await Workspace.findById(workspaceId);

        console.log(
            "WORKSPACE EXISTS:",
            !!workspaceCheck
        );

        console.log(
            "WORKSPACE OWNER:",
            workspaceCheck?.ownerId?.toString()
        );

        console.log(
            "SAME OWNER:",
            workspaceCheck?.ownerId?.toString() ===
                req.user?.id?.toString()
        );

        console.log("==========================================");

        // Workspace doesn't exist
        if (!workspaceCheck) {
            return res.status(404).json({
                msg: "Workspace not found",
            });
        }

        // =====================================================
        // Check Workspace Ownership
        // =====================================================

        if (
            workspaceCheck.ownerId?.toString() !==
            req.user?.id?.toString()
        ) {
            return res.status(403).json({
                msg: "You do not have access to this workspace",
            });
        }

        // =====================================================
        // Check Duplicate Project
        // =====================================================

        const projectExists = await Project.findOne({
            workspaceId,
            name: value.name,
        });

        if (projectExists) {
            return res.status(400).json({
                msg: "Project name already exists in this workspace",
            });
        }

        // =====================================================
        // Create Project
        // =====================================================

        const project = await Project.create({
            ...value,
            ownerId: req.user.id,
            workspaceId,
            status: "active",
        });

        return res.status(201).json({
            success: true,
            msg: "Project initialized successfully",
            project,
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// Get Projects
// =====================================================

const getProjects = async (req, res, next) => {
    try {
        if (
            !CheckRole(req, res, [
                "admin",
                "manager",
                "techLead",
            ])
        ) {
            return;
        }

        let query = {
            workspaceId: req.params.workspaceId,
        };

        const restrictedRoles = ["user", "techLead"];

        if (restrictedRoles.includes(req.user.role)) {
            const userTeams = await Team.find({
                $or: [
                    { members: req.user.id },
                    { teamLead: req.user.id },
                ],
            }).select("_id");

            const teamIds = userTeams.map(
                (team) => team._id
            );

            query.$or = [
                { ownerId: req.user.id },
                { ownerTeam: { $in: teamIds } },
            ];
        }

        const allProjects = await Project.find(query).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            projects: allProjects,
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// Get Project By ID
// =====================================================

const getProjectById = async (req, res, next) => {
    try {
        if (
            !CheckRole(req, res, [
                "admin",
                "manager",
                "techLead",
            ])
        ) {
            return;
        }

        const query = {
            _id: req.params.projectId,
            workspaceId: req.params.workspaceId,
        };

        const restrictedRoles = ["user", "techLead"];

        if (restrictedRoles.includes(req.user.role)) {
            const userTeams = await Team.find({
                $or: [
                    { members: req.user.id },
                    { teamLead: req.user.id },
                ],
            }).select("_id");

            const teamIds = userTeams.map(
                (team) => team._id
            );

            query.$or = [
                { ownerId: req.user.id },
                { ownerTeam: { $in: teamIds } },
            ];
        }

        const project = await Project.findOne(query);

        if (!project) {
            return res.status(404).json({
                msg: "Project not found or unauthorized",
            });
        }

        return res.status(200).json({
            project,
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// Update Project
// =====================================================

const updateProject = async (req, res, next) => {
    try {
        if (!CheckRole(req, res, ["admin", "manager"])) {
            return;
        }

        const { error, value } = projectValidation.validate(
            req.body,
            {
                abortEarly: false,
                stripUnknown: true,
            }
        );

        if (error) {
            return res.status(400).json({
                msg: error.details.map((err) => err.message),
            });
        }

        const updatedProject =
            await Project.findOneAndUpdate(
                {
                    _id: req.params.projectId,
                    workspaceId: req.params.workspaceId,
                },
                {
                    $set: value,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!updatedProject) {
            return res.status(404).json({
                msg: "Project not found or unauthorized",
            });
        }

        return res.status(200).json({
            msg: "Project updated successfully",
            project: updatedProject,
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// Delete Project
// =====================================================

const deleteProject = async (req, res, next) => {
    try {
        if (!CheckRole(req, res, ["admin", "manager"])) {
            return;
        }

        const deletedProject =
            await Project.findOneAndDelete({
                _id: req.params.projectId,
                workspaceId: req.params.workspaceId,
            });

        if (!deletedProject) {
            return res.status(404).json({
                msg: "Project not found or unauthorized",
            });
        }

        return res.status(200).json({
            msg: "Project deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
};

