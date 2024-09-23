import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUserCircle, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import './StudentList.css';
import { db, auth } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';


function StudentList() {
  const navigate = useNavigate();
  const { programId } = useParams();
  const [students, setStudents] = useState([]);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Track logged-in user
  const [loggedIn, setLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown


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


  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'students'), where('programId', 'array-contains', programId));
        const querySnapshot = await getDocs(q);
        const studentsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    const fetchScholarship = async () => {
      try {
        // Query the scholarships collection by id
        const q = query(collection(db, 'scholarships'), where('id', '==', programId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const programData = querySnapshot.docs[0].data(); // Fetch the first result
          setProgram(programData);  // Set the program data
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error('Error fetching scholarship:', error);
      }
    };

    fetchStudents();
    fetchScholarship();
    setLoading(false);
  }, [programId]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="StudentList">
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

      {/* Scholarship Info */}
      <div className="form-container-list">
      <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />
        {program && (
          <div className="scholarship-info">
            <h2>{program.programName}</h2>
            <div className={`program-type ${program.programType.toLowerCase()}`}>{program.programType}
            </div>
            <p>Date Posted: {program.dateAdded ? 
            (program.dateAdded.toDate ? new Date(program.dateAdded.toDate()).toLocaleDateString() 
            : new Date(program.dateAdded).toLocaleDateString()) 
            : 'N/A'}
            </p>
          </div>
        )}

        <h3>List of Applicants</h3>

        {loading ? (
          <p>Loading students...</p>
        ) : students.length > 0 ? (
          <div className="student-list">
            {students.map((student) => (
              <div key={student.id} className="student-card">
                <div className="student-profile">
                  <img
                    src={student.profilePicture || '/default-profile.png'}
                    alt={`${student.firstName} ${student.lastName}`}
                    className="student-image"
                  />
                </div>

                <div className="student-info">
                  <h3>{student.firstName} {student.lastName}</h3>
                  <p>{student.schoolName}</p>
                  <p>Date Applied: {student.dateApplied}</p>
                </div>

                <div className={`status-indicator ${student.status}`}>
                  {student.status}
                </div>

                <div className="student-actions">
                  <FaArrowRight
                    className="proceed-arrow-stud"
                    onClick={() => navigate(`/student/${student.id}`)}
                    title="Proceed"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No students are currently enrolled in this scholarship program.</p>
        )}
      </div>
    </div>
  );
}

export default StudentList;
