import React, { useState, useEffect  } from "react";
import { useAuth } from "../../contexts/AuthContext"

const Profile = () => {
  const { user, setUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    district: user?.district || "",
    preferred_language: user?.preferred_language || ""
  });

  useEffect(() => {
  if (user) {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      district: user.district || "",
      preferred_language: user.preferred_language || ""
    });
  }
}, [user]);

    const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
       const handleSave = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/auth/update-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_email: user.email,
        new_email: user.email,
        name: formData.name,
        phone: formData.phone,
        district: formData.district,
        preferred_language: formData.preferred_language
      }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.detail || "Failed to update");

    setUser(data.user);

    setIsEditing(false);
    alert("Profile updated!");

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};
    return (
  <div className="container mt-5 d-flex justify-content-center">
  <div className="p-4 shadow-lg card" style={{ maxWidth: "700px", width: "100%", borderRadius: "15px" }}>
    
    <h3 className="mb-4 text-center">👤 My Profile</h3>

    <div className="row">


      <div className="mb-3 col-md-6">
        <label className="form-label fw-bold">Name</label>
        {isEditing ? (
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
          />
        ) : (
          <div className="form-control bg-light">{user?.name}</div>
        )}
      </div>


      <div className="mb-3 col-md-6">
        <label className="form-label fw-bold">Email</label>
        <div className="form-control bg-light">{user?.email}</div>
      </div>


      <div className="mb-3 col-md-6">
        <label className="form-label fw-bold">Phone</label>
        {isEditing ? (
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-control"
          />
        ) : (
          <div className="form-control bg-light">{user?.phone}</div>
        )}
      </div>


      <div className="mb-3 col-md-6">
        <label className="form-label fw-bold">District</label>
        {isEditing ? (
          <input
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="form-control"
          />
        ) : (
          <div className="form-control bg-light">{user?.district}</div>
        )}
      </div>


      <div className="mb-3 col-md-12">
        <label className="form-label fw-bold">Preferred Language</label>
        {isEditing ? (
          <input
            name="preferred_language"
            value={formData.preferred_language}
            onChange={handleChange}
            className="form-control"
          />
        ) : (
          <div className="form-control bg-light">{user?.preferred_language}</div>
        )}
      </div>

    </div>


    <div className="mt-4 text-center">
      {isEditing ? (
        <>
          <button onClick={handleSave} className="px-4 btn btn-success me-2">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="px-4 btn btn-outline-secondary">
            Cancel
          </button>
        </>
      ) : (
        <button onClick={() => setIsEditing(true)} className="px-4 btn btn-primary">
           Edit Profile
        </button>
      )}
    </div>

  </div>
</div>
);
}

export default Profile