import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Input validation
        if (!email || !password) {
            setError("Please fill in both email and password.");
            return;
        }

        try {
            // Send login data to backend
            const result = await axios.post('http://localhost:3001/login', { email, password });

            if (result.data.message === "Login successful") {
                setSuccess("Login successful!");
                alert('Login successful!');
                navigate('/SenderReceiver'); // Redirect to the home page after login
            } else if (result.data.message === "Invalid password") {
                setError("Incorrect password! Please try again.");
            } else if (result.data.message === "No user found with this email") {
                setError("No account found with this email address.");
            }
        } catch (err) {
            setError("An error occurred while logging in. Please try again.");
            console.error("Login Error:", err);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-center align-items-center text-center vh-100" style={{ backgroundImage: "linear-gradient(#00d5ff,#0095ff,rgba(93,0,255,.555))" }}>
                <div className="bg-white p-3 rounded" style={{ width: '40%' }}>
                    <h2 className='mb-3 text-primary'>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 text-start">
                            <label htmlFor="exampleInputEmail1" className="form-label"><strong>Email Id</strong></label>
                            <input
                                type="email"
                                placeholder="Enter Email"
                                className="form-control"
                                id="exampleInputEmail1"
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3 text-start">
                            <label htmlFor="exampleInputPassword1" className="form-label"><strong>Password</strong></label>
                            <input
                                type="password"
                                placeholder="Enter Password"
                                className="form-control"
                                id="exampleInputPassword1"
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </div>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        {success && <p style={{ color: 'green' }}>{success}</p>}
                        <button type="submit" className="btn btn-primary">Login</button>
                    </form>

                    <p className='container my-2'>Don&apos;t have an account?</p>
                    <Link to='/register' className="btn btn-secondary">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
