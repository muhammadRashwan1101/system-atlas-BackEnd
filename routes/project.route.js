const projectController = require("../controllers/project.controller")
const authMiddleware = require("../middlewares/authMiddleware")
const setupWizardController = require("../controllers/setupWizard.controller")
const router = require("express").Router()
router.use(authMiddleware);

router.route("/:id")
    .get(projectController.getProjectById)
    .patch(projectController.updateProject)
    .delete(projectController.deleteProject)

router.route("/:projectId/wizard")
    .post(setupWizardController.newSetupWizard)
    
module.exports = router