const mongoose = require('mongoose');

const slugify = require('slugify');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title:{
        required:true,
        type:String
    },
    postDate:{
        type:Date,
        default: Date.now
    },
    content:{
        required:true,
        type:String
    },
    imageUrl:{
        required: true,
        type: String
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    commentsNo:{
        type:Number
    },
    pinned:{
        type:Boolean
    },
    category:{
        type:String
    }
});

// slugify the title of the post
postSchema.pre('validate', function(next) {
    if (this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true })
        next();
    }
});

module.exports = mongoose.model('Post', postSchema);