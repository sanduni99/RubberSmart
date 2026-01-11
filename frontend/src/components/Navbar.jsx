import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
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
          <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link to="/yield-prediction" className={styles.navLink}>Yield Prediction</Link>
          <Link to="/price-intelligence" className={styles.navLink}>Price Intelligence</Link>
        </div>

        {/* Buttons */}
        <div className={styles.buttons}>
          <button className={styles.loginBtn}>Login</button>
          <button className={styles.signupBtn}>Sign Up</button>
        </div>

        {/* Hamburger for mobile */}
        <div className={styles.hamburger} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? 'active' : ''}`}>
        <Link to="/" className={styles.navLink} onClick={toggleMenu}>Home</Link>
        <Link to="/dashboard" className={styles.navLink} onClick={toggleMenu}>Dashboard</Link>
        <Link to="/yield-prediction" className={styles.navLink} onClick={toggleMenu}>Yield Prediction</Link>
        <Link to="/price-intelligence" className={styles.navLink} onClick={toggleMenu}>Price Intelligence</Link>
      </div>
    </nav>
  );
};

export default Navbar;
