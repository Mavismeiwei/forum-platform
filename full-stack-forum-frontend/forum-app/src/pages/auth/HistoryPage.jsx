import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No token found, please log in.");
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user_id;

      if (!userId) {
        throw new Error("Invalid token: user_id is missing.");
      }

      fetchHistory();
    } catch (err) {
      console.error("Failed to decode JWT:", err);
      setError("Invalid token. Please log in again.");
      setLoading(false);
    }
  }, []);

  // Fetch user history
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:5009/history/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.history) {
        setHistory(response.data.history);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Failed to load history.");
      setLoading(false);
    }
  };

  // Delete history entry
  const handleDelete = async (historyId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:5009/history/${historyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the UI after deletion
      setHistory((prevHistory) =>
        prevHistory.filter((entry) => entry.historyId !== historyId)
      );
    } catch (err) {
      console.error("Failed to delete history entry:", err);
      alert("Failed to delete history entry.");
    }
  };

  // Navigate to Post Detail Page when clicking a post title
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-600">Loading history...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-24 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-semibold text-gray-700 text-center">View History</h2>

      {history.length === 0 ? (
        <p className="text-center text-gray-500 mt-6">No history records found.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {history.map((entry) => (
            <li key={entry.historyId} className="bg-gray-100 p-4 rounded-md flex justify-between items-center">
              <div>
                <p 
                  className="text-gray-800 cursor-pointer hover:text-blue-500 font-medium"
                  onClick={() => handlePostClick(entry.postId)}
                >
                  {entry.title}  {/* Display Post Title Instead of Post ID */}
                </p>
                <p className="text-sm text-gray-500">Viewed on: {entry.viewDate}</p>
              </div>
              <button
                onClick={() => handleDelete(entry.historyId)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPage;
