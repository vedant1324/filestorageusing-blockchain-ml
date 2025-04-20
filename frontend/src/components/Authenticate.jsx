import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import Receiver from './Receiver';
import Login from './Login';

const ReceiverAuth = () => {
  const videoRef = useRef();
  const [receiverId, setReceiverId] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const [redirectComponent, setRedirectComponent] = useState(null); // New state for redirection

  useEffect(() => {
    startCamera();
    loadModels();
  }, []);

  const loadModels = async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const captureAndAuthenticate = async () => {
    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      setAuthStatus("No face detected");
      return;
    }

    try {
      const res = await axios.post('http://localhost:3001/api/authenticate', {
        receiverId: receiverId,
        faceDescriptor: Array.from(detections.descriptor),
      });
      setAuthStatus(res.data.message);
    } catch (err) {
      setAuthStatus("Authentication failed");
    }
  };

  const handleNext = () => {
    if (authStatus === "Authentication successful") {
      setRedirectComponent(<Receiver />);
    } else if (authStatus === "Face does not match") {
      setRedirectComponent(<Login />);
    } else {
      alert("Not Authorized!");
      setRedirectComponent(null);
    }
  };

  return (
    <div className="auth-container">
      {redirectComponent ? (
        redirectComponent
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline width="640" height="480" />
          <input
            type="text"
            placeholder="Enter Receiver ID"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
          />
          <button onClick={captureAndAuthenticate}>Authenticate</button>
          {authStatus && <p>Status: {authStatus}</p>}
          {authStatus && <button onClick={handleNext}>Next</button>}
        </>
      )}
    </div>
  );
};

export default ReceiverAuth;
