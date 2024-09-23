import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaArrowRight, FaPlus } from 'react-icons/fa';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase'; // Ensure Firebase is properly imported
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { ClipLoader } from 'react-spinners';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [scholarshipPrograms, setScholarshipPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // Track logged-in user
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown
  const navigate = useNavigate();

  // Check authentication status and store user information
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
        setUser(user); // Store logged-in user details
      } else {
        setLoggedIn(false);
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Fetch scholarship programs created by the logged-in user
  useEffect(() => {
    const fetchScholarships = async () => {
      if (!user) return; // Ensure user is logged in before fetching data

      setLoading(true);
      try {
        // Query to fetch scholarships where 'createdBy' matches the logged-in user's email
        const q = query(
          collection(db, 'scholarships'),
          where('createdBy', '==', user.email)
        );
        const querySnapshot = await getDocs(q);
        const programs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setScholarshipPrograms(programs);
      } catch (error) {
        console.error('Error fetching scholarships:', error);
      }
      setLoading(false);
    };

    fetchScholarships();
  }, [user]); // Re-fetch scholarships whenever the user changes (e.g., after login)

  const filteredPrograms = scholarshipPrograms.filter((program) =>
    program.programName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/fundedfutureslogo.png" alt="Funded Futures" className="logo" onClick={() => navigate(`/app`)} />
        </div>
        <div className="navbar-right">
          <div className="user-icon-container" onClick={() => setShowDropdown(!showDropdown)}>
            <FaUserCircle className="icon" />
            {showDropdown && (
              <div className="user-dropdown">
                {loggedIn ? (
                  <>
                    <p className="username">{user?.email}</p>
                    <button onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <button onClick={() => navigate('/')}>Log in</button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search for scholarship programs..."
          className="search-box"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="scholarship-list">
        {loading ? (
          <ClipLoader color="#000" loading={loading} size={100} />
        ) : filteredPrograms.length > 0 ? (
          filteredPrograms.map((program) => (
            <div key={program.id} className="scholarship-card">
              <h3>{program.programName}</h3>
              <p>Posted on: {program.dateAdded}</p>
              <div className={`card-type ${program.programType.toLowerCase()}`}>
                {program.programType}
              </div>
              <div className="card-bottom">
                <p>Available Slots: {program.slots}</p>
                <FaArrowRight
                  className="proceed-arrow"
                  onClick={() => navigate(`/studentList/${program.id}`)}
                  title="Proceed"
                />
              </div>
            </div>
          ))
        ) : (
          <p>No Scholarship Program found.</p>
        )}
      </div>

      <button className="plus-button" onClick={() => navigate('/addprogram')}>
        <FaPlus />
      </button>
    </div>
  );
}

export default App;
