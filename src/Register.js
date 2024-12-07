import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth, storage } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { FaArrowLeft } from 'react-icons/fa';

function Register() {
  const [orgName, setOrgName] = useState('');
  const [orgUsername, setOrgUsername] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgContact, setOrgContact] = useState('');
  const [orgType, setOrgType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [documentUpload, setDocumentUpload] = useState(null);
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
      setError('Invalid Email. Please check again your details.');
      setLoading(false);
      return;
    }

    if (orgPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!Object.values(passwordValidations).every(Boolean)) {
      setError('Password does not meet the required criteria.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, orgEmail, orgPassword);
      const user = userCredential.user;

      let documentURL = '';
      if (documentUpload) {
        const documentRef = ref(storage, `orgUploadedDocuments/${user.uid}`);
        await uploadBytes(documentRef, documentUpload);
        documentURL = await getDownloadURL(documentRef);
      }

      await addDoc(collection(db, 'organization'), {
        orgName,
        orgUsername,
        orgEmail,
        orgContact: '+63' + orgContact,
        orgType,
        orgDateJoined: new Date().toLocaleDateString(),
        orgVerification: false,
        uploadedDocumentURL: documentURL,
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

  const handleDocumentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentUpload(e.target.files[0]);
    }
  };

  return (
    <div className="Register">
      <nav className="navbar">
      <div className="navbar-left">
        <img
          src="/images/fundedfutureslogo.png"
          alt="Funded Futures"
          className="logo"
          onClick={() => navigate(-1)}
        />
        <span className="logo-title">Funded Futures</span>
      </div>
      </nav>

      <div className="form-container">
        <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />
        <h2>Register Organization</h2>
        {error && <p className="error">{error}</p>}

        <input
          type="text"
          maxLength="100"
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
                <li className={passwordValidations.specialChar ? 'valid' : 'invalid'}>At least one special character (@$!%*?&)</li>
              </ul>
            </div>
          )}
        </div>

        <div className="password-container">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
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
              if (value.length === 0 || value[0] === '9') {
                if (value.length <= 10) {
                  setOrgContact(value);
                }
              }
            }}
            className="contact-input"
          />
        </div>

        <select className="dropdown-reg" value={orgType} onChange={(e) => setOrgType(e.target.value)}>
          <option value="" disabled>
            Select Organization Type...
          </option>
          <option value="School">School</option>
          <option value="Company">Company</option>
        </select>

        <div className="upload-container">
          <label htmlFor="upload-documents" className="upload-label">
            Upload Documents for Verification
          </label>
          <input
            type="file"
            id="upload-documents"
            onChange={handleDocumentChange}
            accept="image/*,.pdf"
          />
        </div>

        <button onClick={handleRegister}>
          {loading ? <div className="loading-animation"></div> : 'Register'}
        </button>
      </div>
    </div>
  );
}

export default Register;
