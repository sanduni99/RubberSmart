// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';
import styles from './login.module.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await authApi.login({ email, password });
      loginUser(response.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.overlay}></div>

      <div className={styles.formWrapper}>
        <div className={styles.leftPanel}>
          <img src="/assets/images/login_image.png" alt="RubberSmart Logo" className={styles.logo} />
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.formlogo}>
            <img src="/assets/images/vector_images/logo_1.png" alt="RubberSmart Logo" />
          </div>
          <div className={styles.formContainer}>
          <h1>Login</h1>
          {error && <p className={styles.error}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Please enter your email"
              required
            />
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <span
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit">Login</button>
            <div className={styles.signupPrompt}>
              <span>Don't have an account? </span>
              <a href="/signup">Sign Up</a>
              <p className={styles.forgotPassword}><a href="/forgot-password">Forgot Password?</a></p>
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
