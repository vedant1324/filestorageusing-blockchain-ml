const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const auth = require('basic-auth');
const fs = require('fs');
const { Web3 } = require('web3');
const connectDB = require("../database/db");
require('dotenv').config();
const FileStorageContract = require('../build/contracts/FileStorage.json');
const mongoose = require('mongoose');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const username = 'admin';
const password = 'password';

// Initialize Web3 with a provider
const web3 = new Web3('http://localhost:7545');

// Load the smart contract ABI and address
const contractABI = FileStorageContract.abi;
const contractAddress = '0x01eB2085e9783E8f445e0E30E6E0611704B4aF9e';

// Initialize the contract instance
const fileStorageContract = new web3.eth.Contract(contractABI, contractAddress);

// Function to upload file to Pinata
async function uploadToPinata(filePath) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
      }
    });
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error.message);
    throw new Error('Failed to upload file to Pinata');
  }
}

// Connect to the database
connectDB();

// Define the Number schema and model
const NumberSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
    default: 25 // Initial value of the number
  }
});

const NumberModel = mongoose.model('Number', NumberSchema);

// Middleware for basic authentication
const basicAuth = (req, res, next) => {
  const user = auth(req);
  if (!user || user.name !== username || user.pass !== password) {
    res.setHeader('WWW-Authenticate', 'Basic realm="FileStorageAPI"');
    return res.status(401).send('Access denied');
  }
  next();
};

// Route for file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { file, body: { description, coordinates } } = req;

    if (!file) {
      return res.status(422).json({ error: 'No file uploaded' });
    }

    if (!description) {
      return res.status(422).json({ error: 'Description is required' });
    }

    if (!coordinates) {
      return res.status(422).json({ error: 'Coordinates are required' });
    }

    // Upload file to Pinata
    const ipfsHash = await uploadToPinata(file.path);

    // Call the smart contract function with IPFS CID, description, and coordinates
    const accounts = await web3.eth.getAccounts();
    console.log(ipfsHash);
    console.log(coordinates);
    console.log(description);
    const transaction = await fileStorageContract.methods.addFile(ipfsHash, coordinates, description)
      .send({ from: accounts[0], gas: 500000 });

    console.log('Transaction complete:', transaction);

    // Increment the number in the database
    const updatedNumber = await NumberModel.findOneAndUpdate(
      {}, // Empty filter for a single document
      { $inc: { value: 1 } }, // Increment the 'value' field by 1
      { new: true, upsert: true } // Create if not existing, return updated document
    );

    if (!updatedNumber) {
      throw new Error('Failed to update the number in the database.');
    }

    console.log('Number incremented to:', updatedNumber.value);

    // Send response with IPFS hash and block number
    res.json({
      ipfsHash,
      blockNum: updatedNumber.value, // Incremented block number
    });
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/file/:id', async (req, res) => {
  try {
      const fileId = req.params.id;
      const fileMetadata = await fileStorageContract.methods.files(fileId).call();
      console.log(fileMetadata);
      res.json({
          success: true,
          message: 'File metadata retrieved successfully.',
          data: fileMetadata
      });
  } catch (error) {
      console.error("Error retrieving file metadata:", error);
      res.status(500).json({
          success: false,
          message: 'Failed to retrieve file metadata.',
          error: error.message
      });
  }
});

router.get('/download/:ipfsHash', async (req, res) => {
  try {
    const ipfsHash = req.params.ipfsHash;
    
    // Fetch the file from IPFS
    const response = await axios.get(`https://turquoise-leading-frog-542.mypinata.cloud/ipfs/${ipfsHash}`, {
      responseType: 'stream',
    });

    // Set the appropriate headers for the client to download the file
    res.set({
      'Content-Disposition': 'attachment; filename="downloaded_file"',
      'Content-Type': 'application/octet-streams', 
    });
    
    // Pipe the file stream to the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server


module.exports = router;
