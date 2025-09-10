import fs from 'fs'
import imagekit from '../configs/imageKit.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import main from '../configs/gemini.js';

//API to addBlog 
export const addBlog = async (req, res)=>{
    try {
         const {title, subTitle, description, category, isPublished} 
            = JSON.parse(req.body.blog);
        const imageFile = req.file;

        //Check if all fiels are present
        if(!title || !description || !category || !imageFile ){
            return res.json({success: false, message: "Missing required fields" })
        }

        const fileBuffer = fs.readFileSync(imageFile.path)
        
        //Upload Image to ImageKit
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/blogs"
        })

        //optimization through imagekit URL transformation
        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                {quality: 'auto'}, // Auto compression
                {format: 'webp'},  // Convert to modern format
                {width: '1280'}    // Width resizing
            ]
        })
        const image = optimizedImageUrl;
        await Blog.create({title, subTitle, description, category, image, isPublished})

        res.json({success: true, message: "Blog added successfully"})

    } catch (error) {
        res.json({success: false, message: error.messsage})

    }
}

//API to get list of blogs

export const getAllBlogs = async (req, res)=>{
    try {
        const blogs = await Blog.find({isPublished: true})
        res.json({success: true, blogs})
    } catch (error) {
        res.json({success: false, message: error.messsage})
    }
}

//get the individual data 
export const getBlogById = async(req, res)=>{
    try {
        const {blogId} = req.params;
        const blog = await Blog.findById(blogId)
        //if we dont get any blog of this ID 
        if(!blog){
            return res.json({success: false, message: "Blog not Found"});
        }
        res.json({success: true, blog})
    } catch (error) {
        res.json({success: false, message: error.messsage})
    }
}

//delete individual Blog
export const deleteBlogById = async(req, res)=>{
    try {
        const {id} = req.body;
        await Blog.findByIdAndDelete(id);

        //Delete all comments associated with the blog
        await Comment.deleteMany({blog: id})
        
        //if we dont get any blog of this ID 
        res.json({success: true, message: "Blog deleted successfully"})
    } catch (error) {
        res.json({success: false, message: error.messsage})
    }
}

//controller function to publish or unpublish Blog
export const togglePublish = async(req,res) =>{
    try {
        const {id} = req.body;
        const blog = await Blog.findById(id);

        blog.isPublished = !blog.isPublished;
        await blog.save();

        res.json({success: true, message: "Blog status updated"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}
// add comments 
export const addComment = async(req, res) =>{
    try {
        const {blog, name, content} = req.body;
        await Comment.create({blog, name, content});
        res.json({success: true, message: "Comment added for review"})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

//comments for individual Blog
export const getBlogComments = async(req, res) =>{
    try {
        const {blogId} = req.body;
        const comments = await Comment.find({blog: blogId, 
            isApproved: true}).sort({createdAt: -1});
        res.json({success: true,comments})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const generateContent = async (req, res)=>{
    try {
        const {prompt} = req.body;
        const content = await main(prompt + ' Generate a blog content for this topic in simple text format')
        res.json({success: true, content})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

