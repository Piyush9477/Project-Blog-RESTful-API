const {User, File} = require("../models");
const hashPassword = require("../utils/hashPassword");
const comparePassword = require("../utils/comparePassword");
const generateToken = require("../utils/generateToken");
const generateCode = require("../utils/generateCode");
const sendEmail = require("../utils/sendEmail");

const signup = async (req, res, next) => {
    try{
        const {name, email, password, role} = req.body;

        const emailExists = await User.findOne({email});
        if(emailExists){
            res.code = 400;
            throw new Error("Email already exists");
        }

        const hashedPassword = await hashPassword(password);

        const newUser = User({name, email, password: hashedPassword, role});

        await newUser.save();

        res.status(201).json({code: 201, status: true, message: "User registered successfully"});
    }catch(error){
        next(error);
    }
}; 

const signin = async (req,res,next) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            res.code = 401;
            throw new Error("Invalid credentials");
        }

        const match = await comparePassword(password, user.password);
        if(!match){
            res.code = 401;
            throw new Error("Invalid credentials");
        }

        const token = generateToken(user);

        res.status(200).json({code: 200, status: true, message: "User signin successful", data:{token}});
    }catch(error){
        next(error);
    }
}

const verifyCode = async (req,res,next) => {
    try{
        const {email} = req.body;

        const user = await User.findOne({email});
        if(!user){
            res.code = 404;
            throw new Error("User not found");
        }

        if(user.isVerified){
            res.code = 400;
            throw new Error("User already verified");
        }

        const code = generateCode(6);

        user.verificationCode = code;
        await user.save();

        //send email
        await sendEmail({
            emailTo: user.email,
            subject: "Email Verification code",
            code,
            content: "Verify your account"
        });

        res.status(200).json({code: 200, status: true, message: "User verification code sent successfully"});
    }catch(error){
        next(error);
    }
}

const verifyUser = async (req, res, next) => {
    try{
        const {email, code} = req.body;

        const user = await User.findOne({email});
        if(!user){
            res.code = 404;
            throw new Error("User not found");
        }

        if(user.verificationCode !== code){
            res.code = 400;
            throw new Error("Invalid code");
        }
        
        user.isVerified = true;
        user.verificationCode = null;
        await user.save();

        res.status(200).json({code: 200, status: true, message: "User verified successfully"});
    }catch(error){
        next(error);
    }
}

const forgotPasswordCode = async (req,res,next) => {
    try{
        const {email} = req.body;

        const user = await User.findOne({email});
        if(!user){
            res.code = 404;
            throw new Error("User not found");
        }

        const code = generateCode(6);

        user.forgotPasswordCode = code;
        await user.save();
        
        await sendEmail({
            emailTo: user.email,
            subject: "Forgot Password code",
            code,
            content: "Change your password"
        });
        
        res.status(200).json({code: 200, status: true, message: "Forgot password code sent successfully"});
    }catch(error){
        next(error);
    }
}

const recoverPassword = async (req,res,next) => {
    try{
        
        const {email, code, password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            res.code = 404;
            throw new Error("User not found");
        }

        if(user.forgotPasswordCode !== code){
            res.code = 400;
            throw new Error("Invalid code");
        }

        const hashedPassword = await hashPassword(password);

        user.password = hashedPassword;
        user.forgotPasswordCode = null;
        await user.save();

        res.status(200).json({code: 200, status: true, message: "Password recovered successfully"});
    }catch(error){
        next(error);
    }
}

const changePassword = async (req,res,next) => {
    try{
        const {oldPassword, newPassword} = req.body;
        const {_id} = req.user;

        const user = await User.findById(_id);
        if(!user){
            res.code = 404;
            throw new Error("User not found");
        }

        const match = await comparePassword(oldPassword, user.password);
        if(!match){
            res.code = 400;
            throw new Error("Old password does not match");
        }

        if(oldPassword === newPassword){
            res.code = 400;
            throw new Error("New password should be different from old password");
        }

        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({code: 200, status: true, message: "Password changed successfully"});
    }catch(error){
        next(error);
    }
}

const updateProfile = async (req,res,next) => {
    try{
        const {_id} = req.user;
        const {name, email, profilePic} = req.body;

        const user = await User.findById(_id).select("-password -verificationCode -forgotPasswordCode");
        if(!user){
            res.code = 404;
            throw new Error("User not found");
        }

        if(email){
            const userExists = await User.findOne({email});
            if(userExists && userExists.email === email && String(userExists._id) !== String(user._id)){
                res.code = 400;
                throw new Error("Email already exists");
            }
        }

        if(profilePic){
            const file = File.findById(profilePic);
            if(!file){
                res.code = 404;
                throw new Error("File not found");
            }
        }

        user.name = name ? name : user.name;
        user.email = email ? email : user.email;
        user.profilePic = profilePic;

        if(email){
            user.isVerified = false;    
        }

        await user.save();

        res.status(200).json({code: 200, status: true, message: "User profil updated successfully", data:{user}});
    }catch(error){
        next(error);
    }
}

const currentUser = async (req,res, next) => {
    try{
        const {_id} = req.user;

        const user = await User.findById(_id).select("-password -verificationCode -forgotPasswordCode").populate("profilePic");
        if(!user){
            res.code = 404;
            throw new Error("User not found");
        }

        res.status(200).json({code: 200, status: true, message: "Got the current user successfully", data: {user}});
    }catch(error){
        next(error);
    }
}

module.exports = {signup, signin, verifyCode, verifyUser, forgotPasswordCode, recoverPassword, changePassword, updateProfile, currentUser};