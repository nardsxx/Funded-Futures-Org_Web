import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaPlus, FaArrowLeft, FaTrash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, doc, getDoc, updateDoc, query, where, getDocs, deleteDoc, Timestamp} from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import Multiselect from 'multiselect-react-dropdown';
import './AddEditProgram.css'; 
import { IoMdCloseCircle } from "react-icons/io";
import { FcInfo } from "react-icons/fc";
import { IoIosWarning } from "react-icons/io";

function Modal({ message, closeModal }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <IoMdCloseCircle className="modal-close-icon" onClick={closeModal} /> 
        <div>
          <FcInfo className="modal-x-image" />
        </div>
        <p className="modal-message">{message}</p>
      </div>
    </div>
  );
}

function EditProgram() {
  const navigate = useNavigate();
  const { programId } = useParams();
  const [programName, setProgramName] = useState('');
  const [programType, setProgramType] = useState('Internal');
  const [requirements, setRequirements] = useState(['', '', '']);
  const [benefits, setBenefits] = useState(['', '', '']);
  const [courses, setCourses] = useState(['']);
  const [slots, setSlots] = useState('');
  const [schoolsOffered, setSchoolsOffered] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [deleteModal, setDeleteModal] = useState(false);

  const openDeleteModal = () => setDeleteModal(true);
  const closeDeleteModal = () => setDeleteModal(false);
  
  const handleDelete = async () => {
    try {
      const docRef = doc(db, 'scholarships', programId);
      await deleteDoc(docRef);
      closeModal();
      navigate('/app');
    } catch (error) {
      console.error("Error deleting document:", error);
      closeModal();
    }
  };



  const handleSelect = (selectedList) => setSchoolsOffered(selectedList);
  const handleRemove = (selectedList) => setSchoolsOffered(selectedList);
  const clearAllSchools = () => setSchoolsOffered([]);
  const selectAllSchools = () => setSchoolsOffered(schoolOptions);

  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
    const fetchProgramData = async () => {
      try {
        const docRef = doc(db, 'scholarships', programId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProgramName(data.programName || '');
          setProgramType(data.programType || 'Internal');
          setRequirements(data.requirements || ['', '', '']);
          setBenefits(data.benefits || ['', '', '']);
          setCourses(data.courses || ['']);
          setSlots(data.slots || '');
          setSchoolsOffered(data.schoolsOffered || []);
        } else {
        }
      } catch (error) {
        console.error('Error fetching program data:', error);
      }
    };

    fetchProgramData();
  }, [programId]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const docRef = doc(db, 'schools', 'r86RPNBNJlTKuF1MNY8o');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSchoolOptions(docSnap.data().list);
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching school list:', error);
      }
    };

    fetchSchools();
  }, []);

  const addRequirementField = () => setRequirements([...requirements, '']);
  const removeRequirementField = (index) => setRequirements(requirements.filter((_, i) => i !== index));

  const addBenefitField = () => setBenefits([...benefits, '']);
  const removeBenefitField = (index) => setBenefits(benefits.filter((_, i) => i !== index));

  const addCourseField = () => setCourses([...courses, '']);
  const removeCourseField = (index) => setCourses(courses.filter((_, i) => i !== index));

  const showErrorModal = (message) => {
    setErrorModal({ show: true, message });
  };

  const closeModal = () => {
    setErrorModal({ show: false, message: '' });
  };

  const handleEditProgram = async () => {
    if (programName.trim() === '') {
      showErrorModal('Scholarship Program Name is required!');
      return;
    }
    if (courses.some(course => course.trim() === '')) {
      showErrorModal('All course information must be filled out.');
      return;
    }
    if (requirements.some(req => req.trim() === '')) {
      showErrorModal('All requirement information must be filled out.');
      return;
    }
    if (benefits.some(ben => ben.trim() === '')) {
      showErrorModal('All benefit information must be filled out.');
      return;
    }
    if (!slots || isNaN(slots) || slots <= 0) {
      showErrorModal('Please enter a valid number of slots.');
      return;
    }

    setLoading(true);

    const programData = {
      programName,
      programType,
      requirements,
      benefits,
      courses,
      schoolsOffered,
      slots,
      lastUpdated: Timestamp.now(),
    };

    try {
      const docRef = doc(db, 'scholarships', programId);
      await updateDoc(docRef, programData);
      setTimeout(() => {
        setLoading(false);
        navigate(-1);
      }, 2000);
    } catch (error) {
      setLoading(false);
      console.error('Error updating program:', error);
    }
  };

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
    <div className="AddProgram">
      <nav className="navbar">
        <div className="navbar-left">
          <img
            src="/fundedfutureslogo.png"
            alt="Funded Futures"
            className="logo"
            onClick={() => navigate(`/app`)}
          />
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

      <div className="form-container-add">
        <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />
        <h2>Edit Scholarship Program</h2>

        <div className="form-group-add">
          <label>Scholarship Program Name</label>
          <input
            type="text"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="Enter Scholarship Program Name"
          />
        </div>

        <div className="form-group-add">
          <label>Program Type</label>
          <div className="type-selector-add">
            <button className={`type-button ${programType === 'Internal' ? 'selected' : ''}`} onClick={() => setProgramType('Internal')}>Internal</button>
            <button className={`type-button ${programType === 'External' ? 'selected' : ''}`} onClick={() => setProgramType('External')}>External</button>
          </div>
        </div>

        <div className="form-group-add">
          <label>Schools Offered</label>
          <div className="multi-select">
            <Multiselect
              options={schoolOptions}
              isObject={false}
              selectedValues={schoolsOffered}
              onSelect={handleSelect}
              onRemove={handleRemove}
              placeholder="Select Schools"
              className="multi-select"
            />
            <div className='select-schools-btns'>
            <button className="multi-select-button" onClick={selectAllSchools}>Select All Schools</button>
            <button className="multi-select-button-clear" onClick={clearAllSchools}>Clear</button>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Courses Offered</label>
          {courses.map((course, index) => (
            <div key={index} className="dynamic-field">
              <input
                type="text"
                value={course}
                onChange={(e) => {
                  const newCourses = [...courses];
                  newCourses[index] = e.target.value;
                  setCourses(newCourses);
                }}
                placeholder={`Enter Course Here...`}
              />
              {index > 0 && (
                <FaTrash className="delete-icon" onClick={() => removeCourseField(index)} title="Remove Course" />
              )}
            </div>
          ))}
          <button className="add-button" onClick={addCourseField}>
            <FaPlus /> Add More Courses
          </button>
        </div>

        <div className="form-group">
          <label>Requirements</label>
          {requirements.map((req, index) => (
            <div key={index} className="dynamic-field">
              <input
                type="text"
                value={req}
                onChange={(e) => {
                  const newRequirements = [...requirements];
                  newRequirements[index] = e.target.value;
                  setRequirements(newRequirements);
                }}
                placeholder={`Requirement ${index + 1}`}
              />
              {index >= 3 && (
                <FaTrash className="delete-icon" onClick={() => removeRequirementField(index)} title="Remove Requirement" />
              )}
            </div>
          ))}
          <button className="add-button" onClick={addRequirementField}>
            <FaPlus /> Add More Requirements
          </button>
        </div>

        <div className="form-group">
          <label>Benefits</label>
          {benefits.map((benefit, index) => (
            <div key={index} className="dynamic-field">
              <input
                type="text"
                value={benefit}
                onChange={(e) => {
                  const newBenefits = [...benefits];
                  newBenefits[index] = e.target.value;
                  setBenefits(newBenefits);
                }}
                placeholder={`Benefit ${index + 1}`}
              />
              {index >= 3 && (
                <FaTrash className="delete-icon" onClick={() => removeBenefitField(index)} title="Remove Benefit" />
              )}
            </div>
          ))}
          <button className="add-button" onClick={addBenefitField}>
            <FaPlus /> Add More Benefits
          </button>
        </div>

        <div className="form-group-add">
          <label>Slots</label>
          <input
            type="number"
            className="slots-input"
            value={slots}
            onChange={(e) => setSlots(e.target.value)}
            min="1"
          />
        </div>

        {loading ? (
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        ) : (
            <>
                <button className="submit-button-add" onClick={handleEditProgram}>Save Changes</button>
                <button className="submit-button-delete" onClick={openDeleteModal}>Delete Scholarship Program</button>
            </>
        )}
        {loading && (
            <button className="submit-button-delete" onClick={openDeleteModal} style={{ visibility: 'hidden' }}>
                Delete Scholarship Program
            </button>
        )}
            
        {deleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Are you sure you want to delete this program? This action cannot be undone.</h3>
            <IoIosWarning className='warning-icon'/>
            <div className="modal-buttons">
              <button className="confirm-button" onClick={handleDelete}>Yes</button>
              <button className="cancel-button" onClick={closeDeleteModal}>No</button>
            </div>
          </div>
        </div>
      )}
      </div>

      {errorModal.show && <Modal message={errorModal.message} closeModal={closeDeleteModal} />}
    </div>
  );
}

export default EditProgram;
