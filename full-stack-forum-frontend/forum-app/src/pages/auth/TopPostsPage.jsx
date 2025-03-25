import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const TopPostsPage = () => {
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const userId = jwtDecode(localStorage.getItem("token")).user_id;
        const response = await axios.get(`http://127.0.0.1:5009/posts/${userId}/top-posts`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        // Ensure correct response structure and extract the `post` field
        const posts = response.data.posts?.map((item) => item.post) || [];
        setTopPosts(posts);
      } catch (err) {
        console.error("Failed to fetch top posts:", err);
        setError("Failed to load top posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopPosts();
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-600">Loading top posts...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-20 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-gray-700 text-center mb-6">🔥 Top 3 Posts</h2>

      {topPosts.length > 0 ? (
        <div className="space-y-4">
          {topPosts.map((post) => (
            <div 
              key={post.id} 
              className="p-4 border border-gray-200 rounded-lg shadow hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/post/${post.id}`)}
            >
              <h3 className="text-xl font-semibold text-blue-600 hover:underline">
                {post.title}
              </h3>
              <p className="text-gray-500 text-sm mt-1">🕒 {new Date(post.dateCreated).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-4">No top posts available.</p>
      )}
    </div>
  );
};

export default TopPostsPage;