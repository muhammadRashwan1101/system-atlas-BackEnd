const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const teamController = require("../controllers/team.controller");

// Create & Read All
router.post("/", authMiddleware, teamController.createTeam);
router.get("/", authMiddleware, teamController.getTeams);
router.post(
 "/:teamId/members",
 authMiddleware,
 teamController.addMember
);
router.get(
  "/:teamId/members",
  authMiddleware,
  teamController.getTeamMembers
);

// Read Single, Update & Delete
router.get("/:id", authMiddleware, teamController.getTeamById);
router.put("/:id", authMiddleware, teamController.updateTeam);
router.delete("/:id", authMiddleware, teamController.deleteTeam);

module.exports = router;