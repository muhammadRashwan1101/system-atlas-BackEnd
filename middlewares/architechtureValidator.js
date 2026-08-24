const Project = require("../models/project.model")
const Workspace = require("../models/workspace.model")
const SetupWizard = require("../models/setupWizard.model")

const architechtureValidator = async (req, res, next) => {
   try {
    const existingProject = await Project.findById(req.params.projectId)
        if (!existingProject) {
            return res.status(404).json({ msg: "Project not found" })
        }

        const existingWorkspace = await Workspace.findById(existingProject.workspaceId)
        if (!existingWorkspace) {
            return res.status(404).json({ msg: "Workspace not found" })
        }
        
        req.projectId = existingProject._id.toString()
        req.workspaceId = existingProject.workspaceId.toString()
        req.projectOwnerId = existingProject.ownerId.toString()
        req.workspaceOwnerId = existingWorkspace.ownerId.toString()
        next()
   } catch (error) {
    next(error)
   }    
}


module.exports = architechtureValidator 