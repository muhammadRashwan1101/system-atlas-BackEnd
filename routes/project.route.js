const express = require("express");

const router = express.Router();

// Controllers
const projectController = require("../controllers/project.controller");
const setupWizardController = require("../controllers/setupWizard.controller");
const componentController = require("../controllers/component.controller");
const relationshipController = require("../controllers/relationship.controller");

// Middlewares
const authMiddleware = require("../middlewares/authMiddleware");
const architechtureValidator = require("../middlewares/architechtureValidator");
const wizardContextMiddleware = require("../middlewares/wizardContextMiddleware");

// =====================================================
// Authentication
// =====================================================

router.use(authMiddleware);

// =====================================================
// Project Routes
// =====================================================

// Create Project
router.post("/", projectController.createProject);

// Get All Projects
router.get("/", projectController.getProjects);

// Get Project By ID
router.get("/:projectId", projectController.getProjectById);

// Update Project
router.patch("/:projectId", projectController.updateProject);

// Delete Project
router.delete("/:projectId", projectController.deleteProject);

// =====================================================
// Setup Wizard Routes
// =====================================================

// Create Setup Wizard
router
    .route("/:projectId/wizard")
    .post(
        architechtureValidator,
        setupWizardController.newSetupWizard
    );

// Get / Update Setup Wizard
router
    .route("/:projectId/wizard/:wizardId")
    .get(
        wizardContextMiddleware,
        setupWizardController.getWizard
    )
    .patch(
        wizardContextMiddleware,
        setupWizardController.updateSetupWizard,
        componentController.createComponent
    );

// =====================================================
// Component Routes
// =====================================================

// Get Components By Project
router
    .route("/:projectId/components")
    .get(
        architechtureValidator,
        componentController.getComponentsByProjectId
    );

// =====================================================
// Relationship Routes
// =====================================================

// Create / Get Relationships
router
    .route("/:projectId/relationships")
    .post(
        architechtureValidator,
        relationshipController.createRelationship
    )
    .get(
        architechtureValidator,
        relationshipController.getRelationships
    );

// Get / Update / Delete Relationship
router
    .route("/:projectId/relationships/:relationshipId")
    .get(
        architechtureValidator,
        relationshipController.getRelationshipById
    )
    .patch(
        architechtureValidator,
        relationshipController.updateRelationship
    )
    .delete(
        architechtureValidator,
        relationshipController.deleteRelationship
    );

// =====================================================
// Export Router
// =====================================================

module.exports = router;
