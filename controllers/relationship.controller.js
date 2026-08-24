const Relationship = require("../models/relationship.model");
const CheckRole = require("../middlewares/CheckRoleMiddleware");
const {
    createRelationshipValidation,
    updateRelationshipValidation
} = require("./validation/relationshipValidation");
const {
    validateRelationshipComponents,
    checkDuplicateRelationship,
    createRelationshipRecord
} = require("../services/relationship.service");

/**
 * Create a new standalone relationship between two components in a project.
 */
const createRelationship = async (req, res, next) => {
    try {
        if (!CheckRole(req, res, ["admin", "manager", "techLead"])) return;

        const { error, value } = createRelationshipValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                msg: error.details.map(err => err.message)
            });
        }

        try {
            const relationship = await createRelationshipRecord({
                projectId: req.projectId,
                sourceId: value.sourceId,
                targetId: value.targetId,
                type: value.type,
                protocol: value.protocol
            });

            const populatedRelationship = await Relationship.findById(relationship._id)
                .populate("sourceId", "name type status deploymentEnvironment")
                .populate("targetId", "name type status deploymentEnvironment");

            return res.status(201).json({
                msg: "Relationship created successfully",
                relationship: populatedRelationship || relationship
            });
        } catch (serviceError) {
            if (serviceError.code === 11000) {
                return res.status(400).json({
                    msg: "Relationship already exists between these components with the same type and protocol"
                });
            }
            if (serviceError.statusCode) {
                return res.status(serviceError.statusCode).json({
                    msg: serviceError.message
                });
            }
            throw serviceError;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Get all relationships for a project, with optional filtering.
 */
const getRelationships = async (req, res, next) => {
    try {
        const query = { projectId: req.projectId };

        // Optional filter: get all relationships involving a specific component
        if (req.query.componentId) {
            query.$or = [
                { sourceId: req.query.componentId },
                { targetId: req.query.componentId }
            ];
        } else {
            if (req.query.sourceId) query.sourceId = req.query.sourceId;
            if (req.query.targetId) query.targetId = req.query.targetId;
        }

        if (req.query.type) {
            query.type = req.query.type;
        }

        if (req.query.protocol) {
            query.protocol = req.query.protocol;
        }

        const relationships = await Relationship.find(query)
            .populate("sourceId", "name type status deploymentEnvironment")
            .populate("targetId", "name type status deploymentEnvironment")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            relationships
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single relationship by ID strictly scoped to the project.
 */
const getRelationshipById = async (req, res, next) => {
    try {
        const { relationshipId } = req.params;

        const relationship = await Relationship.findOne({
            _id: relationshipId,
            projectId: req.projectId
        })
            .populate("sourceId", "name type status deploymentEnvironment")
            .populate("targetId", "name type status deploymentEnvironment");

        if (!relationship) {
            return res.status(404).json({
                msg: "Relationship not found"
            });
        }

        return res.status(200).json({
            relationship
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing relationship (type, protocol, and optionally sourceId/targetId).
 */
const updateRelationship = async (req, res, next) => {
    try {
        if (!CheckRole(req, res, ["admin", "manager", "techLead"])) return;

        const { relationshipId } = req.params;

        const { error, value } = updateRelationshipValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                msg: error.details.map(err => err.message)
            });
        }

        const existingRelationship = await Relationship.findOne({
            _id: relationshipId,
            projectId: req.projectId
        });

        if (!existingRelationship) {
            return res.status(404).json({
                msg: "Relationship not found or access denied"
            });
        }

        const targetSourceId = value.sourceId || existingRelationship.sourceId;
        const targetTargetId = value.targetId || existingRelationship.targetId;
        const targetType = value.type || existingRelationship.type;
        const targetProtocol = value.protocol || existingRelationship.protocol;

        // If sourceId or targetId are provided in update, validate both components
        if (value.sourceId || value.targetId) {
            try {
                await validateRelationshipComponents({
                    projectId: req.projectId,
                    sourceId: targetSourceId,
                    targetId: targetTargetId
                });
            } catch (validationErr) {
                if (validationErr.statusCode) {
                    return res.status(validationErr.statusCode).json({
                        msg: validationErr.message
                    });
                }
                throw validationErr;
            }
        }

        // Check for duplicate with new values
        const duplicate = await checkDuplicateRelationship({
            projectId: req.projectId,
            sourceId: targetSourceId,
            targetId: targetTargetId,
            type: targetType,
            protocol: targetProtocol,
            excludeId: relationshipId
        });

        if (duplicate) {
            return res.status(400).json({
                msg: "A relationship with these components, type, and protocol already exists"
            });
        }

        if (value.sourceId) existingRelationship.sourceId = value.sourceId;
        if (value.targetId) existingRelationship.targetId = value.targetId;
        if (value.type) existingRelationship.type = value.type;
        if (value.protocol) existingRelationship.protocol = value.protocol;

        await existingRelationship.save();

        const updatedRelationship = await Relationship.findById(existingRelationship._id)
            .populate("sourceId", "name type status deploymentEnvironment")
            .populate("targetId", "name type status deploymentEnvironment");

        return res.status(200).json({
            msg: "Relationship updated successfully",
            relationship: updatedRelationship
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                msg: "A relationship with these components, type, and protocol already exists"
            });
        }
        next(error);
    }
};

/**
 * Delete a relationship strictly scoped to the project.
 */
const deleteRelationship = async (req, res, next) => {
    try {
        if (!CheckRole(req, res, ["admin", "manager", "techLead"])) return;

        const { relationshipId } = req.params;

        const deletedRelationship = await Relationship.findOneAndDelete({
            _id: relationshipId,
            projectId: req.projectId
        });

        if (!deletedRelationship) {
            return res.status(404).json({
                msg: "Relationship not found or access denied"
            });
        }

        return res.status(200).json({
            msg: "Relationship deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createRelationship,
    getRelationships,
    getRelationshipById,
    updateRelationship,
    deleteRelationship
};
