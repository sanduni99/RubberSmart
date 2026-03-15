import { useState } from "react";
import styles from "./ForgotPassword.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:8000/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });
  };

  return (
    <div className={styles.forgotContainer}>
  <div className={styles.forgotCard}>
    <h2 className={styles.title}>Forgot Password</h2>

    <p className={styles.subtitle}>
      Enter your email and we will send you a password reset link.
    </p>

    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="email"
        placeholder="Enter your email address"
        onChange={(e) => setEmail(e.target.value)}
        required
        className={styles.input}
      />

      <button type="submit" className={styles.button}>
        Send Reset Link
      </button>
    </form>

    <div className={styles.signupPrompt}>
      <span>Remember your password? </span>
      <a href="/login">Back to Login</a>
    </div>
  </div>
</div>
  );
};

export default ForgotPassword;