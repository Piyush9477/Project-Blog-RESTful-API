const {User} = require("../models");

const signup = async (req, res, next) => {
    try{
        const {name, email, password, role} = req.body;

        if(!name){
            res.code = 400;
            throw new Error("Name is required");
        }

        if(!email){
            res.code = 400;
            throw new Error("email is required");
        }

        if(!password){
            res.code = 400;
            throw new Error("Password is required");
        }

        if(password.length < 6){
            res.code = 400;
            throw new Error("Minimum length of password should be 6");
        }

        const newUser = User({name, email, password, role});

        await newUser.save();

        res.status(201).json({code: 201, status: true, message: "User registered successfully"});
    }catch(error){
        next(error);
    }
};

module.exports = {signup};