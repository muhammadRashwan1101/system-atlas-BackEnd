const wrokspaceController = require("../controllers/workspace.controller")
const projectController = require("../controllers/project.controller")
const authMiddleware = require("../middlewares/authMiddleware")
const router = require("express").Router()

router.use(authMiddleware)

router.route("/")
    .post(wrokspaceController.createWorkspace)
    .get(wrokspaceController.getWorkspaces)

router.route("/:workspaceId")
    .get(wrokspaceController.getWorkspace)
    .patch(wrokspaceController.updateWorkspace)
    .delete(wrokspaceController.deleteWorkspace)

router.route("/:workspaceId/projects")
    .post(projectController.createProject)
    .get(projectController.getProjects)

module.exports = router