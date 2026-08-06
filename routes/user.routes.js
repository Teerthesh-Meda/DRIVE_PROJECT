//user.routes file usually used for user authentications. JWS

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const userModel = require('../models/user.models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//its route   user/test  user/register
router.get('/register', (req, res) => {
  res.render('register');
});

router.post(
  '/register',
  [
    body('email').trim().isEmail().isLength({ min: 13 }),
    body('password').trim().isLength({ min: 5 }),
    body('username').trim().isLength({ min: 3 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Invalid data',
      });
    }

    const { email, username, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = await userModel.create({
        email,
        username,
        password : hashPassword,
      });

      return res.json(newUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'User registration failed' });
    }
  }
);

router.get('/login', (req,res) => {
     res.render('login');
})

router.post('/login', 
     body('username').trim().isLength({min: 3}),
     body('password').trim().isLength({min: 5}),

     async (req, res) =>
     {
          const errors = validationResult(req);

          if(!errors.isEmpty()){
               return res.status(400).json({
                    errors: errors.array(),
                    message: "Invalid data"
               })
          }

          const {username, password } = req.body;

          const user = await userModel.findOne({
               username: username
          })

          if(!user) {
               return res.status(400).json({
                    message: 'username or password is incorrect'
               })

          }
         

          const isMatch = await bcrypt.compare(password, user.password)
 
          if(!isMatch){
               return res.status(400).json({
                    message: 'username or password is incorrect'
               })
          }


          /* jsonwebtoken is a library that allows you to generate and verify JSON Web Tokens (JWTs) in Node.js applications.
          JWTs are a compact and self-contained way to securly transmit information between parties as a JSON object.
          They are commonly used for authentication and authorization purposes in web applications.  */

        const token = jwt.sign({
         userId: user._id,
         email: user.email,
         username: user.username
         },
       process.env.JWT_SECRET,
    )
    
    //tokens are usually stored in cookies or local storage on the client side. 
    // In this case, the token is being stored in a cookie named 'token' using the res.cookie() method.
    // This allows the client to send the token back to the server with subsequent requests for authentication and authoriation purposes. 
    res.cookie('token' , token)

    res.send('Logged In')

     }
 )




module.exports = router; 