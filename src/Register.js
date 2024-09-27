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
  const [orgContact, setOrgContact] = useState('');
  const [orgType, setOrgType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(orgEmail)) {
      setError('Invalid Entry. Please check again your details.');
      setLoading(false);
      return;
    }

    if (orgPassword.length < 6) {
      setError('Password should be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, orgEmail, orgPassword);
      const user = userCredential.user;

      await addDoc(collection(db, 'organization'), {
        orgName,
        orgUsername,
        orgEmail,
        orgPassword,
        orgContact: '+63' + orgContact,
        orgType,
      });

      console.log('Organization registered:', user);
      setLoading(false);
      navigate('/');
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
          type="password"
          placeholder="Password"
          value={orgPassword}
          onChange={(e) => setOrgPassword(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={orgEmail}
          onChange={(e) => setOrgEmail(e.target.value)}
        />

        <div className="contact-input-container">
          <span className="contact-prefix">+63</span>
          <input
            type="text"
            placeholder="Contact ( ex. +63 9XXXXXXXXX )"
            value={orgContact}
            onChange={(e) => setOrgContact(e.target.value.replace(/^0+/, ''))}
            className="contact-input"
            maxLength={10}
          />
        </div>

        <select className="dropdown-reg" value={orgType} onChange={(e) => setOrgType(e.target.value)}>
            <option value="" disabled>Select Type...</option>
            <option value="Company">Company</option>
            <option value="School">School</option>
        </select>

        <button onClick={handleRegister}>
          {loading ? <div className="loading-animation"></div> : 'Register'}
        </button>
      </div>
    </div>
  );
}

export default Register;
