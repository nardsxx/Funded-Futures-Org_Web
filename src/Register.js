import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { FaArrowLeft } from 'react-icons/fa';

function Register() {
  const [orgName, setOrgName] = useState('');
  const [orgUsername, setOrgUsername] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(orgEmail)) {
      setError('Invalid Entry. Please check again your details.');
      setLoading(false);
      return;
    }

    // Validate password length
    if (orgPassword.length < 6) {
      setError('Password should be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      // Register organization using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, orgEmail, orgPassword);
      const user = userCredential.user;

      // Add organization details to Firestore
      await addDoc(collection(db, 'organization'), {
        orgName,
        orgUsername,
        orgEmail,
        orgPassword, 
      });

      console.log('Organization registered:', user);
      setLoading(false);
      navigate('/login');
    } catch (error) {
      console.error('Error registering organization:', error);
      setError('Failed to register. Please check your details and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="Register">
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/fundedfutureslogo.png" alt="Funded Futures" className="logo" onClick={() => navigate(`/`)} />
        </div>
      </nav>
      <div className="form-container">
        <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />
        <h2>Register Organization</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Organization Name"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={orgUsername}
          onChange={(e) => setOrgUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={orgEmail}
          onChange={(e) => setOrgEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={orgPassword}
          onChange={(e) => setOrgPassword(e.target.value)}
        />
        <button onClick={handleRegister}>
          {loading ? <div className="loading-animation"></div> : 'Register'}
        </button>
      </div>
    </div>
  );
}

export default Register;
