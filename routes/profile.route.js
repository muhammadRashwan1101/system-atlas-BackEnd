const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware")
const profileController = require("../controllers/profile.controller");

router.get("/me", authMiddleware, profileController.getMyProfile);
router.patch("/me", authMiddleware, profileController.updateMyProfile);
router.delete("/me", authMiddleware, profileController.deactivateMyAccount);
router.get("/:userId", authMiddleware, profileController.getUserProfile);

module.exports = router;