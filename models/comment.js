const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({

    comment:{
        required:true,
        type:String
    },
    postId:{
        required:true,
        type:mongoose.Types.ObjectId,
        ref:'Post'
    },
    userId:{
        required:true,
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    commentDate:{
        type: Date,
        default:Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);