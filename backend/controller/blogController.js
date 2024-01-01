const Joi = require('joi');
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const fs = require('fs')
const {SERVER_BASEURL } = require('../config/index')
const BlogDTO = require('../dto/blog')
const BlogDetailsDTO = require('../dto/blog-details')

const mongoDbIdPattern = /^[0-9a-fA-F]{24}$/;
const blogController = {

    async create(req,res,next){
        // 1. validate request data
        // 2. handle image storage , naming 
        // 3. store in database 
        // 4. return response 

        const createBlogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            photo: Joi.string().required(),
            slug: Joi.string().required(),
            author: Joi.string().regex(mongoDbIdPattern).required()
        });

        // if validation error occur => return error via middleware 
        const {error} = createBlogSchema.validate(req.body);
        if(error){
            return next(error);
        }

        const {title,content,photo,slug,author} = req.body;
        // handle image 
        // client side => base64 encoded string => decode => store in local file system => store in db

        // read buffer 
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, " "),"base64");
        // giving random name 
        const imgPath = `${Date.now()}-${author}.png`;
        // save locally
        try {
            fs.writeFileSync(`storage/images/${imgPath}`,buffer);
        } catch (error) {
            next(error)
        }

        let newBlog
       try {
            newBlog = new Blog({
                title,
                content,
                photoUrl:`${SERVER_BASEURL}/storage/images/${imgPath}`,
                slug,
                author
            })

            await newBlog.save();

       } catch (error) {
            return next(error)
       }
       return res.status(201).json({blog:newBlog,message:"Blog Added Successfully!"});
        // console.log("Workigg")
        // return res.json({"message": "Working"})
    },
    
    async getAllBlog(req,res,next){
        const blogs = await Blog.find({});
        // return res.status(200).json({blogs});

        // another way 
        const blogsData = [];

        for(let i=0; i < blogs.length; i++){
            const data = new BlogDTO(blogs[i])
            blogsData.push(data);
        }
        return res.status(200).json({blogsData});

    },

    async getBlogBySlug(req,res,next){
        // validate
        // get slug from req.params
        // find blog in database
        // return response

        const blogBySlugSchema = Joi.object({
            slug: Joi.string().required()
        })

        const {error} = blogBySlugSchema.validate(req.params);

        if(error){
            return next(error)
        }

        const {slug} = req.params;

        let blog;
        try {
            blog = await Blog.findOne({slug:slug}).populate('author');  //populate function is used for relationship
        } catch (error) {
            return next(error)
        }

        if(blog){
            const blogDto = new BlogDetailsDTO(blog);
            
            res.status(200).json({blog: blogDto});
        }
        else{
            const error = {
                status: 404,
                message: "Blog Not Found"
            }
            return next(error);
        }

    },

    async delete(req,res,next){
        // validate parameter
        // get params 
        // search blog from database
        // delete blog from database
        // return response

        const deleteBlogSchema = Joi.object({
            id: Joi.string().required()
        });

        const {error} = deleteBlogSchema.validate(req.params);

        if(error){
            return next(error)
        }

        const {id} = req.params

        let blog;
        try {
            blog = await Blog.findOne({_id:id});

        } catch (error) {
            next(error)
        }

        if(blog)
        {
            try {
                await Blog.deleteOne({_id: id})
                await Comment.deleteMany({blog: id});
                return res.status(200).json({messaage: "Blog Deleted Successfully!"})
            } catch (error) {
                return next(error)
            }
        }
        else{
            const error = {
                message: "Blog Not Found",
                status: 401,
            }
            next(error)
        }

        


    },

    async update(req,res,next){
        // validate 
        // check image update or not 
        // save data in db
        // return response 

        const updateBlogSchema = Joi.object({
            title : Joi.string().required(),
            content : Joi.string().required(),
            author: Joi.string().required(),
            blogId: Joi.string().required(),
            photo: Joi.string()
        })

        const {error} = updateBlogSchema.validate(req.body);
        if(error){
            return next(error)
        }

        const {title,content,author,blogId,photo} = req.body;

        // fetch blog data from db by blogId
        let blog;
        try{
            blog = await Blog.findOne({_id: blogId})
        }
        catch(error){
            return next(error)
        }
        // if blog is available
        if(blog){

            // if user select photo
            if(photo){
                // steps => 
                // delete previous photo 
                // add new photo 
    
                // delete previous photo 
                let previousPath = blog.photoUrl;
                previousPath = previousPath.split('/').at(-1);
                fs.unlinkSync(`storage/images/${previousPath}`);
                // add new photo 
                const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/,""),'base64');
                const imgPath = `${Date.now()}-${author}.png`;
                fs.writeFileSync(`storage/images/${imgPath}`,buffer);
    
                try {
                    await Blog.updateOne(
                        {_id: blogId},
                        {
                            title,
                            content,
                            photoUrl: `${SERVER_BASEURL}/storage/images/${imgPath}`
                        })
                } catch (error) {
                    return next(error)
                }    
            }
            else
            {
                try{
                    await Blog.updateOne(
                        {_id:blogId},
                        {
                            title,
                            content
                        })
                }
                catch(error){
                    return next(error)
                }
            }

            return res.status(200).json({message: "Blog Updated Successfully!"});

        }
        else{
            const error = {
                message: "Blog Not Found!"
            }
            return next(error)
        }

        
    }


}

module.exports = blogController;