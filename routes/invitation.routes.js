const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const invitationController = require("../controllers/invitation.controller");

// Public verification routes
router.get("/verify/:token", invitationController.verifyInvitation);
router.get("/:token", invitationController.verifyInvitation);

// Protected routes (Requires Authentication)
router.use(authMiddleware);

router.post("/", invitationController.createInvitation);
router.get("/", invitationController.getInvitations);
router.post("/accept", invitationController.acceptInvitation);
router.delete("/:id", invitationController.revokeInvitation);

module.exports = router;
