import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaBell, FaUserCircle, FaArrowRight, FaPlus } from 'react-icons/fa';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';  // Make sure to import Firebase
import { collection, getDocs } from 'firebase/firestore';
import { ClipLoader } from 'react-spinners';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [scholarshipPrograms, setScholarshipPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch scholarship programs from Firebase Firestore
  useEffect(() => {
    const fetchScholarships = async () => {
      setLoading(true); 
      try {
        const querySnapshot = await getDocs(collection(db, 'scholarships'));
        const programs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setScholarshipPrograms(programs);
      } catch (error) {
        console.error('Error fetching scholarships:', error);
      }
      setLoading(false); 
    };

    fetchScholarships();
  }, []);

  const filteredPrograms = scholarshipPrograms.filter(program =>
    program.programName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-left">
        <img src="/tiplogo.png" alt="Technological Institute of The Philippines" className="logo"  onClick={() => navigate(`/`)} />
        </div>
        <div className="navbar-right">
          <FaQuestionCircle className="icon" title="FAQ" />
          <FaBell className="icon" title="Notifications" />
          <FaUserCircle className="icon" title="Profile" />
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
          filteredPrograms.map(program => (
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
