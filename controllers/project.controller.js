const Project = require("../models/project.model");
const {
  projectValidation,
} = require("../controllers/validation/projectValidation");
const Workspace = require("../models/workspace.model");
const Team = require("../models/teams.model");
const CheckRole = require("../middlewares/CheckRoleMiddleware");

/**
 * Utility function to safely escape special characters in regex strings.
 * Prevents Regular Expression Denial of Service (ReDoS) attacks and syntax errors.
 */
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.:=\^$|#\s\\]/g, "\\$&");

// =====================================================
// 1. Create Project
// =====================================================
const createProject = async (req, res, next) => {
  try {
    // Authorization Check: Restrict creation to Admin and Manager roles
    if (!CheckRole(req, res, ["admin", "manager"])) return;

    // Extract workspaceId from URL parameters or Request Body
    const workspaceId = req.params.workspaceId || req.body.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        msg: "workspaceId is required in URL parameters or request body",
      });
    }

    // Validate incoming payload against Joi schema
    const { error, value } = projectValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Remove undefined/extra fields
    });

    if (error) {
      return res.status(400).json({
        success: false,
        msg: error.details.map((err) => err.message),
      });
    }

    // Query Workspace access: Admins access any workspace; Managers access owned workspaces only
    const workspaceQuery =
      req.user.role === "admin"
        ? { _id: workspaceId }
        : { _id: workspaceId, ownerId: req.user.id };

    const workspace = await Workspace.findOne(workspaceQuery);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        msg: "Workspace not found or access denied",
      });
    }

    // Check for duplicate project names within the target workspace
    const projectExists = await Project.findOne({
      workspaceId,
      name: value.name,
    });

    if (projectExists) {
      return res.status(400).json({
        success: false,
        msg: "A project with this name already exists in this workspace",
      });
    }

    // Persist new project record
    const project = await Project.create({
      ...value,
      ownerId: req.user.id,
      workspaceId,
      status: value.status || "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      msg: "Project created successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// 2. Get Workspace Dashboard Projects (Scoped & Filtered)
// =====================================================
const getProjects = async (req, res, next) => {
  try {
    // Authorization Check: Permit Admins, Managers, and Tech Leads
    if (!CheckRole(req, res, ["admin", "manager", "techLead"])) return;

    // Extract compulsory workspaceId context from route params or query
    const workspaceId = req.params.workspaceId || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        msg: "workspaceId is required to load the workspace dashboard",
      });
    }

    // Verify workspace existence and ensure current user has permission to view it
    const workspaceQuery =
      req.user.role === "admin"
        ? { _id: workspaceId }
        : { _id: workspaceId, ownerId: req.user.id };

    const workspace = await Workspace.findOne(workspaceQuery);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        msg: "Workspace not found or access denied",
      });
    }

    // Base query scoped strictly to the current workspace context
    let query = { workspaceId };

    // Apply Role-Based Access Controls (RBAC) for team leads/members within this workspace
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      const userTeams = await Team.find({
        $or: [{ members: req.user.id }, { teamLead: req.user.id }],
      }).select("_id");

      const teamIds = userTeams.map((team) => team._id);

      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ ownerId: req.user.id }, { ownerTeam: { $in: teamIds } }],
      });
    }

    // Extract dynamic dashboard filters from query parameters
    const {
      search,
      status,
      targetEnvironment,
      env,
      systemTopology,
      manager,
      techLead,
    } = req.query;

    // Parametric Filter: Project Status (Exact case-insensitive match)
    if (status && status !== "All" && status !== "any") {
      query.status = { $regex: new RegExp(`^${escapeRegex(status)}$`, "i") };
    }

    // Parametric Filter: Target Environment
    const selectedEnv = targetEnvironment || env;
    if (selectedEnv && selectedEnv !== "All" && selectedEnv !== "any") {
      query.targetEnvironment = {
        $regex: new RegExp(`^${escapeRegex(selectedEnv)}$`, "i"),
      };
    }

    // Parametric Filter: System Topology
    if (systemTopology && systemTopology !== "All" && systemTopology !== "any") {
      query.systemTopology = systemTopology;
    }

    // Parametric Filter: Manager Name
    if (manager && manager !== "All" && manager !== "any") {
      query.managerName = { $regex: escapeRegex(manager), $options: "i" };
    }

    // Parametric Filter: Tech Lead Name
    if (techLead && techLead !== "All" && techLead !== "any") {
      query.techLead = { $regex: escapeRegex(techLead), $options: "i" };
    }

    // Multi-Field Fuzzy Search: Searches across name, description, and managerName fields
    if (search && search.trim() !== "") {
      const escapedSearch = escapeRegex(search.trim());
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: escapedSearch, $options: "i" } },
          { description: { $regex: escapedSearch, $options: "i" } },
          { managerName: { $regex: escapedSearch, $options: "i" } },
        ],
      });
    }

    // Execute database search with sort order (newest first)
    const projects = await Project.find(query).sort({ createdAt: -1 });

    // Return response containing active workspace metadata alongside matching projects
    return res.status(200).json({
      success: true,
      workspace: {
        id: workspace._id,
        name: workspace.name, // Explicit workspace name returned to frontend header
      },
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// 3. Get Project By ID
// =====================================================
const getProjectById = async (req, res, next) => {
  try {
    if (!CheckRole(req, res, ["admin", "manager", "techLead"])) return;

    const projectId = req.params.id || req.params.projectId;
    let query = { _id: projectId };

    if (req.params.workspaceId) {
      query.workspaceId = req.params.workspaceId;
    }

    // RBAC filtering
    if (req.user.role !== "admin") {
      if (req.user.role === "manager") {
        query.ownerId = req.user.id;
      } else {
        const userTeams = await Team.find({
          $or: [{ members: req.user.id }, { teamLead: req.user.id }],
        }).select("_id");

        const teamIds = userTeams.map((team) => team._id);

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
        success: false,
        msg: "Project not found or access denied",
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
// 4. Update Project
// =====================================================
const updateProject = async (req, res, next) => {
  try {
    if (!CheckRole(req, res, ["admin", "manager"])) return;

    const projectId = req.params.id || req.params.projectId;

    const { error, value } = projectValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        msg: error.details.map((err) => err.message),
      });
    }

    let query = { _id: projectId };

    if (req.params.workspaceId) {
      query.workspaceId = req.params.workspaceId;
    }

    if (req.user.role !== "admin") {
      query.ownerId = req.user.id;
    }

    // Verify existing project before updating
    const existingProject = await Project.findOne(query);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        msg: "Project not found or access denied",
      });
    }

    // Duplicate name validation within workspace, ignoring current project ID
    if (value.name) {
      const targetWorkspaceId =
        req.params.workspaceId || value.workspaceId || existingProject.workspaceId;

      const projectExists = await Project.findOne({
        workspaceId: targetWorkspaceId,
        name: value.name,
        _id: { $ne: projectId },
      });

      if (projectExists) {
        return res.status(400).json({
          success: false,
          msg: "A project with this name already exists in this workspace",
        });
      }
    }

    const updatedProject = await Project.findOneAndUpdate(
      query,
      { $set: value },
      { new: true, runValidators: true }
    );

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
// 5. Delete Project
// =====================================================
const deleteProject = async (req, res, next) => {
  try {
    if (!CheckRole(req, res, ["admin", "manager"])) return;

    const projectId = req.params.id || req.params.projectId;
    let query = { _id: projectId };

    if (req.user.role !== "admin") {
      query.ownerId = req.user.id;
    }

    if (req.params.workspaceId) {
      query.workspaceId = req.params.workspaceId;
    }

    const deletedProject = await Project.findOneAndDelete(query);

    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        msg: "Project not found or access denied",
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

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};