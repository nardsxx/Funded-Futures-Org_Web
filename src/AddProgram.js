import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaPlus, FaArrowLeft, FaTimes, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import Multiselect from 'multiselect-react-dropdown';
import './AddProgram.css'; 

function Modal({ message, closeModal }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <FaTimes className="modal-back-icon" onClick={closeModal} /> 
        <div>
          <img className="modal-x-image" src="/alert.png" alt="alert"/>
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
  const [requirements, setRequirements] = useState(['', '', '']);
  const [benefits, setBenefits] = useState(['', '', '']);
  const [courses, setCourses] = useState(['']);
  const [slots, setSlots] = useState('');
  const [schoolsOffered, setSchoolsOffered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });

  const schoolOptions = [
    'Adamson University', 
    'Arellano University', 
    'Centro Escolar University', 
    'Chinese General Hospital Colleges', 
    'College of the Holy Spirit Manila', 
    'Colegio de San Juan de Letran', 
    'Colegio de Santa Rosa', 
    'De La Salle–College of Saint Benilde', 
    'De La Salle University', 
    'Eulogio "Amang" Rodriguez Institute of Science and Technology', 
    'Emilio Aguinaldo College', 
    'Far Eastern University', 
    'Far Eastern University Institute of Technology', 
    'FEATI University', 
    'Guzman College of Science and Technology', 
    'La Consolacion College Manila', 
    'Lyceum of the Philippines University', 
    'Mapúa University', 
    'Manila Business College', 
    'Manila Law College', 
    'Manuel L. Quezon University', 
    'Mary Chiles College', 
    'Metropolitan Hospital College of Nursing', 
    'National Teachers College', 
    'National University', 
    'Pamantasan ng Lungsod ng Maynila',
    'Perpetual Help College of Manila',
    'Philippine Christian University', 
    'Philippine College of Criminology', 
    'Philippine College of Health Sciences', 
    'Philippine Merchant Marine School', 
    'Philippine Normal University', 
    'Philippine School of Business Administration', 
    'Philsin College Foundation', 
    'PMI Colleges', 
    'Polytechnic University of the Philippines', 
    'Saint Jude College Manila', 
    'Saint Rita College', 
    'San Beda University', 
    'San Sebastian College – Recoletos', 
    'Santa Catalina College', 
    'Santa Isabel College Manila', 
    'St. Paul University Manila', 
    'St. Scholastica\'s College, Manila', 
    'STI NAMEI', 
    'Technological Institute of the Philippines', 
    'Technological University of the Philippines', 
    'Universidad de Manila', 
    'University of Manila',
    'University of Santo Tomas', 
    'University of the East', 
    'University of the Philippines Manila'
];


  const handleSelect = (selectedList) => {
    setSchoolsOffered(selectedList);
  };

  const handleRemove = (selectedList) => {
    setSchoolsOffered(selectedList);
  };

  const clearAllSchools = () => {
    setSchoolsOffered([]);
  }; 

  const selectAllSchools = () => {
    setSchoolsOffered(schoolOptions);
  };

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

    const programData = {
      programName,
      programType,
      requirements,
      benefits,
      courses,
      schoolsOffered,
      slots,
      dateAdded: new Date().toLocaleDateString(),
      createdBy: user?.email || 'unknown',
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

  return (
    <div className="AddProgram">
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
            <button className="multi-select-button" onClick={selectAllSchools}>Select All Schools</button>
            <button className="multi-select-button" onClick={clearAllSchools}>Clear</button>
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
                <FaTrash
                  className="delete-icon"
                  onClick={() => removeCourseField(index)}
                  title="Remove Course"
                />
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
                <FaTrash
                  className="delete-icon"
                  onClick={() => removeRequirementField(index)}
                  title="Remove Requirement"
                />
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
                <FaTrash
                  className="delete-icon"
                  onClick={() => removeBenefitField(index)}
                  title="Remove Benefit"
                />
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

        <button className="submit-button" onClick={handleAddProgram}>
          {loading ? (
            <div className="loading-container">
              <div className="loading-animation"></div>
            </div>
          ) : 'ADD PROGRAM'}
        </button>
      </div>

      {errorModal.show && <Modal message={errorModal.message} closeModal={closeModal} />}
    </div>
  );
}

export default AddProgram;
