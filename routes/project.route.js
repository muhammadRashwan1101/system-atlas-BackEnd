const projectController = require("../controllers/project.controller")
const authMiddleware = require("../middlewares/authMiddleware")
const router = require("express").Router()
router.use(authMiddleware);
router.route("/workspaces/:workspaceId/projects")
    .post(projectController.createProject);
router.route("/workspaces/:workspaceId/projects")
    .get(projectController.getProjects);

router.route("/:id")
const CheckRoleMiddleware = require("../middlewares/CheckRoleMiddleware")
const setupWizardController = require("../controllers/setupWizard.controller")

router.use(authMiddleware)

router.route("/:projectId")
    .get(projectController.getProjectById)
    .patch(projectController.updateProject)
    .delete(projectController.deleteProject)

router.route("/:projectId/wizard")
    .post(setupWizardController.newSetupWizard)
    
module.exports = router