import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaPlus, FaArrowLeft, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, addDoc, getDoc, doc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import Multiselect from 'multiselect-react-dropdown';
import './AddEditProgram.css'; 
import { IoMdCloseCircle } from "react-icons/io";
import { AiFillMessage } from "react-icons/ai";


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
  const [programType, setProgramType] = useState('');
  const [requirements, setRequirements] = useState(['']);
  const [description, setDescription] = useState(['']);
  const [conditions, setConditions] = useState(['']);
  const [benefits, setBenefits] = useState(['']);
  const [courses, setCourses] = useState([]);
  const [yearLevel, setYearLevel] = useState([]);
  const [strand, setStrand] = useState([]);
  const [slots, setSlots] = useState('');
  const [gwa, setGWA] = useState('');
  const [schoolsOffered, setSchoolsOffered] = useState([]);
  const [coursesOptions, setCoursesOptions] = useState([]);
  const [yearLevelOptions, setYearLevelOptions] = useState([]);
  const [strandOptions, setStrandOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [showCourses, setShowCourses] = useState(false);
  const [showStrand, setShowStrand] = useState(false);

  const handleSelect = (selectedList) => setSchoolsOffered(selectedList);
  const handleRemove = (selectedList) => setSchoolsOffered(selectedList);
  const clearAllSchools = () => setSchoolsOffered([]);
  const selectAllSchools = () => setSchoolsOffered(schoolOptions);

  const handleSelectCourses = (selectedList) => setCourses(selectedList);
  const handleRemoveCourses = (selectedList) => setCourses(selectedList);
  const clearAllCourses = () => setCourses([]);
  const selectAllCourses = () => setCourses(coursesOptions);
  
  const handleSelectYearLevel = (selectedList) => {
    setYearLevel(selectedList);

    if (selectedList === "Incoming First Year") {
      setShowStrand(true);
      setShowCourses(false);
    } else if (["First Year", "Second Year", "Third Year", "Fourth Year", "Fifth Year", "All College Levels"].includes(selectedList)) {
      setShowStrand(false);
      setShowCourses(true);
    } else if (selectedList === "All Year Levels") {
      setShowStrand(true);
      setShowCourses(true);
    } else {
      setShowStrand(false);
      setShowCourses(false);
    }
  };

  const handleSelectStrand = (selectedList) => setStrand(selectedList);
  const handleRemoveStrand = (selectedList) => setStrand(selectedList);
  const clearAllStrand = () => setStrand([]);
  const selectAllStrand = () => setStrand(strandOptions);
  

  
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

  useEffect(() => {
    const fetchYearLevel = async () => {
      try {
        const docRef = doc(db, 'system', 'partnerSchools');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const yearLevel = docSnap.data().yearLevelChoices || [];
          setYearLevelOptions(yearLevel);
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching Year Level Choices:', error);
      }
    };
  
    fetchYearLevel();
  }, []);
  
  useEffect(() => {
    const fetchStrand = async () => {
      try {
        const docRef = doc(db, 'system', 'partnerSchools');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const strand = docSnap.data().strandChoices || [];
          setStrandOptions(strand);
        } else {
          console.error('No such document');
        }
      } catch (error) {
        console.error('Error fetching Strand Choices:', error);
      }
    };
  
    fetchStrand();
  }, []);
  
  const addRequirementField = () => setRequirements([...requirements, '']);
  const removeRequirementField = (index) => setRequirements(requirements.filter((_, i) => i !== index));

  const addBenefitField = () => setBenefits([...benefits, '']);
  const removeBenefitField = (index) => setBenefits(benefits.filter((_, i) => i !== index));

  const addDescriptionField = () => setDescription([...description, '']);
  const removeDescriptionField = (index) => setDescription(description.filter((_, i) => i !== index));

  const addConditionField = () => setConditions([...conditions, '']);
  const removeConditionField = (index) => setConditions(conditions.filter((_, i) => i !== index));

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
    
    if (requirements.some(req => req.trim() === '')) {
      showErrorModal('All requirement information must be filled out.');
      return;
    }
    if (benefits.some(ben => ben.trim() === '')) {
      showErrorModal('All benefit information must be filled out.');
      return;
    }

    if (description.some(ben => ben.trim() === '')) {
      showErrorModal('All description information must be filled out.');
      return;
    }

    if (conditions.some(ben => ben.trim() === '')) {
      showErrorModal('All conditions information must be filled out.');
      return;
    }

    if (!slots || isNaN(slots) || slots <= 0) {
      showErrorModal('Please enter a valid number of slots.');
      return;
    }

    if (!gwa || isNaN(gwa) || gwa <= 0) {
      showErrorModal('Please enter a valid number of GWA.');
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

    const combinedPrograms = [...courses, ...strand];

    const programData = {
      programName,
      programType,
      requirements,
      benefits,
      conditions,
      description, 
      schoolsOffered,
      slots,
      gwa,
      yearLevel,
      dateAdded: Timestamp.now(),
      createdBy: user?.email || 'unknown',
      applied: 0,
      orgPosted: orgName,  
      programs: combinedPrograms
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
          <div className="user-icon-container" ref={dropdownRef} >
            <AiFillMessage className="icon" onClick={handleViewMessages}/>
            <FaUserCircle className="icon" onClick={() => setShowDropdown(!showDropdown)}/>
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
        <div className="form-header">
          <FaArrowLeft className="back-arrow" onClick={() => navigate(-1)} />
          <h2>Add Scholarship Program</h2>
        </div>

        <div className="form-group-add">
          <label><strong>Scholarship Program Name</strong><span className="text-req"> *</span></label>
          <input
            type="text"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="Enter Scholarship Program Name"
            className="form-name-text"
          />
        </div>

        <div className="form-group-add">
          <label><strong>Program Type</strong><span className="text-req"> *</span></label>
          <div className="type-selector-add">
            <button className={`type-button ${programType === 'Internal' ? 'selected' : ''}`} onClick={() => setProgramType('Internal')}>Internal</button>
            <button className={`type-button ${programType === 'External' ? 'selected' : ''}`} onClick={() => setProgramType('External')}>External</button>
          </div>
        </div>

        <div className="form-group-add">
          <label><strong>Set Total Slots<span className="text-req"> *</span></strong></label>
          <input
            type="number"
            className="slots-input"
            value={slots}
            onChange={(e) => setSlots(e.target.value)}
            min="1"
          />
        </div>

        <div className="form-group-add">
          <label><strong>Set Minimum GWA<span className="text-req"> *</span></strong></label>
          <input
            type="number"
            className="slots-input"
            value={gwa}
            onChange={(e) => setGWA(e.target.value)}
            min="1"
            max="5"
          />
        </div>

        <div className="form-group">
          <label><strong>Description</strong><span className="text-req"> *</span></label>
          {description.map((desc, index) => (
            <div key={index} className="dynamic-field">
              <input
                type="text"
                value={desc}
                onChange={(e) => {
                  const newDescription = [...description];
                  newDescription[index] = e.target.value;
                  setDescription(newDescription);
                }}
                placeholder={`Description ${index + 1}`}
              />
              {index >= 1 && (
                <FaTrash className="delete-icon" onClick={() => removeDescriptionField(index)} title="Remove Description" />
              )}
            </div>
          ))}
          <button className="add-button" onClick={addDescriptionField}>
            <FaPlus /> Add More Description
          </button>
        </div>

        <div className="form-group">
          <label><strong>Requirements</strong> (ex. Transcript of Records, Grade Slip, etc.)<span className="text-req"> *</span></label>
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
          <label><strong>Benefits</strong><span className="text-req"> *</span></label>
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

        <div className="form-group">
          <label><strong>Conditions</strong><span className="text-req"> *</span></label>
          {conditions.map((condition, index) => (
            <div key={index} className="dynamic-field">
              <input
                type="text"
                value={condition}
                onChange={(e) => {
                  const newConditions = [...conditions];
                  newConditions[index] = e.target.value;
                  setConditions(newConditions);
                }}
                placeholder={`Condition ${index + 1}`}
              />
              {index >= 1 && (
                <FaTrash className="delete-icon" onClick={() => removeConditionField(index)} title="Remove Condition" />
              )}
            </div>
          ))}
          <button className="add-button" onClick={addConditionField}>
            <FaPlus /> Add More Conditions
          </button>
        </div>

        <div className="form-group-add">
          <label><strong>Select Year Level<span className="text-req"> *</span></strong></label>
          <select 
            className="multi-select" 
            value={yearLevel} 
            onChange={(e) => handleSelectYearLevel(e.target.value)}
          >
            <option value="" disabled>Select Year Level</option>
            {yearLevelOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="form-group-add">
          <label><strong>Schools Offered<span className="text-req"> *</span></strong></label>
          <div className="multi-select">
            <Multiselect
              options={schoolOptions}
              isObject={false}
              selectedValues={schoolsOffered}
              onSelect={handleSelect}
              onRemove={handleRemove}
              placeholder="Select Schools"
            />
            <div className='select-schools-btns'>
              <button className="multi-select-button" onClick={selectAllSchools}>Select All Schools</button>
              <button className="multi-select-button-clear" onClick={clearAllSchools}>Clear</button>
            </div>
          </div>
        </div>

        {showCourses && (
        <div className="form-group-add">
          <label><strong>Courses Offered<span className="text-req"> *</span></strong></label>
          <div className="multi-select">
            <Multiselect
              options={coursesOptions}
              isObject={false}
              selectedValues={courses}
              onSelect={handleSelectCourses}
              onRemove={handleRemoveCourses}
              placeholder="Select Courses"
            />
            <div className='select-schools-btns'>
              <button className="multi-select-button" onClick={selectAllCourses}>Select All Courses</button>
              <button className="multi-select-button-clear" onClick={clearAllCourses}>Clear</button>
            </div>
          </div>
        </div>
      )}

      {showStrand && (
        <div className="form-group-add">
          <label><strong>Recommended Strand</strong><span className="text-req"> *</span></label>
          <div className="multi-select">
            <Multiselect
              options={strandOptions}
              isObject={false}
              selectedValues={strand}
              onSelect={handleSelectStrand}
              onRemove={handleRemoveStrand}
              placeholder="Select Strand"
            />
            <div className='select-schools-btns'>
              <button className="multi-select-button" onClick={selectAllStrand}>Select All Strands</button>
              <button className="multi-select-button-clear" onClick={clearAllStrand}>Clear</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : (
        <button className="submit-button-add btn-color-submit" onClick={handleAddProgram}>
          Submit Scholarship Program
        </button>
      )}
      </div>

      {errorModal.show && <Modal message={errorModal.message} closeModal={closeModal} />}
    </div>
  );
}

export default AddProgram;