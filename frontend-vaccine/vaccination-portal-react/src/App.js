import React from 'react';
import {
  BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate,useLocation} 
  from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import BulkUpload from './components/BulkUpload';
import Drives from './components/Drives.js';
import Reports from './components/Reports';
import Enroll from './components/Enroll.js';
import './NavBar.css';


const Private = ({ children }) =>
  localStorage.getItem('authToken') ? children : <Navigate to="/login" />;





const Nav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!localStorage.getItem('authToken')) return null;

  const link = (path, label) => (
    <Link
      to={path}
      className={pathname === path ? 'active' : undefined}  >
      {label}
    </Link>
  );

  return (
    <nav className="navbar">
      <span className="brand">Vaccination Portal</span>

      <div className="links">
        {link('/', 'Dashboard')}
        {link('/students', 'Students')}
        {link('/upload', 'Students Bulk Upload')}
        {link('/drives', 'Drives')}
        {link('/enroll', 'Enroll')}
        {link('/reports', 'Reports')}
      </div>

      <span className="spacer" />
      <button onClick={() => {
        localStorage.clear();
        navigate('/login');
      }}>
        Logout
      </button>
    </nav>
  );
};

export default function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Private><Dashboard /></Private>} />
        <Route path="/students" element={<Private><Students /></Private>} />
        <Route path="/upload" element={<Private><BulkUpload /></Private>} />
        <Route path="/drives" element={<Private><Drives /></Private>} />
         <Route path="/enroll" element={<Private><Enroll /></Private>} />
        <Route path="/reports" element={<Private><Reports /></Private>} />
       
      </Routes>
    </Router>
  );
}
