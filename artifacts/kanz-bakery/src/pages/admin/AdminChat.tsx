import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, User, RefreshCw, Circle } from "lucide-react";

interface ChatMessage {
  id: string; threadId: string; senderRole: "customer" | "admin";
  senderName: string; text: string; createdAt: string;
}
interface ThreadSummary {
  userId: string; userName: string; userEmail: string;
  lastMessageAt: string; lastMessage: string; messageCount: number; unreadByAdmin: number;
}

export default function AdminChat() {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ userName: string; userEmail: string } | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchThreads = async () => {
    const res = await fetch("/api/chat/admin/threads", { credentials: "include" });
    if (res.ok) {
      const data = await res.json() as { threads: ThreadSummary[] };
      setThreads(data.threads);
    }
    setLoadingThreads(false);
  };

  const fetchMessages = async (userId: string) => {
    setLoadingMsgs(true);
    const res = await fetch(`/api/chat/admin/threads/${userId}`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json() as { messages: ChatMessage[]; thread: { userName: string; userEmail: string } };
      setMessages(data.messages);
      setSelectedUser(data.thread);
      // Mark thread as read in local state
      setThreads(prev => prev.map(t => t.userId === userId ? { ...t, unreadByAdmin: 0 } : t));
    }
    setLoadingMsgs(false);
  };

  const selectThread = (userId: string) => {
    setSelectedUserId(userId);
    fetchMessages(userId);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedUserId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const res = await fetch(`/api/chat/admin/threads/${selectedUserId}`, {
      method: "POST", headers: {"Content-Type":"application/json"}, credentials:"include",
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = await res.json() as { message: ChatMessage };
      setMessages(prev => [...prev, data.message]);
    }
    setSending(false);
  };

  // Poll for new messages every 3 seconds
  useEffect(() => {
    fetchThreads();
    const interval = setInterval(fetchThreads, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchMessages(selectedUserId), 3000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }
    return undefined;
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const totalUnread = threads.reduce((s, t) => s + t.unreadByAdmin, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Customer Chat</h1>
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnread} new</span>
          )}
        </div>
        <button onClick={fetchThreads} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-2 rounded-lg transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex h-[calc(100vh-14rem)]">
        {/* Thread list */}
        <div className="w-64 sm:w-72 border-r border-gray-100 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingThreads ? (
              <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
            ) : threads.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No conversations yet</p>
              </div>
            ) : (
              threads.map((thread) => (
                <button key={thread.userId} onClick={() => selectThread(thread.userId)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedUserId === thread.userId ? "bg-amber-50 border-l-2 border-l-[#D4A017]" : ""}`}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 bg-[#2C1810] rounded-full flex items-center justify-center text-[#D4A017] text-xs font-bold shrink-0 mt-0.5">
                      {thread.userName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 text-sm truncate">{thread.userName}</span>
                        {thread.unreadByAdmin > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">{thread.unreadByAdmin}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{thread.lastMessage || "No messages yet"}</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">{new Date(thread.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedUserId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 bg-white">
                <div className="w-8 h-8 bg-[#2C1810] rounded-full flex items-center justify-center text-[#D4A017] text-xs font-bold">
                  {selectedUser?.userName[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{selectedUser?.userName}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Circle size={6} className="text-green-400 fill-green-400" /> {selectedUser?.userEmail}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/50">
                {loadingMsgs ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No messages yet. Say hi!</div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        {!isAdmin && (
                          <div className="w-6 h-6 bg-[#2C1810] rounded-full flex items-center justify-center text-[#D4A017] text-[10px] font-bold mr-2 shrink-0 mt-1">
                            <User size={11} />
                          </div>
                        )}
                        <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isAdmin ? "order-2" : ""}`}>
                          <div className={`rounded-2xl px-4 py-2.5 text-sm ${isAdmin ? "bg-[#2C1810] text-[#F5E6C8] rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"}`}>
                            {msg.text}
                          </div>
                          <div className={`text-[10px] text-gray-400 mt-1 ${isAdmin ? "text-right" : "text-left"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a reply… (Enter to send)"
                    rows={1}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 resize-none leading-relaxed"
                    style={{ maxHeight: "96px" }}
                  />
                  <button onClick={sendMessage} disabled={!input.trim() || sending}
                    className="p-2.5 bg-[#D4A017] hover:bg-[#E8B82A] disabled:opacity-50 text-[#2C1810] rounded-xl transition-colors shrink-0">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
