const projectController = require("../controllers/project.controller")
const authMiddleware = require("../middlewares/authMiddleware")
const setupWizardController = require("../controllers/setupWizard.controller")
const architechtureValidator = require("../middlewares/architechtureValidator")
const componentController = require("../controllers/component.controller");
const relationshipController = require("../controllers/relationship.controller");
const wizardContextMiddleware = require("../middlewares/wizardContextMiddleware")

const router = require("express").Router()
router.use(authMiddleware);

router.route("/:id")
    .get(projectController.getProjectById)
    .patch(projectController.updateProject)
    .delete(projectController.deleteProject)

router.route("/:projectId/wizard")
    .post(architechtureValidator, setupWizardController.newSetupWizard)

router.route("/:projectId/wizard/:wizardId")
        .get(wizardContextMiddleware, setupWizardController.getWizard)
        .patch(wizardContextMiddleware, setupWizardController.updateSetupWizard, componentController.createComponent)
        
router.route("/:projectId/components")
    .get(architechtureValidator, componentController.getComponentsByProjectId)

router.route("/:projectId/relationships")
    .post(architechtureValidator, relationshipController.createRelationship)
    .get(architechtureValidator, relationshipController.getRelationships)

router.route("/:projectId/relationships/:relationshipId")
    .get(architechtureValidator, relationshipController.getRelationshipById)
    .patch(architechtureValidator, relationshipController.updateRelationship)
    .delete(architechtureValidator, relationshipController.deleteRelationship)
    
module.exports = router