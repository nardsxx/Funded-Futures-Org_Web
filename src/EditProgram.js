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
import { AiFillMessage } from "react-icons/ai";


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
  const [requirements, setRequirements] = useState(['']);
  const [benefits, setBenefits] = useState(['']);
  const [courses, setCourses] = useState([]);
  const [description, setDescription] = useState(['']);
  const [conditions, setConditions] = useState(['']);
  const [slots, setSlots] = useState('');
  const [yearLevel, setYearLevel] = useState([]);
  const [strand, setStrand] = useState([]);
  const [gwa, setGWA] = useState('');
  const [schoolsOffered, setSchoolsOffered] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [yearLevelOptions, setYearLevelOptions] = useState([]);
  const [strandOptions, setStrandOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const [coursesOptions, setCoursesOptions] = useState([]);
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

  const handleSelectYearLevel = (selectedList) => setYearLevel(selectedList);
  const handleRemoveYearLevel = (selectedList) => setYearLevel(selectedList);
  const clearAllYearLevel = () => setYearLevel([]);
  const selectAllYearLevel = () => setYearLevel(yearLevelOptions);

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
          setConditions(data.conditions || ['', '', '']);
          setDescription(data.description || ['', '', '']);
          setCourses(data.courses || ['']);
          setSlots(data.slots || '');
          setGWA(data.gwa || '');
          setSchoolsOffered(data.schoolsOffered || []);
          setYearLevel(data.yearLevel || []);
          setStrand(data.strand || []);

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
          console.error('No such document for courses!');
        }
      } catch (error) {
        console.error('Error fetching course list:', error);
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
    if (!gwa || isNaN(gwa) || gwa <= 0) {
      showErrorModal('Please enter a valid number of minimum GWA');
      return;
    }

    setLoading(true);

    const programData = {
      programName,
      programType,
      requirements,
      benefits,
      courses,
      gwa,
      description,
      conditions,
      schoolsOffered,
      yearLevel,
      strand,
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
          <h2>Edit Scholarship Program</h2>
        </div>

        <div className="form-group-add">
          <label>Scholarship Program Name</label>
          <input
            type="text"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="Enter Scholarship Program Name"
            className="form-name-text"
          />
        </div>

        <div className="form-group-add">
          <label>Program Type</label>
          <div className="type-selector-add">
            <button className={`type-button ${programType === 'Internal' ? 'selected' : ''}`} onClick={() => setProgramType('Internal')}>Internal</button>
            <button className={`type-button ${programType === 'External' ? 'selected' : ''}`} onClick={() => setProgramType('External')}>External</button>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
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

        <div className="form-group">
          <label>Conditions</label>
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
          <label>Schools Offered</label>
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

        <div className="form-group-add">
          <label>Courses Offered</label>
          <div className="multi-select">
            <Multiselect
              options={coursesOptions}
              isObject={false}
              selectedValues={courses}
              onSelect={(selectedList) => setCourses(selectedList)}
              onRemove={(selectedList) => setCourses(selectedList)}
              placeholder="Select Courses"
            />
            <div className="select-schools-btns">
              <button className="multi-select-button" onClick={() => setCourses(coursesOptions)}>Select All Courses</button>
              <button className="multi-select-button-clear" onClick={() => setCourses([])}>Clear</button>
            </div>
          </div>
        </div>

        <div className="form-group-add">
          <label><strong>Select Year Level</strong></label>
          <div className="multi-select">
            <Multiselect
              options={yearLevelOptions}
              isObject={false}
              selectedValues={yearLevel}
              onSelect={handleSelectYearLevel}
              onRemove={handleRemoveYearLevel}
              placeholder="Select Year Level"
            />
            <div className='select-schools-btns'>
              <button className="multi-select-button" onClick={selectAllYearLevel}>Select All Year Levels</button>
              <button className="multi-select-button-clear" onClick={clearAllYearLevel}>Clear</button>
            </div>
          </div>
        </div>

        <div className="form-group-add">
          <label><strong>Recommended Strand</strong> (If none, choose select all)</label>
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

        <div className="form-group-add">
          <label>Set Minimum GWA</label>
          <input
            type="number"
            className="slots-input"
            value={gwa}
            onChange={(e) => setGWA(e.target.value)}
            min="1"
            max="5"
          />
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : (
          <>
            <button className="submit-button-add btn-color-submit" onClick={handleEditProgram}>Save Changes</button>
            <button className="submit-button-add btn-color-delete" onClick={openDeleteModal}>Delete Scholarship Program</button>
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

