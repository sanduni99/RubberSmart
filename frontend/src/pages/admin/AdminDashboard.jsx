import React, { useState } from "react";
import styles from "./AdminDashboard.module.css";
import { FaUsers, FaChartLine, FaDollarSign, FaEnvelope } from "react-icons/fa";
import axios from "axios";


const AdminDashboard = () => {
    const [subject, setSubject] = useState("");
const [message, setMessage] = useState("");

const sendEmail = async () => {
  try {

    const res = await axios.post(
      "http://127.0.0.1:8000/admin/send-email",
      {
        subject,
        message
      }
    );

    alert(`Emails sent to ${res.data.stats.success} users`);

    setSubject("");
    setMessage("");

  } catch (error) {
    alert("Failed to send email");
  }
};

  return (
   <div>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <div className={styles.cardGrid}>

        <div className={styles.card}>
          <FaUsers className={styles.icon}/>
          <h3>Total Farmers</h3>
          <p>120</p>
        </div>

        <div className={styles.card}>
          <FaChartLine className={styles.icon}/>
          <h3>Production Records</h3>
          <p>350</p>
        </div>

        <div className={styles.card}>
          <FaDollarSign className={styles.icon}/>
          <h3>Rubber Prices</h3>
          <p>45</p>
        </div>

        <div className={styles.card}>
          <FaEnvelope className={styles.icon}/>
          <h3>Messages</h3>
          <p>18</p>
        </div>

      </div>

      <div className={styles.infoBox}>
  <h2>System Overview</h2>
  <p>
    Manage farmers, production data, rubber prices and user messages from the RubberSmart Admin Dashboard.
  </p>
</div>

<div className={styles.emailBox}>
  <h2>Send Email to All Users</h2>

  <input
    type="text"
    placeholder="Email Subject"
    value={subject}
    onChange={(e) => setSubject(e.target.value)}
    className={styles.input}
  />

  <textarea
    placeholder="Email Message"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    className={styles.textarea}
  />

  <button onClick={sendEmail} className={styles.sendButton}>
    Send Email
  </button>
</div>
    </div>
  );
};

export default AdminDashboard;