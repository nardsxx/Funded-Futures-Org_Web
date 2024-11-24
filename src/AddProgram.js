import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaPlus, FaArrowLeft, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, addDoc, getDoc, doc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import Multiselect from 'multiselect-react-dropdown';
import './AddEditProgram.css'; 
import { IoMdCloseCircle } from "react-icons/io";


function Modal({ message, closeModal }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <IoMdCloseCircle className="modal-close-icon" onClick={closeModal} /> 
        <div>
          <FaExclamationTriangle className='warning-icon'/>
        </div>
        <p className="modal-message">{message}</p>
      </div>
    </div>
  );
}

function AddProgram() {
  const navigate = useNavigate();
  const [programName, setProgramName] = useState('');
  const [programType, setProgramType] = useState('Internal');
  const [requirements, setRequirements] = useState(['']);
  const [benefits, setBenefits] = useState(['']);
  const [courses, setCourses] = useState([]);
  const [slots, setSlots] = useState('');
  const [schoolsOffered, setSchoolsOffered] = useState([]);
  const [coursesOptions, setCoursesOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });

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
    const fetchSchools = async () => {
      try {
        const docRef = doc(db, 'system', 'partnerSchools');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const schools = docSnap.data().schools || [];
          setSchoolOptions(schools.sort((a, b) => a.localeCompare(b)));
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching school list:', error);
      }
    };

    fetchSchools();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const docRef = doc(db, 'system', 'partnerSchools');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const courses = docSnap.data().courses || [];
          setCoursesOptions(courses.sort((a, b) => a.localeCompare(b)));
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching courses list:', error);
      }
    };
  
    fetchCourses();
  }, []);
  
  const handleSelectCourses = (selectedList) => setCourses(selectedList);
  const handleRemoveCourses = (selectedList) => setCourses(selectedList);
  const clearAllCourses = () => setCourses([]);
  const selectAllCourses = () => setCourses(coursesOptions);
  
  

  const addRequirementField = () => setRequirements([...requirements, '']);
  const removeRequirementField = (index) => setRequirements(requirements.filter((_, i) => i !== index));

  const addBenefitField = () => setBenefits([...benefits, '']);
  const removeBenefitField = (index) => setBenefits(benefits.filter((_, i) => i !== index));

  const showErrorModal = (message) => {
    setErrorModal({ show: true, message });
  };

  const closeModal = () => {
    setErrorModal({ show: false, message: '' });
  };

  const handleAddProgram = async () => {
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

    const fetchOrgName = async (userEmail) => {
      try {
        const q = query(collection(db, 'organization'), where('orgEmail', '==', userEmail));
        const querySnapshot = await getDocs(q);
    
        if (!querySnapshot.empty) {
          const orgDoc = querySnapshot.docs[0];
          return orgDoc.data().orgName;
        } else {
          console.error('No organization found for this user.');
          return 'Unknown Organization';
        }
      } catch (error) {
        console.error('Error fetching organization name:', error);
        return 'Unknown Organization';
      }
    };

    const orgName = await fetchOrgName(user.email)

    const programData = {
      programName,
      programType,
      requirements,
      benefits,
      courses,
      schoolsOffered,
      slots,
      dateAdded: Timestamp.now(),
      createdBy: user?.email || 'unknown',
      applied: 0,
      orgPosted: orgName,  
    };

    try {
      await addDoc(collection(db, 'scholarships'), programData);
      setTimeout(() => {
        setLoading(false);
        navigate('/app');
      }, 2000);
    } catch (error) {
      setLoading(false);
      console.error('Error adding program:', error);
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
            src="/images/fundedfutureslogo.png"
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
                  null
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="form-container-add">
        <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />
        <h2>Add Scholarship Program</h2>

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

        <div className="form-group-add">
          <label>Courses Offered</label>
          <div className="multi-select">
            <Multiselect
              options={coursesOptions}
              isObject={false}
              selectedValues={courses}
              onSelect={handleSelectCourses}
              onRemove={handleRemoveCourses}
              placeholder="Select Courses"
              className="multi-select"
            />
            <div className='select-schools-btns'>
              <button className="multi-select-button" onClick={selectAllCourses}>Select All Courses</button>
              <button className="multi-select-button-clear" onClick={clearAllCourses}>Clear</button>
            </div>
          </div>
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
              {index >= 1 && (
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
              {index >= 1 && (
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
          <div className="loader"></div>
        ) : (
          <button className="submit-button-add" onClick={handleAddProgram}>Submit</button>
        )}
      </div>

      {errorModal.show && <Modal message={errorModal.message} closeModal={closeModal} />}
    </div>
  );
}

export default AddProgram;
