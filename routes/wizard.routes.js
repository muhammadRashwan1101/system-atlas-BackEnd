const router = require("express").Router()
const setupWizardController = require("../controllers/setupWizard.controller")
const authMiddleware = require("../middlewares/authMiddleware")

router.use(authMiddleware)

router.route("/:wizardId")
    .patch(setupWizardController.updateSetupWizard)


module.exports = router