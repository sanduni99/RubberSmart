
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';
import styles from './signup.module.css';
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Signup = () => {
  const { t, i18n } = useTranslation("signup");
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');


  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  try {
    const data = await authApi.signup({
      name,
      email,
      password,
      district,
      phone,
      preferred_language: preferredLanguage
    });

    login(data.access_token, data.user);
    navigate('/dashboard');

  } catch (err) {
    setError(err.message || "Signup failed");
  }
};


  const handleClose = () => {
    navigate("/");
  };
  return (
    <div className={styles.signupContainer}>
      <div className={styles.overlay}></div>
      <div className={styles.formWrapper}>
        <button
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "green",
            border: "none",
            fontSize: "22px",
            width: "40px",
            height: "49px",
            borderRadius: "10%",
            color: "white",
            cursor: "pointer"
          }}
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
            <h1>{t("register")}</h1>
            <select
              value={preferredLanguage}
              onChange={(e) => {
                const lang = e.target.value;

                setPreferredLanguage(lang);
                i18n.changeLanguage(lang);
              }}
              required
            >
              <option value="en">English</option>
              <option value="si">Sinhala</option>
              <option value="ta">Tamil</option>
            </select>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("fullname")}
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email")}
                required
              />
              <input
                type="District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder={t("district")}
                required
              />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phone")}
                required
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password")}
                required
              />
              <button type="submit">{t("createAccount")}</button>
              <div className={styles.loginPrompt}>
                <span>{t("alreadyAccount")} </span>
                <a href="/login">{t("login")}</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
