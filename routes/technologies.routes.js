const router = require("express").Router()
const technologiesController = require("../controllers/utils/technologies.controller")

router.route("/")
    .get(technologiesController.getTechnologies)

module.exports = router