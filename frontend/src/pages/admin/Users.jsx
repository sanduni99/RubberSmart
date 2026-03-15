import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Users.module.css";

const Users = () => {

  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

const fetchUsers = async () => {
  try {

    const res = await fetch("http://localhost:8000/admin/users");

    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await res.json();

    setUsers(data);

  } catch (error) {
    console.error(error);
  }
};

//   const editUser = (id)=>{
//    navigate(`/admin/users/edit/${id}`)
// }

const deleteUser = async(id)=>{

  await fetch(`http://localhost:8000/admin/users/${id}`,{
     method:"DELETE"
  })

  fetchUsers()
}

const changeRole = async(id, role)=>{

 await fetch(`http://localhost:8000/admin/users/${id}/role?role=${role}`,{
   method:"PUT"
 })

 fetchUsers()
}

  return (
   <div className={styles.usersContainer}>

  <div className={styles.header}>
    <h2 className={styles.title}>Registered Users</h2>

    <button
      onClick={() => navigate("/admin/dashboard")}
      className={styles.backButton}
    >
      ← Admin Dashboard
    </button>
  </div>

  <div className={styles.tableWrapper}>

    <table className={styles.table}>
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Email</th>
      <th>Phone</th>
      <th>District</th>
      <th>Language</th>
      <th>Role</th>
      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
    {users.map((u) => (
      <tr key={u.id}>
        <td>{u.id}</td>
        <td>{u.name}</td>
        <td>{u.email}</td>
        <td>{u.phone}</td>
        <td>{u.district}</td>
        <td>{u.language}</td>

        <td>
          <span className={u.role === "admin" ? styles.roleAdmin : styles.roleFarmer}>
            {u.role}
          </span>
        </td>

        <td className={styles.actions}>

  {/* <button
    className={styles.editBtn}
    onClick={() => editUser(u.id)}
  >
    Edit
  </button> */}

  <button
    className={styles.deleteBtn}
    onClick={() => deleteUser(u.id)}
  >
    Delete
  </button>

  <select
    className={styles.roleSelect}
    value={u.role}
    onChange={(e)=>changeRole(u.id,e.target.value)}
  >
    <option value="farmer">Farmer</option>
    <option value="admin">Admin</option>
  </select>

</td>
      </tr>
    ))}
  </tbody>
</table>

  </div>

</div>
  );
};

export default Users;