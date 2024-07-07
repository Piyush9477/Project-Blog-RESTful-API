const mongoose = require("mongoose");
const {connectionUrl} = require("../config/keys");

const connetMongoDb = async() => {
    try{
        await mongoose.connect(connectionUrl);
        console.log("Database connection successful");
    }catch(error){
        console.log(error.message);
    }
}

module.exports = connetMongoDb;