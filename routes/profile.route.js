const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const profileController = require("../controllers/profile.controller");
const upload = require("../middlewares/uploadMiddleware");
const CheckRole = require("../middlewares/CheckRoleMiddleware");

router.get("/me", authMiddleware, profileController.getMyProfile);
router.patch("/me", authMiddleware, profileController.updateMyProfile);
router.delete("/me", authMiddleware, profileController.deactivateMyAccount);
router.get("/:userId", authMiddleware, profileController.getUserProfile);
router.patch(
  "/me/avatar",
  authMiddleware,
  upload.single("avatar"),
  profileController.uploadAvatar,
);
router.patch(
  "/me/notifications",
  authMiddleware,
  profileController.updateNotificationPreference,
);
router.get("/stats/overview", authMiddleware, profileController.getUserStats);
router.get("/", authMiddleware, profileController.getAllUsers);
router.delete(
  "/:userId",
  authMiddleware,
  CheckRole("admin"),
  profileController.deactivateUserById,
);

router.patch(
  "/:userId/suspend",
  authMiddleware,
  CheckRole("admin"),
  profileController.toggleSuspendUser,
);
module.exports = router;
