import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StudentList from './StudentList';
import AddProgram from './AddProgram';
import Login from './Login';
import Register from './Register';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import ViewProfile from './ViewProfile';
import StudentProfile from './StudentProfile';
import EditProgram from './EditProgram';
import App from './App';
import Home from './Home';
import Messages from './Messages'
import { AuthProvider } from './authContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<PublicRoute element={Home} />} />
        <Route path="/login" element={<PublicRoute element={Login} />} />
        <Route path="/register" element={<PublicRoute element={Register} />} />
        <Route path="/app" element={<PrivateRoute element={App} />} />
        <Route path="/addProgram" element={<PrivateRoute element={AddProgram} />} />\
        <Route path="/messages/:id" element={<PrivateRoute element={Messages} />} />\
        <Route path="/editProgram/:programId" element={<PrivateRoute element={EditProgram} />} />
        <Route path="/studentList/:programId" element={<PrivateRoute element={StudentList} />} />
        <Route path="/viewProfile/:id" element={<PrivateRoute element={ViewProfile} />} />
        <Route path="/studentProfile/:programId/:studentId" element={<PrivateRoute element={StudentProfile} />} />
      </Routes>
    </Router> 
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
