import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { role } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found.");

        const response = await fetch("http://127.0.0.1:5009/admin/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
        } else {
          setError(data.error || "Failed to fetch users.");
        }
      } catch (error) {
        console.error("Error loading users:", error);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleBanUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      const response = await fetch(
        `http://127.0.0.1:5009/admin/users/${userId}/update-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ active: false }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.userId === userId ? { ...user, active: !user.active } : user
          )
        );
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error banning user:", error);
      alert("Failed to update user status.");
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found.");

      const response = await fetch(
        `http://127.0.0.1:5009/admin/users/${userId}/promote`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.userId === userId ? { ...user, type: "admin" } : user
          )
        );
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error promoting user:", error);
      alert("Failed to promote user.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="font-playfair text-3xl text-blue-600 mb-4">
        User Management
      </h2>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="border p-2">User ID</th>
              <th className="border p-2">Full Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Joined Date</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId} className="text-center">
                <td className="border p-2">{user.userId}</td>
                <td className="border p-2">
                  {user.firstName} {user.lastName}
                </td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.type}</td>
                <td
                  className={`border p-2 ${
                    user.active ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user.active ? "Active" : "Banned"}
                </td>
                <td className="border p-2">
                  {new Date(user.dateJoined).toLocaleDateString()}
                </td>
                <td className="border p-2 flex justify-center gap-2">
                  {user.type !== "super_admin" && (
                    <>
                      {(user.type !== "admin" || role === "super_admin") && (
                        <>
                          {user.active ? (
                            <button
                              onClick={() => handleBanUser(user.userId)}
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(user.userId)}
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                            >
                              Unban
                            </button>
                          )}
                        </>
                      )}

                      {user.type === "user" &&
                        user.active &&
                        role === "super_admin" && (
                          <button
                            onClick={() => handlePromoteUser(user.userId)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                          >
                            Promote to Admin
                          </button>
                        )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagementPage;
