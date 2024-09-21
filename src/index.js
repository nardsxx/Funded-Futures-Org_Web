import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StudentList from './StudentList';
import AddProgram from './AddProgram';
import Login from './Login';  // Import Login component
import Register from './Register';  // Import Register component

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/addProgram" element={<AddProgram />} />
        <Route path="/studentList/:programId" element={<StudentList />} />
        <Route path="/login" element={<Login />} /> {/* Add Login Route */}
        <Route path="/register" element={<Register />} /> {/* Add Register Route */}
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
