// Setting up the middleware to restrict the permissions
const jwt = require('jsonwebtoken');
require('dotenv').config();
const sercret = process.env.SECRET;

exports.verifyToken = (req, res, next)=>{
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if(!token){
        return res.status(403).json({error: 'No token provided'});
    }
    jwt.verify(token, sercret, (err, decoded)=>{
        if(err){
            return res.status(403).json({error: 'Failed to authenticate token'});
        }
        req.user = decoded;
        next();
    });
};

exports.isBlogger = (req, res, next)=>{
    if(req.user.role === 'Blogger'){
        next();
    }else{
        res.status(403).json({error: 'Only Bloggers can perform this action'});
    };
};

exports.isAdmin = (req, res, next) =>{
    if(req.user.role === 'Admin'){
        next();
    }else{
        res.status(403).json({error: 'Only Admins can perform this action'});
    };
};

exports.isUser = (req, res, next)=>{
    if(req.user.role === 'User'){
        next();
    }else{
        res.status(403).json({error: 'Sign to Perform this Action'});
    }
}

exports.checkAdminOrUserRole = (req, res, next) => {
    if (req.user && (req.user.role === 'User' || req.user.role === 'Admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Only users or admins can perform this action.' });
    }
};