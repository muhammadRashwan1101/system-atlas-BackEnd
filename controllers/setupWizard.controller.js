const mongoose = require("mongoose")
const SetupWizard = require("../models/setupWizard.model")
const Component = require("../models/component.model")
const Project = require("../models/project.model")
const Workspace = require("../models/workspace.model")
const Technologies = require("../constants/technologies")
const Relationship = require("../models/relationship.model")
const Team = require("../models/teams.model")
const {basicInfoValidation} = require("../controllers/validation/setupWizard/basicInfoValidation")
const {ownerShipValidation} = require("../controllers/validation/setupWizard/ownerShipValidation")
const {techStackValidation} = require("../controllers/validation/setupWizard/techStackValidation")
const {documentationValidation} = require("../controllers/validation/setupWizard/documentationValidation")
const {relationshipValidation} = require("../controllers/validation/relationshipValidation")
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

        //Check for 
        const ownerId = req.user.id
        const isOwner = ownerId === req.workspaceOwnerId || ownerId === req.projectOwnerId;

        if(!isOwner) {
            return res.status(401).json({ msg: "Unauthorized" })
        }

        const newBasicInfo = {
            data: {
                basicInfo: {...value}
            },
            projectId: req.projectId,
            workspaceId: req.workspaceId,
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
        const currentWizard = await SetupWizard.findById(req.params.wizardId)
        if (!currentWizard) {
            return res.status(404).json({ msg: "Invalid Request, Wizard not found" })
        } 
        //Check Owner
        const ownerId = req.user.id
        const isOwner = ownerId === req.workspaceOwnerId.toString() || ownerId === req.projectOwnerId.toString();
        if (!isOwner) {
            return res.status(401).json({
                        msg: "Unauthorized"
                    });
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
                    return res.status(400).json({ msg: "These technologies are not compatible  with the chosen component type.", invalidTech })
                }
                currentWizard.data= {
                    ...currentWizard.data,
                    techStack: {...value}
                }
                currentWizard.currentStep = "ownership" 
                break
            }  
            case "ownership": {

                const { error, value } = ownerShipValidation.validate(req.body, {
                    abortEarly: false,
                    stripUnknown: true
                })
                if(error) {
                    return res.status(400).json({ msg: error.details.map(err => err.message) })
                }
                let existingTeam = null
                if(value.ownerTeam) {
                    existingTeam = await Team.findById(value.ownerTeam)
                    if(!existingTeam) {
                        return res.status(400).json({ msg: "Team not found." })
                    }
                } else if (value.ownerRefCode) {
                    existingTeam = await Team.findOne({ refCode: value.ownerRefCode })
                    if(!existingTeam) {
                        return res.status(400).json({ msg: "No teams refernced with this code." })
                    }
                } else {
                    return res.status(400).json({ msg: "A component must reference either an existing team or a team reference code." })
                }
                
                const maintainers = existingTeam?.members?.length ? existingTeam.members.map(member => {
                    return member._id.toString()       
                }) : []

                    currentWizard.data = {
                        ...currentWizard.data,
                        ownership: {
                            ...value,
                            maintainers
                        }
                    }
                    currentWizard.currentStep = "documentation"
                break          
                }
            case "documentation": {
                const { error, value } = documentationValidation.validate(req.body, {
                    abortEarly: false,
                    stripUnknown: true
                })

                if(error) {
                    return res.status(400).json({ msg: error.details.map(err => err.message) })
                }
                console.log(Object.keys(value))
                if(!value || Object.keys(value).length === 0 ) {
                    return res.status(400).json({ msg: "Documentation cannot be empty." })
                }
                currentWizard.data = {
                    ...currentWizard.data,
                    documentation: {...value}
                }
                currentWizard.currentStep = "relationships"
                break
                }
            case "relationships": {
                //if no relationships provided skip this step
                if(!req.body.relationships || req.body.relationships.length === 0) {
                    currentWizard.currentStep = "review"
                    currentWizard.data = {
                        ...currentWizard.data,
                        relationships: []
                    }
                    break
                } else {
                    //if there are relationship validate and go to next step
                    const { error, value } = relationshipValidation.validate(req.body, {
                        abortEarly: false,
                        stripUnknown: true
                    })
                    if(error) {
                        return res.status(400).json({ msg: error.details.map(err => err.message) })
                    }
                    //Check for duplicate relationships
                    const relationshipSet = new Set()
                        value.relationships.forEach(relationship => {
                            relationshipSet.add(`${relationship.targetId}-${relationship.type}-${relationship.protocol}`)
                        })
                    if(relationshipSet.size !== value.relationships.length) {
                        return res.status(400).json({ msg: "Duplicate relationships detected." })
                    }
                    //Check for self relationship
                    const selfRelationship = value.relationships.find(relationship => relationship.sourceId === relationship.targetId)
                    if(selfRelationship) {
                        return res.status(400).json({ msg: "Self relationship detected." })
                    }
                    //Check if the related component exists
                    const relatedComponents = await Component.find({ _id: { $in: value.relationships.map(relationship => relationship.targetId) } })
                    if(relatedComponents.length !== value.relationships.length) {
                        return res.status(400).json({ msg: "One or more related components not found." })
                    }
                    //Check if the related component is in the same project
                    const relatedComponentsInProject = relatedComponents.filter(component => component.projectId.toString() === currentWizard.projectId.toString())
                    if (relatedComponentsInProject.length !== value.relationships.length) {
                        return res.status(400).json({ msg: "One or more related components are not in the same project." })
                    }

                    currentWizard.data = {
                        ...currentWizard.data,
                        relationships: [...value.relationships]
                    }
                    currentWizard.currentStep = "review"
                }
                break
            } 
            case "review": {
                //check for the confirmation flag from the req
                if(!req.body.confirmation || req.body.confirmation !== true) {
                    return res.status(400).json({ msg: "Wizard not confirmed for creation." })
                } else {

                    req.currentWizard = currentWizard    
                    return next()
                }
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

const getWizard = async (req, res, next) => {
    try {
        res.status(200).json({
            wizard: req.currentWizard
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    newSetupWizard,
    updateSetupWizard,
    getWizard
}