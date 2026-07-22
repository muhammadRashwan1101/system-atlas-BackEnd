const ChekRole = (req, res, allowedRoles) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        res.status(403).json({
            msg: "Forbidden: You do not have permission to perform this action"
        });
        return false; 
    }
    return true; 
};

module.exports = ChekRole;