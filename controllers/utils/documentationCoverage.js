const calculateDocumentationCoverage = (documentation = {}) => {
    const types = documentation.types || {};

    const total = Object.keys(types).length;

    if (total === 0) {
        return 0;
    }

    const completed = Object.values(types).filter(
        value => value === true
    ).length;

    return Math.round((completed / total) * 100);
};
const calculateTeamDocumentationCoverage = (components = []) => {
    if (!components.length) {
        return 0;
    }

    const totalCoverage = components.reduce(
        (sum, component) => sum + (component.documentationCoverage || 0),
        0
    );

    return Math.round(totalCoverage / components.length);
};

module.exports = {
    calculateDocumentationCoverage,
    calculateTeamDocumentationCoverage
};
