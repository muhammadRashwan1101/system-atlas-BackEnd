const projectController = require("../controllers/project.controller")
const authMiddleware = require("../middlewares/authMiddleware")
const router = require("express").Router()

router.use(authMiddleware)

router.route("/")
    .post(projectController.createProject)
    .get(projectController.getProjects)

router.route("/:id")
    .get(projectController.getProjectById)
    .patch(projectController.updateProject)
    .delete(projectController.deleteProject)

module.exports = router