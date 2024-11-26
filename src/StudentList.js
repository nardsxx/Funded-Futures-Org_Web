import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUserCircle, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import './StudentList.css';
import { db, auth, storage } from './firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { ClipLoader } from 'react-spinners';
import { getDownloadURL, ref, listAll } from 'firebase/storage';
import { MdInfo } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";


function StudentList() {
  const navigate = useNavigate();
  const { programId } = useParams();
  const [students, setStudents] = useState([]);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)){
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
          setProgram(programDoc.data());
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
            const studentId = studentDoc.id;
            let profilePictureUrl = '/default-profile.png';

            try {
              const profileFolderRef = ref(storage, `${studentId}/studProfilePictures`);
              const listResult = await listAll(profileFolderRef);
              
              if (listResult.items.length > 0) {
                profilePictureUrl = await getDownloadURL(listResult.items[0]);
              }
            } catch (error) {
              console.log("Error fetching profile picture:", error);
            }

            return {
              id: studentId,
              firstname: studentData.firstname,
              lastname: studentData.lastname,
              school: studentData.school,
              dateApplied: enrollmentData.dateApplied,
              status: enrollmentData.status,
              profilePictureUrl,
            };
          }
          return null;
        }));

        const sortedStudents = studentsData
          .filter((student) => student !== null)
          .sort((a, b) => new Date(a.dateApplied) - new Date(b.dateApplied));

        setStudents(sortedStudents);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.seconds) {
      return "N/A";
    }
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  

  return (
    <div className="StudentList">
      <nav className="navbar">
        <div className="navbar-left">
          <img src="/images/fundedfutureslogo.png" alt="Funded Futures" className="logo" onClick={() => navigate(`/app`)} />
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
                ) : null}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="form-container-list">
        <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />
        {program && (
          <div className="scholarship-info">
            <h2>{program.programName}&nbsp;<MdInfo className='edit-icon' onClick={() => setShowModal(true)} /> </h2> 
            <div className={`program-type ${program.programType.toLowerCase()}`}>{program.programType}</div>
            <p>Date Posted: {program.dateAdded ? 
              (program.dateAdded.toDate ? new Date(program.dateAdded.toDate()).toLocaleDateString() : new Date(program.dateAdded).toLocaleDateString()) : 'N/A'}
            </p>
            <p>Maximum slots: {program.slots}</p>
          </div>
        )}

        {showModal && (
            <div className="prog-modal-overlay">
                <div className="prog-modal">
                    <div className="prog-modal-header">
                        <h2 className="prog-modal-title">{program.programName}</h2>&nbsp;
                        <button className='prog-update-btn' onClick={() => navigate(`/editProgram/${programId}`)}>Update</button>
                        <IoMdCloseCircle  onClick={() => setShowModal(false)} className="sp-close-modal-icon"/>
                    </div>
                    <div className="prog-modal-content">
                        <div className="prog-modal-column">
                            <p><strong>Program Name:</strong> {program.programName}</p>
                            <p><strong>Program Type:</strong> {program.programType}</p>
                            <p><strong>School/Company: </strong> {program.orgPosted}</p>
                            <p><strong>Posted by: </strong> {program.createdBy}</p>
                            <p><strong>Minimum GWA: </strong> {program.gwa}</p>
                            <p><strong>Slots:</strong> {program.slots}</p>
                            <p><strong>Applied:</strong> {program.applied}</p>
                            <p><strong>Courses Offered:</strong></p>
                            <ul>
                                {program.courses.map((course, index) => (
                                    <li key={index}>{course}</li>
                                ))}
                            </ul>
                            <p><strong>Date Added:</strong> {formatTimestamp(program.dateAdded)}</p>
                            <p><strong>Last Updated:</strong> {formatTimestamp(program.lastUpdated)}</p>
                        </div>

                        <div className="prog-modal-column">
                          <p><strong>Description:</strong></p>
                            <ul>
                                {program.description.map((description, index) => (
                                    <li key={index}>{description}</li>
                                ))}
                            </ul>
                            <p><strong>Requirements:</strong></p>
                            <ul>
                                {program.requirements.map((requirement, index) => (
                                    <li key={index}>{requirement}</li>
                                ))}
                            </ul>
                            <p><strong>Benefits:</strong></p>
                            <ul>
                                {program.benefits.map((benefit, index) => (
                                    <li key={index}>{benefit}</li>
                                ))}
                            </ul>
                            <p><strong>Conditions:</strong></p>
                            <ul>
                                {program.conditions.map((conditions, index) => (
                                    <li key={index}>{conditions}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="prog-modal-column">
                            <p><strong>Schools Offered:</strong></p>
                            <ul>
                                {program.schoolsOffered.map((school, index) => (
                                    <li key={index}>{school}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
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
                    src={student.profilePictureUrl}
                    className="student-image"
                    alt={``}
                  />
                </div>

                <div className="student-info">
                  <h3>{student.firstname} {student.lastname}</h3>
                  <p>{student.school}</p>
                  <p>Date Applied: {student.dateApplied}</p>
                </div>

                <div className={`status-indicator ${student.status}`}>
                  {student.status}
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
          <p className="p-studentList">No students are currently enrolled in this program.</p>
        )}
      </div>
    </div>
  );
}

export default StudentList;
