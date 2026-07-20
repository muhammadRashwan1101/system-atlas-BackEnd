const Joi = require("joi")

const loginValidation = Joi.object({
    email: Joi.string().email().required("").messages({
        "string.email": "Please Enter a Valid Email",
    }),
    password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/).required().messages({
        "string.pattern.base": "Wrong Email or Password",
        "any.required": "Please Enter your Password"
    })
})

const signUpValidation = Joi.object({
    firstName: Joi.string().required("Please Enter your First Name"),
    lastName: Joi.string().required("Please Enter your Last Name"),
    email: Joi.string().email().required().messages({
        "string.email": "Please Enter a Valid Email",
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/).required("Please Enter your Password").messages({
        "string.pattern.base": "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
    }),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
        "any.only": "Passwords do not match"
    }),
    role: Joi.string().valid("user", "admin", "manager", "techLead").default("user")
})

module.exports = { loginValidation, signUpValidation }