const Project = require("../models/project.model");
const Workspace = require("../models/workspace.model");
const { projectValidation } = require("./validation/projectValidation");


const createProject = async (req, res, next) => {
    try {   
        const { error, value } = projectValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                msg: error.details.map((err) => err.message)
            });
        }


        const existingProject = await Project.findOne({
            workspaceId: req.params.workspaceId,
            name: value.name,
        });

        if (existingProject) {
            return res.status(400).json({
                msg: "Project name already exists"
            });
        }


        const existingWorkspace = await Workspace.findOne({
            _id: req.params.workspaceId,
            ownerId: req.user._id
        });

        if (!existingWorkspace) {
            return res.status(404).json({
                msg: "Workspace not found"
            });
        }


        const newProject = {
            ...value,
            ownerId: req.user._id,
            workspaceId: req.params.workspaceId
        };


        const project = await Project.create(newProject);

        res.status(201).json({
            msg: "Project created successfully",
            project
        });

    } catch (error) {
        next(error);
    }
};



const getProjects = async (req, res, next) => {
    try {
        const allProjects = await Project.find({
            workspaceId: req.params.workspaceId,
            ownerId: req.user._id
        }).sort({
            createdAt: -1
        });


        res.status(200).json({
            projects: allProjects
        });

    } catch (error) {
        next(error);
    }
};



module.exports = {
    createProject,
    getProjects
};