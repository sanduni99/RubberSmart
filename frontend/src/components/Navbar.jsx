// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logoutUser  } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logoutUser ();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          🌳 RubberSmart
        </Link>
        
        {/* Desktop links */}
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/about" className={styles.navLink}>About</Link>
          <Link to="/features" className={styles.navLink}>Features</Link>
          {user && (
            <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
          )}
        </div>
        
        {/* Buttons */}
        <div className={styles.buttons}>
          {user ? (
            <>
              <span className={styles.userName}>Hi, {user.name}</span>
              <button onClick={handleLogout} className={styles.loginBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className={styles.loginBtn}>Login</button>
              </Link>
              <Link to="/signup">
                <button className={styles.signupBtn}>Sign Up</button>
              </Link>
            </>
          )}
        </div>
        
        {/* Hamburger for mobile */}
        <div className={styles.hamburger} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      {/* Mobile menu - FIX: Use template literal correctly */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.active : ''}`}>
        <Link to="/" className={styles.navLink} onClick={toggleMenu}>Home</Link>
        <Link to="/about" className={styles.navLink} onClick={toggleMenu}>About</Link>
        <Link to="/features" className={styles.navLink} onClick={toggleMenu}>Features</Link>
        {user ? (
          <>
            <Link to="/dashboard" className={styles.navLink} onClick={toggleMenu}>Dashboard</Link>
            <button onClick={handleLogout} className={styles.navLink}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.navLink} onClick={toggleMenu}>Login</Link>
            <Link to="/signup" className={styles.navLink} onClick={toggleMenu}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;