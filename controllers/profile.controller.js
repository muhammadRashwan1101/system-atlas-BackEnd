const User = require("../models/user.model")
const Component = require("../models/component.model")
const Project = require("../models/project.model")
const { updateProfileValidation } = require("./validation/profileValidation")


const getMyProfile = async (req, res , next) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            .populate("reportsTo", "firstName lastName jobTitle")

        if (!user) {
            return res.status(404).json({ msg: "User Not Found" })
        }

        const [ownedComponentsCount, ownedProjectsCount] = await Promise.all([
            Component.countDocuments({ createdBy: user._id }),
            Project.countDocuments({ ownerId: user._id })
        ])

        res.status(200).json({
            user,
            stats: {
                ownedComponents: ownedComponentsCount,
                ownedProjects: ownedProjectsCount
               
            }
        })
    } catch (error) {
        next(error);
    }
}


const getUserProfile = async (req, res , next) => {
    try {
        const user = await User.findById(req.params.userId)
            .select("-password -email")
            .populate("reportsTo", "firstName lastName jobTitle")

        if (!user) {
            return res.status(404).json({ msg: "User Not Found" })
        }

        const [ownedComponentsCount, ownedProjectsCount] = await Promise.all([
            Component.countDocuments({ createdBy: user._id }),
            Project.countDocuments({ ownerId: user._id })
        ])

        res.status(200).json({
            user,
            stats: {
                ownedComponents: ownedComponentsCount,
                ownedProjects: ownedProjectsCount
            }
        })
    } catch (error) {
        next(error);
    }
}


const updateMyProfile = async (req, res , next) => {
    const { error, value } = updateProfileValidation.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    })

    if (error) {
        return res.status(400).json({ msg: error.details.map(err => err.message) })
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: value },
            { new: true, runValidators: true }
        ).select("-password")

        if (!updatedUser) {
            return res.status(404).json({ msg: "User Not Found" })
        }

        res.status(200).json({ msg: "Profile Updated Successfully", user: updatedUser })
    } catch (error) {
      next(error);
    }
}


const deactivateMyAccount = async (req, res , next) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { accountStatus: "inactive" },
            { new: true }
        ).select("-password")

        if (!updatedUser) {
            return res.status(404).json({ msg: "User Not Found" })
        }

        res.status(200).json({ msg: "Account Deactivated Successfully" })
    } catch (error) {
       next(error);
    }
}

module.exports = {
    getMyProfile,
    getUserProfile,
    updateMyProfile,
    deactivateMyAccount
}