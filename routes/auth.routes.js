const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authController = require("../controllers/authentication/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/current-user", authMiddleware, authController.currentUser);
router.get("/users", authMiddleware, authController.getUsers);
router.patch("/set-password", authMiddleware, authController.setNewPassword);
router.patch("/password", authMiddleware, authController.setNewPassword);
router.patch("/complete-onboarding", authMiddleware, authController.completeOnboarding);

router.patch("/users/:id/status", authMiddleware, authController.updateUserStatus);
router.put("/users/:id/status", authMiddleware, authController.updateUserStatus);
router.delete("/users/:id", authMiddleware, authController.deleteUser);
router.post("/users/:id/reset-password", authMiddleware, authController.resetUserPassword);

module.exports = router;
