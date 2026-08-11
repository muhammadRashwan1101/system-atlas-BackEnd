const CheckRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                msg: "Forbidden: You do not have permission to perform this action"
            });
        }
        next();
    };
};

module.exports = CheckRole;