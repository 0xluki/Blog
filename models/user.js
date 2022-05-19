const mongoose = require('mongoose');

const Schema = mongoose.Schema;

userSchema = new Schema({
    name:{
        required:true,
        type:String
    },
    username:{
        unique: true,
        required:true,
        type:String
    },
    password:{
        required:true,
        type:String
    },
    email:{
        unique: true,
        required:true,
        type:String
    },
    gender:{
        required:true,
        type:String
    },
    plan:{
        type:String
    },
    avatar:{
        type:String
    },
    confirmationToken:{
        type:String
    },
    confirmed:{
        type:Boolean
    },
    resetToken:{
        type:String
    },
    resetTokenExpiration:{
        type:Date
    },
    changeEmail:{
        type:String
    },
    admin:{
        type:Boolean
    }
});

module.exports = mongoose.model('User', userSchema);