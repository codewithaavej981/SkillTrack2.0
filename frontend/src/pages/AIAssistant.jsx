import { useState, useEffect, useRef } from "react";
import PageHead from "../components/PageHead";
import Button from "../components/Button";
import Notice from "../components/Notice";
import { getAIStatus, chatWithAI, getAIRecommendations } from "../services/aiService";
import { createLearningResource, getLearningResources } from "../services/learningService";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Bot,
  Send,
  RefreshCw,
  BookOpen,
  Plus,
  Check,
  ExternalLink,
  AlertCircle,
  Trash2,
  Compass,
  Clock,
  Info,
  Lightbulb,
} from "lucide-react";

const CATEGORY_COLORS = {
  Development: "#6956e7",
  Design: "#24a47f",
  Analytics: "#ef8b45",
  Leadership: "#d6547d",
  "AI / ML": "#8b5cf6",
  Cybersecurity: "#0ea5e9",
  Other: "#64748b",
};

const STARTER_PROMPTS = [
  "How should I structure my learning path this month?",
  "Which skills need the most attention based on my profile?",
  "Suggest beginner-friendly resources for my active goals",
  "Give me a mock interview question based on my skills",
];

/**
 * Lightweight safe markdown formatter for AI responses
 */
function FormattedMessage({ content }) {
  if (!content) return null;

  // Split into lines to parse headings, lists, and paragraphs
  const lines = content.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let keyIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${keyIdx++}`} className="ai-code-block">
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(<h4 key={`h4-${keyIdx++}`}>{formatInline(line.slice(4))}</h4>);
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={`h3-${keyIdx++}`}>{formatInline(line.slice(3))}</h3>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={`h2-${keyIdx++}`}>{formatInline(line.slice(2))}</h2>);
    } else if (/^[-*]\s+/.test(line.trim())) {
      elements.push(
        <div key={`li-${keyIdx++}`} className="ai-bullet-item">
          <span className="bullet-dot">•</span>
          <span>{formatInline(line.trim().replace(/^[-*]\s+/, ""))}</span>
        </div>
      );
    } else if (/^\d+\.\s+/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s+(.*)/);
      elements.push(
        <div key={`oli-${keyIdx++}`} className="ai-bullet-item">
          <span className="bullet-num">{match[1]}.</span>
          <span>{formatInline(match[2])}</span>
        </div>
      );
    } else if (line.trim().length > 0) {
      elements.push(<p key={`p-${keyIdx++}`}>{formatInline(line)}</p>);
    }
  }

  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <pre key={`code-${keyIdx++}`} className="ai-code-block">
        <code>{codeBuffer.join("\n")}</code>
      </pre>
    );
  }

  return <div className="ai-formatted-text">{elements}</div>;
}

function formatInline(text) {
  const parts = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(<code key={match.index} className="inline-code">{token.slice(1, -1)}</code>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' | 'recommendations'
  const [aiStatus, setAiStatus] = useState({ available: false, model: "qwen/qwen3.8-27b", displayName: "Groq • Qwen 27B" });
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "model",
      text: `Hello ${user?.name ? user.name.split(" ")[0] : "there"}! I'm your SkillTrack AI learning mentor. I have context on your tracked skills, active goals, and learning resources. Ask me anything about your curriculum, next steps, or technical concepts!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");

  // Recommendations State
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState("");
  const [addedIds, setAddedIds] = useState(new Set());
  const [addingId, setAddingId] = useState(null);
  const [existingTitles, setExistingTitles] = useState(new Set());
  const [existingUrls, setExistingUrls] = useState(new Set());

  // Global notice
  const [notice, setNotice] = useState("");

  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const refreshLibraryState = async () => {
    try {
      const data = await getLearningResources();
      if (Array.isArray(data)) {
        const titles = new Set();
        const urls = new Set();
        for (const item of data) {
          if (item.title) titles.add(item.title.trim().toLowerCase());
          if (item.url && item.url.trim()) urls.add(item.url.trim().toLowerCase());
        }
        setExistingTitles(titles);
        setExistingUrls(urls);
      }
    } catch {
      // non-blocking
    }
  };

  // Load user's existing learning library resources on mount and when activeTab changes
  useEffect(() => {
    refreshLibraryState();
  }, [activeTab]);

  const loadRecommendations = async () => {
    try {
      setLoadingRecs(true);
      setRecsError("");
      const [res] = await Promise.all([
        getAIRecommendations(),
        refreshLibraryState(),
      ]);
      const rawRecs = res.recommendations || [];
      const normalized = rawRecs.map((r, i) => ({
        ...r,
        id: r.id || `rec_${i + 1}_${(r.title || "").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}`,
      }));
      setRecommendations(normalized);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to generate recommendations.";
      setRecsError(msg);
    } finally {
      setLoadingRecs(false);
    }
  };

  // Check AI status on mount
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        setCheckingStatus(true);
        const status = await getAIStatus();
        if (isMounted) {
          setAiStatus(status);
        }
      } catch {
        if (isMounted) {
          setAiStatus({ available: false, configured: false, model: "qwen/qwen3.8-27b", displayName: "Groq • Qwen 27B" });
        }
      } finally {
        if (isMounted) setCheckingStatus(false);
      }
    };
    checkStatus();
    return () => { isMounted = false; };
  }, []);

  // Fetch recommendations when switching to recommendations tab
  useEffect(() => {
    if (activeTab === "recommendations" && recommendations.length === 0 && !loadingRecs) {
      loadRecommendations();
    }
  }, [activeTab]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const cleanMsg = inputMessage.trim();
    if (!cleanMsg || sending) return;

    setChatError("");
    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text: cleanMsg,
      timestamp: new Date().toISOString(),
    };

    // Optimistically add user message
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputMessage("");
    setSending(true);

    try {
      // Build history for backend (only user and model turns)
      const historyPayload = nextMessages
        .slice(0, -1) // exclude current message
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await chatWithAI(cleanMsg, historyPayload);

      const aiReply = {
        id: `model-${Date.now()}`,
        role: "model",
        text: res.reply || "I didn't receive a response. Please try asking again.",
        modelUsed: res.modelUsed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to get AI response. Please try again.";
      setChatError(errMsg);
    } finally {
      setSending(false);
    }
  };

  const handleStarterPrompt = (promptText) => {
    setInputMessage(promptText);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        text: `Chat history cleared. How can I assist your learning today, ${user?.name ? user.name.split(" ")[0] : "Member"}?`,
        timestamp: new Date().toISOString(),
      },
    ]);
    setChatError("");
  };

  const isAlreadyInLibrary = (rec) => {
    if (!rec) return false;
    if (rec.id && addedIds.has(rec.id)) return true;
    const cleanTitle = (rec.title || "").trim().toLowerCase();
    if (cleanTitle && existingTitles.has(cleanTitle)) return true;
    const cleanUrl = (rec.url || "").trim().toLowerCase();
    if (cleanUrl && existingUrls.has(cleanUrl)) return true;
    return false;
  };

  const handleAddRecommendation = async (rec) => {
    if (!rec || addingId || isAlreadyInLibrary(rec)) return;
    try {
      setAddingId(rec.id);
      await createLearningResource({
        title: rec.title,
        source: rec.source,
        category: rec.category,
        url: rec.url || "",
        progress: 0,
        completed: false,
      });

      setAddedIds((prev) => new Set([...prev, rec.id]));
      if (rec.title) {
        setExistingTitles((prev) => new Set([...prev, rec.title.trim().toLowerCase()]));
      }
      if (rec.url && rec.url.trim()) {
        setExistingUrls((prev) => new Set([...prev, rec.url.trim().toLowerCase()]));
      }
      setNotice(`"${rec.title}" was added to your Learning Library!`);
      setTimeout(() => setNotice(""), 4500);
    } catch (err) {
      setChatError(err.response?.data?.message || "Failed to add resource to Learning Library.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <>
      <div className="ai-page-head">
        <PageHead
          label="AI LEARNING ASSISTANT"
          title="SkillTrack AI Mentor"
          text="Context-aware learning guidance, career acceleration, and tailored curriculum recommendations grounded in your live workspace."
          action={
            <div className="ai-page-top-actions">
              <div className="ai-model-pill" title="Configured Groq AI Model">
                <Sparkles size={14} />
                <span>{aiStatus.displayName || aiStatus.model || "Groq • Qwen 27B"}</span>
              </div>
              {activeTab === "chat" && (
                <Button variant="secondary" onClick={handleClearChat} title="Reset chat history">
                  <Trash2 size={14} />
                  <span>Clear Chat</span>
                </Button>
              )}
              {activeTab === "recommendations" && (
                <Button
                  variant="secondary"
                  onClick={loadRecommendations}
                  disabled={loadingRecs}
                  title="Refresh recommendations"
                >
                  <RefreshCw size={14} className={loadingRecs ? "spinning" : ""} />
                  <span>Refresh</span>
                </Button>
              )}
            </div>
          }
        />
      </div>

      <Notice message={notice} />

      {/* Unconfigured Alert Card */}
      {!checkingStatus && !(aiStatus.configured ?? aiStatus.available) && (
        <article className="card ai-unconfigured-banner">
          <div className="ai-unconfigured-icon">
            <Info size={28} />
          </div>
          <div className="ai-unconfigured-info">
            <h3>Groq API Key Required</h3>
            <p>
              The AI Learning Assistant is ready, but requires a Groq API key to activate.
              Add <code>GROQ_API_KEY=your_key</code> in <code>backend/.env</code> and restart the backend server.
            </p>
          </div>
        </article>
      )}

      {/* Tabs Switcher */}
      <div className="ai-assistant-tabs">
        <button
          type="button"
          className={`ai-tab-btn ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          <Bot size={16} />
          <span>Interactive Assistant</span>
        </button>

        <button
          type="button"
          className={`ai-tab-btn ${activeTab === "recommendations" ? "active" : ""}`}
          onClick={() => setActiveTab("recommendations")}
        >
          <Compass size={16} />
          <span>Curated Recommendations</span>
          {recommendations.length > 0 && (
            <span className="ai-tab-count">{recommendations.length}</span>
          )}
        </button>
      </div>

      {/* TAB 1: INTERACTIVE CHAT */}
      {activeTab === "chat" && (
        <div className="ai-chat-layout">
          <div className="card ai-chat-container">
            {/* Messages Scroll Area */}
            <div className="ai-messages-list">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`ai-message-row ${m.role === "user" ? "user-row" : "model-row"}`}
                >
                  <div className="ai-avatar-mark">
                    {m.role === "user" ? (
                      user?.name ? user.name[0].toUpperCase() : "U"
                    ) : (
                      <Sparkles size={16} />
                    )}
                  </div>

                  <div className="ai-bubble">
                    <div className="ai-bubble-header">
                      <strong>{m.role === "user" ? "You" : "SkillTrack AI"}</strong>
                      <span className="ai-time">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <FormattedMessage content={m.text} />
                  </div>
                </div>
              ))}

              {sending && (
                <div className="ai-message-row model-row">
                  <div className="ai-avatar-mark">
                    <Sparkles size={16} />
                  </div>
                  <div className="ai-bubble ai-typing-bubble">
                    <span className="dot dot-1" />
                    <span className="dot dot-2" />
                    <span className="dot dot-3" />
                    <small>Consulting Groq AI &amp; your workspace context...</small>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error display */}
            {chatError && (
              <div className="ai-chat-error-bar">
                <AlertCircle size={16} />
                <span>{chatError}</span>
              </div>
            )}

            {/* Starter Prompts */}
            {messages.length <= 2 && (
              <div className="ai-starter-prompts">
                <span className="starter-label">
                  <Lightbulb size={13} /> Suggested prompts:
                </span>
                <div className="starter-chips">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="starter-chip"
                      onClick={() => handleStarterPrompt(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form className="ai-input-form" onSubmit={handleSendMessage}>
              <div className="ai-input-wrapper">
                <textarea
                  className="ai-textarea"
                  placeholder={
                    !aiStatus.available
                      ? "Groq API key is unconfigured in backend/.env..."
                      : "Ask about your learning path, skills, or curriculum..."
                  }
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  maxLength={2000}
                  disabled={sending}
                />
                <div className="ai-input-footer">
                  <small className="ai-char-counter">
                    {inputMessage.length} / 2000
                  </small>
                  <Button
                    type="submit"
                    className="ai-send-btn"
                    disabled={sending || !inputMessage.trim()}
                  >
                    {sending ? <RefreshCw size={15} className="spinning" /> : <Send size={15} />}
                    <span>Send</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONALIZED RECOMMENDATIONS */}
      {activeTab === "recommendations" && (
        <div className="ai-recommendations-layout">
          {loadingRecs ? (
            <article className="card ai-loading-card">
              <RefreshCw size={28} className="spinning" />
              <h3>Analyzing your workspace records...</h3>
              <p>Cross-referencing skills needing reinforcement and target goal deadlines.</p>
            </article>
          ) : recsError ? (
            <article className="card ai-error-card">
              <AlertCircle size={28} style={{ color: "var(--danger, #e5484d)" }} />
              <h3>Unable to generate recommendations</h3>
              <p>{recsError}</p>
              <Button onClick={loadRecommendations}>
                <RefreshCw size={14} /> Retry
              </Button>
            </article>
          ) : recommendations.length === 0 ? (
            <article className="card ai-empty-card">
              <BookOpen size={32} />
              <h3>No recommendations generated yet</h3>
              <p>Click below to analyze your skills and generate tailored learning suggestions.</p>
              <Button onClick={loadRecommendations}>
                <Sparkles size={14} /> Generate Recommendations
              </Button>
            </article>
          ) : (
            <div className="ai-recommendations-grid">
              {recommendations.map((rec) => {
                const isAdded = isAlreadyInLibrary(rec);
                const isAdding = addingId === rec.id;

                return (
                  <article key={rec.id} className="card ai-rec-card">
                    <div className="ai-rec-header">
                      <span
                        className="ai-rec-cat-badge"
                        style={{
                          borderColor: CATEGORY_COLORS[rec.category] || "#6956e7",
                          color: CATEGORY_COLORS[rec.category] || "#6956e7",
                        }}
                      >
                        {rec.category}
                      </span>

                      <div className="ai-rec-meta-tags">
                        <span className="ai-tag difficulty">{rec.difficulty}</span>
                        {rec.estimatedHours && (
                          <span className="ai-tag duration">
                            <Clock size={11} /> {rec.estimatedHours}h
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="ai-rec-title">{rec.title}</h3>

                    <div className="ai-rec-source">
                      <span className="source-label">Source / Provider:</span>
                      <strong>{rec.source}</strong>
                    </div>

                    <p className="ai-rec-reason">{rec.reason}</p>

                    <div className="ai-rec-actions">
                      {rec.url && (
                        <a
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ai-btn-link"
                          title="Open resource in new tab"
                        >
                          <span>Visit Resource</span>
                          <ExternalLink size={12} />
                        </a>
                      )}

                      <Button
                        type="button"
                        variant={isAdded ? "secondary" : "primary"}
                        className={`ai-btn-add ${isAdded ? "is-added" : ""}`}
                        onClick={() => handleAddRecommendation(rec)}
                        disabled={isAdded || isAdding}
                      >
                        {isAdding ? (
                          <>
                            <RefreshCw size={13} className="spinning" />
                            <span>Adding...</span>
                          </>
                        ) : isAdded ? (
                          <>
                            <Check size={13} />
                            <span>In Library</span>
                          </>
                        ) : (
                          <>
                            <Plus size={13} />
                            <span>Add to Library</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
