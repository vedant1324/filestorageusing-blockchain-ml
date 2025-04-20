import React, { useState } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import './SenderReceiver.css';

const Receiver = () => {
  const [encryptedBlockId, setEncryptedBlockId] = useState('');
  const [password, setPassword] = useState('');
  const [fileMetadata, setFileMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles decryption of the encrypted block ID and fetches file metadata.
   */
  const handleDecryptAndFetch = async () => {
    if (!encryptedBlockId || !password) {
      setError('Both Encrypted Block ID and password are required.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedBlockId, password);
      const originalBlockId = bytes.toString(CryptoJS.enc.Utf8);

      if (!originalBlockId) {
        throw new Error('Invalid password or Encrypted Block ID.');
      }

      const response = await axios.get(`http://localhost:3001/api/file/${originalBlockId}`);
      setFileMetadata(response.data.data); 
    } catch (err) {
      console.error('Decryption or Fetching failed:', err.message);
      setError('Failed to decrypt or fetch the file. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="receiver-container">
      <h2 className="title">Fetch Your Video</h2>

      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label>Encrypted Block ID</label>
        <input
          type="text"
          value={encryptedBlockId}
          onChange={(e) => setEncryptedBlockId(e.target.value)}
          placeholder="Enter Encrypted Block ID"
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
        />
      </div>

      <button 
        onClick={handleDecryptAndFetch} 
        disabled={isLoading} 
        className="modern-button"
      >
        {isLoading ? 'Fetching...' : 'Decrypt & Fetch'}
      </button>

      {isLoading && <p className="loading-text">Loading...</p>}

      {fileMetadata && (
        <div className="file-metadata">
          <h4>File Metadata</h4>
          <p><strong>Description:</strong> {fileMetadata.description}</p>
          <p><strong>Coordinates:</strong> {fileMetadata.coordinates}</p>

          <p>
            <strong>Video Link:</strong> 
            <a 
              href={`https://turquoise-leading-frog-542.mypinata.cloud/ipfs/${fileMetadata.ipfsHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="video-link"
            >
              View Video
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default Receiver;
