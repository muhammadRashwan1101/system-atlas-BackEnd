const workspaceController = require("../controllers/workspace.controller");
const projectController = require("../controllers/project.controller");
const authMiddleware = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.use(authMiddleware);

router
  .route("/")
  .post(workspaceController.createWorkspace)
  .get(workspaceController.getWorkspaces);

router
  .route("/:workspaceId")
  .get(workspaceController.getWorkspace)
  .patch(workspaceController.updateWorkspace)
  .delete(workspaceController.deleteWorkspace);

router
  .route("/:workspaceId/projects")
  .post(projectController.createProject)
  .get(projectController.getProjects);

module.exports = router;