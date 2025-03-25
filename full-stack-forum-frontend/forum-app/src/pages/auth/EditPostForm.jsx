import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiX } from "react-icons/fi";

const EditPostForm = () => {
  const { postId } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [postUserId, setPostUserId] = useState("");

  const [existingImages, setExistingImages] = useState([]); // store current images
  const [newImages, setNewImages] = useState([]); // store new images
  const [removedImages, setRemovedImages] = useState([]); // track deleted images
  
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);
  const [removedAttachments, setRemovedAttachments] = useState([]);
  
  const [loading, setLoading] = useState(false); // This loading state is for the form submission
  const [postLoading, setPostLoading] = useState(true); // This loading state is for fetching the post
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      setPostLoading(true);
      try {
        const response = await axios.get(
          `http://127.0.0.1:5009/posts/${postId}`,
          {
            headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` },
          }
        );

        const post = response.data.post;
        setTitle(post.title);
        setContent(post.content);
        setStatus(post.status);
        setPostUserId(post.userId);
        
        setExistingImages(post.images ? post.images.split(",").map((img) => img.trim()) : []);
        setExistingAttachments(post.attachments ? post.attachments.split(",").map((att) => att.trim()) : []);
      } catch (err) {
        setError("Error fetching post. Please try again.");
        console.error("Error fetching post:", err);
      } finally {
        setPostLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // hanlde files upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setNewAttachments((prev) => [...prev, ...files]);
  };

  // delete current images (append into delete list)
  const handleRemoveExistingImage = (index) => {
    const imageToRemove = existingImages[index];
    setRemovedImages((prev) => [...prev, imageToRemove]); 
    setExistingImages((prev) => prev.filter((_, i) => i !== index)); 
  };

  const handleRemoveExistingAttachment = (index) => {
    setRemovedAttachments((prev) => [...prev, existingAttachments[index]]);
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // delete uploaded new images
  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("status", status);

      // pass the current exists images
      const updatedImages = existingImages.filter((img) => !removedImages.includes(img));
      formData.append("images", updatedImages.join(","));
      newImages.forEach((image) => formData.append("newImages", image));


      // pass new uploaded images
      const updatedAttachments = existingAttachments.filter((att) => !removedAttachments.includes(att));
      formData.append("attachments", updatedAttachments.join(","));
      newAttachments.forEach((file) => formData.append("newAttachments", file));

      await axios.put(`http://127.0.0.1:5009/posts/${postId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSuccessMessage("Post updated successfully! 🎉");
      alert("Post updated successfully!");

      setTimeout(() => {
        navigate(`/post/${postId}`);
      }, 1000);
    } catch (err) {
      setError("Error updating post. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (postLoading) {
    return <div className="text-center mt-10">Loading post...</div>;
  }

  return (
    <>
      {JSON.parse(localStorage.getItem("user")).id === postUserId ? (
        <div className="flex flex-col items-center mt-16 p-6">
          <h2 className="text-2xl font-bold mb-6">Edit Post</h2>

          {successMessage && (
            <div className="mt-4 p-3 w-full max-w-lg text-center bg-green-100 text-green-800 border border-green-300 rounded-md">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-lg space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 px-4 py-2 w-full border rounded-md" />
            </div>

            {/* content */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows="4" className="mt-1 px-4 py-2 w-full border rounded-md" />
            </div>

            {/* update status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 px-4 py-2 w-full border rounded-md">
                <option value="Unpublished">Draft</option>
                <option value="Published">Published</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>

            {/* display current images + delete button */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Images</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img} alt={`Current ${index}`} className="w-24 h-24 rounded-md shadow-md object-cover" />
                      <button type="button" className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700" onClick={() => handleRemoveExistingImage(index)}>
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new images */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload New Images</label>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="mt-1 w-full text-sm border rounded-md" />
              <div className="flex flex-wrap gap-2 mt-2">
                {newImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={URL.createObjectURL(img)} alt={`New ${index}`} className="w-24 h-24 rounded-md shadow-md object-cover" />
                    <button type="button" className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700" onClick={() => handleRemoveNewImage(index)}>
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
            {/* Attachment part */}
            <label className="font-medium">Current Attachments</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {existingAttachments.map((att, index) => {
                const [fileName, fileUrl] = att.split("|"); // Extract filename and URL
                return (
                  <div key={index} className="flex items-center space-x-2 border p-2 rounded-md">
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{fileName}</a>
                    <button onClick={() => handleRemoveExistingAttachment(index)} className="text-red-500">
                      <FiX />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-medium">Upload New Attachments</label>
            <input type="file" multiple onChange={handleAttachmentChange} className="border p-2 w-full" />
          </div>

            {/* submit button */}
            <button type="submit" disabled={loading} className={`px-6 py-2 mt-4 rounded-md text-white ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}>
              {loading ? "Updating Post..." : "Update Post"}
            </button>
          </form>

          {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>
      ) : (
        <p className="text-xl text-red-500 font-semibold">You are not authorized to edit this post.</p>
      )}
    </>
  );
};

export default EditPostForm;