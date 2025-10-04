import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// Get Gemini API key from environment (Vite/CRA compatible, no process.env)
const geminiApiKey =
  import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY"
    ? import.meta.env.VITE_GEMINI_API_KEY
    : (
      import.meta.env.REACT_APP_GEMINI_API_KEY && import.meta.env.REACT_APP_GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY"
        ? import.meta.env.REACT_APP_GEMINI_API_KEY
        : ""
    );

const ChatWidgetToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! How can I assist you with TurfTime today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const GEMINI_MODEL = "gemini-2.5-pro"; // Use Gemini 2.5 Pro

  const formatAiReply = (text) => {
    // Remove asterisks, bullets, and trim whitespace
    const cleaned = text
      .replace(/(\*{2,}|[*•]+)/g, "")
      .replace(/^\s+|\s+$/g, "");

    // If the answer is very short or generic, show the whole cleaned text
    if (
      cleaned.toLowerCase().startsWith("of course") ||
      cleaned.length < 40
    ) {
      return <span>{cleaned}</span>;
    }

    // Otherwise, show up to the first two sentences or 180 chars for context
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
    let short = "";
    for (let i = 0; i < sentences.length && short.length < 180; i++) {
      short += sentences[i];
    }
    if (short.length < cleaned.length) short += "...";
    return <span>{short.trim()}</span>;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setLoading(true);

    if (!geminiApiKey) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "API key missing. Add VITE_GEMINI_API_KEY or REACT_APP_GEMINI_API_KEY in .env" },
      ]);
      setLoading(false);
      return;
    }

    // Optimistically add user message and show typing animation immediately
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

    // Prepare conversation context
    const conversation = [
      ...messages,
      { sender: "user", text: userMessage },
    ];

    const contents = conversation.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Set a timeout to show typing animation for at least 400ms (for perceived speed)
    let typingTimeout;
    try {
      // Start request and typing animation in parallel
      const requestPromise = axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`,
        { contents },
        { headers: { "Content-Type": "application/json" } }
      );

      // Wait at least 400ms before showing the answer (for UX)
      await new Promise((resolve) => {
        typingTimeout = setTimeout(resolve, 400);
      });

      const res = await requestPromise;

      if (res.data && res.data.candidates && res.data.candidates.length > 0) {
        const aiReplyRaw =
          res.data.candidates[0]?.content?.parts?.[0]?.text ||
          "Sorry, no reply found.";
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: aiReplyRaw },
        ]);
      } else if (res.data && res.data.error && res.data.error.message) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: `Gemini API error: ${res.data.error.message}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "Sorry, no reply found." },
        ]);
      }
    } catch (err) {
      const apiError =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Sorry, I'm having trouble responding right now.";
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `Gemini API error: ${apiError}` },
      ]);
      console.error("Gemini API error:", err);
    } finally {
      clearTimeout(typingTimeout);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const TypingAnimation = () => (
    <div className="flex gap-1 text-xl text-green-700 animate-blink">
      <span>.</span>
      <span>.</span>
      <span>.</span>
      <style>{`
        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
        .animate-blink { animation: blink 1.4s infinite; }
      `}</style>
    </div>
  );

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-5 bottom-5 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg flex items-center justify-center text-2xl z-50"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <section className="fixed right-5 bottom-20 w-80 max-h-[80vh] min-h-[450px] flex flex-col bg-white rounded-lg shadow-xl text-gray-900 z-50 border border-gray-300">
          {/* Header */}
          <header className="flex justify-between items-center bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg px-4 py-3 font-bold text-white border-b">
            <h2>TurfTime Chat</h2>
            <button onClick={() => setIsOpen(false)} className="text-white font-bold text-2xl">
              &times;
            </button>
          </header>

          {/* Messages */}
          <main className="flex-grow overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-100">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} w-full`}
              >
                <p
                  className={`w-full p-3 rounded-lg break-words whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-green-200 to-green-300 text-gray-900 text-right ml-8"
                      : "bg-green-100 text-green-900 mr-8"
                  }`}
                  style={{ wordBreak: "break-word" }}
                >
                  {m.sender === "ai" ? formatAiReply(m.text) : m.text}
                </p>
              </div>
            ))}

            {loading && (
              <div className="self-start w-14 h-6 flex items-center justify-center bg-green-100 text-green-800 rounded-lg">
                <TypingAnimation />
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          {/* Input */}
          <footer className="border-t border-gray-300 bg-white px-4 py-4 flex flex-col gap-2">
            <textarea
              rows={2}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="resize-none p-2 rounded border border-gray-300 w-full text-gray-900"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded py-2 font-semibold text-white transition-opacity disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </footer>
        </section>
      )}
    </>
  );
};

export default ChatWidgetToggle;