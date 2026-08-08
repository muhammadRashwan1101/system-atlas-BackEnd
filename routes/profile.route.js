const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware")
const profileController = require("../controllers/profile.controller");
const upload = require("../middlewares/uploadMiddleware");

router.get("/me", authMiddleware, profileController.getMyProfile);
router.patch("/me", authMiddleware, profileController.updateMyProfile);
router.delete("/me", authMiddleware, profileController.deactivateMyAccount);
router.get("/:userId", authMiddleware, profileController.getUserProfile);
router.patch("/me/avatar", authMiddleware, upload.single("avatar"), profileController.uploadAvatar);
router.patch("/me/notifications", authMiddleware, profileController.updateNotificationPreference);

module.exports = router;