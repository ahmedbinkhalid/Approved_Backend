const userModel = require('../Models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const upload = require('../Middlewares/middleware');  // Import the multer middleware


const JWT_SECRET = process.env.secretKey;

exports.signUp = async (req, res, next) => {
  const { email, userName, password, confirmPassword, role } = req.body;

  try {
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if the email already exists
    const existingUser = await userModel.emailExists(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Check if the username already exists
    const existingUserName = await userModel.findOne({ userName });
    if (existingUserName) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Standard salt rounds

    // Create a new user
    const newUser = new userModel({
      email,
      userName,
      password: hashedPassword,
      role: role || 'user', 
    });

    // Save the user to the database
    await newUser.save();

    // Send success response
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.login = async (req, res, next)=>{
    const {email, password} = req.body;
    try{
        // Find user by mail
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({message: "User does not exits, please signup"});
        }
        if(user.status === "blocked"){
            return res.status(400).json({message: "Your account has been Blocked 😞"});
        }
        // compare the password with the hashed password 

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Password is not correct"});
        }

        // Create a JWT token
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role, profilePicture: user.profilePicture, userName : user.userName }, JWT_SECRET, { expiresIn: '10h' });

        // Send success response with token
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
        
    }

}
exports.forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
      const user = await userModel.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: "User does not exist" });
      }

      // Generate a random 4-digit OTP
      const otp = Math.floor(Math.random() * 9000) + 1000;

      // Store the OTP temporarily
      user.otp = otp;
      user.otpExpire = Date.now() + 3600000; // Valid for 1 hour
      await user.save();

      // Create the transporter
      const transporter = nodeMailer.createTransport({
          host: "smtp.hostinger.com",
          port: 465,
          secure: true,
          auth: {
              user: process.env.MAIL_LOGIN,
              pass: process.env.MAIL_PASS,
          },
      });

      transporter.verify((error, success) => {
          if (error) {
              console.error("SMTP Transport Error:", error);
          } else {
              console.log("SMTP Server is ready to take messages.");
          }
      });

      // HTML Content for the gaming-themed email
      const htmlContent = `
      <div style="font-family: 'Arial', sans-serif; background-color: #1e1e2f; color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; max-width: 600px; margin: auto;">
          <h1 style="color: #ff5722;">🔐 Password Reset Request</h1>
          <p style="font-size: 16px; color: #b3b3cc;">Hey <strong>${user.userName}</strong>,</p>
          <p style="font-size: 16px; color: #b3b3cc;">
              We received a request to reset your password for your gaming account on <strong>SubZero</strong>. To proceed, use the one-time password (OTP) below:
          </p>
          <div style="background-color: #252540; color: #ff5722; font-size: 24px; padding: 15px; margin: 20px 0; border-radius: 5px; font-weight: bold;">
              ${otp}
          </div>
          <p style="font-size: 14px; color: #b3b3cc;">
              This OTP is valid for 1 hour. For your security, do not share this code with anyone. If you did not request a password reset, you can safely ignore this email.
          </p>
          <p style="font-size: 16px; color: #b3b3cc;">Stay safe and keep gaming! 🎮</p>
          <p style="font-size: 14px; color: #b3b3cc;">
              Best regards,<br>
              <strong style="color: #ff5722;">SubZero Support Team</strong>
          </p>
      </div>`;

      // Email options
      const mailOptions = {
          from: process.env.MAIL_LOGIN,
          to: email,
          subject: 'Password Reset OTP',
          html: htmlContent, // Use the HTML content instead of plain text
      };

      // Send the email
      transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
              console.error("Error sending email:", err);
              return res.status(500).json({ message: 'Failed to send email.' });
          } else {
              console.log("Email sent:", info.response);
              const otpToken = jwt.sign({ email, otp }, JWT_SECRET, { expiresIn: '10m' });
              return res.status(200).json({ message: "OTP sent to your email.", otpToken });
          }
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
exports.resetPassword = async (req, res, next) => {
  const { otp, newPassword, confirmNewPassword } = req.body;

//   Check if new password and confirm password match
  if (newPassword != confirmNewPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
      // Extract the JWT token from the Authorization header
      const authHeader = req.headers.authorization;

      // Ensure the header exists and is in the correct format
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Authorization token missing or invalid' });
      }

      // Get the token from the header
      const otpToken = authHeader.split(' ')[1];

      // Verify the OTP token
      const decoded = jwt.verify(otpToken, JWT_SECRET);
      const email = decoded.email;

      // Find the user by email
      const user = await userModel.findOne({ email });
      if (!user || user.otp !== parseInt(otp) || new Date() > user.otpExpire) {
          return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user password and remove the OTP
      user.password = hashedPassword;
      user.otp = undefined; // Clear OTP
      user.otpExpire = undefined; // Clear OTP expiration
      await user.save(); // Save the updated user

      return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
      console.error('Error during password reset', error);
      return res.status(500).json({ error: 'Server Error' });
  }
};
  

  exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users except the requesting user
        const users = await userModel.find({}, 'userName email profilePicture role');

        // Return users
        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};


