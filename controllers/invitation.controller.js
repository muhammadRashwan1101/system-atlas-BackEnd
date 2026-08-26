const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Invitation = require("../models/invitation.model");
const User = require("../models/user.model");
const Workspace = require("../models/workspace.model");
const Team = require("../models/teams.model");
const {
  createInvitationValidation,
  acceptInvitationValidation,
} = require("./validation/invitationValidation");

/**
 * Generate a random secure password if none provided
 */
const generateRandomPassword = (length = 12) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

/**
 * POST /api/invitations
 * Create invitation / Provision user with temporary credentials
 */
const createInvitation = async (req, res, next) => {
  try {
    const { error, value } = createInvitationValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        msg: error.details.map((err) => err.message),
      });
    }

    const {
      email,
      role = "user",
      workspaceId,
      teamId = null,
      temporaryPassword,
      requirePasswordReset = true,
      firstName = "",
      lastName = "",
      jobTitle = "",
      level = "",
      department = "",
    } = value;

    // Verify workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ msg: "Target workspace not found" });
    }

    // Verify team exists if provided
    if (teamId) {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ msg: "Target team not found" });
      }
    }

    const normalizedEmail = email.toLowerCase().trim();
    const inviterId = req.user.id;

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Check if user already exists
    let existingUser = await User.findOne({ email: normalizedEmail });
    let tempPasswordUsed = temporaryPassword || generateRandomPassword();

    if (!existingUser) {
      // Create user account with temporary password & mustChangePassword
      const hashedPass = await bcrypt.hash(tempPasswordUsed, 12);
      const derivedFirstName = firstName || normalizedEmail.split("@")[0] || "User";
      const derivedLastName = lastName || "Member";

      existingUser = await User.create({
        firstName: derivedFirstName,
        lastName: derivedLastName,
        email: normalizedEmail,
        password: hashedPass,
        role,
        jobTitle,
        level,
        department,
        workspaceAccess: [workspaceId.toString()],
        onboardingStatus: "pending",
        mustChangePassword: Boolean(requirePasswordReset),
        accountStatus: "active",
      });
    } else {
      // User exists: if not already granted workspace access, add it
      const wsIdStr = workspaceId.toString();
      if (!existingUser.workspaceAccess.includes(wsIdStr)) {
        existingUser.workspaceAccess.push(wsIdStr);
        await existingUser.save();
      }
    }

    // If team specified, add user to team members if not already present
    if (teamId) {
      await Team.findByIdAndUpdate(teamId, {
        $addToSet: { members: existingUser._id },
      });
    }

    // Check for previous pending invitation to same workspace and revoke/replace
    await Invitation.updateMany(
      { email: normalizedEmail, workspaceId, status: "pending" },
      { status: "revoked" }
    );

    // Create the invitation record
    const invitation = await Invitation.create({
      email: normalizedEmail,
      role,
      workspaceId,
      teamId: teamId || null,
      invitedBy: inviterId,
      token,
      temporaryPassword: tempPasswordUsed,
      firstName: firstName || existingUser.firstName,
      lastName: lastName || existingUser.lastName,
      jobTitle: jobTitle || existingUser.jobTitle,
      level: level || existingUser.level,
      department: department || existingUser.department,
      status: "pending",
    });

    const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const inviteLink = clientBaseUrl + "/invite/" + token;

    res.status(201).json({
      msg: "Invitation created and user provisioned successfully",
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        workspaceId: invitation.workspaceId,
        teamId: invitation.teamId,
        token: invitation.token,
        inviteLink,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        temporaryPassword: tempPasswordUsed,
        mustChangePassword: Boolean(existingUser.mustChangePassword),
      },
      user: {
        id: existingUser._id,
        name: existingUser.fullName,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        role: existingUser.role,
        workspaceAccess: existingUser.workspaceAccess,
        mustChangePassword: Boolean(existingUser.mustChangePassword),
        onboardingStatus: existingUser.onboardingStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/invitations
 * Get list of invitations (filterable by workspaceId)
 */
const getInvitations = async (req, res, next) => {
  try {
    const { workspaceId, status } = req.query;
    const query = {};

    if (workspaceId) query.workspaceId = workspaceId;
    if (status) query.status = status;

    const invitations = await Invitation.find(query)
      .populate("workspaceId", "name description")
      .populate("teamId", "teamName teamCode")
      .populate("invitedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: invitations.length,
      invitations,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/invitations/verify/:token or GET /api/invitations/:token
 * Public endpoint to verify invitation token before acceptance
 */
const verifyInvitation = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ msg: "Invitation token is required" });
    }

    const invitation = await Invitation.findOne({ token })
      .populate("workspaceId", "name description status")
      .populate("teamId", "teamName teamCode category")
      .populate("invitedBy", "firstName lastName email avatar");

    if (!invitation) {
      return res.status(404).json({ msg: "Invalid or nonexistent invitation token" });
    }

    if (invitation.status === "accepted") {
      return res.status(400).json({
        msg: "This invitation has already been accepted.",
        invitation,
        workspace: invitation.workspaceId,
      });
    }

    if (invitation.status === "revoked") {
      return res.status(400).json({ msg: "This invitation has been revoked by an administrator." });
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({ msg: "This invitation has expired. Please request a new invitation." });
    }

    res.status(200).json({
      msg: "Invitation token verified successfully",
      valid: true,
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      },
      workspace: invitation.workspaceId,
      team: invitation.teamId,
      invitedBy: invitation.invitedBy,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/invitations/accept
 * Authenticated endpoint: Accepts the invitation for the logged in user
 */
const acceptInvitation = async (req, res, next) => {
  try {
    const { error, value } = acceptInvitationValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ msg: error.details.map((e) => e.message) });
    }

    const { token } = value;
    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({ msg: "Invitation token not found" });
    }

    if (invitation.status === "accepted") {
      const ws = await Workspace.findById(invitation.workspaceId);
      return res.status(200).json({
        msg: "Invitation already accepted",
        workspace: ws,
      });
    }

    if (invitation.status === "revoked") {
      return res.status(400).json({ msg: "This invitation has been revoked" });
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({ msg: "Invitation has expired" });
    }

    // Attach workspace access to current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Authenticated user not found" });
    }

    const wsIdStr = invitation.workspaceId.toString();
    if (!user.workspaceAccess.includes(wsIdStr)) {
      user.workspaceAccess.push(wsIdStr);
      await user.save();
    }

    // Attach to team if specified
    if (invitation.teamId) {
      await Team.findByIdAndUpdate(invitation.teamId, {
        $addToSet: { members: user._id },
      });
    }

    // Mark invitation accepted
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = user._id;
    await invitation.save();

    const workspace = await Workspace.findById(invitation.workspaceId);

    res.status(200).json({
      msg: "Invitation accepted successfully! Workspace access granted.",
      workspace,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        workspaceAccess: user.workspaceAccess,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/invitations/:id
 * Revoke invitation
 */
const revokeInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invitation = await Invitation.findById(id);

    if (!invitation) {
      return res.status(404).json({ msg: "Invitation not found" });
    }

    invitation.status = "revoked";
    await invitation.save();

    res.status(200).json({
      msg: "Invitation revoked successfully",
      invitation,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInvitation,
  getInvitations,
  verifyInvitation,
  acceptInvitation,
  revokeInvitation,
};
