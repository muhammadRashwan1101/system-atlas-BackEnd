const router = require("express").Router();

const authMiddleware = require("../middlewares/authMiddleware");

const teamMemberController = require("../controllers/teamMember.controller");

router.post(
  "/:id/members",
  authMiddleware,
  teamMemberController.addMembers
);

module.exports = router;