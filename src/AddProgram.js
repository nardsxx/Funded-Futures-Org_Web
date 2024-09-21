import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase'; // Ensure Firebase is properly imported
import { collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { signOut, onAuthStateChanged } from 'firebase/auth';

import './AddProgram.css'; 

function AddProgram() {
  const navigate = useNavigate();
  const [programName, setProgramName] = useState('');
  const [programType, setProgramType] = useState('Internal');
  const [requirements, setRequirements] = useState(['', '', '']);
  const [benefits, setBenefits] = useState(['', '', '']);
  const [courses, setCourses] = useState(['']);
  const [slots, setSlots] = useState('');
  const [schoolsOffered, setSchoolsOffered] = useState([{ value: '', isSelected: false }]); // Schools list
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // Track logged-in user
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown

  const programId = uuidv4(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
        setUser(user); // Store logged-in user details
      } else {
        setLoggedIn(false);
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const addRequirementField = () => setRequirements([...requirements, '']);
  const removeRequirementField = (index) => setRequirements(requirements.filter((_, i) => i !== index));

  const addBenefitField = () => setBenefits([...benefits, '']);
  const removeBenefitField = (index) => setBenefits(benefits.filter((_, i) => i !== index));

  const addCourseField = () => setCourses([...courses, '']);
  const removeCourseField = (index) => setCourses(courses.filter((_, i) => i !== index));

  const addSchoolField = () => setSchoolsOffered([...schoolsOffered, { value: '', isSelected: false }]);
  const removeSchoolField = (index) => setSchoolsOffered(schoolsOffered.filter((_, i) => i !== index));

  const handleSchoolChange = (index, value) => {
  const newSchools = [...schoolsOffered];
    newSchools[index].value = value;
    setSchoolsOffered(newSchools);
  };

  const handleAddProgram = async () => {
    if (programName.trim() === '') {
      alert('Scholarship Program Name is required!');
      return;
    }
    if (courses.some(course => course.trim() === '')) {
      alert('All information must be filled out.');
      return;
    }
    if (requirements.some(req => req.trim() === '')) {
      alert('All information must be filled out.');
      return;
    }
    if (benefits.some(ben => ben.trim() === '')) {
      alert('All information must be filled out.');
      return;
    }
    if (!slots || isNaN(slots) || slots <= 0) {
      alert('Please enter a valid number of slots.');
      return;
    }

    setLoading(true);

    const programData = {
      id: programId, 
      programName,
      programType,
      requirements,
      benefits,
      courses,
      schoolsOffered: schoolsOffered.map(school => school.value), // Save school names
      slots,
      dateAdded: new Date().toLocaleDateString(),
    };

    try {
      await addDoc(collection(db, 'scholarships'), programData);
      setTimeout(() => {
        setLoading(false);
        navigate('/');
      }, 2000);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="AddProgram">
      <nav className="navbar">
        <div className="navbar-left">
        <img src="/fundedfutureslogo.png" alt="Funded Futures" className="logo" onClick={() => navigate(`/`)} />
        </div>
        <div className="navbar-right">
          <div className="user-icon-container" onClick={() => setShowDropdown(!showDropdown)}>
            <FaUserCircle className="icon" />
            {showDropdown && (
              <div className="user-dropdown">
                {loggedIn ? (
                  <>
                    <p className="username">{user?.email}</p>
                    <button onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <button onClick={() => navigate('/login')}>Log in</button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="form-container-add">
        <FaArrowLeft className="proceed-arrow" onClick={() => navigate('/')} title="Go Back" />
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
          {schoolsOffered.map((school, index) => (
            <div key={index} className="dynamic-field">
              <select
                value={school.value}
                onChange={(e) => handleSchoolChange(index, e.target.value)}
              >
                <option value="" disabled>Select School...</option>
                <option>Technological Institue of the Philippines</option>
                <option>Centro Escolar University</option>
                <option>National Teacher's College</option>
                <option>University of Santo Thomas</option>
                <option>University of the East</option>
                <option>Far Eastern University</option>
              </select>
              {index > 0 && (
                <FaTrash className="delete-icon" onClick={() => removeSchoolField(index)} title="Remove School" />
              )}
            </div>
          ))}
          <button className="add-button" onClick={addSchoolField}>
            <FaPlus /> Add More Schools
          </button>
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
            <FaPlus /> Add Requirement
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
            <FaPlus /> Add Benefit
          </button>
        </div>

        <div className="form-group">
          <label>Number of Slots Offered</label>
          <input
            type="number"
            value={slots}
            onChange={(e) => setSlots(e.target.value)}
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
    </div>
  );
}

export default AddProgram;
