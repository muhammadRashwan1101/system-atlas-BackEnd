const User = require('../models/user.model'); 

const searchTeamLeads = async (req, res) => {
  try {
    const { name } = req.query;

    const queryFilter = {
      role: 'techLead'
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

    res.status(200).json({
      success: true,
      count: teamLeads.length,
      data: teamLeads
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