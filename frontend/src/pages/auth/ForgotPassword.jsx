import { useState } from "react";

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
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Send Reset Link</button>
    </form>
  );
};

export default ForgotPassword;