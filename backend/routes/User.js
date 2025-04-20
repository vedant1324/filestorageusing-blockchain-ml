const express = require("express");
const {UserModel,ServilanceUser} = require ("../database/db")
const Userroute = express.Router();
const {userschema,signinschema,surveillanceSchema}= require("../middlewere/check");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

Userroute.post("/register", async (req, res) => {
    const User= req.body;
   
    userschema.parse(User);
    console.log("parsed");
    const { Username, Password , Useremail , Servilancepartner} = User;
    try {
        const user = await UserModel.findOne({ Useremail });
        if (user) {
            throw new Error("Error: User exist");
        }
        const createdUser = await UserModel.create({ Username, Password ,Useremail,Servilancepartner });
       
        const token = await jwt.sign({ userId: createdUser._id ,servilance:createdUser.Servilancepartner}, JWT_SECRET);
        console.log(createdUser);
        res.cookie('token', token, { httpOnly: true }).status(201).json({Username: createdUser.Username, _id: createdUser._id});
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
Userroute.post("/signin", async (req, res) => {
  const userreq = req.body;
 
  try {
      signinschema.parse(userreq);
      console.log("parsed");
      const user = await UserModel.findOne({Username:userreq.Username});
      let token;
      if (!user) {
          const userpart= await ServilanceUser.findOne({ adhar:userreq.Username })
          console.log(userpart);
          if(!userpart){
            throw new Error("Error: User does not exist");
          }else{
            token = await jwt.sign({ userId: userpart._id , servilance: userpart.Servilancepartner}, JWT_SECRET);
            res.cookie('token', token, { httpOnly: true }).status(201).json({Username: userpart.firstName, _id: userpart._id,Servilancepartner:userpart.Servilancepartner});
          }
      }else{
        token = await jwt.sign({ userId: user._id , servilance: user.Servrilancepartner}, JWT_SECRET);
        console.log(user);
        res.cookie('token', token, { httpOnly: true }).status(201).json({Username: user.Username, _id: user._id,Servilancepartner:user.Servilancepartner});
      }

     
  } catch (err) {
      console.error("Error registering user:", err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

Userroute.post('/Servilanceregister', async (req, res) => {
  const body = req.body;
  const { firstName, lastName, adhar, location ,Servilancepartner}=body;

  try {
    // Input validation
    surveillanceSchema.parse(body);
    const user= ServilanceUser.findOne({adhar:adhar});
    if(!user){
      throw new Error("user already exists");
    }
    // Create a new user instance using the User schema
    const newUser = new ServilanceUser({
      firstName,
      lastName,
      adhar,
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      Servilancepartner:Servilancepartner
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ adhar: savedUser.adhar ,servilance:savedUser.Servilancepartner}, JWT_SECRET);

    // Sending a response back to the frontend with the JWT token
    res.cookie('token', token, { httpOnly: true }).json({username:savedUser.firstName, _id: savedUser._id,Servilancepartner:savedUser.Servilancepartner,location:savedUser.location});
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering user');
  }
});

  

module.exports= {Userroute};