import React, { useState } from 'react';
import { FaQuestionCircle, FaBell, FaUserCircle, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import './AddProgram.css'; 

function AddProgram() {
  const navigate = useNavigate();
  const [programName, setProgramName] = useState('');
  const [programType, setProgramType] = useState('Internal');
  const [requirements, setRequirements] = useState(['', '', '']);
  const [benefits, setBenefits] = useState(['', '', '']);
  const [courses, setCourses] = useState(['']);
  const [slots, setSlots] = useState('');
  const [loading, setLoading] = useState(false);

  const programId = uuidv4(); 

  const addRequirementField = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirementField = (index) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    setRequirements(newRequirements);
  };

  const addBenefitField = () => {
    setBenefits([...benefits, '']);
  };

  const removeBenefitField = (index) => {
    const newBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(newBenefits);
  };

  const addCourseField = () => {
    setCourses([...courses, '']);
  };

  const removeCourseField = (index) => {
    const newCourses = courses.filter((_, i) => i !== index);
    setCourses(newCourses);
  };

  const handleAddProgram = async () => {
    if (programName.trim() === '') {
      alert('All information must be filled out.');
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
      slots,
      dateAdded: new Date().toLocaleDateString(),
    };
  
    try {
      await addDoc(collection(db, 'scholarships'), programData);
      console.log('Program added:', programData);
      
      setTimeout(() => {
        setLoading(false);
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error adding program:', error);
      setLoading(false);
    }
  };
  
  return (
    <div className="AddProgram">
      <nav className="navbar">
        <div className="navbar-left">
        <img src="/tiplogo.png" alt="Technological Institute of The Philippines" className="logo"  onClick={() => navigate(`/`)} />
        </div>
        <div className="navbar-right">
          <FaQuestionCircle className="icon" title="FAQ" />
          <FaBell className="icon" title="Notifications" />
          <FaUserCircle className="icon" title="Profile" />
        </div>
      </nav>

      <div className="form-container">
        <FaArrowLeft className="proceed-arrow" onClick={() => navigate('/')} title="Go Back" />
        <h2>Add Scholarship Program</h2>

        <div className="form-group">
          <label>Scholarship Program Name</label>
          <input
            type="text"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="Enter Scholarship Program Name"
          />
        </div>

        <div className="form-group">
          <label>Program Type</label>
          <div className="type-selector">
            <button
              className={`type-button ${programType === 'Internal' ? 'selected' : ''}`}
              onClick={() => setProgramType('Internal')}
            >
              Internal
            </button>
            <button
              className={`type-button ${programType === 'External' ? 'selected' : ''}`}
              onClick={() => setProgramType('External')}
            >
              External
            </button>
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
            placeholder="Enter Number of Slots"
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
