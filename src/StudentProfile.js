import React, { useEffect, useState, useRef } from 'react';
import { FaUserCircle, FaArrowLeft, FaFileDownload } from 'react-icons/fa';
import { db, auth, storage } from './firebase';
import { doc, getDoc, getDocs, where, query, collection } from 'firebase/firestore';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import './StudentProfile.css';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";

function StudentProfile() { 
    const navigate = useNavigate();
    const { programId, studentId } = useParams();
    const [user, setUser] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [studentDetails, setStudentDetails] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [uploadedFiles, setuploadedFiles] = useState([]);
    const dropdownRef = useRef(null);
    const [checkedStates, setCheckedStates] = useState(Array(4).fill(false));

    const toggleCheckbox = (index) => {
        const newCheckedStates = [...checkedStates];
        newCheckedStates[index] = !newCheckedStates[index];
        setCheckedStates(newCheckedStates);
    };

    useEffect(() => {
        const fetchStudentDetails = async () => {
            if (studentId) {
                const studentRef = doc(db, 'students', studentId);
                const studentSnap = await getDoc(studentRef);

                if (studentSnap.exists()) {
                    setStudentDetails(studentSnap.data());
                } else {
                    console.log('No such student document!');
                }
            }
        };
        fetchStudentDetails();
    }, [studentId]);

    useEffect(() => {
        const fetchStudentDocuments = async () => {
            if (studentId && programId) {
                try {
                    const storageRef = ref(storage, `/${studentId}/${programId}/`);
                    const listResult = await listAll(storageRef);

                    const files = await Promise.all(
                        listResult.items.map(async (itemRef) => {
                            const downloadURL = await getDownloadURL(itemRef);
                            return {
                                name: itemRef.name,
                                url: downloadURL
                            };
                        })
                    );
                    setuploadedFiles(files);
                } catch (error) {
                    console.error('Error fetching student documents:', error);
                }
            }
        };
        fetchStudentDocuments();
    }, [studentId, programId]);

    useEffect(() => {
        document.addEventListener('mousedown', (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        });
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
        <div className="StudentProfile">
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

            <div className="sp-form-container-list">
                <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />

                <div className="sp-student-profile-container">
                    <div className="sp-profile-wrapper">
                        <div className="sp-student-profile">
                            {studentDetails?.profilePicture ? (
                                <img src={studentDetails.profilePicture} alt="Profile" />
                            ) : (
                                <img src="/path/to/default-profile-pic.jpg" alt="Default Profile" />
                            )}
                        </div>
                        <div className="sp-student-info">
                            <h3>{`${studentDetails?.firstname || ''} ${studentDetails?.lastname || ''}`}</h3>
                            <p>
                                {studentDetails?.school || 'School'}<br />
                                {studentDetails?.course || 'Course'}<br />
                                {studentDetails?.studentId || 'Student ID'}<br />
                                {studentDetails?.email || 'Email'}<br />
                                {studentDetails?.birthday || 'Birthday'}
                            </p>
                        </div>
                    </div>

                    <div className="sp-student-documents">
                        {uploadedFiles.length > 0 ? (
                            uploadedFiles.map((file, index) => (
                                <div className="sp-document-row" key={file.name}>
                                    <span>{file.name}</span>
                                    <div className="sp-document-actions">
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                            <FaFileDownload className="sp-download-icon" />
                                        </a>
                                        {checkedStates[index] ? (
                                            <ImCheckboxChecked className="sp-checked-icon" onClick={() => toggleCheckbox(index)} />
                                        ) : (
                                            <ImCheckboxUnchecked className="sp-uncheck-icon" onClick={() => toggleCheckbox(index)} />
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="sp-no-documents">
                                This student has not uploaded any documents yet.
                            </div>
                        )}
                    </div>

                    {uploadedFiles.length > 0 && (
                    <div className="sp-approve-container">
                        <button className="sp-approve-button">Approve Student</button>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentProfile;
