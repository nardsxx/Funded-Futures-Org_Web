import React, { useEffect, useState, useRef} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUserCircle, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import './StudentList.css';
import { db, auth } from './firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { ClipLoader } from 'react-spinners';
import { TiEdit } from "react-icons/ti";



function StudentList() {
  const navigate = useNavigate();
  const { programId } = useParams();
  const [students, setStudents] = useState([]);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
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

  useEffect(() => {
    const fetchProgramAndStudents = async () => {
      try {
        const programDoc = await getDoc(doc(db, 'scholarships', programId));
        if (programDoc.exists()) {
          const programData = programDoc.data();
          setProgram(programData);
        } else {
          console.log("No such scholarship program document!");
        }
  
        const enrollmentsQuery = query(collection(db, 'enrollments'), where('offerId', '==', programId));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
  
        const studentsData = await Promise.all(enrollmentsSnapshot.docs.map(async (enrollmentDoc) => {
          const enrollmentData = enrollmentDoc.data();
          const studentDoc = await getDoc(doc(db, 'students', enrollmentData.userId));
          
          if (studentDoc.exists()) {
            const studentData = studentDoc.data();
            return {
              id: studentDoc.id,
              firstname: studentData.firstname,
              lastname: studentData.lastname,
              school: studentData.school,
              dateApplied: enrollmentData.dateApplied,
              status: enrollmentData.status,
              profilePicture: studentData.profilePicture,
            };
          }
          return null;
        }));
  
        const sortedStudents = studentsData
          .filter((student) => student !== null)
          .sort((a, b) => new Date(a.dateApplied) - new Date(b.dateApplied));
  
        setStudents(sortedStudents);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
  
    fetchProgramAndStudents();
  }, [programId]);
  

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
    <div className="StudentList">
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

      <div className="form-container-list">
        <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />
        {program && (
          <div className="scholarship-info">
            <h2>{program.programName}  <TiEdit className='edit-icon' onClick={() => navigate(`/editProgram/${programId}`)}/></h2> 
            <div className={`program-type ${program.programType.toLowerCase()}`}>{program.programType}</div>
            <p>Date Posted: {program.dateAdded ? 
              (program.dateAdded.toDate ? new Date(program.dateAdded.toDate()).toLocaleDateString() 
              : new Date(program.dateAdded).toLocaleDateString()) 
              : 'N/A'}
            </p>
            <p>Maximum slots: {program.slots}</p>
          </div>
        )}

        <h3>List of Applicants</h3>

        {loading ? (
          <div className="spinner-container">
            <ClipLoader color='#FFD700' loading={loading} size={100} />
          </div>
        ) : students.length > 0 ? (
          <div className="student-list">
            {students.map((student) => (
              <div key={student.id} className="student-card">
                <div className="student-profile">
                  <img
                    src={student.profilePicture || '/default-profile.png'}
                    alt={`${student.firstname} ${student.lastname}`}
                    className="student-image"
                  />
                </div>

                <div className="student-info">
                  <h3>{student.firstname} {student.lastname}</h3>
                  <p>{student.school}</p>
                  <p>Date Applied: {student.dateApplied}</p>
                </div>

                <div className={`status-indicator ${student.status}`}>
                  {(student.status)}
                </div>

                <div className="student-actions">
                  <FaArrowRight
                    className="proceed-arrow-stud"
                    onClick={() => navigate(`/studentProfile/${programId}/${student.id}`)}
                    title="Proceed"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-studentList">No students are currently enrolled in this scholarship program.</p>
        )}
      </div>
    </div>
  );
}

export default StudentList;
