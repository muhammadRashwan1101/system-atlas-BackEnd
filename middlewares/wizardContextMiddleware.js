const Project = require("../models/project.model")
const Workspace = require("../models/workspace.model")
const SetupWizard = require("../models/setupWizard.model")

const wizardContextMiddleware = async (req, res, next) => {
   try {
    const currentWizard = await SetupWizard.findById(req.params.wizardId)
    if (!currentWizard) {
        return res.status(404).json({ msg: "Invalid Request, Wizard not found" })
    }
       //Check for dupliucate projects
           const existingProject = await Project.findById(currentWizard.projectId)
           if(!existingProject) {
               return res.status(404).json({ msg: "Project not found" })
           }
   
           //Check for duplicate workspaces
           const existingWorkspace = await Workspace.findById(existingProject.workspaceId)
           if(!existingWorkspace) {
               return res.status(404).json({ msg: "Workspace not found" })
           }

        console.log(existingProject.ownerId, existingWorkspace.ownerId)
        
        req.currentWizard = currentWizard
        req.projectId = existingProject._id.toString()
        req.workspaceId = existingProject.workspaceId.toString()
        req.projectOwnerId = existingProject.ownerId.toString()
        req.workspaceOwnerId = existingWorkspace.ownerId.toString()
        next()
   } catch (error) {
    next(error)
   }    
}


module.exports = wizardContextMiddleware