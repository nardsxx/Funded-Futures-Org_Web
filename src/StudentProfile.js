import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FaUserCircle, FaArrowLeft, FaFileDownload } from 'react-icons/fa';
import { db, auth, storage } from './firebase';
import { doc, getDoc, getDocs, where, query, collection, setDoc } from 'firebase/firestore';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import './StudentProfile.css';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import { IoMdCloseCircle } from "react-icons/io";

function StudentProfile() { 
    const navigate = useNavigate();
    const { programId, studentId } = useParams();
    const [user, setUser] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [studentDetails, setStudentDetails] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [uploadedFiles, setuploadedFiles] = useState([]);
    const dropdownRef = useRef(null);
    const [checkedStates, setCheckedStates] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const fetchCheckedStates = useCallback(async () => {
        if (studentId && programId) {
            const docRef = doc(db, 'students', studentId, 'programs', programId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCheckedStates(data.checkedStates || Array(uploadedFiles.length).fill(false));
            } else {
                setCheckedStates(Array(uploadedFiles.length).fill(false));
            }
        }
    }, [studentId, programId, uploadedFiles.length]);

    const toggleCheckbox = async (index) => {
        const newCheckedStates = [...checkedStates];
        newCheckedStates[index] = !newCheckedStates[index];
        setCheckedStates(newCheckedStates);

        const docRef = doc(db, 'students', studentId, 'programs', programId);
        await setDoc(docRef, { checkedStates: newCheckedStates }, { merge: true });
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

    useEffect(() => {
        if (uploadedFiles.length > 0) {
            fetchCheckedStates();
        }
    }, [uploadedFiles, fetchCheckedStates]);

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
                                {studentDetails?.email || 'Email'}<br />
                                <button className='sp-info-btn' onClick={() => setShowModal(true)}>View Info</button>
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

            {showModal && (
                <div className="sp-modal-overlay">
                    <div className="sp-modal-content">
                        <IoMdCloseCircle className="sp-close-modal-icon" onClick={() => setShowModal(false)} />
                        <div className="sp-modal-left">
                            <img 
                                src={studentDetails?.profilePicture || "/path/to/default-profile-pic.jpg"} 
                                alt="Profile" 
                                className="sp-modal-profile-pic"
                            />
                        </div>
                        <div className="sp-modal-right">
                            <p>Fullname: {`${studentDetails?.firstname || ''} ${studentDetails?.lastname || ''}`}</p>
                            <p>Username: {studentDetails?.username || 'Username'}</p>
                            <p>Email: {studentDetails?.email || 'Email'}</p>
                            <p>Gender: {studentDetails?.gender || 'Gender'}</p>
                            <p>Birthday: {studentDetails?.birthday || 'Birthday'}</p>
                            <p>Student ID: {studentDetails?.studentId || 'StudentID'}</p>
                            <p>Course: {studentDetails?.course || 'Course'}</p>
                            <p>School: {studentDetails?.school || 'School'}</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default StudentProfile;
