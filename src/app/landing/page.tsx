"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import localFont from "next/font/local";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { MenuIcon, type MenuIconHandle } from "@/components/ui/menu";

const instrumentSerif = localFont({
  src: [
    {
      path: "../../../public/fonts/InstrumentSerif-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/InstrumentSerif-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
});

export default function LandingPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  const [input, setInput] = useState("");
  const [isChatMode, setIsChatMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuIconRef = useRef<MenuIconHandle>(null);

  // Control menu icon animation based on sidebar state
  useEffect(() => {
    if (isSidebarOpen) {
      menuIconRef.current?.startAnimation();
    } else {
      menuIconRef.current?.stopAnimation();
    }
  }, [isSidebarOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input });
      setInput("");
      setIsChatMode(true);
    }
  };

  // Mock data for previous chats - replace with real data later
  const previousChats = [
    { id: "1", title: "What is quantum computing?", timestamp: "2 hours ago" },
    { id: "2", title: "Explain blockchain technology", timestamp: "Yesterday" },
    { id: "3", title: "How does AI work?", timestamp: "2 days ago" },
  ];

  return (
    <main
      style={{
        margin: 0,
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          marginLeft: isSidebarOpen ? "300px" : "0",
          transition: "margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Image
          src="/landing.png"
          alt="Landing"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        {/* Dark overlay for chat mode */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: isChatMode ? "blur(8px)" : "blur(0px)",
            opacity: isChatMode ? 1 : 0,
            transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            pointerEvents: isChatMode ? "auto" : "none",
          }}
        />

        {/* Menu Button - Always Visible */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            position: "fixed",
            top: "1.5rem",
            left: "1.5rem",
            zIndex: 50,
            width: "3rem",
            height: "3rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow:
              "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
            color: "#fff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
            e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.15)";
          }}
        >
          <MenuIcon
            ref={menuIconRef}
            size={24}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
          />
        </button>

        {/* Sidebar */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "300px",
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            boxShadow: isSidebarOpen
              ? "0 0 60px rgba(0, 0, 0, 0.5)"
              : "none",
          }}
        >
          {/* Sidebar Header */}
          <div
            style={{
              padding: "1.5rem",
              paddingTop: "1.5rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <button
              onClick={() => {
                setIsChatMode(false);
                setInput("");
              }}
              style={{
                width: "100%",
                padding: "0.75rem 1.25rem",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "0.95rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.border =
                  "1px solid rgba(255, 255, 255, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.border =
                  "1px solid rgba(255, 255, 255, 0.15)";
              }}
            >
              + New Chat
            </button>
          </div>

          {/* Previous Chats List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
            }}
          >
            {previousChats.map((chat) => (
              <div
                key={chat.id}
                style={{
                  padding: "0.875rem 1rem",
                  marginBottom: "0.5rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.border =
                    "1px solid rgba(255, 255, 255, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.border =
                    "1px solid rgba(255, 255, 255, 0.08)";
                }}
              >
                <div
                  style={{
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    marginBottom: "0.25rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {chat.title}
                </div>
                <div
                  style={{
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: "0.75rem",
                  }}
                >
                  {chat.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={instrumentSerif.className}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            textAlign: "center",
            padding: "22vh 1.5rem 0",
            gap: "0.75rem",
            color: "#fff",
            transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isChatMode ? "translateY(-100vh)" : "translateY(0)",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 4.25rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              maxWidth: "100%",
              whiteSpace: "nowrap",
            }}
          >
            <em>Private</em> intelligence for <em>private</em> people
          </h1>
          <p
            style={{
              fontSize: "clamp(1.125rem, 2vw, 1.6rem)",
              fontWeight: 400,
              maxWidth: "40rem",
              lineHeight: 1.45,
            }}
          >
            Loyal is built for those who want to ask questions with no
            reprucussions.
          </p>
        </div>

        {/* Input container */}
        <div
          style={{
            position: "absolute",
            bottom: isChatMode ? "0" : "48vh",
            left: "50%",
            transform: "translateX(-50%)",
            width: isChatMode ? "min(920px, 90%)" : "min(600px, 90%)",
            maxHeight: isChatMode ? "100vh" : "auto",
            transition:
              "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: isChatMode ? "2rem" : "0",
          }}
        >
          {/* Chat messages */}
          {isChatMode && (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                paddingBottom: "1rem",
                animation: "fadeIn 0.5s ease-in",
              }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    padding: "1rem 1.5rem",
                    borderRadius: "16px",
                    background:
                      message.role === "user"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    fontSize: "1rem",
                    lineHeight: 1.5,
                    alignSelf:
                      message.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                  }}
                >
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <span key={index}>{part.text}</span>
                    ) : null,
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Input form - liquid glass style */}
          <form
            onSubmit={handleSubmit}
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              gap: "0.75rem",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== "ready"}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: "1.25rem 1.75rem",
                fontSize: "1rem",
                color: "#fff",
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "20px",
                outline: "none",
                transition: "all 0.3s ease",
                boxShadow:
                  "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
              }}
              onFocus={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.12)";
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.25)";
              }}
              onBlur={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.08)";
                e.target.style.border = "1px solid rgba(255, 255, 255, 0.15)";
              }}
            />
            <button
              type="submit"
              disabled={status !== "ready" || !input.trim()}
              style={{
                padding: "1.25rem 2rem",
                fontSize: "1rem",
                fontWeight: 500,
                color: "#fff",
                background:
                  status !== "ready" || !input.trim()
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "20px",
                cursor:
                  status !== "ready" || !input.trim()
                    ? "not-allowed"
                    : "pointer",
                outline: "none",
                transition: "all 0.3s ease",
                boxShadow:
                  "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                opacity: status !== "ready" || !input.trim() ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (status === "ready" && input.trim()) {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.25)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 40px 0 rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)";
              }}
            >
              {status === "streaming" || status === "submitted"
                ? "Sending..."
                : "Send"}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </main>
  );
}
