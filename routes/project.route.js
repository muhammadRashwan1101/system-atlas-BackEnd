const projectController = require("../controllers/project.controller")
const authMiddleware = require("../middlewares/authMiddleware")
const router = require("express").Router()
router.use(authMiddleware);
router.route("/workspaces/:workspaceId/projects")
    .post(projectController.createProject);
router.route("/workspaces/:workspaceId/projects")
    .get(projectController.getProjects);

router.route("/:id")
    .get(projectController.getProjectById)
    .patch(projectController.updateProject)
    .delete(projectController.deleteProject)

module.exports = router