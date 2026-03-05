// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';
import styles from './login.module.css';
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Login = () => {
   const { t, i18n } = useTranslation("login");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);


const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  try {
    const data = await authApi.login({ email, password });

    login(data.access_token, data.user);

    navigate("/dashboard");

  } catch (err) {
    setError(err.message || "Login failed");
  }
};


  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.overlay}></div>

      <div className={styles.formWrapper}>
        <button
          style={{ position: "absolute", 
            top: "20px", 
            right: "20px", 
            background: "green", 
            border: "none", 
            fontSize: "22px", 
            width: "40px", 
            height: "49px", 
            borderRadius: "10%", 
            color: "white", 
            cursor: "pointer" }}
          onClick={handleClose}
          type="button"
        >
          <FaTimes />
        </button>
        <div className={styles.leftPanel}>
          <img src="/assets/images/login_image.png" alt="RubberSmart Logo" className={styles.logo} />
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.formlogo}>
            <img src="/assets/images/vector_images/logo_1.png" alt="RubberSmart Logo" />
          </div>
          <div className={styles.formContainer}>
            <h1>{t("login")}</h1>
            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email")}
                required
              />
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("password")}
                  required
                />
                <span
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button type="submit">{t("login")}</button>
              <div className={styles.signupPrompt}>
                <span>{t("dont_have_account")}</span>
                <a href="/signup">{t("signup")}</a>
                <p className={styles.forgotPassword}><a href="/forgot-password">{t("forgot_password")}</a></p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className={styles.footerInfo}>
        <p>Start Maximizing you Rubber farm Profit with RubberSmart Today.</p>
      </div>
    </div>
  );
};

export default Login;
