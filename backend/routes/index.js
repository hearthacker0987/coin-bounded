const express = require('express')
const router = express.Router();
const authController = require('../controller/authController');
const auth = require('../middleware/auth');
const blogController = require('../controller/blogController');
const commentController = require('../controller/commentController');

// testing
router.get('/testing',(req,res) => res.json({message: "Testing Route is running"}))
router.post('/register', authController.register)
router.post('/login',authController.login)
router.post('/refresh',authController.refresh);
router.post('/logout',auth,authController.logout)

// Blogs Routes
// *** create  
router.post('/blog/create',auth,blogController.create);
// *** getAllBlogs
router.get('/blog/all',auth,blogController.getAllBlog)
// *** get Blog By Id 
router.get('/blog/:slug',auth,blogController.getBlogBySlug);
// *** update blog 
router.put('/blog/update',auth,blogController.update)
// *** detele blog 
router.delete('/blog/delete/:id',auth,blogController.delete)

// Comments Routes 
router.post('/comment/create',auth,commentController.create);
router.get('/comments/get/:blogId',auth,commentController.getByBlogId);
module.exports = router;