const {check} = require("express-validator");

const signupValidator = [
    check("name").notEmpty().withMessage("Name is required"),

    check("email")
        .isEmail().withMessage("Invalid email")
        .notEmpty().withMessage("Email is required"),

    check("password")
        .isLength({min: 6}).withMessage("Minimum length of password should be 6")
        .notEmpty().withMessage("Password is required")
];

const signinValidator = [
    check("email")
        .isEmail().withMessage("Invalid email")
        .notEmpty().withMessage("Email is required"),

    check("password")
        .notEmpty().withMessage("Password is required")
];

const emailValidator = [
    check("email")
        .isEmail().withMessage("Invalid email")
        .notEmpty().withMessage("Email is required")
];

const verifyUserValidator = [
    check("email")
        .isEmail().withMessage("Invalid email")
        .notEmpty().withMessage("Email is required"),

    check("code").notEmpty().withMessage("Code is required")
];

module.exports = {signupValidator, signinValidator, emailValidator, verifyUserValidator};