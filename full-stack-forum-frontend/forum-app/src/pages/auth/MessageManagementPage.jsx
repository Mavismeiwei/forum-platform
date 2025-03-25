import { useEffect, useState } from "react";

const MessageManagementPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true); // Track if more messages exist

  // Fetch messages from API Gateway
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5009/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await response.json();
      if (response.ok) {
        // Filter pending messages and sort by newest
        const pendingMessages = data
          .filter((msg) => msg.status === "pending")
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        setMessages(pendingMessages.slice(0, 10)); // Show only 10 initially
        setHasMore(pendingMessages.length > 10); // Check if more exist
      } else {
        console.error("Error fetching messages:", data.error);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Handle status update (PUT /messages/{id}/status)
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5009/messages/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id ? { ...msg, status: newStatus } : msg
          )
        );
      } else {
        console.error("Failed to update message status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto mt-16">
      <h2 className="text-3xl font-bold mb-4 text-blue-600">
        Message Management
      </h2>
      {loading && <p>Loading messages...</p>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Date Created</th>
            <th className="border p-2">Subject</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Message</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((msg) => (
            <tr key={msg.id} className="text-center">
              <td className="border p-2">
                {new Date(msg.createdAt).toLocaleString()}
              </td>
              <td className="border p-2">{msg.subject}</td>
              <td className="border p-2">{msg.email}</td>
              <td className="border p-2">{msg.message}</td>
              <td className="border p-2">
                <button
                  onClick={() =>
                    updateStatus(
                      msg.id,
                      msg.status === "pending"
                        ? "reviewed"
                        : msg.status === "reviewed"
                        ? "resolved"
                        : "pending"
                    )
                  }
                  className={`px-4 py-1 rounded text-white ${
                    msg.status === "pending"
                      ? "bg-yellow-500"
                      : msg.status === "reviewed"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                >
                  {msg.status}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Load More Button */}
      {hasMore && (
        <button
          onClick={() =>
            setMessages((prev) => [...prev, ...messages.slice(10)])
          }
          className="mt-4 bg-gray-700 text-white px-4 py-2 rounded"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default MessageManagementPage;
