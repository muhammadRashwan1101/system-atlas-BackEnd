const mongoose = require("mongoose")
const SetupWizard = require("../models/setupWizard.model")
const Component = require("../models/component.model")
const Project = require("../models/project.model")
const Workspace = require("../models/workspace.model")
const Technologies = require("../constants/technologies")
const {basicInfoValidation} = require("../controllers/validation/setupWizard/basicInfoValidation")
const {ownerShipValidaiton} = require("../controllers/validation/setupWizard/ownerShipValidation")
const {techStackValidation} = require("../controllers/validation/setupWizard/techStackValidation")
const CheckRoleMiddleware = require("../middlewares/CheckRoleMiddleware")

const newSetupWizard = async (req, res, next) => {
    // console.log(req)
    if(!CheckRoleMiddleware(req, res, ["admin", "manager", "techLead"])) return
    try {
        const { error, value } = basicInfoValidation.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        })
        
        if(error) {
            return res.status(400).json({ msg: error.details.map(err => err.message) })
        }
        //Check if the name in the basic info duplicates another component (existingComponent)
        const existingComponent = await Component.findOne({ 
            projectId: req.params.projectId,
            name: value.name 
        })
        //Check for duplicate components
        if(existingComponent) {
            return res.status(400).json({ msg: "This component already exists" })
        }

        //Check for dupliucate projects
        const existingProject = await Project.findById(req.params.projectId )
        if(!existingProject) {
            return res.status(404).json({ msg: "Project not found" })
        }

        //Check for duplicate workspaces
        const existingWorkspace = await Workspace.findById(existingProject.workspaceId)
        if(!existingWorkspace) {
            return res.status(404).json({ msg: "Workspace not found" })
        }

        //Check for 
        const ownerId = req.user.id
        const isOwner = ownerId === existingWorkspace.ownerId.toString() || ownerId === existingProject.ownerId.toString();

        if(!isOwner) {
            return res.status(401).json({ msg: "Unauthorized" })
        }

        const newBasicInfo = {
            data: {
                basicInfo: {...value}
            },
            completedSteps: [
                "basicInfo"
            ],
            projectId: req.params.projectId,
            workspaceId: existingProject.workspaceId,
            ownerId,
            currentStep: "techStack"
        }

        const newWizard = await SetupWizard.create(newBasicInfo)
        res.status(201).json({ initialData: {wizardId: newWizard._id, data: newWizard.data, currentStep: newWizard.currentStep} })
       
    } catch(err) {
        next(err)
    }
}

// Step 2 controller
const updateSetupWizard = async (req, res, next) => {
    try{
        //Get Current Wizard
        const currentWizard = await SetupWizard.findOne({ _id: req.params.wizardId })
        if(!currentWizard) {
            return res.status(404).json({ msg: "Invalid Request, Wizard not found" })
        }
        console.log(currentWizard)
        //Check Current Step
        if(currentWizard.currentStep !== "techStack") {
            return res.status(400).json({ msg: "Invalid step per creation flow" })
        }
       //Check for dupliucate projects
        const existingProject = await Project.findOne({ _id: currentWizard.projectId })
        if(!existingProject) {
            return res.status(404).json({ msg: "Project not found" })
        }
        
        //Check for duplicate workspaces
        const existingWorkspace = await Workspace.findOne({ _id: existingProject.workspaceId })
        if(!existingWorkspace) {
            return res.status(404).json({ msg: "Workspace not found" })
        }

        //Check Owner
        const ownerId = req.user.id
        if(ownerId !== existingWorkspace.ownerId.toString() || ownerId !== existingProject.ownerId.toString())   {
            return res.status(401).json({ msg: "Unauthorized" })
        }  
        switch(currentWizard.currentStep) {
            case "techStack": {

                const { error, value } = techStackValidation.validate(req.body, {
                    abortEarly: false,
                    stripUnknown: true
                })
                if(error) {
                    return res.status(400).json({ msg: error.details.map(err => err.message) })
                }

                const allowedTech = Technologies[currentWizard.data.basicInfo.type.toLowerCase()]

                if(!allowedTech){
                    return res.status(400).json({
                        msg:"Unsupported component type."
                    })
                }

                const invalidTech = value.technologies.filter(tech => !allowedTech.includes(tech))
                
                if(invalidTech.length > 0) {
                    return res.status(400).json({ msg: "These technologies are not compaitable with the chosen component type.", invalidTech })
                }
                currentWizard.data= {
                    ...currentWizard.data,
                    techStack: {...value}
                }
                console.log(currentWizard)
                currentWizard.currentStep = "ownership" 
                break
            }   
            case "ownership": {

                const { error, value } = ownerShipValidaiton.validate(req.body, {
                    abortEarly: false,
                    stripUnknown: true
                })
                if(error) {
                    return res.status(400).json({ msg: error.details.map(err => err.message) })
                }
                currentWizard.data.ownerShip = {...value}
                currentWizard.currentStep = "completed"
                break
            }   
                default:
                    return res.status(400).json({ msg: "Invalid step per creation flow" })
                }

                await currentWizard.save()
                res.status(200).json({ msg: "Success", currentWizard })
            } catch(err) {
                next(err)
    }
}
// Step 3 Controller
// Step 4 Controller

module.exports = {
    newSetupWizard,
    updateSetupWizard
}