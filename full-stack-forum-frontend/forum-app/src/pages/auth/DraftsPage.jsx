import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const DraftsPage = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const userId = jwtDecode(localStorage.getItem("token")).user_id;
        const response = await axios.get(`http://127.0.0.1:5009/posts/${userId}/drafts`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        // Ensure correct response structure and extract the `post` field
        const draftsData = response.data.drafts?.map((item) => item.post) || [];
        setDrafts(draftsData);
      } catch (err) {
        console.error("Failed to fetch drafts:", err);
        setError("Failed to load drafts.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-600">Loading drafts...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

return (
  <div className="max-w-4xl mx-auto mt-20 p-6 bg-white shadow-lg rounded-lg">
    <h2 className="text-3xl font-bold text-gray-700 text-center mb-6">📝 Your Drafts</h2>

    {drafts.length > 0 ? (
      <div className="space-y-4">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="p-4 border border-gray-200 rounded-lg shadow hover:shadow-md transition cursor-pointer"
            onClick={() =>
              navigate(draft.status === "Unpublished" ? `/edit-post/${draft.id}` : `/post/${draft.id}`)
            } 
          >
            <h3 className="text-xl font-semibold text-blue-600">{draft.title}</h3>
            <p className="text-gray-500 text-sm mt-1">🕒 {new Date(draft.dateCreated).toLocaleDateString()}</p>
            <p
              className={`text-xs font-bold uppercase mt-1 ${
                draft.status === "Unpublished" ? "text-red-500" : "text-green-500"
              }`}
            >
              {draft.status}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-center mt-4">No drafts available.</p>
    )}
  </div>
);
};

export default DraftsPage;