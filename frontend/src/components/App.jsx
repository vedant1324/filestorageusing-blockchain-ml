import Home from './Home';
import Login from './Login';
import Register from './Register';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import SenderReceiver from './SenderReceiver';
import ReceiverAuth from './Authenticate';
import Receiver from './Receiver';

function App() {

  return (
    <div style={{marginTop : '-3.5rem'}}>
      <BrowserRouter >
        <Routes>
          <Route path="/" element ={<Register/>} />
          <Route path="/register" element ={<Register/>} />
          <Route path="/login" element ={<Login/>} />
          <Route path="/home" element ={<Home/>} />
          <Route path="/SenderReceiver" element ={<SenderReceiver/>} />
          <Route path="/R" element ={<ReceiverAuth/>} />
          <Route path="/receiver" element ={<Receiver/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
