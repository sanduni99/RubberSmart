// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Navbar.module.css';
import { useTranslation } from "react-i18next";
import LanguageDropdown from "../components/LanguageDropdown";

const Navbar = () => {
   const { t } = useTranslation("navbar")
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          <img src="/assets/images/vector_images/logo_1.png" alt="logo" />
        </Link>

        {/* Desktop links */}
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>{t("home")}</Link>
          <Link to="/about" className={styles.navLink}>{t("about")}</Link>
          <Link to="/features" className={styles.navLink}>{t("features")}</Link>
          <Link to="/tapping" className={styles.navLink}>{t("tapping")}</Link>
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
               {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className={styles.loginBtn}>{t("login")}</button>
              </Link>
              <Link to="/signup">
                <button className={styles.signupBtn}>{t("signup")}</button>
              </Link>
            </>
          )}
        </div>
        <div className={styles.topRight}>
          <LanguageDropdown />
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