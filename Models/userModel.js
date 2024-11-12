// Creating the model for User Creation => Multi users

const bcrypt = require('bcrypt');

exports.createUser = async (db, userData)=>{
    const {name, email, password, role} = userData;

    // Hash the password Before Saving

    const hashPassword = await bcrypt.hash(password, 5);

    const user = {
        name,
        email,
        password: hashPassword,
        role,
        createdAt: new Date()
    };
    // Inserting the new user into the user collection

    const result = await db.collection('users').insertOne(user);
    return user;
};

    // Function to find user by Email

 exports.findUserByEmail = async (db, email) =>{
    const user = await db.collection('users').findOne({email});
    return user;
 }

