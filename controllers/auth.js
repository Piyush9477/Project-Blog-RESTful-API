const {User} = require("../models");

const signup = async (req, res, next) => {
    try{
        const {name, email, password, role} = req.body;

        const emailExists = await User.findOne({email});
        if(emailExists){
            res.code = 400;
            throw new Error("Email already exists");
        }

        const newUser = User({name, email, password, role});

        await newUser.save();

        res.status(201).json({code: 201, status: true, message: "User registered successfully"});
    }catch(error){
        next(error);
    }
};

module.exports = {signup};