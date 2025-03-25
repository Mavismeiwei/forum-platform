import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { logout } from "../redux/slices/authSlice";

const GlobalNavBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ Get user & token from Redux store
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);

  // ✅ Track user data for display
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    if (!token) {
      console.log("❌ No token found, user not logged in.");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      console.log("Decoded JWT:", decodedToken);

      if (!decodedToken.email) {
        console.warn("⚠️ No email found in JWT payload!");
      }

      setUserData({
        email: decodedToken.email,
        role: decodedToken.role || "user",
        verified: user?.verified || false,
      });

      console.log("🔹 Set userData:", {
        email: decodedToken.email,
        role: decodedToken.role || "user",
        verified: user?.verified || false,
      });
    } catch (error) {
      console.error("❌ Failed to decode JWT:", error);
      localStorage.removeItem("token");
    }
  }, [token, user]); // ✅ Re-run when token or user changes (for real-time updates)

  const handleLogout = () => {
    dispatch(logout());
    navigate("/users/login");
  };

  const normalUserNav = [
    { path: "/home", label: "Home" },
    { path: "/create-post", label: "Create New Post" },
    { path: "/user-posts", label: "My Posts" },
    { path: "/history", label: "History Management" },
    { path: "/profile", label: "User Profile" },
    { path: "/contactus", label: "Contact Us" },
  ];

  const adminNav = [
    { path: "/home", label: "Home" },
    { path: "/user-posts", label: "My Posts" },
    { path: "/user-management", label: "User Management" },
    { path: "/messages", label: "Messages Management" },
    { path: "/profile", label: "User Profile" },
  ];

  const superAdminNav = [
    { path: "/home", label: "Home" },
    { path: "/user-posts", label: "My Posts" },
    { path: "/user-management", label: "User Management" },
    { path: "/messages", label: "Messages Management" },
    { path: "/profile", label: "User Profile" },
  ];

  let navItems = normalUserNav;
  if (userData?.role === "admin") {
    navItems = adminNav;
  } else if (userData?.role === "super_admin") {
    navItems = superAdminNav;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-indigo-600 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/home"
          className="text-3xl font-semibold hover:text-indigo-300 transition duration-200"
        >
          Forum
        </Link>

        <ul className="flex space-x-6">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="hover:text-indigo-300 transition duration-200"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center space-x-5">
          <span className="text-sm font-medium">
            {userData?.email} ({userData?.role}) -
            {userData?.verified ? (
              <span className="text-green-400"> Verified ✅</span>
            ) : (
              <span className="text-red-400"> Not Verified ❌</span>
            )}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavBar;
