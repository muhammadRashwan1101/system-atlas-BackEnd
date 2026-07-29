const Joi = require("joi");

const ALLOWED_KEYS = [
    "ownershipChanges",
    "projectAssignment",
    "relationshipChanges",
    "criticalAlerts",
    "documentationAlerts"
];

const updateNotificationValidation = Joi.object({
    key: Joi.string().valid(...ALLOWED_KEYS).required(),
    value: Joi.boolean().required()
});

module.exports = { updateNotificationValidation };