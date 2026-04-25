import { useState } from "react";
import styles from "./ResetPassword.module.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,        
        new_password: password
      })
    });

    if (res.ok) {
      alert("Password reset successful");
      navigate("/login");
    }
  };

  return (
    <div className={styles.resetContainer}>
  <div className={styles.resetCard}>
    <h2 className={styles.title}>Reset Password</h2>

    <p className={styles.subtitle}>
      Enter your new password below.
    </p>

    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
        className={styles.input}
      />

      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setPassword(e.target.value)}
        required
        className={styles.input}
      />

      <button type="submit" className={styles.button}>
        Reset Password
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

export default ResetPassword;