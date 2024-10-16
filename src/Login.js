import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
        setError('Invalid username or password.');
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
        Don't have an account?
        <button className="register-link" onClick={() => navigate('/register')}>
          Register
        </button>
      </div>
    </div>
  );
}

export default Login;
