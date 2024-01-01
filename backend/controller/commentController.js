const Joi = require('joi');
const Comment = require('../models/comment');
const CommentDTO = require('../dto/comment-details');
const mongoDbIdPattern = /^[0-9a-fA-F]{24}$/;
const commentController = {
    
    async create(req,res,next){
        // validate
        // save data in db
        // return response

        const postCommentSchema = Joi.object({
            content: Joi.string().required(),
            blogId: Joi.string().required(),
            author: Joi.string().required()
        });

        const {error} = postCommentSchema.validate(req.body);

        if(error){
            return next(error)
        }

        const {content,blogId,author} = req.body;

        let comment;
        try {
            comment = new Comment({content,blog:blogId,author});
            await comment.save()
            return res.status(201).json({message: "comment created!"});
        } catch (error) {
            return next(error)
        }
    },

    async getByBlogId(req,res,next){
        // validate 
        // checking blog have or not 
        // save data in db
        // return response 

        const getCommentSchema = Joi.object({
            blogId: Joi.string().regex(mongoDbIdPattern).required()
        });

        const {error} = getCommentSchema.validate(req.params);
        
        if(error){
            return next(error)
        }
        const {blogId} = req.params;

        try {
           const comments = await Comment.find({blog:blogId}).populate('author');
           const commentArray = []; 

           for(let i=0; i < comments.length;i++){
                let data = new CommentDTO(comments[i]);
                commentArray.push(data);
           }

           return res.status(200).json({comments: commentArray})
        } catch (error) {
            return next(error)
        }        

    }

}

module.exports = commentController;