const mongoose = require("mongoose");
const User = require("../../models/user.model");
const Project = require("../../models/project.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { loginValidation, signUpValidation } = require("../validation/authValidation");

const register = async (req, res, next) => {
    if (req.body.name && (!req.body.firstName || !req.body.lastName)) {
        const parts = req.body.name.trim().split(" ");
        req.body.firstName = req.body.firstName || parts[0] || "User";
        req.body.lastName = req.body.lastName || parts.slice(1).join(" ") || parts[0];
    }

    const { error, value } = signUpValidation.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({ msg: error.details.map((err) => err.message) });
    }

    try {
        const normalizedEmail = value.email.toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({ msg: "User Already Exists" });
        }

        const hashedPass = await bcrypt.hash(value.password, 12);
        value.password = hashedPass;
        value.email = normalizedEmail;
        delete value.confirmPassword;

        const newUser = await User.create(value);
        res.status(201).json({
            msg: "User Created Successfully",
            user: {
                id: newUser._id,
                name: newUser.fullName,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role,
                onboardingStatus: newUser.onboardingStatus,
                mustChangePassword: Boolean(newUser.mustChangePassword)
            }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    const { error, value } = loginValidation.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({ msg: error.details.map((err) => err.message) });
    }

    try {
        const { email, password } = value;
        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            return res.status(401).json({ msg: "Wrong Email or Password" });
        }
        if (user.accountStatus === "inactive") {
            return res.status(403).json({ msg: "This account has been deactivated." });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ msg: "Wrong Email or Password" });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({
            msg: `Logged In Successfully. Welcome ${user.fullName}!`,
            token,
            user: {
                id: user._id,
                name: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                onboarding: user.onboardingStatus,
                onboardingStatus: user.onboardingStatus,
                mustChangePassword: Boolean(user.mustChangePassword),
                workspaceAccess: user.workspaceAccess,
                avatar: user.avatar,
                jobTitle: user.jobTitle,
                department: user.department
            }
        });
    } catch (error) {
        next(error);
    }
};

const currentUser = async (req, res, next) => {
    try {
        const userData = await User.findById(req.user.id).select("-password");
        if (!userData) {
            return res.status(404).json({ msg: "User Not Found" });
        }

        const user = {
            id: userData._id,
            name: userData.fullName,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
            onboarding: userData.onboardingStatus,
            onboardingStatus: userData.onboardingStatus,
            mustChangePassword: Boolean(userData.mustChangePassword),
            workspaceAccess: userData.workspaceAccess,
            avatar: userData.avatar,
            jobTitle: userData.jobTitle,
            department: userData.department,
            accountStatus: userData.accountStatus
        };

        res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const { search, role, excludeMaxProjects } = req.query;
        const query = {};

        if (role && role !== "All" && role !== "All Roles") {
            query.role = { $regex: new RegExp(`^${role}$`, "i") };
        }

        if (search && search.trim()) {
            const cleanSearch = search.trim();
            query.$or = [
                { firstName: { $regex: cleanSearch, $options: "i" } },
                { lastName: { $regex: cleanSearch, $options: "i" } },
                { email: { $regex: cleanSearch, $options: "i" } },
                { jobTitle: { $regex: cleanSearch, $options: "i" } },
                { department: { $regex: cleanSearch, $options: "i" } }
            ];
        }

        const rawUsers = await User.find(query).select("-password");
        const userIds = rawUsers.map((u) => u._id);

        const projectAgg = await Project.aggregate([
            { $match: { ownerId: { $in: userIds } } },
            { $group: { _id: "$ownerId", count: { $sum: 1 } } }
        ]);

        const projectCountMap = new Map();
        projectAgg.forEach((p) => projectCountMap.set(p._id.toString(), p.count));

        let users = rawUsers.map((u) => {
            const uObj = u.toObject();
            const projectsCount = projectCountMap.get(u._id.toString()) || 0;
            return {
                ...uObj,
                id: uObj._id,
                name: u.fullName,
                projectsCount,
                isMaxProjects: projectsCount >= 3
            };
        });

        // If excludeMaxProjects is true, filter out users who have reached the 3 project limit
        if (excludeMaxProjects === "true" || excludeMaxProjects === true) {
            users = users.filter((u) => u.projectsCount < 3);
        }

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (err) {
        next(err);
    }
};

const setNewPassword = async (req, res, next) => {
    try {
        const { newPassword, confirmPassword, password } = req.body;
        const pwdToSet = newPassword || password;

        if (!pwdToSet || typeof pwdToSet !== "string" || pwdToSet.length < 6) {
            return res.status(400).json({ msg: "New password must be at least 6 characters long" });
        }

        if (confirmPassword && pwdToSet !== confirmPassword) {
            return res.status(400).json({ msg: "Passwords do not match" });
        }

        const user = await User.findById(req.user.id).select("+password");
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const isSameAsOld = await bcrypt.compare(pwdToSet, user.password);
        if (isSameAsOld) {
            return res.status(400).json({ msg: "New password cannot be the same as your temporary password" });
        }

        const hashedPass = await bcrypt.hash(pwdToSet, 12);
        user.password = hashedPass;
        user.mustChangePassword = false;
        user.onboardingStatus = "completed";
        await user.save();

        res.status(200).json({
            msg: "Password updated successfully. Your account is now active.",
            user: {
                id: user._id,
                name: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                onboarding: user.onboardingStatus,
                onboardingStatus: user.onboardingStatus,
                mustChangePassword: false,
                workspaceAccess: user.workspaceAccess,
                avatar: user.avatar,
                jobTitle: user.jobTitle,
                department: user.department
            }
        });
    } catch (err) {
        next(err);
    }
};

const completeOnboarding = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: "User Not Found" });
        }
        user.onboardingStatus = "completed";
        await user.save();

        res.status(200).json({
            msg: "Onboarding completed successfully",
            user: {
                id: user._id,
                name: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                onboarding: "completed",
                onboardingStatus: "completed",
                mustChangePassword: Boolean(user.mustChangePassword),
                workspaceAccess: user.workspaceAccess,
                avatar: user.avatar,
                jobTitle: user.jobTitle,
                department: user.department
            }
        });
    } catch (err) {
        next(err);
    }
};


const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, accountStatus } = req.body;
        const newStatus = (status || accountStatus || 'active').toLowerCase();

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.accountStatus = newStatus === 'suspended' ? 'inactive' : 'active';
        user.status = newStatus.toUpperCase();
        await user.save();

        res.status(200).json({
            msg: `User status updated to ${newStatus}`,
            user: {
                id: user._id,
                name: user.fullName,
                status: user.status,
                accountStatus: user.accountStatus
            }
        });
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json({ msg: 'User deleted successfully', id });
    } catch (err) {
        next(err);
    }
};

const resetUserPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.mustChangePassword = true;
        await user.save();
        res.status(200).json({ msg: 'Password reset flagged. User will be required to reset password on next login.', id });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    updateUserStatus,
    deleteUser,
    resetUserPassword,
    register,
    login,
    currentUser,
    getUsers,
    setNewPassword,
    completeOnboarding
};
