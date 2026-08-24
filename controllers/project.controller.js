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
        if (!CheckRole(req, res, ["admin", "manager"])) return;

        const workspaceId =
            req.params.workspaceId || req.body.workspaceId;

        if (!workspaceId) {
            return res.status(400).json({
                msg: "workspaceId is required in URL params or Request Body",
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

        // Admin can access any workspace.
        // Manager can only access workspaces they own.
        const workspaceQuery =
            req.user.role === "admin"
                ? { _id: workspaceId }
                : {
                      _id: workspaceId,
                      ownerId: req.user.id,
                  };

        const workspace = await Workspace.findOne(workspaceQuery);

        if (!workspace) {
            return res.status(404).json({
                msg: "Workspace not found or access denied",
            });
        }

        // Prevent duplicate project names
        // inside the same workspace
        const projectExists = await Project.findOne({
            workspaceId,
            name: value.name,
        });

        if (projectExists) {
            return res.status(400).json({
                msg: "Project name already exists in this workspace",
            });
        }

        const project = await Project.create({
            ...value,
            ownerId: req.user.id,
            workspaceId,
            status: value.status || "ACTIVE",
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
        if (!CheckRole(req, res, ["admin", "manager", "techLead"])) {
            return;
        }

        const {
            search,
            workspaceId,
            status,
            targetEnvironment,
            env,
            systemTopology,
            manager,
            techLead,
        } = req.query;

        let query = {};

        // =================================================
        // Workspace Filter
        // =================================================

        const targetWorkspace =
            req.params.workspaceId || workspaceId;

        if (
            targetWorkspace &&
            targetWorkspace !== "All" &&
            targetWorkspace !== "any"
        ) {
            query.workspaceId = targetWorkspace;
        }

        // =================================================
        // RBAC
        // =================================================

        if (req.user.role !== "admin") {
            if (req.user.role === "manager") {
                // Managers can see their own projects
                query.ownerId = req.user.id;
            } else {
                // Tech leads can see projects they own
                // or projects belonging to their teams

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
        }

        // =================================================
        // Status Filter
        // =================================================

        if (
            status &&
            status !== "All" &&
            status !== "any"
        ) {
            query.status = {
                $regex: new RegExp(`^${status}$`, "i"),
            };
        }

        // =================================================
        // Environment Filter
        // =================================================

        const selectedEnv = targetEnvironment || env;

        if (
            selectedEnv &&
            selectedEnv !== "All" &&
            selectedEnv !== "any"
        ) {
            query.targetEnvironment = {
                $regex: new RegExp(`^${selectedEnv}$`, "i"),
            };
        }

        // =================================================
        // System Topology Filter
        // =================================================

        if (
            systemTopology &&
            systemTopology !== "All" &&
            systemTopology !== "any"
        ) {
            query.systemTopology = systemTopology;
        }

        // =================================================
        // Manager Filter
        // =================================================

        if (
            manager &&
            manager !== "All" &&
            manager !== "Any" &&
            manager !== "any"
        ) {
            query.managerName = {
                $regex: manager,
                $options: "i",
            };
        }

        // =================================================
        // Tech Lead Filter
        // =================================================

        if (
            techLead &&
            techLead !== "All" &&
            techLead !== "Any" &&
            techLead !== "any"
        ) {
            query.techLead = {
                $regex: techLead,
                $options: "i",
            };
        }

        // =================================================
        // Search
        // =================================================

        if (search && search.trim() !== "") {
            query.$and = query.$and || [];

            query.$and.push({
                $or: [
                    {
                        name: {
                            $regex: search.trim(),
                            $options: "i",
                        },
                    },
                    {
                        description: {
                            $regex: search.trim(),
                            $options: "i",
                        },
                    },
                    {
                        managerName: {
                            $regex: search.trim(),
                            $options: "i",
                        },
                    },
                ],
            });
        }

        // =================================================
        // Fetch Projects
        // =================================================

        const projects = await Project.find(query)
            .populate("workspaceId", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: projects.length,
            projects,
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
        if (!CheckRole(req, res, ["admin", "manager", "techLead"])) {
            return;
        }

        const projectId =
            req.params.id || req.params.projectId;

        let query = {
            _id: projectId,
        };

        // Workspace restriction
        if (req.params.workspaceId) {
            query.workspaceId = req.params.workspaceId;
        }

        // =================================================
        // RBAC
        // =================================================

        if (req.user.role !== "admin") {
            if (req.user.role === "manager") {
                query.ownerId = req.user.id;
            } else {
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
        }

        const project = await Project.findOne(query).populate(
            "workspaceId",
            "name"
        );

        if (!project) {
            return res.status(404).json({
                msg: "Project not found or unauthorized",
            });
        }

        return res.status(200).json({
            success: true,
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

        const projectId =
            req.params.id || req.params.projectId;

        // =================================================
        // Validate Body
        // =================================================

        const { error, value } = projectValidation.validate(
            req.body,
            {
                abortEarly: false,
                stripUnknown: true,
            }
        );

        if (error) {
            return res.status(400).json({
                msg: error.details.map(
                    (err) => err.message
                ),
            });
        }

        // =================================================
        // Build Query
        // =================================================

        let query = {
            _id: projectId,
        };

        if (req.params.workspaceId) {
            query.workspaceId = req.params.workspaceId;
        }

        // Admin can update any project.
        // Manager can update only owned projects.
        if (req.user.role !== "admin") {
            query.ownerId = req.user.id;
        }

        // =================================================
        // Check Workspace Access
        // =================================================

        if (req.params.workspaceId) {
            const workspaceQuery =
                req.user.role === "admin"
                    ? { _id: req.params.workspaceId }
                    : {
                          _id: req.params.workspaceId,
                          ownerId: req.user.id,
                      };

            const workspace = await Workspace.findOne(
                workspaceQuery
            );

            if (!workspace) {
                return res.status(404).json({
                    msg: "Workspace not found or access denied",
                });
            }
        }

        // =================================================
        // Prevent Duplicate Project Names
        // =================================================

        if (value.name) {
            const duplicateQuery = {
                workspaceId:
                    req.params.workspaceId ||
                    value.workspaceId,
                name: value.name,
                _id: { $ne: projectId },
            };

            if (duplicateQuery.workspaceId) {
                const projectExists =
                    await Project.findOne(duplicateQuery);

                if (projectExists) {
                    return res.status(400).json({
                        msg: "Project name already exists in this workspace",
                    });
                }
            }
        }

        // =================================================
        // Update
        // =================================================

        const updatedProject =
            await Project.findOneAndUpdate(
                query,
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
            success: true,
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

        const projectId =
            req.params.id || req.params.projectId;

        let query = {
            _id: projectId,
        };

        // Manager can delete only owned projects
        if (req.user.role !== "admin") {
            query.ownerId = req.user.id;
        }

        // Workspace restriction
        if (req.params.workspaceId) {
            query.workspaceId = req.params.workspaceId;
        }

        const deletedProject =
            await Project.findOneAndDelete(query);

        if (!deletedProject) {
            return res.status(404).json({
                msg: "Project not found or unauthorized",
            });
        }

        return res.status(200).json({
            success: true,
            msg: "Project deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// Exports
// =====================================================

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
};