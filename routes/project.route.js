const projectController = require("../controllers/project.controller")
const authMiddleware = require("../middlewares/authMiddleware")
const router = require("express").Router()
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