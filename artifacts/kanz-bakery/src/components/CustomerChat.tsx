import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Minimize2, Circle } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { Link } from "wouter";

interface ChatMessage {
  id: string; senderRole: "customer" | "admin"; senderName: string;
  text: string; createdAt: string;
}

export default function CustomerChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = async () => {
    if (!user || user.role === "admin") return;
    const res = await fetch("/api/chat/thread", { credentials: "include" });
    if (res.ok) {
      const data = await res.json() as { messages: ChatMessage[] };
      setMessages(data.messages);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && user && user.role !== "admin") {
      setLoading(true);
      fetchMessages();
      pollRef.current = setInterval(fetchMessages, 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const res = await fetch("/api/chat/thread", {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = await res.json() as { message: ChatMessage };
      setMessages(prev => [...prev, data.message]);
    }
    setSending(false);
  };

  // Don't show for admin users (they have the admin panel)
  if (user?.role === "admin") return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#2C1810] hover:bg-[#3D2418] text-[#D4A017] rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
        {/* Unread dot (simplified — always show when there are admin messages not viewed yet) */}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#F5E6C8]" style={{ maxHeight: "480px" }}>
          {/* Header */}
          <div className="bg-[#2C1810] px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
               <div className="w-8 h-8 bg-[#D4A017] rounded-full flex items-center justify-center text-[#2C1810] text-xs font-bold">OB</div>
              <div>
                 <div className="text-white font-semibold text-sm">Ovenly bekery Support</div>
                <div className="text-[#F5E6C8]/50 text-[10px] flex items-center gap-1">
                  <Circle size={5} className="text-green-400 fill-green-400" /> Usually replies within 1 hour
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#F5E6C8]/50 hover:text-white transition-colors">
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Body */}
          {!user ? (
            <div className="flex-1 flex items-center justify-center px-6 py-10 text-center">
              <div>
                <MessageSquare size={32} className="text-[#D4A017]/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-[#2C1810] mb-1">Sign in to chat with us</p>
                <p className="text-xs text-[#2C1810]/50 mb-4">Get help with orders, menu questions, and more.</p>
                <Link href="/login" onClick={() => setOpen(false)} className="bg-[#D4A017] text-[#2C1810] text-xs font-bold px-5 py-2 rounded-xl hover:bg-[#E8B82A] transition-colors inline-block">Sign In</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FFF8F0]/50" style={{ minHeight: "240px" }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-5 h-5 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-[#2C1810]/40 leading-relaxed">
                      👋 Hi {user.name}! How can we help you today? Ask us about our menu, orders, or anything else!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderRole === "customer";
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        {!isMe && (
                           <div className="w-6 h-6 bg-[#D4A017] rounded-full flex items-center justify-center text-[#2C1810] text-[10px] font-bold mr-1.5 shrink-0 mt-0.5">OB</div>
                        )}
                        <div className="max-w-[75%]">
                          <div className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${isMe ? "bg-[#2C1810] text-[#F5E6C8] rounded-br-sm" : "bg-white text-[#2C1810] border border-[#F5E6C8] rounded-bl-sm shadow-sm"}`}>
                            {msg.text}
                          </div>
                          <div className={`text-[10px] text-[#2C1810]/30 mt-0.5 ${isMe ? "text-right" : "text-left"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="px-3 py-3 border-t border-[#F5E6C8] bg-white shrink-0">
                <div className="flex gap-2 items-end">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
                    placeholder="Type a message…"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#D4A017]/20 text-xs focus:outline-none focus:ring-2 focus:ring-[#D4A017]/30 text-[#2C1810] placeholder:text-[#2C1810]/30"
                  />
                  <button onClick={send} disabled={!input.trim() || sending}
                    className="p-2 bg-[#D4A017] hover:bg-[#E8B82A] disabled:opacity-50 text-[#2C1810] rounded-xl transition-colors shrink-0">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
