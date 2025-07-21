import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { chatAPI } from "../services/api"; // Adjust path as needed

const ChatPage = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    chatAPI.getConversations()
      .then(res => setConversations(res.data))
      .catch(err => console.error("Error loading conversations:", err));
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      chatAPI.getMessages(activeConversationId)
        .then(res => setMessages(res.data))
        .catch(err => console.error("Error loading messages:", err));
    }
  }, [activeConversationId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    chatAPI.sendMessage(activeConversationId, newMessage)
      .then(sent => {
        setMessages(prev => [...prev, {
          id: sent.id,
          content: sent.content,
          sender: { username: "You" },
          timestamp: new Date().toISOString()
        }]);
        setNewMessage("");
      })
      .catch(err => console.error("Error sending message:", err));
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Left Panel: Conversations */}
        <div className="col-md-4 border-end">
          <h4 className="mb-3">Conversations</h4>
          <div className="list-group">
            {conversations.map(conv => (
              <button
                key={conv.id}
                className={`list-group-item list-group-item-action ${activeConversationId === conv.id ? 'active' : ''}`}
                onClick={() => setActiveConversationId(conv.id)}
              >
                <div className="d-flex align-items-center">
                  <img
                    src={`http://localhost:8000/media/${conv.item?.image}`}
                    alt={conv.item?.title}
                    className="img-thumbnail me-3"
                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                  />
                  <div>
                    <strong>{conv.item?.title}</strong>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Messages */}
        <div className="col-md-8">
          <h4 className="mb-3">Messages</h4>
          <div className="card mb-3" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <div className="card-body">
              {messages.map((msg) => (
                <div key={msg.id} className="mb-3">
                  <div>
                    <strong>{msg.sender?.username || "User"}</strong>: {msg.content}
                  </div>
                  <small className="text-muted">
                    {new Date(msg.timestamp).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          </div>

          {activeConversationId && (
            <form className="d-flex" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="form-control me-2"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
