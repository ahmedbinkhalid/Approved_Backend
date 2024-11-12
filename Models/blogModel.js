// Model for Creating blogs

const MongoDB = require("mongodb");
 exports.createBlog = async (db, blogData) =>{
    const {title, content, author, images} = blogData;
    const blog ={
        title,
        content,
        author, // Bloggers id or name
        images, // Array of image urls
        status: 'Approved',
        createdAt: new Date(),
    };
    const result = await db.collection('approvedblogs').insertOne(blog);
    return result;
 };

 // For getting pending blogs to show to the Admin
 exports.getPendingBlogs = async (db) =>{
    return await db.collection('pendingblogs').find({status: 'pending'}).toArray();
 };

 // For approving the blogs by Admin

 exports.approveBlog = async (db, blogId) => {
    const blog = await db.collection('pendingblogs').findOne({_id: new MongoDB.ObjectId(blogId)});
    if(blog){

        // Set the status to Approved
        const approvedBlog = {
            ...blog,
            status: 'Approved',
            approvedAt: new Date()
        }
        await db.collection('approvedblogs').insertOne(approvedBlog);
        await db.collection('pendingblogs').deleteOne({_id: new MongoDB.ObjectId(blogId)});
    };
 };

 // For rejecting the blog by the Admin

 exports.rejectBlog = async (db, blogId)=>{
    const blog = await db.collection('pendingblogs').findOne({_id: new MongoDB.ObjectId(blogId)});
    if(blog){
        // Set the status to Rejected
        const rejectedBlog = {
            ...blog,
            status: 'Rejected',
            rejectedAt: new Date()
        }
        await db.collection('rejectedblogs').insertOne(rejectedBlog);
        await db.collection('pendingblogs').deleteOne({_id: new MongoDB.ObjectId(blogId)});
    };
 };

 // For getting all the Approve blogs to show

 exports.getBlogs = async (db)=>{
    return await db.collection('approvedblogs').find({status: 'Approved'}).toArray();
 }

 // For getting blogs by id

 exports.getBlogById = async (db, blogId)=>{
    return await db.collection('approvedblogs').findOne({_id: new MongoDB.ObjectId(blogId)});
 }