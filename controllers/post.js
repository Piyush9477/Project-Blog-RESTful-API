const {File, Category, Post} = require("../models");

const addPost = async (req,res,next) => {
    try{
        const {title, desc, file, category} = req.body;
        const {_id} = req.user;

        if(file){
            const fileExists = await File.findById(file);
            if(!fileExists){
                res.code = 404;
                throw new Error("File not found");
            }
        }

        const categoryExists = await Category.findById(category);
        if(!categoryExists){
            res.code = 404;
            throw new Error("Category not found");
        }

        const newPost = new Post({
            title, desc, file, category, updatedBy: _id
        });

        await newPost.save();

        res.status(200).json({code: 200, status: true, message: "Post added successfully"});
    }catch(error){
        next(error);
    }
}

const updatePost = async (req,res,next) => {
    try{
        const {title, desc, file, category} = req.body;
        const {id} = req.params;
        const {_id} = req.user;

        if(file){
            const fileExists = await File.findById(file);
            if(!fileExists){
                res.code = 404;
                throw new Error("File not found");
            } 
        }

        if(category){
            const categoryExists = await Category.findById(category);
            if(!categoryExists){
                res.code = 404;
                throw new Error("Category not found");
            }
        }

        const post = await Post.findById(id);
        if(!post){
            res.code = 404;
            throw new Error("Post not found");
        }

        post.title = title ? title : post.title;
        post.desc = desc;
        post.file = file;
        post.category = category ? category : post.category;
        post.updatedBy = _id;

        await post.save();

        res.status(200).json({code: 200, status: true, message: "Post updated successfully", data: {post}});
    }catch(error){
        next(error);
    }
}

const deletePost = async (req,res,next) => {
    try{
        const {id} = req.params;

        const post = await Post.findById(id);
        if(!post){
            res.code = 404;
            throw new Error("Post not found");
        }

        await Post.findByIdAndDelete(id);

        res.status(200).json({code: 200, status: true, message: "Post deleted successfully"});
    }catch(error){
        next(error);
    }
}

const getPosts = async (req,res,next) => {
    try{
        const {page, size, q, category} = req.query;

        const pageNum = parseInt(page) || 1;
        const sizeNum = parseInt(size) || 10;
        let query = {};

        if(q){
            const search = new RegExp(q, "i");

            query = {
                $or: [{title: search}]
            }
        }

        if(category){
            query = {...query, category};
        }

        const total = await Post.countDocuments(query);
        const pages = Math.ceil(total/sizeNum);

        const posts = await Post.find(query).sort({updatedBy: -1}).skip((pageNum - 1) * sizeNum).limit(sizeNum);

        res.status(200).json({code: 200, status: true, message: "Got post list successfully", data: {posts, total, pages}});
    }catch(error){
        next(error);
    }
}

const getPost = async (req,res,next) => {
    try{
        const {id} = req.params;

        const post = await Post.findById(id).populate("file").populate("category").populate("updatedBy", "-password -verificationCode -forgotPasswordCode");
        if(!post){
            res.code = 404;
            throw new Error("Post not found");
        }

        res.status(200).json({code: 200, status: true, message: "Got the post successfully", data: {post}});
    }catch(error){
        next(error);
    }
}

module.exports = {addPost, updatePost, deletePost, getPosts, getPost};