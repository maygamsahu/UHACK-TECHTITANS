import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

type Message = { role: "user" | "assistant"; content: string };

const quickActions = [
  "What does the trust score mean?",
  "How do I analyze a private account?",
  "What signals indicate a fake account?",
];

const botResponses: Record<string, string> = {
  "What does the trust score mean?":
    "The Trust Score is a composite metric (0-100) derived from engagement analysis, profile metadata, and behavioral patterns. Scores below 40 indicate high anomaly density. Scores above 70 suggest authentic activity.",
  "How do I analyze a private account?":
    "Use Manual Mode. Upload a screenshot of the profile, enter all visible data (username, bio, follower count), and submit. Our engine analyzes the provided data for anomalies.",
  "What signals indicate a fake account?":
    "Key indicators: engagement-to-follower ratio below 1%, follower spikes without viral content, generic comments (< 3 words), recently created accounts with high follower counts, and repetitive posting patterns.",
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Social Shield Analysis Terminal. How can I assist your investigation?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response =
        botResponses[text] ||
        "Anomaly noted. I can assist with trust score interpretation, analysis modes, and platform guidance. Please specify your query.";
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-sm btn-depress animate-pulse-border border border-primary"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={spring}
            className="fixed bottom-20 right-6 z-50 w-80 md:w-96 border border-border bg-card rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col"
            style={{ maxHeight: "480px" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-evidence-high" />
              <span className="label-forensic">ANALYSIS TERMINAL</span>
              <span className="data-point ml-auto">ONLINE</span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "300px" }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`text-xs leading-relaxed ${
                    msg.role === "assistant"
                      ? "text-muted-foreground"
                      : "text-foreground ml-6"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <span className="text-primary font-mono mr-1">›</span>
                  )}
                  {msg.content}
                </motion.div>
              ))}
              {typing && (
                <div className="text-xs text-muted-foreground">
                  <span className="text-primary font-mono mr-1">›</span>
                  Processing query
                  <span className="animate-pulse">...</span>
                </div>
              )}
            </div>

            {/* Quick actions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 space-y-1">
                {quickActions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="block w-full text-left text-[10px] text-muted-foreground hover:text-primary transition-colors py-1 px-2 border border-border rounded-sm hover:border-primary/30"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border p-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Enter query..."
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                className="btn-depress text-primary hover:text-primary/80"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
