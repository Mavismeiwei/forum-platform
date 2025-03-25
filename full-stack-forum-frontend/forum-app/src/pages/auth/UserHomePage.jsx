import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../../redux/slices/postSlice.js";
import { fetchUser } from "../../redux/slices/userSlice.js";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const UserHomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get data from Redux
  const { posts, loading, error } = useSelector((state) => state.posts);
  const users = useSelector((state) => state.user?.users || {});
  const userError = useSelector((state) => state.user?.error);
  const role = useSelector((state) => state.auth.role);
  const isAdmin = role === "admin"; // Check if user is admin

  // States for sorting and filtering
  const [sortByDate, setSortByDate] = useState(true);
  const [titleFilter, setTitleFilter] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [sortedPosts, setSortedPosts] = useState([]);
  const [filterType, setFilterType] = useState("published"); // "published", "banned", "deleted"

  useEffect(() => {
    dispatch(fetchPosts())
      .unwrap()
      .then((posts) => {
        const uniqueUserIds = [
          ...new Set(posts.map((post) => post.post.userId)),
        ];
        uniqueUserIds.forEach((userId) => {
          if (userId) dispatch(fetchUser(userId));
        });
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }, [dispatch]);

  useEffect(() => {
    let sorted = [...posts];

    // Sort by date
    if (sortByDate) {
      sorted = sorted.sort(
        (a, b) => new Date(b.post.dateCreated) - new Date(a.post.dateCreated)
      );
    } else {
      sorted = sorted.sort(
        (a, b) => new Date(a.post.dateCreated) - new Date(b.post.dateCreated)
      );
    }

    setSortedPosts(sorted);
  }, [posts, sortByDate]);

  // Filter posts by title, creator, and status
  const filteredPosts = sortedPosts.filter((post) => {
    const titleMatch = post.post.title
      .toLowerCase()
      .includes(titleFilter.toLowerCase());
    const creatorMatch = creatorFilter
      ? post.post.userId == creatorFilter
      : true;

    // Status-based filtering
    const statusMatch =
      filterType === "published"
        ? post.post.status === "Published"
        : filterType === "banned"
        ? post.post.status === "Banned"
        : filterType === "deleted"
        ? post.post.status === "Deleted"
        : true; // Default case (should never hit)

    return titleMatch && creatorMatch && statusMatch;
  });

  // Unique creators for dropdown
  const uniqueCreators = [...new Set(posts.map((post) => post.post.userId))];

  // Handle post click and store in history
  const handlePostClick = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found.");

      await axios.post(
        "http://127.0.0.1:5009/history/",
        { postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`✅ History saved for post ${postId}`);
      navigate(`/post/${postId}`);
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  };

  // Handle Ban/Unban/Recover actions
  const handlePostAction = async (postId, action, userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found.");
      return;
    }

    const status =
      action === "ban"
        ? "Banned"
        : action === "unban"
        ? "Published"
        : action === "recover"
        ? "Published"
        : null;

    if (!status) {
      console.error("Invalid action");
      return;
    }

    try {
      await axios.put(
        `http://127.0.0.1:5009/posts/${postId}/status`,
        {
          userId, // Passed userId
          status, // Set status based on action
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(`✅ Post ${postId} ${action}ed successfully`);
      dispatch(fetchPosts()); // Refresh post list after action
    } catch (error) {
      console.error(`Failed to ${action} post:`, error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 mt-16">
      <h1 className="text-3xl font-bold mb-4 font-lato">
        {isAdmin ? "Admin Dashboard" : "Published Posts"}
      </h1>

      <div className="flex flex-wrap gap-4 mb-4">
        {isAdmin && (
          <>
            <button
              className={`px-4 py-2 rounded ${
                filterType === "published"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setFilterType("published")}
            >
              Published Posts
            </button>
            <button
              className={`px-4 py-2 rounded ${
                filterType === "banned"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setFilterType("banned")}
            >
              Banned Posts
            </button>
            <button
              className={`px-4 py-2 rounded ${
                filterType === "deleted"
                  ? "bg-red-500 text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setFilterType("deleted")}
            >
              Deleted Posts
            </button>
          </>
        )}
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={() => setSortByDate(!sortByDate)}
        >
          Sort by Date {sortByDate ? "↓" : "↑"}
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded"
          onClick={() => {
            setTitleFilter("");
            setCreatorFilter("");
            setFilterType("published");
          }}
        >
          Reset Filters
        </button>
      </div>

      <input
        type="text"
        placeholder="Filter by title..."
        className="border p-2 mb-4 w-full max-w-md"
        value={titleFilter}
        onChange={(e) => setTitleFilter(e.target.value)}
      />

      <select
        className="border p-2 mb-4 w-full max-w-md"
        value={creatorFilter}
        onChange={(e) => setCreatorFilter(e.target.value)}
      >
        <option value="">Filter by Creator</option>
        {uniqueCreators.map((userId) => (
          <option key={userId} value={userId}>
            {users[userId]?.firstName || "Unknown"}{" "}
            {users[userId]?.lastName || ""}
          </option>
        ))}
      </select>

      <Link
        to="/create-post"
        className="px-4 py-2 bg-green-500 text-white rounded mb-4 flex items-center gap-2"
      >
        <i className="fa-solid fa-plus"></i> Create New Post
      </Link>

      {loading && <p>Loading posts...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {userError && (
        <p className="text-red-500">User fetch error: {userError}</p>
      )}

      <div className="flex flex-col w-full max-w-3xl">
        {filteredPosts.length === 0 ? (
          <p className="text-gray-600 text-center">No posts found.</p>
        ) : (
          filteredPosts.map((post) => {
            const user = users[post.post.userId] || {
              firstName: "Loading...",
              lastName: "",
            };
            return (
              <div
                key={post.post.id}
                className="p-4 border mb-2 rounded shadow-md bg-white flex justify-between items-center"
              >
                <div
                  onClick={() => handlePostClick(post.post.id)}
                  className="cursor-pointer"
                >
                  <h2 className="text-lg font-semibold text-blue-700">
                    {post.post.title}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {new Date(post.post.dateCreated).toLocaleString()}
                  </p>
                  <p className="text-gray-800 font-medium">
                    <strong>Author:</strong> {user.firstName} {user.lastName}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    className={`px-4 py-2 text-white rounded ${
                      post.post.status === "Banned"
                        ? "bg-green-500"
                        : post.post.status === "Deleted"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    onClick={() =>
                      handlePostAction(
                        post.post.id,
                        post.post.status === "Banned"
                          ? "unban"
                          : post.post.status === "Deleted"
                          ? "recover"
                          : "ban", // Change action based on status
                        post.post.userId
                      )
                    }
                  >
                    {post.post.status === "Banned"
                      ? "Unban"
                      : post.post.status === "Deleted"
                      ? "Recover"
                      : "Ban"}{" "}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserHomePage;
