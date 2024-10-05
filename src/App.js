import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaArrowRight, FaPlus } from 'react-icons/fa';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { ClipLoader } from 'react-spinners';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [scholarshipPrograms, setScholarshipPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [enrollmentCounts, setEnrollmentCounts] = useState({}); // Track student count for each scholarship

  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current &&
      !dropdownRef.current.contains(event.target)){
        setShowDropdown(false);
      }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
        setUser(user);
      } else {
        setLoggedIn(false);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch scholarship programs created by the logged-in user
  useEffect(() => {
    const fetchScholarshipsAndEnrollments = async () => {
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

        // Setup real-time listener for enrollments for each program
        programs.forEach((program) => {
          const enrollmentQuery = query(
            collection(db, 'enrollments'),
            where('offerId', '==', program.id) // Listen for enrollments related to this scholarship
          );

          onSnapshot(enrollmentQuery, (snapshot) => {
            const enrolledCount = snapshot.size; // Count of enrolled students
            setEnrollmentCounts((prevCounts) => ({
              ...prevCounts,
              [program.id]: enrolledCount, // Update the count for this scholarship
            }));
          });
        });
      } catch (error) {
        console.error('Error fetching scholarships and enrollments:', error);
      }
      setLoading(false);
    };

    fetchScholarshipsAndEnrollments();
  }, [user]);

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

  const handleViewProfile = async () => {
    try {
      const q = query(collection(db, 'organization'), where('orgEmail', '==', user.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const orgDoc = querySnapshot.docs[0];
        const orgId = orgDoc.id;
        navigate(`/viewProfile/${orgId}`);
      } else {
        console.error('No organization found for this user.');
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
  };
  
  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/fundedfutureslogo.png" alt="Funded Futures" className="logo" onClick={() => navigate(`/app`)} />
        </div>
        <div className="navbar-right">
          <div className="user-icon-container" ref={dropdownRef} onClick={() => setShowDropdown(!showDropdown)}>
            <FaUserCircle className="icon" />
            {showDropdown && (
              <div className="user-dropdown">
                {loggedIn ? (
                  <>
                    <p className="username">{user?.email}</p>
                    <button onClick={handleViewProfile}>View Profile</button>
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
          filteredPrograms.map((program) => {
            const totalSlots = program.slots; // Total slots available
            const enrolledStudents = enrollmentCounts[program.id] || 0; // Students enrolled in this program
            const availableSlots = totalSlots - enrolledStudents; // Calculate available slots

            return (
              <div key={program.id} className="scholarship-card">
                <h3>{program.programName}</h3>
                <p>Posted on: {program.dateAdded}</p>
                <div className={`card-type ${program.programType.toLowerCase()}`}>
                  {program.programType}
                </div>
                <div className="card-bottom">
                  <p>Available Slots: {availableSlots >= 0 ? availableSlots : 0}</p>

                  <FaArrowRight
                    className="proceed-arrow"
                    onClick={() => navigate(`/studentList/${program.id}`)}
                    title="Proceed"
                  />
                </div>
              </div>
            );
          })
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
