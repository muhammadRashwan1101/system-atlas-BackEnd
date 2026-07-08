const Project = require("../models/project.model")
const {projectValidation} = require("../controllers/validation/projectValidation")

const createProject = async (req, res) => {
    try {   
        const { error, value } = projectValidation.validate(req.body, {
                abortEarly: false,
                stripUnknown: true,
            });

            if(error) {
                return res.status(400).json({ msg: error.details.map((err) => err.message) });
            }
        const existingProject = await Project.findOne({
            workspaceId: req.params.workspaceId,
            name: value.name,
        });

        if(existingProject) {
            return res.status(400).json({
                msg: "Project name already exists"
            });
        }        


        const existingWorkspace = await Workspace.findOne({
            _id: req.params.workspaceId,
            ownerId: req.user._id
        })

        if(!existingWorkspace) {
            return res.status(404).json({
                msg: "Workspace not found"
            });
        }

        const newProject = {
            ...value,
            ownerId: req.user._id,
            workspaceId: req.params.workspaceId
        }
        const project = await Project.create(newProject);

        res.status(201).json({msg: "Project created successfully", project });    
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }    
}

const getProjects = async ( req, res ) => {
    try {
        const allProjects = await Project.find({
            workspaceId: req.params.workspaceId,
            ownerId: req.user._id
        }).sort({
            createdAt: -1
        })

        res.status(200).json({ projects: allProjects });
    } catch (error) {
        res.ststu(500).json({ msg: error.message });
    }
}



