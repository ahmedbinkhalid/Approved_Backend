const userModel = require('../Models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.SECRET;
const mail = process.env.MAIL_LOGIN;
const pass = process.env.MAIL_PASS;

// Signup Logic

exports.signUp = async (req, res, next) =>{
    const {name, email, password, confirmpassword, role} = req.body;
    if(password !==confirmpassword){
        return res.status(400).json({error: 'Passwords do not match'});
    }

    // Validate the role 

    const allowedRoles = ['User', 'Admin', 'Blogger'];

    if(!allowedRoles.includes(role)){
        return res.status(400).json({erorr: 'Invalid Role Selected'});
    }
    try{
        const db = req.app.locals.db;

        // Check if user already exists
        const existingUser = await userModel.findUserByEmail(db, email);
        if(existingUser){
            return res.status(400).json({error: 'User Already Exists'});
        }

        // Creating new user 
        const newUser = await userModel.createUser(db, {name, email, password, role});
        res.status(200).json({message: 'User Registered Successfuly', userid: newUser.insertedId});

    }catch (error){
        console.error('Error During Signup:', error)
        res.status(500).json({error: 'Server error',error});
    }

};

// Login Logic

exports.login = async (req, res, next)=>{
    const {email, password} = req.body;

    if (!email || !password){
        return res.status(400).json({error: "Email and Password are required"});
    }

    try{
        const db = req.app.locals.db;

        // Find User by Email
        const user = await userModel.findUserByEmail(db, email);
        if(!user){
            return res.status(400).json({error: "User does not exist"});
        }
        // Compare Password with hashed password if the database
        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(400).json({error:"Invalid Email or Password"})
        }

        //Generate JWT Token
        const token = jwt.sign({id: user._id, role: user.role, name: user.name}, 'myzameen!@#$%^&*()',{expiresIn: '1h'});
        // Successful Login

        res.status(200).json({message: 'Logged in successuly', token, user:{id: user._id, name: user.name, role: user.role}});
    }
    catch(error){
        console.error('Error During Login:', error);
        res.status(500).json({error: "Server Error"});
    }
}

exports.forgotpassword = async (req, res, nex) =>{
    const {email} = req.body;
    try{
        const db = req.app.locals.db;
        // Find user by Email
        const user = await userModel.findUserByEmail(db, email);
        if(!user){
            res.status(400).json({error: 'User does not exist'});
        }
        // generate 4 digits random Otp
        const otp = Math.floor(1000 + Math.random() * 9000);

        // Save the otp in the database with expiration time

        const otpExpiration = new Date(Date.now() + 10 * 60000);
        await db.collection('users').updateOne({email}, {$set: {otp, otpExpiration}});

        // setup nodemailer for sending mails

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: mail,
                pass: pass,

            },
        });
        const mailOptions = {
            from: 'My Zameen',
            to: email,
            subject: 'Reset Password',
            text: `Your otp for password reset is: ${otp} Its is valid for 10 minutes`
        }
        await transporter.sendMail(mailOptions);
        const otpToken = jwt.sign({ email, otp }, secret, { expiresIn: '10m' });
        res.status(200).json({message: 'Otp sent on your mail', otpToken});
    } catch (error){
        console.error('Error during password reset', error);
        res.status(500).json({error: 'Server Error'});
    }
}

exports.resetpassword = async (req, res, next)=>{
    const {otpToken, otp, newpassword, confirmpassword} = req.body;
    if(newpassword !==confirmpassword){
        res.status(500).json({error: 'Password does not match'});
    }

    
    try{
        const decoded = jwt.verify(otpToken, secret);
        const email = decoded.email;
        const db = req.app.locals.db;
        const user = await userModel.findUserByEmail(db, email);
        if(!user || user.otp !== parseInt(otp) || new Date() > user.otpExpiration){
            res.status(500).json({error:'Invalid or Expired otp'})
        }
        // Hash new Password 
        const hashedPassword = await bcrypt.hash(newpassword, 5);

        // Update the user password and remove the otp

        db.collection('users').updateOne(
            {email},
            {$set: {password: hashedPassword}, $unset:{otp: "", otpExpiration:""}}
        )
        res.status(200).json({message: "Password changed successfuly"});
    } catch(error){
        console.error('Error during password reset', error);
        res.status(500).json({error: 'Server Error'});
    };
};

// Google login logic (new)
exports.googleLogin = async (req, res, next) => {
    // Passport attaches the user object to the request once authenticated
    const user = req.user;
    try {
        // Generate JWT token for the user
        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, secret, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Google Login Successful',
            token,
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error('Error During Google Login:', error);
        res.status(500).json({ error: "Server Error" });
    }
};


