import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './Login.css';
import { sendPasswordResetEmail } from 'firebase/auth';


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/app');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);  
    try {
      const q = query(collection(db, 'organization'), where('orgUsername', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('Invalid credentials.');
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userEmail = userDoc.data().orgEmail;

      await signInWithEmailAndPassword(auth, userEmail, password);
      console.log('Organization logged in');
      navigate('/app');
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Failed to log in. Please check your username and password.');
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const q = query(collection(db, 'organization'), where('orgUsername', '==', resetUsername));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        setError('No account found with that username.');
        return;
      }
  
      const userDoc = querySnapshot.docs[0];
      const userEmail = userDoc.data().orgEmail;
  
      await sendPasswordResetEmail(auth, userEmail);
      setError('Password reset email sent successfully.');
      setShowReset(false)
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setError('Failed to send password reset email.');
    }
  };

  return (
    <div className="Login">
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/fundedfutureslogo.png" alt="Funded Futures" className="logo" onClick={() => navigate(`/`)} />
        </div>
      </nav>
      <div className="form-container">
        <h2>Funded Futures</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>
          {loading ? <div className="loading-animation"></div> : 'Log in'}
        </button>
        <a href="#!" onClick={() => setShowReset(true)} className="forgot-password-link">
          Forgot Password?
        </a>
        <button className="register-link" onClick={() => navigate('/register')}>
          Register
        </button>
        Don't have an account?

      </div>
      
      {showReset && (
        <>
          <div className="modal-overlay" onClick={() => setShowReset(false)}></div>
          <div className="reset-modal">
            <h3>Reset Password</h3>
            <input
              type="text"
              placeholder="Enter Username"
              value={resetUsername}
              onChange={(e) => setResetUsername(e.target.value)}
            />
            <button onClick={handlePasswordReset}>Send Reset Email</button>
            <button onClick={() => setShowReset(false)}>Cancel</button>
          </div>
        </>
      )}

    </div>
  );
}

export default Login;
