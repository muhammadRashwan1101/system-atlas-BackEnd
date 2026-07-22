const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware")
const authController = require("../controllers/authentication/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/current-user", authMiddleware, authController.currentUser);

module.exports = router;