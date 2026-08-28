const User = require('../models/user.model'); 
const Project = require('../models/project.model');
const Team = require('../models/teams.model');

const searchTeamLeads = async (req, res) => {
  try {
    const { name } = req.query;

    const queryFilter = {
      role: { $in: ['techLead', 'manager', 'admin', 'user'] }
    };

    if (name && name.trim() !== '') {
      const cleanName = name.trim();
      queryFilter.$or = [
        { firstName: { $regex: cleanName, $options: 'i' } },
        { lastName: { $regex: cleanName, $options: 'i' } },
        { email: { $regex: cleanName, $options: 'i' } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: cleanName,
              options: "i"
            }
          }
        }
      ];
    }

    const teamLeads = await User.find(queryFilter).select('-password');
    const userIds = teamLeads.map((u) => u._id);

    // Count direct project ownership
    const projectAgg = await Project.aggregate([
      { $match: { ownerId: { $in: userIds } } },
      { $group: { _id: "$ownerId", count: { $sum: 1 } } }
    ]);

    const projectCountMap = new Map();
    projectAgg.forEach((p) => projectCountMap.set(p._id.toString(), p.count));

    // Filter out users who have reached the maximum limit of 3 projects
    const availableLeads = teamLeads
      .map((u) => {
        const uObj = u.toObject();
        const projectsCount = projectCountMap.get(u._id.toString()) || 0;
        return {
          ...uObj,
          projectsCount
        };
      })
      .filter((u) => u.projectsCount < 3);

    res.status(200).json({
      success: true,
      count: availableLeads.length,
      data: availableLeads
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to fetch team leads',
      error: error.message
    });
  }
};

module.exports = {
  searchTeamLeads
};
