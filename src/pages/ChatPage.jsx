import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { chatAPI } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";

const ChatPage = () => {
  const { currentUser } = useAuth();
  const { sellerId , itemId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const res = await chatAPI.getConversations();
        setConversations(res.data);

        // If sellerId is provided in URL, find or create conversation
        if (sellerId) {
          console.log(res.data, "Conversations data:", sellerId);
          
          const existingConv = res.data.find(conv => 
            conv.user.toString() === sellerId
          );

          if (existingConv) {
            // Conversation exists, set as active
            setActiveConversationId(existingConv.id);
          } else {
            // Create new conversation with seller
            try {
              const newConv = await chatAPI.createConversation({
                participants: [currentUser.id, parseInt(sellerId)],
                item: itemId ? parseInt(itemId) : null
              });
              setConversations(prev => [...prev, newConv.data]);
              setActiveConversationId(newConv.data.id);
              navigate(`/chat/${sellerId}/${newConv.data.id}`, { replace: true });
            } catch (err) {
              setError("Failed to create conversation");
              console.error("Error creating conversation:", err);
            }
          }
        }
      } catch (err) {
        setError("Failed to load conversations");
        console.error("Error loading conversations:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [sellerId, currentUser, navigate]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (activeConversationId) {
        try {
          const res = await chatAPI.getMessages(activeConversationId);
          setMessages(res.data);
        } catch (err) {
          console.error("Error loading messages:", err);
        }
      }
    };

    fetchMessages();
  }, [activeConversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    try {
      const sent = await chatAPI.sendMessage(activeConversationId, {
        content: newMessage,
        type: "text"
      });
      
      setMessages(prev => [...prev, {
        id: sent.data.id,
        content: sent.data.content,
        sender: { id: currentUser.id, username: currentUser.username },
        timestamp: new Date().toISOString()
      }]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

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
                className={`list-group-item list-group-item-action ${
                  activeConversationId === conv.id ? 'active' : ''
                }`}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  navigate(`/chat/${conv.participants.find(p => p.id !== currentUser.id)?.id}/${conv.id}`);
                }}
              >
                <div className="d-flex align-items-center">
                  {conv.item?.image && (
                    <img
                      src={conv.item.image}
                      alt={conv.item?.title}
                      className="img-thumbnail me-3"
                      style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    />
                  )}
                  <div>
                    <strong>
                      {conv.item?.title || 
                       `Chat with ${conv.participants.find(p => p.id !== currentUser.id)?.username}`}
                    </strong>
                    <div className="text-muted small">
                      {conv.last_message?.content || "No messages yet"}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Messages */}
        <div className="col-md-8">
          {activeConversationId ? (
            <>
              <h4 className="mb-3">Messages</h4>
              <div className="card mb-3" style={{ maxHeight: "500px", overflowY: "auto" }}>
                <div className="card-body">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`mb-3 ${msg.sender?.id === currentUser.id ? 'text-end' : ''}`}
                      >
                        <div className={`p-2 rounded ${
                          msg.sender?.id === currentUser.id 
                            ? 'bg-primary text-white' 
                            : 'bg-light'
                        }`}>
                          <strong>{msg.sender?.username || "User"}</strong>: {msg.content}
                        </div>
                        <small className="text-muted">
                          {new Date(msg.timestamp).toLocaleString()}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </div>
              </div>

              <form className="d-flex" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-5">
              <h4>Select a conversation</h4>
              <p className="text-muted">Or start a new one from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;