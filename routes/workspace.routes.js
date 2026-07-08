const wrokspaceController = require("../controllers/workspace.controller")
const authMiddleware = require("../middlewares/authMiddleware")
const router = require("express").Router()

router.use(authMiddleware)

router.route("/")
    .post(wrokspaceController.createWorkspace)
    .get(wrokspaceController.getWorkspaces)

router.route("/:id")
    .get(wrokspaceController.getWorkspace)
    .patch(wrokspaceController.updateWorkspace)
    .delete(wrokspaceController.deleteWorkspace)

module.exports = router