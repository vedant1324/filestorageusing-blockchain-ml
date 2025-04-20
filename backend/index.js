const cors = require('cors');
const express = require('express');
const connectDB= require("./database/db");
const bcrypt = require('bcrypt');
const FormDataModel = require('./models/FormData');
const router = require('./routes/upload');
const router2 = require('./routes/faceAuth');
const mongoose = require('mongoose');

// Initialize the Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
connectDB();
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Server is healthy!' });
});

//ipfs endpoint
app.use('/api/', router);
app.use('/api/', router2);
// Register endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const existingUser = await FormDataModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password before saving to database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new FormDataModel({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser.email });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await FormDataModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Compare hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({ message: 'Login successful', user: user.email });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err });
  }
});

// View all users (Admin Debugging Endpoint)
app.get('/users', async (req, res) => {
  try {
    const users = await FormDataModel.find({}, { password: 0 }); // Exclude passwords from results
    res.status(200).json({ message: 'User list retrieved', users });
  } catch (err) {
    console.error('Error retrieving users:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err });
  }
});

// Validate if data is inserted into DB
app.get('/check-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await FormDataModel.findOne({ email });
    if (user) {
      res.status(200).json({ message: 'User exists in the database', user });
    } else {
      res.status(404).json({ message: 'User not found in the database' });
    }
  } catch (err) {
    console.error('Error checking user in database:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err });
  }
});

// Start the server
app.listen(3001, () => {
  console.log('Server is listening on http://127.0.0.1:3001');
});
