const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const { v4: uuidv4 } = require("uuid");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData }); // Monkey patching for Node.js

const router2 = express.Router();

// Load Face API models
const MODELS_PATH = path.join(__dirname, "../modelsface");

const loadModels = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
};

loadModels().then(() => console.log("Face API models loaded.")).catch(err => console.error("Error loading models:", err));

// Storage for Uploaded Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}.jpg`);
  },
});

const upload = multer({ storage: storage });

// Upload and Store Face Descriptor
router2.post("/uploadFaceAuth", upload.single("receiverImage"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const img = await canvas.loadImage(req.file.path);
    const faceCanvas = canvas.createCanvas(img.width, img.height);
    const ctx = faceCanvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Ensure models are loaded
    if (!faceapi.nets.ssdMobilenetv1.params) {
      return res.status(500).json({ message: "Face model not loaded" });
    }

    const detection = await faceapi.detectSingleFace(faceCanvas)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "No face detected" });
    }

    const receiverId = uuidv4(); // Generate receiver ID
    const descriptorsDir = path.join(__dirname, "../descriptors");

// Ensure the directory exists
if (!fs.existsSync(descriptorsDir)) {
  fs.mkdirSync(descriptorsDir, { recursive: true });
}

const descriptorPath = path.join(descriptorsDir, `${receiverId}.json`);
fs.writeFileSync(descriptorPath, JSON.stringify(Array.from(detection.descriptor)));


    fs.writeFileSync(descriptorPath, JSON.stringify(Array.from(detection.descriptor)));

    res.json({ receiverId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Face Authentication
router2.post("/authenticate", async (req, res) => {
    try {
      const { receiverId, faceDescriptor } = req.body;
      const descriptorPath = path.join(__dirname, "../descriptors", `${receiverId}.json`);
  
      if (!fs.existsSync(descriptorPath)) {
        return res.status(401).json({ message: "User not found" });
      }
  
      const storedDescriptor = JSON.parse(fs.readFileSync(descriptorPath));
      const distance = faceapi.euclideanDistance(
        new Float32Array(storedDescriptor), 
        new Float32Array(faceDescriptor)
      );
  
      if (distance > 0.6
      ) {
        // Authentication failed, block access
        return res.status(403).json({ message: "Access Denied: Face does not match" });
      }
  
      // Authentication successful, allow user to proceed
      res.json({ message: "Access Granted", success: true  });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  

// Notify Sender about Unauthorized Access
function notifySender(senderId, intruderId) {
  console.log(`Notification: Unauthorized access attempt by ${intruderId}`);
}

module.exports = router2;
