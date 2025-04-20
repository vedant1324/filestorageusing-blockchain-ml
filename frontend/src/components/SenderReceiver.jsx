import React, { useState } from 'react';
import Sender from './Sender';
import Receiver from './Receiver';
import ReceiverAuth from './Authenticate';
import './SenderReceiver.css';

const SenderReceiver = () => {
  const [role, setRole] = useState("Sender"); // Default role: Sender
 
  return (
    <div className="sr-container">
      <div className="sr-card">
        <div className="sr-header">
          <h2 className="sr-title">Sender / Receiver</h2>
          <div className="role-toggle">
            <button
              onClick={() => setRole("Sender")}
              className={`toggle-btn ${role === "Sender" ? "active" : ""}`}
            >
              Sender
            </button>
            <button
              onClick={() => setRole("Receiver")}
              className={`toggle-btn ${role === "Receiver" ? "active" : ""}`}
            >
              Receiver
            </button>
          </div>
        </div>
        <div className="sr-content">
          {role === "Sender" && <Sender />}
          {role === "Receiver" && <ReceiverAuth />}
        </div>
      </div>
    </div>

    
  );
};

export default SenderReceiver;
