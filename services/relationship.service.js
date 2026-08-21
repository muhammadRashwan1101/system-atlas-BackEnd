const Component = require("../models/component.model");
const Relationship = require("../models/relationship.model");

/**
 * Validates that source and target components:
 * 1. Are not identical (no self-loops).
 * 2. Exist in the database.
 * 3. Both belong to the specified project.
 */
const validateRelationshipComponents = async ({ projectId, sourceId, targetId }) => {
    if (!sourceId || !targetId) {
        const error = new Error("Both sourceId and targetId are required");
        error.statusCode = 400;
        throw error;
    }

    if (sourceId.toString() === targetId.toString()) {
        const error = new Error("Self relationship detected: source and target cannot be the same component");
        error.statusCode = 400;
        throw error;
    }

    const [sourceComponent, targetComponent] = await Promise.all([
        Component.findById(sourceId),
        Component.findById(targetId)
    ]);

    if (!sourceComponent) {
        const error = new Error("Source component not found");
        error.statusCode = 404;
        throw error;
    }

    if (!targetComponent) {
        const error = new Error("Target component not found");
        error.statusCode = 404;
        throw error;
    }

    if (sourceComponent.projectId.toString() !== projectId.toString()) {
        const error = new Error("Source component does not belong to this project");
        error.statusCode = 400;
        throw error;
    }

    if (targetComponent.projectId.toString() !== projectId.toString()) {
        const error = new Error("Target component does not belong to this project");
        error.statusCode = 400;
        throw error;
    }

    return { sourceComponent, targetComponent };
};

/**
 * Checks whether an identical relationship already exists in the project.
 */
const checkDuplicateRelationship = async ({ projectId, sourceId, targetId, type, protocol, excludeId = null }) => {
    const query = {
        projectId,
        sourceId,
        targetId,
        type,
        protocol
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const existing = await Relationship.findOne(query);
    return existing;
};

/**
 * Validates a batch of relationships (e.g. for Setup Wizard or bulk operations).
 */
const validateBatchRelationships = async ({ projectId, sourceId = null, relationships = [] }) => {
    if (!relationships || relationships.length === 0) {
        return [];
    }

    // Check duplicate relationships within the incoming array
    const relationshipSet = new Set();
    for (const rel of relationships) {
        const currentSource = rel.sourceId || sourceId;
        const key = `${currentSource || ""}-${rel.targetId}-${rel.type}-${rel.protocol}`;
        if (relationshipSet.has(key)) {
            const error = new Error("Duplicate relationships detected.");
            error.statusCode = 400;
            throw error;
        }
        relationshipSet.add(key);

        // Check self-relationship
        if (currentSource && currentSource.toString() === rel.targetId.toString()) {
            const error = new Error("Self relationship detected.");
            error.statusCode = 400;
            throw error;
        }
    }

    // Check all target components exist
    const targetIds = relationships.map(r => r.targetId);
    const relatedComponents = await Component.find({ _id: { $in: targetIds } });

    if (relatedComponents.length !== new Set(targetIds).size) {
        const error = new Error("One or more related components not found.");
        error.statusCode = 400;
        throw error;
    }

    // Check all related components belong to the same project
    const invalidComponent = relatedComponents.find(
        c => c.projectId.toString() !== projectId.toString()
    );

    if (invalidComponent) {
        const error = new Error("One or more related components are not in the same project");
        error.statusCode = 400;
        throw error;
    }

    // If sourceId is provided, verify source component too
    if (sourceId) {
        const sourceComponent = await Component.findById(sourceId);
        if (!sourceComponent) {
            const error = new Error("Source component not found");
            error.statusCode = 404;
            throw error;
        }
        if (sourceComponent.projectId.toString() !== projectId.toString()) {
            const error = new Error("Source component does not belong to this project");
            error.statusCode = 400;
            throw error;
        }
    }

    return relationships;
};

/**
 * Standalone creation of a single relationship with validation and duplicate prevention.
 */
const createRelationshipRecord = async ({ projectId, sourceId, targetId, type, protocol }) => {
    await validateRelationshipComponents({ projectId, sourceId, targetId });

    const duplicate = await checkDuplicateRelationship({
        projectId,
        sourceId,
        targetId,
        type,
        protocol
    });

    if (duplicate) {
        const error = new Error("Relationship already exists between these components with the same type and protocol");
        error.statusCode = 400;
        throw error;
    }

    const relationship = await Relationship.create({
        projectId,
        sourceId,
        targetId,
        type,
        protocol
    });

    return relationship;
};

module.exports = {
    validateRelationshipComponents,
    checkDuplicateRelationship,
    validateBatchRelationships,
    createRelationshipRecord
};
