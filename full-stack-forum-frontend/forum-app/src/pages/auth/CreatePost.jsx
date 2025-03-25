import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const CreatePostForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [status, setStatus] = useState("Unpublished"); // Default status is 'Unpublished'
  const [images, setImages] = useState([]);  // allow user to upload multiple images
  const [attachments, setAttachments] = useState([]); // State for multiple attachments
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleContentChange = (e) => setContent(e.target.value);
  const handleStatusChange = (e) => setStatus(e.target.value);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const handleAttachmentsChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]); // Append new files to the list
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit
    setLoading(true); // Start loading state

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("status", status);

      // Append multiple images
      images.forEach((image) => {
        formData.append("images", image); 
      });

      console.log("FormData images:", formData.getAll("images"));

      attachments.forEach((attachment, index) => {
        formData.append(`attachments[${index}]`, attachment);
      });

      console.log("FormData images:", formData.getAll("images"));

      const response = await axios.post(
        "http://127.0.0.1:5009/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Post has been created successfully!");
      console.log(response);

      navigate("/user-posts");

      setTitle("");
      setContent("");
      setStatus("Unpublished");
      setImages([]);
      setAttachments([]);
    } catch (err) {
      setError("Error creating post. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="flex flex-col items-center mt-16 p-6">
      <h2 className="text-3xl font-bold mb-6 font-lato">Create a New Post</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-lg space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            required
            className="mt-1 px-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            value={content}
            onChange={handleContentChange}
            required
            rows="4"
            className="mt-1 px-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="mt-1 px-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Unpublished">Draft</option>
            <option value="Published">Published</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Post Image
          </label>
          <input
            type="file"
            accept="image/*"
            name="images"
            multiple  // allow multiple images
            onChange={handleImageChange}
            className="mt-1 w-full text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Attachments
          </label>
          <input
            type="file"
            multiple  // allow multiple files
            onChange={handleAttachmentsChange}
            className="mt-1 w-full text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {verified ? (
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 mt-4 rounded-md text-white ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            } focus:outline-none`}
          >
            {loading ? "Creating Post..." : "Create Post"}
          </button>
        ) : (
          <p className="mt-4 text-red-500">
            You must be verified in order to create a post.
          </p>
        )}
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default CreatePostForm;
