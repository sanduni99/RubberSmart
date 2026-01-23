// src/pages/auth/Signup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';
import styles from './signup.module.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await authApi.signup({ name, email, password });
      loginUser(response.access_token);

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Signup failed");
    }
  };

  return (
    <div className={styles.signupContainer}>
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
          <h1>Register</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="District"
              value={email}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="District"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button type="submit">Create Account</button>
            <div className={styles.loginPrompt}>
              <span>Already have an account? </span>
              <a href="/login">Login</a>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
