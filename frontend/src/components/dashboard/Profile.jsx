import React from "react"
import { useAuth } from "../../contexts/AuthContext"

const Profile = () => {
    const { user } = useAuth()
    return (
        <div className="container mt-4">
      <h2>My Profile</h2>

      <div className="p-4 mt-3 card">
        <div className="mb-3">
          <strong>Name:</strong>
          <div>{user?.name || "Not Available"}</div>
        </div>

        <div className="mb-3">
          <strong>Email:</strong>
          <div>{user?.email || "Not Available"}</div>
        </div>

        <div className="mb-3">
          <strong>Phone:</strong>
          <div>{user?.phone || "Not Available"}</div>
        </div>

        <div className="mb-3">
          <strong>District:</strong>
          <div>{user?.district || "Not Available"}</div>
        </div>

        <div className="mb-3">
          <strong>Preferred Language:</strong>
          <div>{user?.preferred_language || "Not Available"}</div>
        </div>
      </div>
    </div>
  )
}

export default Profile