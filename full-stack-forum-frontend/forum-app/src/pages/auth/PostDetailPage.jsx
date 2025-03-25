import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUser } from "../../redux/slices/userSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { FiDownload } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [post, setPost] = useState(null);
  const user = useSelector((state) => state.user?.users[post?.userId] || {});
  const [replies, setReplies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newReply, setNewReply] = useState(""); // To handle new reply input
  const [replyLoading, setReplyLoading] = useState(false);

  // resolve images and attachments into array
  // const images = post?.images && typeof post.images === "string"
  // ? post.images.split(",").map(img => img.trim())
  // : [];
  const images = post?.images ? post.images.split(",").map(img => img.trim()) : [];
  const attachments = post?.attachments ? post.attachments.split(",").map(file => file.trim()) : [];

  const fetchReplies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5003/replies/post/${postId}`
      );
      let newReplies = Array.isArray(response.data)
        ? response.data.filter((reply) => reply.reply.isActive)
        : [];

      // Fetch user data for each reply and attach to reply object
      const enrichedReplies = await Promise.all(
        newReplies.map(async (reply) => {
          try {
            const userResponse = await axios.get(
              `http://127.0.0.1:5009/users/${reply.reply.userId}/profile`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            const userName = `${userResponse.data.user.firstName} ${userResponse.data.user.lastName}`;
            const userProfileImageURL = userResponse.data.user.profileImageURL;
            return {
              ...reply,
              userName,
              userProfileImageURL,
            };
          } catch (userErr) {
            console.error(
              `Failed to fetch user for reply ${reply.id}:`,
              userErr
            );
            return { ...reply, userName: "Unknown User" };
          }
        })
      );

      setReplies(enrichedReplies);
    } catch (err) {
      console.error("Error fetching replies:", err);
      setError("Error fetching replies. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5009/posts/${postId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const new_post = response.data.post;
        console.log("Fetched post:", response.data.post);
        setPost(response.data.post);

        if (new_post && new_post?.userId) {
          dispatch(fetchUser(new_post?.userId))
            .unwrap()
            .catch((err) => console.error("Failed to fetch user:", err));
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Error fetching post. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    fetchReplies();
  }, [postId]);

  const handleReplyChange = (e) => {
    setNewReply(e.target.value);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return; // Don't submit if reply is empty

    setReplyLoading(true);
    try {
      const response = await axios.post(
        `http://127.0.0.1:5009/replies/post/${postId}`,
        {
          comment: newReply,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setReplies((prevReplies) => {
        const currentReplies = Array.isArray(prevReplies) ? prevReplies : [];
        return [response.data.reply, ...currentReplies]; // Add the new reply to the front
      });
      setNewReply(""); // Reset reply input after successful submission

      fetchReplies();
    } catch (err) {
      console.error("Error posting reply:", err);
      setError("Error posting reply. Please try again later.");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;

    try {
      await axios.put(
        `http://127.0.0.1:5009/replies/delete/${replyId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setReplies((prevReplies) =>
        prevReplies.filter((reply) => reply.reply.replyId !== replyId)
      );
    } catch (err) {
      console.error("Error deleting reply:", err);
      setError("Error deleting reply. Please try again later.");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading post...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!post) return <div className="text-center mt-10">Post not found.</div>;

  //Check Post statuses
  const isPostUnpublished = post.status === "Unpublished";
  const isPostDeleted = post.status === "Deleted";
  const isPostHidden = post.status === "Hidden";
  const isPostBanned = post.status === "Banned";

  //Check if user is verified (in order to reply to posts)
  let verified = false;
  try {
    const token = localStorage.getItem("token");
    if (token) {
      verified = jwtDecode(token).verified;
    }
  } catch (error) {
    console.error("Invalid or expired token:", error);
    localStorage.removeItem("token");
  }

  const default_image =
    "https://fa-forum-user-profile-bucket.s3.us-east-1.amazonaws.com/profile_images/default_user.png";

  return (
    <>
      <div className="flex flex-col items-center mt-16 p-8">
        <div className="w-full max-w-3xl bg-white shadow-2xl rounded-xl p-8 border-2 border-gray-200">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Title: {post.title}
          </h2>

          {/* Author Info */}
          <div className="flex items-center gap-4 mb-6 border-b pb-4">
            <img
              src={user.profileImageURL || default_image}
              alt="Author"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 shadow-lg"
            />
            <p className="text-gray-700 font-medium text-lg">
              Author: {user.firstName} {user.lastName}
            </p>
          </div>

          {/* Post Details */}
          <p className="text-gray-500 text-sm mb-4">
            Created on: {post.dateCreated}
          </p>
          <p className="text-gray-600 mb-4">
            <span className="font-semibold">Status:</span> {post.status}
          </p>

          {/* Post Content */}
          <div className="prose max-w-none text-gray-800 mb-6">
            Content: {post.content}
          </div>

          {/* Post Image */}
          {images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 max-h-[300px] object-contain"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Post Attachments */}
            {attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Attachments</h3>
                <ul className="space-y-2">
                  {attachments.map((fileUrl, index) => {
                    try {
                      const fileName = new URL(fileUrl).pathname.split("/").pop();
                      return (
                        <li key={index} className="flex items-center gap-2 text-blue-600 hover:underline">
                          <FiDownload className="text-xl" />
                          <a href={fileUrl.trim()} download target="_blank" rel="noopener noreferrer">
                            {fileName}
                          </a>
                        </li>
                      );
                    } catch (error) {
                      console.error("Invalid file URL:", error);
                      return null;
                    }
                  })}
                </ul>
              </div>
            )}


          {/* Replies Section with Scroll */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              Replies
            </h3>
            <div className="max-h-[400px] overflow-y-auto border p-4 rounded-lg bg-gray-50 shadow-inner">
              {replies && replies.length > 0 ? (
                replies.map((reply) => (
                  <div key={reply.reply.replyId} className="border-b pb-4 mb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={reply.userProfileImageURL || default_image}
                        alt="Author"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 shadow-lg"
                      />
                      <p className="text-gray-700 font-medium text-lg">
                        {reply.userName}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-700">
                      Reply: {reply.reply.comment}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Posted on: {reply.reply.dateCreated}
                    </p>

                    {/* Delete Button for Reply Author */}
                    {JSON.parse(localStorage.getItem("user")).id ===
                      reply.reply.userId && (
                      <button
                        onClick={() => handleDeleteReply(reply.reply.replyId)}
                        className="text-red-500 hover:text-red-700 text-sm mt-2"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No replies yet. Be the first to reply!
                </p>
              )}
            </div>
          </div>

          {/* Add Reply Form */}
          {verified ? (
            <></>
          ) : (
            <p className="text-red-500">
              You must be verified in order to reply.
            </p>
          )}
          {isPostBanned ||
          isPostDeleted ||
          isPostHidden ||
          post.isArchived ||
          !verified ? (
            <p className="text-red-500">
              This post has been {post.isArchived ? "Archived" : post.status}.
            </p>
          ) : (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Add a Reply
              </h3>
              {isPostUnpublished ? (
                <p className="text-red-500">
                  Replies are disabled for unpublished posts.
                </p>
              ) : (
                <form
                  onSubmit={handleReplySubmit}
                  className="flex flex-col space-y-4"
                >
                  <textarea
                    value={newReply}
                    onChange={handleReplyChange}
                    placeholder="Write your reply..."
                    className="border-2 rounded-md p-3 w-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                  <button
                    type="submit"
                    disabled={replyLoading || isPostUnpublished}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-md shadow-lg ${
                      replyLoading || isPostUnpublished
                        ? "bg-gray-400"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    {replyLoading ? "Posting Reply..." : "Post Reply"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Back Button */}
          <div className="flex gap-4 mt-6">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition duration-300"
              onClick={() => navigate("/user-posts")}
            >
              Back to Posts
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostDetailPage;
