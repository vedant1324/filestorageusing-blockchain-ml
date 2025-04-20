import React, { useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import "./SenderReceiver.css";

const Sender = () => {
  const [file, setFile] = useState(null);
  const [receiverImage, setReceiverImage] = useState(null);
  const [description, setDescription] = useState("");
  const [encryptedBlockId, setEncryptedBlockId] = useState("");
  const [publicKeyId, setpublicKeyId] = useState("");

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const coordinates = "40.7128, -74.0060"; // Hardcoded coordinates

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleReceiverImageChange = (event) => {
    setReceiverImage(event.target.files[0]);
  };

  const handleSenderSubmit = async () => {
    if (!file || !receiverImage || !description || !password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");
    setEncryptedBlockId(""); // Clear previous block ID on new submission
    setpublicKeyId("");
    try {
      // Upload receiver image for face authentication
      const faceAuthFormData = new FormData();
      faceAuthFormData.append("receiverImage", receiverImage);

      const faceResponse = await axios.post(
        "http://localhost:3001/api/uploadFaceAuth",
        faceAuthFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { receiverId } = faceResponse.data;

      console.log(receiverId);
     setpublicKeyId(receiverId);
      // Upload main file
      const fileFormData = new FormData();
      fileFormData.append("file", file);
      fileFormData.append("description", description);
      fileFormData.append("coordinates", coordinates);

      const fileResponse = await axios.post(
        "http://localhost:3001/api/upload",
        fileFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!fileResponse.data.blockNum) {
        throw new Error("Block ID missing in response.");
      }

      // Encrypt the Block ID
      const encryptedId = CryptoJS.AES.encrypt(
        fileResponse.data.blockNum.toString(),
        password
      ).toString();

      console.log("encrypted");
      setEncryptedBlockId(encryptedId);

      // Reset form fields
      setFile(null);
      setReceiverImage(null);
      setDescription("");
      setPassword("");

      // Reset file input fields manually (React does not auto-reset them)
      document.getElementById("fileInput").value = "";
      document.getElementById("receiverImageInput").value = "";
    } catch (err) {
      console.error("Error uploading file:", err.response?.data?.message || err.message);
      setError("Failed to upload. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sr-card">
      <h3 className="sr-title">Sender</h3>

      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label>File:</label>
        <input id="fileInput" type="file" onChange={handleFileChange} className="input-field" />
      </div>

      <div className="form-group">
        <label>Receiver's Image:</label>
        <input id="receiverImageInput" type="file" onChange={handleReceiverImageChange} className="input-field" />
      </div>

      <div className="form-group">
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          placeholder="Enter a description"
        />
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="Enter a password"
        />
      </div>

      <button onClick={handleSenderSubmit} disabled={loading} className="modern-button">
        {loading ? "Uploading..." : "Send File"}
      </button>

      {encryptedBlockId && (
        <div className="file-metadata">
          <h4>Encrypted Block ID:</h4>
          <p>{encryptedBlockId}</p>
        </div>
      )}
       {publicKeyId && (
        <div className="file-metadata">
          <h4>public ID:</h4>
          <p>{publicKeyId}</p>
        </div>
      )}
    </div>
  );
};

export default Sender;
