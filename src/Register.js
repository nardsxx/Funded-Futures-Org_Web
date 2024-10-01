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
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const navigate = useNavigate();

  const handlePasswordChange = (password) => {
    setOrgPassword(password);

    // Password validation checks
    setPasswordValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    });
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);
  
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(orgEmail)) {
      setError('Invalid Entry. Please check again your details.');
      setLoading(false);
      return;
    }
  
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(orgPassword)) {
      setError(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
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

        <div className="password-container">
          <input
            type="password"
            placeholder="Password"
            value={orgPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onFocus={() => setShowPasswordHint(true)}
            onBlur={() => setShowPasswordHint(false)}
          />
          {showPasswordHint && (
            <div className="floating-box">
              <p>Password must meet the following requirements:</p>
              <ul>
                <li className={passwordValidations.length ? 'valid' : 'invalid'}>At least 8 characters long</li>
                <li className={passwordValidations.uppercase ? 'valid' : 'invalid'}>At least one uppercase letter</li>
                <li className={passwordValidations.lowercase ? 'valid' : 'invalid'}>At least one lowercase letter</li>
                <li className={passwordValidations.number ? 'valid' : 'invalid'}>At least one number</li>
                <li className={passwordValidations.specialChar ? 'valid' : 'invalid'}>
                  At least one special character (@$!%*?&)
                </li>
              </ul>
            </div>
          )}
        </div>

        <input
          type="email"
          placeholder="Email"
          value={orgEmail}
          onChange={(e) => setOrgEmail(e.target.value)}
        />

        <div className="contact-input-container">
          <span className="contact-prefix">+63</span>
          <input
            type="number"
            placeholder="Contact ( ex. +63 9XXXXXXXXX )"
            value={orgContact}
            onChange={(e) => {
              const value = e.target.value;

              // Allow only numbers and enforce first digit to be 9
              if (value.length === 0 || value[0] === '9') {
                // Limit the length to 10 digits
                if (value.length <= 10) {
                  setOrgContact(value);
                }
              }
            }}
            className="contact-input"
          />
        </div>

        <select className="dropdown-reg" value={orgType} onChange={(e) => setOrgType(e.target.value)}>
          <option value="" disabled>Select Organization Type...</option>
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
