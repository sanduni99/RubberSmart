import { useState } from "react";

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
        email: email,        // or from token
        new_password: password
      })
    });

    if (res.ok) {
      alert("Password reset successful");
      navigate("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Reset Password</button>
    </form>
  );
};

export default ResetPassword;