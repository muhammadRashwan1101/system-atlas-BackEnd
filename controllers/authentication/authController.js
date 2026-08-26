const mongoose = require("mongoose");
const User = require("../../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { loginValidation, signUpValidation,  createUserValidation } = require("../validation/authValidation")
const { loginValidation, signUpValidation } = require("../validation/authValidation")
const generateEmployeeId = require("../utils/generateEmployeeId");

const register = async (req, res, next) => {
  const { error, value } = signUpValidation.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      msg: error.details.map((err) => err.message),
    });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({
      email: value.email,
    });

    if (existingUser) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    // Hash password
    value.password = await bcrypt.hash(value.password, 12);

    // Generate Employee ID
    const employeeId = await generateEmployeeId();

    // Create user
    const newUser = await User.create({
      ...value,
      employeeId,
    });

    return res.status(201).json({
      success: true,
      msg: "User created successfully",
      user: {
        id: newUser._id,
        employeeId: newUser.employeeId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    // Duplicate employeeId
    if (error.code === 11000 && error.keyPattern?.employeeId) {
      return res.status(400).json({
        msg: "Employee ID already exists. Please try again.",
      });
    }

    next(error);
  }
};

const login = async (req, res, next) => {
    const { error, value } = loginValidation.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({ msg: error.details.map(err => err.message) })
    }

    try {
        const { email, password } = value
        value.email = email.toLowerCase()

        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            return res.status(401).json({ msg: "Wrong Email or Password" })
        }
        if (user.accountStatus === "inactive") {
            return res.status(403).json({ msg: "This account has been deactivated." })
        }
        const passwordMatch = await bcrypt.compare(password, user.password)
        delete value.confrimPassword

        if (!passwordMatch) {
            return res.status(400).json({ msg: "Wrong Email or Password" })
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" })
        res.status(200).json({ msg: `Logged In Successfully. Welcome ${user.fullName}!`, token })
    } catch (error) {
        next(error)
    }
}

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
            onboarding: userData.onboardingStatus
        }
        if (!user) {
            return res.status(404).json({ msg: "User Not Found" })
        }

        res.status(200).json({ user })
    } catch (err) {
        next(err)
    }
}

const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query?.trim()) {
      return res.status(400).json({
        msg: "Search query is required",
      });
    }

    const users = await User.find({
      $or: [
        {
          employeeId: {
            $regex: query,
            $options: "i",
          },
        },
        {
          firstName: {
            $regex: query,
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: query,
            $options: "i",
          },
        },
        {
          email: {
            $regex: query,
            $options: "i",
          },
        },
      ],
    })
      .select("employeeId firstName lastName email role")
      .limit(10);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    register,
    login,
    currentUser,
     searchUsers
}
