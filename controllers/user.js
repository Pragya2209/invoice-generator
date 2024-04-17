const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const uuid = require('uuid');
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');

const signup = async(req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName = '' } = req.body;

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
            userId: uuid.v4(),
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            uniqueId: generateUniqueId()
        });

        // Save the user to the database
        const savedUser = await user.save();

        if (savedUser && savedUser._id) {
            return res.status(201).json({ message: 'User registered successfully' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error registering user' });
    }
};


function createUserDetailObj (obj, req) {
    return {
        name: obj.firstName + ' ' + obj.lastName,
        email: obj.email,
        loginCount: obj.loginCount,
        isVerified: obj.isVerified,
        location: req.location,
        questionPreferences: obj.questionPreferences,
        uniqueId: obj.uniqueId 
    }
  }
  
  const signin = async(req, res) => {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }
  
      let { email, password } = req.body;
      email = email.toLowerCase();
  
      try {
          // Check if the user with the provided email exists
          const user = await User.findOne({ email });
  
          if (!user) {
              return res.status(401).json({ error: 'User not found' });
          }
  
          // Verify the password
          const isPasswordValid = await bcrypt.compare(password, user.password);
  
          if (!isPasswordValid) {
              return res.status(400).json({ error: 'Invalid password' });
          }
  
          // Create a JWT token
          const token = jwt.sign({ userId: user.userId, isVerified: user.isVerified },
              process.env.JWT_SECRET, // Replace with your secret key
              { expiresIn: '1h' } // Token expiration time
          );
  
          await User.updateOne({ userId: user.userId }, { $inc: { loginCount: 1 } })
  
          res.status(200).send({
              message: 'SignIn successful',
              data: {...createUserDetailObj(user, req), token }
          })
      } catch (err) {
          console.log(err)
          res.status(500).json({ error: 'Error signing in' });
      }
  };
  
  const getUserDetails = async(req, res) => {
      const token = req.headers.authorization;
      try {
          const userId = req.body.userId
  
          if (userId) {
              const detail = await User.findOne({ userId });
  
              if (detail) {
                  res.status(200).send({
                      message: 'User details found',
                      data: {
                          ...createUserDetailObj(detail, req),
                          token,
                      }
                  })
              } else
                  res.status(401).send({ error: 'Invalid token' })
          } else
              res.status(401).send({ error: 'Invalid token' })
      } catch (error) {
          console.log(error)
          res.status(401).send({ error: 'Invalid token' })
      }
  }

  module.exports = {
    getUserDetails,
    signin,
    signup
  }
