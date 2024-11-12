// For Sumbitting the blogs

const blogModel = require('../Models/blogModel');
require('dotenv').config();
const subsModel = require('../Models/subscriptionModel');
const nodemailer = require('nodemailer');

exports.submitBlog = async (req, res, next)=>{
    const {title, content, images} = req.body;
    // const bloggerId = req.user.id;

    if(content.length< 2){
        return res.status(400).json({error: "Blog content must be atleast of 500 words"});
    }
    try{
        const db = req.app.locals.db;
        const images = req.files.map(file=> file.filename);
        const newBlog = await blogModel.createBlog(db, {
            title,
            content,
            // author: bloggerId,
            images: images,
        });
        res.status(200).json({message:'Blog submitted', blogId: newBlog.insteredId})
         // Approve the blog
         await blogModel.approveBlog(db, newBlog.insertedId); // Use the newly created blog ID

         // Fetch the newly created blog for the email notification
         const blog = await blogModel.getBlogById(db, newBlog.insertedId);
        if (blog) {
            const subs = await subsModel.getSubscriber(db);
            // Set up the email transporter using nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail', // Example: 'gmail'
                auth: {
                    user: process.env.MAIL_LOGIN,
                    pass: process.env.MAIL_PASS,
                },
            });

            // Set up the email options
            const mailOptions = {
                from: 'Subhan Motors',
                to: subs, // You can loop through subscribers here
                subject: 'New Blog Approved!',
                html: `
                    <h2>${blog.title}</h2>
                    <p>${blog.content}</p>
                    <p><a href="http://localhost:3000/blogs/${newBlog.insertedId}">Read the full blog here</a></p>

                `,
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ error: 'Error sending email' });
                }
            });
        }

    } catch(error){
        console.error('Error During blog submission' ,error);
        res.status(500).json({error: 'Server error'});
    };
};


// This part of the code was not used because of the deadline



// For approving the blog

exports.approveBlog = async (req, res, next) =>{
    const { blogId } = req.body;
    try{
        const db = req.app.locals.db;
        await blogModel.approveBlog(db, blogId);
        const blog = await blogModel.getBlogById(db, blogId);
        if (blog) {
            const subs = await subsModel.getSubscriber(db);
            // Set up the email transporter using nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail', // Example: 'gmail'
                auth: {
                    user: process.env.MAIL_LOGIN,
                    pass: process.env.MAIL_PASS,
                },
            });

            // Set up the email options
            const mailOptions = {
                from: 'Subhan Motors',
                to: subs, // You can loop through subscribers here
                subject: 'New Blog Approved!',
                html: `
                    <h2>${blog.title}</h2>
                    <p>${blog.content}</p>
                    <p><a href="http://localhost:5000/blogs/${blogId}">Read the full blog here</a></p>

                `,
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ error: 'Error sending email' });
                }
            });
        }
        res.status(200).json({message: 'Blog approved and Published'});
    } catch(error){
        console.error('Error During blog approval', error);
        res.status(500).json({error: 'Server error'});
    }
};

// For rejecting the blog

exports.rejectBlog = async (req, res, next)=>{
    const { blogId } = req.body;
    try {
        const db = req.app.locals.db;
        await blogModel.rejectBlog(db, blogId);
        res.status(200).json({message:'Blog rejected Succesfuly'});
    } catch(error){
        console.error('Error during rejecting the blog', error);
        res.status(500).json({error: 'Server error'});
    };
};

// Controller for getting pending blogs

exports.getpendingBlog = async (req, res, next)=>{
    try{
        const db = req.app.locals.db;
        const pendingblogs = await blogModel.getPendingBlogs(db);
        res.status(200).json({pendingblogs});
    } catch(error){
        console.error('Error During getting pending blogs', error);
        res.staus(500).json({error: 'Server error'});
    }
};

// Controller for geting all the approved blogs

exports.getApprovedBlogs = async (req, res, next)=>{
    try{
        const db = req.app.locals.db;
        const approvedBlogs = await blogModel.getBlogs(db);
        // res.status(200).json(approvedBlogs);
        const blogsWithTimeAgo = approvedBlogs.map(blog => {
            const timeAgo = calculateTimeAgo(blog.approvedAt);
            return { ...blog, timeAgo }; // Add timeAgo to the blog object
        });

        res.status(200).json(blogsWithTimeAgo);
    } catch(error){
        console.error('Error During getting approved blogs', error);
        res.status(500).json({error: 'Server error'});
    }
};
// Helper function to calculate time ago
function calculateTimeAgo(postDate) {
    const now = new Date();
    const timeDiff = Math.abs(now - postDate); // Difference in milliseconds

    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day(s) ago`;
    if (hours > 0) return `${hours} hour(s) ago`;
    if (minutes > 0) return `${minutes} minute(s) ago`;
    
    return 'Just now';
}

// Controller for getting blog by id 
exports.getBlogById = async (req, res, next)=>{
    try{
        const db = req.app.locals.db;
        const blogId = req.params.id;
        const blog = await blogModel.getBlogById(db, blogId);
        res.status(200).json(blog);
    } catch(error){
        console.error('error during fetching blog by id', error);
        res.status(500).json({error: 'Server Error'});
    }
}