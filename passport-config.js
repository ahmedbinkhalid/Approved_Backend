const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('./Models/userModel');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALL_BACK_URL,
    },
    async (acessToken, refreshToken, Profile, done)=>{
        const db = global.db;
        const email = Profile.emails[0].value;

        try {
            // Check if the user already exists
            let user = await userModel.findUserByEmail(db, email);

            if(!user){
                // If the user does not exist, create a user with role user
                user = await userModel.createUser(db, {
                    name: Profile.displayName,
                    email: email,
                    password: '',
                    role: 'User'
                });
            }
            return done(null, user);

            }catch(error){
                return done(error, null);

            }
}));

module.exports = passport;


