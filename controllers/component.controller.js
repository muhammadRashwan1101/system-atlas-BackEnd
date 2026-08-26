const Component = require("../models/component.model");
const Relationship = require("../models/relationship.model");

const {
  calculateDocumentationCoverage,
} = require("./utils/documentationCoverage");

const {
  componentValidation,
} = require("./validation/componentValidation");

// ================= Create Component =================

const createComponent = async (req, res, next) => {
  try {
    const Data = req.currentWizard.data;

    const ownerTeam =
      Data.ownership?.ownerTeam || null;

    console.log("Current Wizard Data:", Data);

    const documentationData =
      Data.documentation || {};

    const tagsData =
      Array.isArray(documentationData.tags) &&
      documentationData.tags.length > 0
        ? documentationData.tags
        : Array.isArray(Data.tags)
        ? Data.tags
        : [];

    const componentData = {
      name: Data.basicInfo?.name,
      description: Data.basicInfo?.description,

      projectId: req.projectId.toString(),

      type: Data.basicInfo?.type,

      technologies:
        Data.techStack?.technologies || [],

      ownerRefCode: ownerTeam
        ? null
        : Data.ownership?.ownerRefCode || null,

      ownerTeam,

      technicalLead:
        Data.ownership?.technicalLead || null,

      maintainers:
        Data.ownership?.maintainers || [],

      documentation: documentationData,

      deploymentEnvironment:
        Data.ownership?.environment ||
        "development",

      tags: tagsData,

      createdBy: req.user.id,
    };

    console.log(
      "Validated component data:",
      componentData
    );

    const { error, value } =
      componentValidation.validate(
        componentData,
        {
          abortEarly: false,
          stripUnknown: true,
        }
      );

    if (error) {
      const errorMessages = error.details.map(
        (detail) => detail.message
      );

      return res.status(400).json({
        errors: errorMessages,
      });
    }

    const component =
      await Component.create(value);

    // ================= Relationships =================

    if (
      Data.relationships &&
      Data.relationships.length > 0
    ) {
      const relationships =
        Data.relationships.map((relation) => ({
          sourceId: component._id,
          targetId: relation.targetId,
          projectId: component.projectId,
          type: relation.type,
          protocol: relation.protocol,
        }));

      await Relationship.insertMany(
        relationships
      );
    }

    // ================= Finish Wizard =================

    req.currentWizard.currentStep =
      "completed";

    req.currentWizard.status =
      "finished";

    await req.currentWizard.save();

    return res.status(201).json({
      msg: "Component created successfully",
      componentId: component._id,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Get Components By Project =================

const getComponentsByProjectId = async (
  req,
  res,
  next
) => {
  try {
    const components =
      await Component.find({
        projectId: req.projectId,
      })
        .populate("ownerTeam")
        .populate(
          "technicalLead",
          "name firstName lastName fullName email"
        )
        .populate(
          "maintainers",
          "name firstName lastName fullName email"
        );

    if (
      !components ||
      components.length === 0
    ) {
      return res.status(404).json({
        msg: "No components found for this project",
      });
    }

    const componentsWithCoverage =
      components.map((component) => ({
        ...component.toObject(),

        documentationCoverage:
          calculateDocumentationCoverage(
            component.documentation
          ),
      }));

    return res.status(200).json({
      components: componentsWithCoverage,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Get Component By ID =================

const getComponentById = async (
  req,
  res,
  next
) => {
  try {
    const component =
      await Component.findOne({
        _id: req.params.componentId,
        projectId: req.projectId,
      })
        .populate("ownerTeam")
        .populate(
          "technicalLead",
          "name firstName lastName fullName email"
        )
        .populate(
          "maintainers",
          "name firstName lastName fullName email"
        );

    if (!component) {
      return res.status(404).json({
        msg: "Component not found",
      });
    }

    return res.status(200).json({
      component,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Update Component =================

const updateComponent = async (
  req,
  res,
  next
) => {
  try {
    const updated =
      await Component.findOneAndUpdate(
        {
          _id: req.params.componentId,
          projectId: req.projectId,
        },
        {
          $set: req.body,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updated) {
      return res.status(404).json({
        msg: "Component not found",
      });
    }

    return res.status(200).json({
      msg: "Component updated successfully",
      component: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Delete Component =================

const deleteComponent = async (
  req,
  res,
  next
) => {
  try {
    const deleted =
      await Component.findOneAndDelete({
        _id: req.params.componentId,
        projectId: req.projectId,
      });

    if (!deleted) {
      return res.status(404).json({
        msg: "Component not found",
      });
    }

    await Relationship.deleteMany({
      $or: [
        {
          sourceId: deleted._id,
        },
        {
          targetId: deleted._id,
        },
      ],
    });

    return res.status(200).json({
      msg: "Component deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ================= Exports =================

module.exports = {
  createComponent,
  getComponentsByProjectId,
  getComponentById,
  updateComponent,
  deleteComponent,
};