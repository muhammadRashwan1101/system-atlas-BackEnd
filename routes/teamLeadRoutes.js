const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { searchTeamLeads } = require('../controllers/teamLeadController');
router.get('/search', authMiddleware, searchTeamLeads);

module.exports = router;