import React from 'react';
import './StudentList.css';
import { FaQuestionCircle, FaBell, FaUserCircle, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function StudentList() {
    const navigate = useNavigate();

  return (
    <div>
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
      <h1>Student List</h1>
      <p>List of the students</p>
    </div>
  );
}

export default StudentList;