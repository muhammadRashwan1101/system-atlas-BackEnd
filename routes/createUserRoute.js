const router = require("express").Router();

const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../controllers/authentication/createUserController");

// Create User
router.post("/Creat-User", authMiddleware, userController.createUser);

// Get All Users
router.get("/", authMiddleware, userController.getUsers);

// Get User By Id
router.get("/:userId", authMiddleware, userController.getUserById);

// Update User
router.put("/:userId", authMiddleware, userController.updateUser);

// Delete User (Soft Delete)
router.delete("/:userId", authMiddleware, userController.deleteUser);

module.exports = router;