const router = require("express").Router()
const setupWizardController = require("../controllers/setupWizard.controller")
const authMiddleware = require("../middlewares/authMiddleware")
const componentController = require("../controllers/component.controller")
const wizardContextMiddleware = require("../middlewares/wizardContextMiddleware")

router.use(authMiddleware)

router.route("/:wizardId")
    .patch(wizardContextMiddleware, setupWizardController.updateSetupWizard, componentController.createComponent)


module.exports = router