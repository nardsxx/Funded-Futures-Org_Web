import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StudentList from './StudentList';
import AddProgram from './AddProgram';
import Login from './Login';
import Register from './Register';
import PrivateRoute from './PrivateRoute';
import ViewProfile from './ViewProfile';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={<PrivateRoute element={App} />} />
        <Route path="/addProgram" element={<PrivateRoute element={AddProgram} />} />
        <Route path="/studentList/:programId" element={<PrivateRoute element={StudentList} />} />
        <Route path="/viewProfile/:id" element={<PrivateRoute element={ViewProfile} />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
