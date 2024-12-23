import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FaUserCircle, FaArrowLeft, FaFileDownload } from 'react-icons/fa';
import { db, auth, storage } from './firebase';
import { doc, getDoc, getDocs, where, query, collection, setDoc, addDoc, Timestamp } from 'firebase/firestore';
import { ref, listAll, getDownloadURL, uploadBytes } from 'firebase/storage';
import './StudentProfile.css';
import { FiX } from 'react-icons/fi';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import { IoMdCloseCircle, IoIosWarning} from "react-icons/io";
import { AiFillMessage } from "react-icons/ai";
import { LuMail } from "react-icons/lu";

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
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showIncompleteDocumentsModal, setShowIncompleteDocumentsModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [scholarshipPrograms, setScholarshipPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState('');
    const [currentProgramName, setCurrentProgramName] = useState('');
    const [files, setFiles] = useState([]);
    const [checkboxVisibility, setCheckboxVisibility] = useState([]);

    const showCheckbox = (index) => {
        const newVisibilityStates = [...checkboxVisibility];
        newVisibilityStates[index] = true;
        setCheckboxVisibility(newVisibilityStates);
    };

    const handleFileUpload = (e) => {
        if (e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        }
    };

    const removeFile = (indexToRemove) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const areAllChecked = () => checkedStates.every((state) => state);

    const handleApproveClick = () => {
        if (areAllChecked()) {
            setShowApproveModal(true);
        } else {
            setShowIncompleteDocumentsModal(true);
        }
    };

    const handleSaveRemarks = async () => {
        setLoading(true);
        try {
            const enrollmentQuery = query(
                collection(db, 'enrollments'),
                where('userId', '==', studentId),
                where('offerId', '==', programId)
            );

            const querySnapshot = await getDocs(enrollmentQuery);
            if (!querySnapshot.empty) {
                const enrollmentDoc = querySnapshot.docs[0];
                const enrollmentDocRef = doc(db, 'enrollments', enrollmentDoc.id);

                await setDoc(enrollmentDocRef, { remarks: remarks }, { merge: true });
                console.log("Remarks saved successfully.");
            } else {
                console.error('Enrollment document not found for this student and program.');
            }
        } catch (error) {
            console.error("Error saving remarks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchCurrentProgram = async () => {
            if (programId) {
                try {
                    const programDoc = await getDoc(doc(db, 'scholarships', programId));
                    if (programDoc.exists()) {
                        const programData = programDoc.data();
                        setCurrentProgramName(programData.programName);
                    }
                } catch {
                    
                }
            }
        };

        fetchCurrentProgram();
    }, [programId]);

    useEffect(() => {
        const fetchAppliedPrograms = async () => {
            if (studentId && scholarshipPrograms.length > 0) {
                try {
                    const enrollmentQuery = query(
                        collection(db, 'enrollments'),
                        where('userId', '==', studentId)
                    );
                    const enrollmentSnapshot = await getDocs(enrollmentQuery);
    
                    if (!enrollmentSnapshot.empty) {
                        const appliedProgramIds = enrollmentSnapshot.docs.map(doc => doc.data().offerId);
    
                        const filteredPrograms = scholarshipPrograms.filter(program =>
                            appliedProgramIds.includes(program.id)
                        );
    
                        setScholarshipPrograms(filteredPrograms);
    
                        if (filteredPrograms.length > 0) {
                            setSelectedProgram(filteredPrograms[0].id); // Set the offerId as selectedProgram
                        }
                    }
                } catch (error) {
                    console.error("Error fetching applied programs:", error);
                }
            }
        };
    
        fetchAppliedPrograms();
    }, [studentId, scholarshipPrograms]);    

    useEffect(() => {
        const fetchRemarks = async () => {
            try {
                const enrollmentQuery = query(
                    collection(db, 'enrollments'),
                    where('userId', '==', studentId),
                    where('offerId', '==', programId)
                );
    
                const querySnapshot = await getDocs(enrollmentQuery);
                if (!querySnapshot.empty) {
                    const enrollmentDoc = querySnapshot.docs[0];
                    const enrollmentData = enrollmentDoc.data();
    
                    if (enrollmentData.remarks) {
                        setRemarks(enrollmentData.remarks);
                    } else {
                    }
                } else {
                    console.error('Enrollment document not found for this student and program.');
                }
            } catch (error) {
                console.error("Error fetching remarks:", error);
            }
        };
    
        fetchRemarks();
    }, [studentId, programId]);

    const confirmApproval = async () => {
        setShowApproveModal(false);
        
        try {
            const enrollmentQuery = query(
                collection(db, 'enrollments'),
                where('userId', '==', studentId),
                where('offerId', '==', programId)
            );
            
            const querySnapshot = await getDocs(enrollmentQuery);
            if (!querySnapshot.empty) {
                const enrollmentDoc = querySnapshot.docs[0];
                const enrollmentDocRef = doc(db, 'enrollments', enrollmentDoc.id);
                
                await setDoc(enrollmentDocRef, { status: "Approved" }, { merge: true });
                console.log("Student status updated to Approved.");
                navigate(-1);
            } else {
                console.error('Enrollment document not found for this student and program.');
            }
        } catch (error) {
            console.error("Error updating enrollment status:", error);
        }
    };

    const handleRejectClick = () => {
        setShowRejectModal(true);
    };

    const confirmRejection = async () => {
        setShowRejectModal(false);
        
        try {
            const enrollmentQuery = query(
                collection(db, 'enrollments'),
                where('userId', '==', studentId),
                where('offerId', '==', programId)
            );

            const querySnapshot = await getDocs(enrollmentQuery);
            if (!querySnapshot.empty) {
                const enrollmentDoc = querySnapshot.docs[0];
                const enrollmentDocRef = doc(db, 'enrollments', enrollmentDoc.id);
                
                await setDoc(enrollmentDocRef, { status: "Rejected" }, { merge: true });
                console.log("Student status updated to Rejected.");
                navigate(-1);
            } else {
                console.error('Enrollment document not found for this student and program.');
            }
        } catch (error) {
            console.error("Error updating enrollment status:", error);
        }
    };

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
        const newVisibilityStates = [...checkboxVisibility];
    
        newCheckedStates[index] = !newCheckedStates[index];
    
        if (newCheckedStates[index]) {
            newVisibilityStates[index] = true;
        }
    
        setCheckedStates(newCheckedStates);
        setCheckboxVisibility(newVisibilityStates);
    
        const docRef = doc(db, 'students', studentId, 'programs', programId);
        await setDoc(docRef, { checkedStates: newCheckedStates }, { merge: true });
    
        const newStatus = newCheckedStates.every((state) => state === false) ? "Pending" : "Processing";
    
        const enrollmentQuery = query(
            collection(db, 'enrollments'),
            where('userId', '==', studentId),
            where('offerId', '==', programId)
        );
    
        const querySnapshot = await getDocs(enrollmentQuery);
        if (!querySnapshot.empty) {
            const enrollmentDoc = querySnapshot.docs[0];
            const enrollmentDocRef = doc(db, 'enrollments', enrollmentDoc.id);
    
            await setDoc(enrollmentDocRef, { status: newStatus }, { merge: true });
        } else {
            console.error('Enrollment document not found for this student and program.');
        }
    };
    
    
    useEffect(() => {
        document.addEventListener('mousedown', (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        });
    }, []);

    useEffect(() => {
        const fetchScholarshipPrograms = async () => {
            if (user?.email) {
                try {
                    const orgQuery = query(
                        collection(db, 'organization'),
                        where('orgEmail', '==', user.email)
                    );
                    const orgQuerySnapshot = await getDocs(orgQuery);
                    
                    if (!orgQuerySnapshot.empty) {
                        const orgData = orgQuerySnapshot.docs[0].data();
                        const orgName = orgData.orgName
    
                        const programsQuery = query(
                            collection(db, 'scholarships'),
                            where('orgPosted', '==', orgName)
                        );
                        const programsSnapshot = await getDocs(programsQuery);
                        const programs = programsSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        setScholarshipPrograms(programs);
                    } else {
                        console.warn('No organization found for the current user.');
                    }
                } catch (error) {
                    console.error('Error fetching scholarship programs:', error);
                }
            }
        };
    
        fetchScholarshipPrograms();
    }, [user]); 

    useEffect(() => {
        const fetchStudentDetails = async () => {
            if (studentId) {
                const studentRef = doc(db, 'students', studentId);
                const studentSnap = await getDoc(studentRef);
                if (studentSnap.exists()) {
                    const studentData = studentSnap.data();
                    let profilePictureUrl = '/path/to/default-profile-pic.jpg';
    
                    try {
                        const profileFolderRef = ref(storage, `${studentId}/studProfilePictures`);
                        const listResult = await listAll(profileFolderRef);
                        
                        if (listResult.items.length > 0) {
                            profilePictureUrl = await getDownloadURL(listResult.items[0]);
                        }
                    } catch (error) {
                        console.log("Error fetching profile picture:", error);
                    }
    
                    setStudentDetails({
                        ...studentData,
                        profilePicture: profilePictureUrl
                    });
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

    const handleSendMessage = async () => {
        if (subject.trim() && body.trim()) {
            try {
                const q = query(collection(db, 'organization'), where('orgEmail', '==', user.email));
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    console.error('No organization found for this user.');
                    setNotificationMessage('Organization not found.');
                    setShowNotificationModal(true);
                    return;
                }
    
                const orgDoc = querySnapshot.docs[0];
                const orgId = orgDoc.id;
                
                const fileNames = [];
                for (const file of files) {
                    const filename = `${Date.now()}-${file.name}`;
                    console.log(`Uploading to: ${orgId}/${selectedProgram}/${filename}`);
                    const storageRef = ref(storage, `${orgId}/${selectedProgram}/${filename}`);
                    await uploadBytes(storageRef, file);
                    fileNames.push(filename);
                }
    
                await addDoc(collection(db, 'messages'), {
                    sender: user.email,
                    receiver: studentDetails?.email,
                    subject: subject,
                    body: body,
                    dateSent: Timestamp.now(),
                    messageStatus: false,
                    offerId: selectedProgram,
                    fileId: fileNames.length > 0 ? fileNames : null,
                });
    
                setShowMessageModal(false);
                setSubject('');
                setBody('');
                setFiles([]);
                setNotificationMessage('Message sent successfully!');
                setShowNotificationModal(true);
            } catch (error) {
                console.error('Error sending message:', error);
                setNotificationMessage('Error sending message.');
                setShowNotificationModal(true);
            }
        } else {
            setNotificationMessage('Subject and body are required!');
            setShowNotificationModal(true);
        }
    };
    
    const handleViewMessages = async () => {
        try {
          const q = query(collection(db, 'organization'), where('orgEmail', '==', user.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const orgDoc = querySnapshot.docs[0];
            const orgId = orgDoc.id;
            navigate(`/messages/${orgId}`);
          } else {
            console.error('No organization found for this user.');
          }
        } catch (error) {
          console.error('Error fetching organization:', error);
        }
      };    
      
      const [profilePicture, setProfilePicture] = useState(null);

      useEffect(() => {
        const fetchProfile = async () => {
          try {
            if (user) {
              const q = query(collection(db, 'organization'), where('orgEmail', '==', user.email));
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                const orgDoc = querySnapshot.docs[0];
                const orgData = { id: orgDoc.id, ...orgDoc.data() }; 
                setProfilePicture(orgData.orgProfilePicture || null); 
              }
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        };
    
        fetchProfile();
      }, [user]);
    
    return (
        <div className="StudentProfile">
            
            <nav className="navbar">
            <div className="navbar-left" onClick={() => navigate(`/app`)}>
                <img
                src="/images/fundedfutureslogo.png"
                alt="Funded Futures"
                className="logo"
                />
                <span className="logo-title">Funded Futures</span>
            </div>

            <div className="navbar-right">
                <div className="user-icon-container" ref={dropdownRef}>
                <AiFillMessage className="icon" onClick={handleViewMessages} />
                
                <div className="user-profile">
                    {profilePicture ? (
                    <img
                        src={profilePicture}
                        alt="Profile"
                        className="user-profile-img"
                        onClick={() => setShowDropdown(!showDropdown)}
                    />
                    ) : (
                    <FaUserCircle
                        className="icon"
                        onClick={() => setShowDropdown(!showDropdown)}
                    />
                    )}
                </div>

                {showDropdown && (
                    <div className="user-dropdown">
                    {loggedIn ? (
                        <>
                        <p className="username">{user?.email}</p>
                        <button onClick={handleViewProfile}>View Profile</button>
                        <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        null
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
                                <img src={studentDetails?.profilePicture} alt="Profile" className="sp-modal-profile-pic"/>
                            ) : (
                                <img src="/path/to/default-profile-pic.jpg" alt="" className="sp-modal-profile-pic"/>
                            )}
                        </div>
                        <div className="sp-student-info">
                            <h3>{`${studentDetails?.firstname || ''} ${studentDetails?.lastname || ''}`}</h3>
                            <p>
                                {studentDetails?.school || 'School'}<br />
                                {studentDetails?.email || 'Email'}<br />
                                Applying for <span className="program-name">{currentProgramName}</span>
                            </p>
                            <div className='sp-student-btns'>
                                <button className='sp-info-btn' onClick={() => setShowInfoModal(true)}>View Info</button>
                                <button className='sp-msg-btn' onClick={() => setShowMessageModal(true)}>Send a Message</button>
                            </div>
                        </div>
                    </div>

                    <div className="sp-student-documents">
                        {uploadedFiles.length > 0 ? (
                            uploadedFiles.map((file, index) => (
                                <div className="sp-document-row" key={file.name}>
                                    <span>{file.name}</span>
                                    <div className="sp-document-actions">
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => showCheckbox(index)}
                                        >
                                            <FaFileDownload className="sp-download-icon" />
                                        </a>
                                        {(checkboxVisibility[index] || checkedStates[index]) && (
                                            checkedStates[index] ? (
                                                <ImCheckboxChecked
                                                    className="sp-checked-icon"
                                                    onClick={() => toggleCheckbox(index)}
                                                />
                                            ) : (
                                                <ImCheckboxUnchecked
                                                    className="sp-uncheck-icon"
                                                    onClick={() => toggleCheckbox(index)}
                                                />
                                            )
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
                        <button className="sp-approve-button" onClick={handleApproveClick}>Approve Student</button>
                        <button className="sp-reject-button" onClick={handleRejectClick}>Reject Student</button>
                    </div>
                    )}

                </div>
            </div>

            {showInfoModal && (
            <div className="sp-modal-overlay">
                <div className="sp-modal-content">
                <IoMdCloseCircle
                    className="sp-close-modal-icon"
                    onClick={() => setShowInfoModal(false)}
                />
                <div className="sp-modal-header">
                    <img
                    src={studentDetails?.profilePicture || "/path/to/default-profile-pic.jpg"}
                    alt="Profile"
                    className="sp-modal-profile-pic"
                    />
                </div>
                <div className="sp-modal-details-container">
                    <table className="sp-modal-details-table">
                    <tbody>
                        <tr>
                        <td><strong>Fullname:</strong></td>
                        <td>{`${studentDetails?.firstname || ''} ${studentDetails?.lastname || ''}`}</td>
                        </tr>
                        <tr>
                        <td><strong>Username:</strong></td>
                        <td>{studentDetails?.username || 'Username'}</td>
                        </tr>
                        <tr>
                        <td><strong>Email:</strong></td>
                        <td>{studentDetails?.email || 'Email'}</td>
                        </tr>
                        <tr>
                        <td><strong>Gender:</strong></td>
                        <td>{studentDetails?.gender || 'Gender'}</td>
                        </tr>
                        <tr>
                        <td><strong>Birthday:</strong></td>
                        <td>{studentDetails?.birthday || 'Birthday'}</td>
                        </tr>
                        <tr>
                        <td><strong>Student ID:</strong></td>
                        <td>{studentDetails?.studentId || 'StudentID'}</td>
                        </tr>
                        <tr>
                        <td><strong>Course:</strong></td>
                        <td>{studentDetails?.course || 'Course'}</td>
                        </tr>
                        <tr>
                        <td><strong>School:</strong></td>
                        <td>{studentDetails?.school || 'School'}</td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
            )}

            {showMessageModal && (
                <div className="sp-modal-overlay">
                    <div className="sp-modal-content">
                        <IoMdCloseCircle className="sp-close-modal-icon" onClick={() => setShowMessageModal(false)} />
                        <div className="sp-modal-form">
                            <h3>Send a message</h3>
                            <input
                                type="text"
                                value={`From: ${user?.email || ''}`}
                                disabled
                                placeholder="Sender Email"
                                className="sp-modal-input"
                            />
                            <input
                                type="text"
                                value={`To: ${studentDetails?.email || ''}`}
                                disabled
                                placeholder="Recipient Email"
                                className="sp-modal-input"
                            />
                            <input
                                type="text"
                                value={
                                    scholarshipPrograms.find(program => program.id === selectedProgram)?.programName || 
                                    'No program selected'
                                }
                                disabled
                                placeholder="Scholarship Program"
                                className="sp-modal-input"
                            />
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="sp-modal-input"
                            >
                                <option value="" disabled>Select a subject</option>
                                <option value="Lack of document">Lack of documents</option>
                                <option value="For interview">For interview</option>
                                <option value="Follow up">Follow up</option>
                                <option value="Disqualification notice">Disqualification notice</option>
                                <option value="Others">Others</option>
                            </select>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="sp-modal-textarea"
                                placeholder="Enter your message"
                            />
                            <div className="sp-file-upload-section">
                                <input 
                                    type="file" 
                                    onChange={handleFileUpload} 
                                    className="sp-modal-input"
                                    multiple
                                />
                                {files.length > 0 && (
                                    <div className="sp-selected-files">
                                        {files.map((file, index) => (
                                            <div key={index} className="sp-file-item">
                                                <span>{file.name}</span>
                                                <button 
                                                    onClick={() => removeFile(index)}
                                                    className="sp-remove-file"
                                                >
                                                    <FiX />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button className="sp-send-btn" onClick={handleSendMessage}>
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showNotificationModal && (
                <div className="sp-modal-notif-overlay">
                    <div className="sp-modal-notif-content">
                        <div className="sp-modal-notification">
                            <h3 className='sp-modal-notif-msg'>{notificationMessage}</h3>
                            <LuMail className='sp-warning-icon'/>
                            <button onClick={() => setShowNotificationModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showApproveModal && (
                <div className="sp-modal-notif-overlay">
                    <div className="sp-modal-notif-content">
                        <h3 className='sp-modal-notif-msg'>Are you sure you want to approve this student?</h3>
                        <div className="sp-button-container">
                            <button onClick={confirmApproval} className='sp-send-btn sp-btn-yes'>Yes</button>
                            <button onClick={() => setShowApproveModal(false)} className='sp-send-btn sp-btn-no'>No</button>
                        </div>
                        <div className="sp-remarks-container">
                            <textarea
                                value={remarks}
                                placeholder="Add a remark or a comment"
                                onChange={(e) => setRemarks(e.target.value)}
                                className="sp-remarks-textarea"
                            />
                            <button onClick={handleSaveRemarks} className="sp-save-remarks-button" disabled={loading}>
                                    {loading ? (
                                        <div className="sp-spinner"></div> 
                                    ) : (
                                        "Save Remarks"
                                    )}
                            </button>
                        </div> 
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="sp-modal-notif-overlay">
                    <div className="sp-modal-notif-content">
                    <h3 className='sp-modal-notif-msg'>Are you sure you want to reject this student?</h3>
                        <div className="sp-button-container">
                            <button onClick={confirmRejection} className='sp-send-btn sp-btn-yes'>Yes</button>
                            <button onClick={() => setShowRejectModal(false)} className='sp-send-btn sp-btn-no'>No</button>
                        </div>
                        <div className="sp-remarks-container">
                            <textarea
                                value={remarks}
                                placeholder="Add a remark or a comment"
                                onChange={(e) => setRemarks(e.target.value)}
                                className="sp-remarks-textarea"
                            />
                            <button onClick={handleSaveRemarks} className="sp-save-remarks-button" disabled={loading}>
                                    {loading ? (
                                        <div className="sp-spinner"></div> 
                                    ) : (
                                        "Save Remarks"
                                    )}
                            </button>
                        </div>                        
                    </div>
                </div>
            )}

            {showIncompleteDocumentsModal && (
                <div className="sp-modal-notif-overlay">
                    <div className="sp-modal-notif-content">
                        <h3 className='sp-modal-notif-msg'>All documents must be viewed and checked first before approving this student.</h3>
                        <IoIosWarning className='warning-icon'/>
                        <button onClick={() => setShowIncompleteDocumentsModal(false)} className='sp-send-btn'>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentProfile;