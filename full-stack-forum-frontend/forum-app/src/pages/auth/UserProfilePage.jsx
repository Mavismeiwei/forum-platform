import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserProfilePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Extract verified status from JWT
  const token = localStorage.getItem("token");
  let isVerified = false;
  let userId = null;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.user_id;
      isVerified = decodedToken.verified;
    } catch (err) {
      console.error("Failed to decode JWT:", err);
    }
  }

  useEffect(() => {
    if (!token) {
      setError("No token found, please log in.");
      setLoading(false);
      return;
    }

    if (!userId) {
      setError("Invalid token. Please log in again.");
      setLoading(false);
      return;
    }

    fetchUserProfile(userId);
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5009/users/${userId}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserProfile(response.data.user);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load profile.");
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      await axios.put(
        `http://127.0.0.1:5009/users/${userId}/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Profile image updated successfully!");
      setUploading(false);
      fetchUserProfile(userId);
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert("Failed to update profile image.");
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-600">Loading profile...</div>
    );
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-16 p-8 bg-white shadow-md rounded-xl">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6 font-lato">
        User Profile
      </h2>

      <div className="flex flex-col items-center">
        {/* Profile Image */}
        <div className="relative">
          <img
            src={userProfile?.profileImageURL || "/default-profile.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 shadow-md hover:shadow-lg transition"
          />
        </div>

        <h3 className="mt-4 text-xl font-semibold text-gray-900">
          {userProfile?.firstName} {userProfile?.lastName}
        </h3>
        <p className="text-gray-500">{userProfile?.email}</p>
        <p className="text-sm text-gray-400">
          Joined on {userProfile?.dateJoined}
        </p>

        {/* Role Badge */}
        <span className="mt-2 px-4 py-1 bg-blue-600 text-white text-sm rounded-lg shadow">
          {userProfile?.type?.toUpperCase()}
        </span>

        {/* Profile Image Upload */}
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
          />
          <label
            htmlFor="fileUpload"
            className="cursor-pointer px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Choose New Profile Image
          </label>

          {selectedFile && (
            <button
              onClick={handleUpload}
              className="ml-3 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 shadow-md"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          )}
        </div>

        {/* Display Verified or Verify Email Button */}
        {isVerified ? (
          <span className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md shadow-md">
            Email Already Verified
          </span>
        ) : (
          <button
            onClick={() =>
              navigate("/verify-email", {
                state: { email: userProfile?.email },
              })
            }
            className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 shadow-md transition"
          >
            Verify Email
          </button>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => navigate("/top-posts")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-md"
          >
            View Top Posts
          </button>

          <button
            onClick={() => navigate("/drafts")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-md"
          >
            View Drafts
          </button>

          <button
            onClick={() => navigate("/history")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-md"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
