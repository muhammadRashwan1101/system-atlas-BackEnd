const mongoose = require("mongoose");
const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { loginValidation, signUpValidation } = require("../validation/authValidation");

const register = async (req, res, next) => {
    // If name is provided instead of firstName/lastName, derive them
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
        console.log(error.details.map((err) => err.message));
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

module.exports = {
    register,
    login,
    currentUser,
    setNewPassword
};
