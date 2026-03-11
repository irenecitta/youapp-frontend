"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  senderId: { _id: string; username: string } | string;
  receiverId: { _id: string; username: string } | string;
  content: string;
  status: string;
  createdAt: string;
}

interface Conversation {
  userId: string;
  username: string;
  name?: string;
  profilePicture?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    // Decode JWT to get userId
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.sub);
    } catch {}

    fetchConversations();
    connectSocket(token);

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connectSocket = (token: string) => {
    const socket = io("http://localhost:3001/chat", {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("Socket connected"));
    socket.on("newMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      fetchConversations();
    });
    socket.on("userTyping", ({ senderId }: any) => {
      if (selectedUser && senderId === selectedUser._id) setIsTyping(true);
    });
    socket.on("userStopTyping", () => setIsTyping(false));

    socketRef.current = socket;
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/conversations", {
        headers: { "x-access-token": token || "" },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const fetchMessages = async (userId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/viewMessages?receiverId=${userId}&limit=50`, {
        headers: { "x-access-token": token || "" },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: Conversation) => {
    setSelectedUser(user);
    fetchMessages(user.userId);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedUser) return;
    const content = inputMessage.trim();
    setInputMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token || "",
        },
        body: JSON.stringify({ receiverId: selectedUser._id, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.data]);
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = () => {
    if (!selectedUser || !socketRef.current) return;
    socketRef.current.emit("typing", { receiverId: selectedUser._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stopTyping", { receiverId: selectedUser._id });
    }, 1500);
  };

  const handleSearchUser = async () => {
    if (!searchUser.trim()) return;
    setSearchError("");
    setSearchResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/findUser?username=${searchUser.trim()}`, {
        headers: { "x-access-token": token || "" },
      });
      const data = await res.json();
      if (!res.ok || !data.data) {
        setSearchError("User not found");
        return;
      }
      setSearchResult(data.data);
    } catch {
      setSearchError("User not found");
    }
  };

  const startChatWithUser = (user: any) => {
    setSelectedUser({ _id: user._id, username: user.username });
    fetchMessages(user._id);
    setSearchUser("");
    setSearchResult(null);
  };

  const getSenderId = (msg: Message) =>
    typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="mobile-container">
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backBtn}>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ marginLeft: 8, fontSize: 14, color: "white" }}>Back</span>
          </button>
          <span style={styles.headerTitle}>
            {selectedUser ? `@${selectedUser.username}` : "Messages"}
          </span>
          <div style={{ width: 60 }} />
        </div>

        {!selectedUser ? (
          // ── Conversation List ──────────────────────────────────
          <div style={styles.listView}>
            {/* Search */}
            <div style={styles.searchRow}>
              <input
                type="text"
                placeholder="Find user by username..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                style={styles.searchInput}
              />
              <button onClick={handleSearchUser} style={styles.searchBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </button>
            </div>

            {searchError && <p style={styles.errorText}>{searchError}</p>}

            {searchResult && (
              <div style={styles.searchResult} onClick={() => startChatWithUser(searchResult)}>
                <div style={styles.avatar}>{searchResult.username[0].toUpperCase()}</div>
                <div>
                  <p style={styles.convUsername}>@{searchResult.username}</p>
                  <p style={styles.convPreview}>Tap to start chatting</p>
                </div>
              </div>
            )}

            {conversations.length === 0 && !searchResult && (
              <div style={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <p style={styles.emptyText}>No conversations yet</p>
                <p style={styles.emptySubtext}>Search for a user to start chatting</p>
              </div>
            )}

            {conversations.map((conv) => (
              <div key={conv.userId} style={styles.convItem} onClick={() => handleSelectUser(conv)}>
                <div style={styles.avatar}>{conv.name?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={styles.convUsername}>{conv.name || conv.username}</p>
                  <p style={styles.convPreview}>{conv.lastMessage || "Start chatting"}</p>
                </div>
                <div style={styles.convMeta}>
                  {conv.lastMessageTime && (
                    <span style={styles.convTime}>{formatTime(conv.lastMessageTime)}</span>
                  )}
                  {conv.unreadCount > 0 && (
                    <span style={styles.unreadBadge}>{conv.unreadCount}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ── Chat View ──────────────────────────────────────────
          <div style={styles.chatView}>
            <div style={styles.messagesList}>
              {loading && (
                <div style={styles.loadingText}>Loading messages...</div>
              )}
              {messages.map((msg) => {
                const isMine = getSenderId(msg) === currentUserId;
                return (
                  <div key={msg._id} style={{ ...styles.messageRow, justifyContent: isMine ? "flex-end" : "flex-start" }}>
                    <div style={{ ...styles.bubble, ...(isMine ? styles.myBubble : styles.theirBubble) }}>
                      <p style={styles.bubbleText}>{msg.content}</p>
                      <span style={styles.bubbleTime}>{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
                  <div style={{ ...styles.bubble, ...styles.theirBubble }}>
                    <span style={styles.typingDots}>●●●</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={styles.inputRow}>
              <input
                type="text"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => { setInputMessage(e.target.value); handleTyping(); }}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                style={styles.messageInput}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                style={{ ...styles.sendBtn, opacity: inputMessage.trim() ? 1 : 0.4 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: "flex", flexDirection: "column", height: "100vh", padding: "20px 20px 0" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  headerTitle: { color: "white", fontSize: 16, fontWeight: 600 },
  backBtn: { display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0 },
  listView: { flex: 1, overflowY: "auto" },
  searchRow: { display: "flex", gap: 8, marginBottom: 16 },
  searchInput: {
    flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: "10px 14px", color: "white", fontSize: 13, outline: "none",
  },
  searchBtn: {
    background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8,
    padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center",
  },
  searchResult: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px",
    background: "rgba(255,255,255,0.06)", borderRadius: 12, marginBottom: 12, cursor: "pointer",
    border: "1px solid rgba(99,205,203,0.3)",
  },
  errorText: { color: "#ff6b6b", fontSize: 13, marginBottom: 12 },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 80 },
  emptyText: { color: "rgba(255,255,255,0.4)", fontSize: 15, fontWeight: 500, margin: 0 },
  emptySubtext: { color: "rgba(255,255,255,0.2)", fontSize: 13, margin: 0 },
  convItem: {
    display: "flex", alignItems: "center", gap: 12, padding: "14px 12px",
    borderRadius: 12, marginBottom: 8, cursor: "pointer",
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
  },
  avatar: {
    width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white", flexShrink: 0,
    background: "linear-gradient(135deg, #62CDCB, #4599DB)",
  },
  convUsername: { color: "white", fontSize: 14, fontWeight: 600, margin: 0 },
  convPreview: { color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  convMeta: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 },
  convTime: { color: "rgba(255,255,255,0.3)", fontSize: 11 },
  unreadBadge: {
    background: "linear-gradient(135deg, #62CDCB, #4599DB)", color: "white",
    borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 10, fontWeight: 700,
  },
  chatView: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 },
  messagesList: { flex: 1, overflowY: "auto", paddingBottom: 12 },
  loadingText: { color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: 20 },
  messageRow: { display: "flex", marginBottom: 8 },
  bubble: { maxWidth: "75%", borderRadius: 16, padding: "10px 14px" },
  myBubble: { background: "linear-gradient(135deg, #62CDCB, #4599DB)", borderBottomRightRadius: 4 },
  theirBubble: { background: "rgba(255,255,255,0.08)", borderBottomLeftRadius: 4 },
  bubbleText: { color: "white", fontSize: 14, margin: 0, lineHeight: 1.4 },
  bubbleTime: { color: "rgba(255,255,255,0.5)", fontSize: 10, display: "block", marginTop: 4, textAlign: "right" },
  typingDots: { color: "rgba(255,255,255,0.5)", fontSize: 12, letterSpacing: 2 },
  inputRow: {
    display: "flex", gap: 8, padding: "12px 0 20px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  messageInput: {
    flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24, padding: "12px 18px", color: "white", fontSize: 14, outline: "none",
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: "50%", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    background: "linear-gradient(135deg, #62CDCB, #4599DB)",
  },
};