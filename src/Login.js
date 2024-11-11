import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import './Login.css';

function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUsernameOrEmail, setResetUsernameOrEmail] = useState('');
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
    setError('');
    try {
      let userEmail = usernameOrEmail;

      if (!usernameOrEmail.includes('@')) {
        const q = query(collection(db, 'organization'), where('orgUsername', '==', usernameOrEmail));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Invalid credentials.');
          setLoading(false);
          return;
        }
        
        const userDoc = querySnapshot.docs[0];
        userEmail = userDoc.data().orgEmail;
      }

      await signInWithEmailAndPassword(auth, userEmail, password);
      console.log('Organization logged in');
      navigate('/app');
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Failed to log in. Please check your username/email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    try {
      let userEmail = resetUsernameOrEmail;

      if (!resetUsernameOrEmail.includes('@')) {
        const q = query(collection(db, 'organization'), where('orgUsername', '==', resetUsernameOrEmail));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('No account found with that username.');
          return;
        }
        
        const userDoc = querySnapshot.docs[0];
        userEmail = userDoc.data().orgEmail;
      }

      await sendPasswordResetEmail(auth, userEmail);
      setError('Password reset email sent successfully.');
      setShowReset(false);
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
          placeholder="Username or Email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
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
        <a href="#!" onClick={() => setShowReset(true)} className="forgot-password">
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
              placeholder="Enter Username or Email"
              value={resetUsernameOrEmail}
              onChange={(e) => setResetUsernameOrEmail(e.target.value)}
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
