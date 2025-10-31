"use client";

import { useChat } from "@ai-sdk/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { DefaultChatTransport } from "ai";
import localFont from "next/font/local";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ChevronRightIcon } from "@/components/ui/chevron-right";
import { CopyIcon, type CopyIconHandle } from "@/components/ui/copy";
import { MenuIcon, type MenuIconHandle } from "@/components/ui/menu";
import { PlusIcon, type PlusIconHandle } from "@/components/ui/plus";

const instrumentSerif = localFont({
  src: [
    {
      path: "../../public/fonts/InstrumentSerif-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/InstrumentSerif-Italic.woff2",
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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuIconRef = useRef<MenuIconHandle>(null);
  const plusIconRef = useRef<PlusIconHandle>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const copyIconRefs = useRef<Map<string, CopyIconHandle>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Wallet hooks
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Control menu icon animation based on sidebar state
  useEffect(() => {
    if (isSidebarOpen) {
      menuIconRef.current?.startAnimation();
    } else {
      menuIconRef.current?.stopAnimation();
    }
  }, [isSidebarOpen]);

  // Handle sending pending message after wallet connection
  useEffect(() => {
    if (connected && pendingMessage && status === "ready") {
      sendMessage({ text: pendingMessage });
      setInput("");
      setPendingMessage(null);
      setIsChatMode(true);

      // Reset textarea height and ensure focus
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = "auto";
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [connected, pendingMessage, status, sendMessage]);

  // Auto-focus on initial load
  useEffect(() => {
    // Focus the textarea when the component mounts
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array = run once on mount

  // Auto-focus input when entering chat mode with multiple fallback strategies
  useEffect(() => {
    if (isChatMode && inputRef.current) {
      const focusInput = () => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select(); // Also select any existing text
        }
      };

      // Strategy 1: Immediate focus attempt
      focusInput();

      // Strategy 2: After micro-task
      Promise.resolve().then(focusInput);

      // Strategy 3: After animation frame (for layout)
      requestAnimationFrame(() => {
        focusInput();

        // Strategy 4: After second animation frame (for paint)
        requestAnimationFrame(focusInput);
      });

      // Strategy 5: After transition completes (800ms based on CSS)
      const timeout1 = setTimeout(focusInput, 850);

      // Strategy 6: Multiple attempts with increasing delays
      const timeout2 = setTimeout(focusInput, 100);
      const timeout3 = setTimeout(focusInput, 300);
      const timeout4 = setTimeout(focusInput, 500);
      const timeout5 = setTimeout(focusInput, 1000);

      // Cleanup
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        clearTimeout(timeout4);
        clearTimeout(timeout5);
      };
    }
  }, [isChatMode]);

  // Keep focus on textarea when messages change (e.g., after receiving response)
  useEffect(() => {
    if (isChatMode && messages.length > 0 && inputRef.current) {
      // Small delay to ensure UI has updated
      const timeout = setTimeout(() => {
        if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus();
        }
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [messages, isChatMode]);

  // Auto-resize textarea when input changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      // Use a small delay to ensure DOM is updated
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Always check if wallet is connected before sending any message
    if (!connected) {
      // Save the message to send after connection
      if (input.trim()) {
        setPendingMessage(input);
      }
      // Open wallet connection modal
      setVisible(true);
      return;
    }

    if (input.trim() && status === "ready") {
      sendMessage({ text: input });
      setInput("");
      setIsChatMode(true);

      // Reset textarea height and ensure focus
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = "auto";
          inputRef.current.focus();
        }
      }, 50);
    }
  };

  const handleCopyMessage = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);

      // Trigger animation on the specific copy icon
      const iconHandle = copyIconRefs.current.get(messageId);
      iconHandle?.startAnimation();

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null);
        iconHandle?.stopAnimation();
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
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
            e.currentTarget.style.border =
              "1px solid rgba(255, 255, 255, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.border =
              "1px solid rgba(255, 255, 255, 0.15)";
          }}
        >
          <MenuIcon
            ref={menuIconRef}
            size={24}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
          />
        </button>

        {/* New Chat Button - Below Menu - Elegantly hides when sidebar opens */}
        <div
          style={{
            position: "fixed",
            top: "5.5rem",
            left: "1.5rem",
            zIndex: 45,
            width: "3rem",
            height: "3rem",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isSidebarOpen
              ? "translateX(-5rem) scale(0.7) rotate(-180deg)"
              : "translateX(0) scale(1) rotate(0deg)",
            opacity: isSidebarOpen ? 0 : 1,
            pointerEvents: isSidebarOpen ? "none" : "auto",
          }}
        >
          <button
            onClick={() => {
              setIsChatMode(false);
              setInput("");
              // Clear messages to start fresh
              // Note: This would need to be implemented with the chat API
              // For now, just reset the UI state
              setTimeout(() => {
                inputRef.current?.focus();
              }, 100);
            }}
            style={{
              width: "100%",
              height: "100%",
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
            title="New chat"
          >
            <PlusIcon
              ref={plusIconRef}
              size={24}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            />
          </button>
        </div>

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
            boxShadow: isSidebarOpen ? "0 0 60px rgba(0, 0, 0, 0.5)" : "none",
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
                // Focus on input after resetting chat
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 100);
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
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
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
          {/* Demo warning */}
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              position: "absolute",
              top: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#ff4444",
              fontSize: "0.875rem",
              fontWeight: 500,
              letterSpacing: "0.025em",
              fontFamily: "system-ui, -apple-system, sans-serif",
              padding: "0.5rem 1rem",
              background: "rgba(255, 68, 68, 0.1)",
              border: "1px solid rgba(255, 68, 68, 0.3)",
              borderRadius: "8px",
              backdropFilter: "blur(10px)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              outline: "none",
              animation: "subtlePulse 2s ease-in-out infinite",
              boxShadow: "0 2px 10px rgba(255, 68, 68, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.animation = "none";
              e.currentTarget.style.background = "rgba(255, 68, 68, 0.15)";
              e.currentTarget.style.border = "1px solid rgba(255, 68, 68, 0.4)";
              e.currentTarget.style.transform = "translateX(-50%) scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 68, 68, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animation = "subtlePulse 2s ease-in-out infinite";
              e.currentTarget.style.background = "rgba(255, 68, 68, 0.1)";
              e.currentTarget.style.border = "1px solid rgba(255, 68, 68, 0.3)";
              e.currentTarget.style.transform = "translateX(-50%) scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(255, 68, 68, 0.2)";
            }}
          >
            Important message for testers
          </button>

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

        {/* Chat Header - Shows first message as title - FIXED TO TOP OF VIEWPORT */}
        {isChatMode && messages.length > 0 && (
            <div
              style={{
                position: "fixed",
                top: "1.5rem",  // Same level as control buttons
                left: isSidebarOpen ? "320px" : "1.5rem",  // Full width from left edge
                right: "1.5rem",  // Full width to right edge
                height: "3rem",  // Same height as control buttons
                display: "flex",
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "24px",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                zIndex: 5,  // Very LOW z-index so all buttons appear on top
                animation: "fadeIn 0.5s ease-out",
                animationFillMode: "both",
                animationDelay: "0.2s",
                padding: "0 1.5rem",
                transition: "left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* Chat title - no chevron button */}
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 400,
                  color: "rgba(255, 255, 255, 0.85)",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%",
                  letterSpacing: "0.01em",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {messages[0]?.role === "user"
                  ? messages[0].parts
                      .filter((part) => part.type === "text")
                      .map((part) => part.text)
                      .join("")
                      .slice(0, 80) + (messages[0].parts
                        .filter((part) => part.type === "text")
                        .map((part) => part.text)
                        .join("").length > 80 ? "..." : "")
                  : "Chat"}
              </h2>
            </div>
        )}

        {/* Input container */}
        <div
          style={{
            position: "absolute",
            bottom: isChatMode ? "0" : "48vh",
            left: "50%",
            transform: "translateX(-50%)",
            width: isChatMode ? "min(920px, 90%)" : "min(600px, 90%)",
            maxHeight: isChatMode ? "100vh" : "auto",
            transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: isChatMode ? "2rem 1rem 2rem 2rem" : "0",
          }}
          onClick={(e) => {
            // Focus input when clicking on the container (but not on other elements)
            if (isChatMode && e.target === e.currentTarget) {
              inputRef.current?.focus();
            }
          }}
        >
          {/* Chat messages */}
          {isChatMode && (
            <div
              ref={messagesContainerRef}
              className="chat-messages-container"
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                padding: messages.length > 0 ? "5rem 1rem 2rem 0" : "2rem 1rem 2rem 0",
                animation: "fadeIn 0.5s ease-in",
                position: "relative",
                maskImage:
                  messages.length > 0
                    ? "linear-gradient(to bottom, transparent 0%, black 4rem, black calc(100% - 1.5rem), transparent 100%)"
                    : "linear-gradient(to bottom, transparent 0%, black 1.5rem, black calc(100% - 1.5rem), transparent 100%)",
                WebkitMaskImage:
                  messages.length > 0
                    ? "linear-gradient(to bottom, transparent 0%, black 4rem, black calc(100% - 1.5rem), transparent 100%)"
                    : "linear-gradient(to bottom, transparent 0%, black 1.5rem, black calc(100% - 1.5rem), transparent 100%)",
              }}
              onClick={() => {
                // Focus input when clicking on the message area
                inputRef.current?.focus();
              }}
            >
              {messages.map((message, messageIndex) => {
                const messageText = message.parts
                  .filter((part) => part.type === "text")
                  .map((part) => part.text)
                  .join("");

                // Generate a timestamp for the message
                const messageTime = new Date(
                  Date.now() - (messages.length - messageIndex - 1) * 60000
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div
                    key={message.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        message.role === "user" ? "flex-end" : "flex-start",
                      gap: "0.5rem",
                      animation: "slideInUp 0.3s ease-out",
                      animationFillMode: "both",
                    }}
                  >
                    {/* Message bubble */}
                    <div
                      style={{
                        position: "relative",
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
                        maxWidth: "80%",
                        transition: "all 0.2s ease",
                        overflow: "visible",
                      }}
                    >
                      {message.parts.map((part, index) =>
                        part.type === "text" ? (
                          <span key={index}>{part.text}</span>
                        ) : null
                      )}
                    </div>

                    {/* Controls below message */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0 0.5rem",
                      }}
                    >
                      {/* Timestamp */}
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255, 255, 255, 0.3)",
                          fontFamily: "system-ui, -apple-system, sans-serif",
                          letterSpacing: "0.025em",
                        }}
                      >
                        {messageTime}
                      </span>

                      {/* Copy button */}
                      <button
                        onClick={() => handleCopyMessage(message.id, messageText)}
                        style={{
                          padding: "0.25rem",
                          background:
                            copiedMessageId === message.id
                              ? "rgba(34, 197, 94, 0.15)"
                              : "transparent",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          color:
                            copiedMessageId === message.id
                              ? "#22c55e"
                              : "rgba(255, 255, 255, 0.3)",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          if (copiedMessageId !== message.id) {
                            e.currentTarget.style.color =
                              "rgba(255, 255, 255, 0.5)";
                            e.currentTarget.style.background =
                              "rgba(255, 255, 255, 0.05)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (copiedMessageId !== message.id) {
                            e.currentTarget.style.color =
                              "rgba(255, 255, 255, 0.3)";
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                        title={
                          copiedMessageId === message.id
                            ? "Copied!"
                            : "Copy message"
                        }
                      >
                        <CopyIcon
                          ref={(el) => {
                            if (el) {
                              copyIconRefs.current.set(message.id, el);
                            }
                          }}
                          size={14}
                        />

                        {/* Copied feedback text */}
                        {copiedMessageId === message.id && (
                          <span
                            style={{
                              position: "absolute",
                              top: "-1.25rem",
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontSize: "0.65rem",
                              color: "#fff",
                              background: "rgba(34, 197, 94, 0.9)",
                              padding: "0.125rem 0.375rem",
                              borderRadius: "4px",
                              animation: "fadeInDownSimple 0.2s ease-in",
                              fontWeight: 500,
                              letterSpacing: "0.025em",
                              whiteSpace: "nowrap",
                              pointerEvents: "none",
                              zIndex: 10,
                            }}
                          >
                            Copied
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} style={{ height: "1rem" }} />
            </div>
          )}

          {/* Input form - liquid glass style with integrated send button */}
          <form
            onSubmit={handleSubmit}
            style={{
              position: "relative",
              width: "100%",
              marginTop: "0.5rem",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "flex-end",
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "20px",
                boxShadow:
                  "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.25)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.15)";
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize textarea
                  if (inputRef.current) {
                    inputRef.current.style.height = "auto";
                    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
                  }
                }}
                disabled={status !== "ready" || (isChatMode && !connected)}
                placeholder={isChatMode && !connected ? "Please reconnect wallet to continue..." : "Ask me anything..."}
                autoFocus
                tabIndex={0}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                style={{
                  flex: 1,
                  padding: "1.25rem 1.75rem",
                  paddingRight: "3.5rem", // Make room for the send button
                  fontSize: "1rem",
                  color: "#fff",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                  lineHeight: "1.5",
                  overflowX: "hidden",
                  overflowY: "auto",
                  minHeight: "auto",
                  maxHeight: "200px",
                }}
              />
              <button
                type="submit"
                disabled={status !== "ready" || !input.trim() || (isChatMode && !connected)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  background: "transparent",
                  border: "none",
                  borderRadius: "12px",
                  cursor:
                    status !== "ready" || !input.trim() || (isChatMode && !connected)
                      ? "not-allowed"
                      : "pointer",
                  outline: "none",
                  transition: "all 0.3s ease",
                  opacity: status !== "ready" || !input.trim() || (isChatMode && !connected) ? 0.3 : 0.7,
                }}
                onMouseEnter={(e) => {
                  if (status === "ready" && input.trim() && (!isChatMode || connected)) {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateY(-50%) scale(1)";
                }}
              >
                <ChevronRightIcon
                  size={24}
                  style={{
                    animation:
                      status === "streaming" || status === "submitted"
                        ? "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                        : "none",
                  }}
                />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Wallet disconnection warning overlay */}
      {isChatMode && !connected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              width: "100%",
              background: "rgba(255, 68, 68, 0.1)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 68, 68, 0.3)",
              borderRadius: "20px",
              padding: "2rem",
              boxShadow:
                "0 20px 60px 0 rgba(255, 68, 68, 0.2), " +
                "inset 0 2px 4px rgba(255, 255, 255, 0.1)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              ⚠️
            </div>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#fff",
                marginBottom: "1rem",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Wallet Disconnected
            </h3>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "1rem",
                lineHeight: 1.6,
                marginBottom: "1.5rem",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Your wallet has been disconnected. Please reconnect to continue your conversation.
            </p>
            <button
              onClick={() => setVisible(true)}
              style={{
                padding: "0.875rem 2rem",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#fff",
                background: "rgba(255, 68, 68, 0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 68, 68, 0.4)",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow:
                  "0 4px 20px 0 rgba(255, 68, 68, 0.2), " +
                  "inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 68, 68, 0.3)";
                e.currentTarget.style.border = "1px solid rgba(255, 68, 68, 0.5)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 24px 0 rgba(255, 68, 68, 0.3), " +
                  "inset 0 1px 2px rgba(255, 255, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 68, 68, 0.2)";
                e.currentTarget.style.border = "1px solid rgba(255, 68, 68, 0.4)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 20px 0 rgba(255, 68, 68, 0.2), " +
                  "inset 0 1px 2px rgba(255, 255, 255, 0.1)";
              }}
            >
              Reconnect Wallet
            </button>
          </div>
        </div>
      )}

      {/* Modal for testers message */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            animation: "fadeIn 0.3s ease-out",
          }}
          onClick={() => setIsModalOpen(false)}
        >
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
            }}
          />

          {/* Modal content */}
          <div
            style={{
              position: "relative",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "24px",
              padding: "2.5rem",
              boxShadow:
                "0 20px 60px 0 rgba(0, 0, 0, 0.5), " +
                "inset 0 2px 4px rgba(255, 255, 255, 0.1), " +
                "inset 0 -1px 2px rgba(0, 0, 0, 0.3)",
              animation: "slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 600,
                color: "#fff",
                marginBottom: "1.5rem",
                lineHeight: 1.3,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              Thank you for joining the first test batch!
            </h2>

            {/* Modal body */}
            <div
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "1rem",
                lineHeight: 1.7,
                fontFamily: "system-ui, -apple-system, sans-serif",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <p style={{ margin: 0 }}>
                Please note: Loyal is a test product for evaluation purposes
                only. Functionality may be incomplete, may change without
                notice, and may contain errors.
              </p>

              <p style={{ margin: 0 }}>
                <strong style={{ color: "#fff", fontWeight: 600 }}>
                  What makes Loyal different from regular LLM chats:
                </strong>{" "}
                your queries run in fully private, confidential compute—even the
                Loyal team cannot access them. Conversation state is written
                on-chain and anchored to a per-user Solana PDA.
              </p>

              <p style={{ margin: 0 }}>
                This app may look like a simple chat, but under the hood you&apos;re
                talking to a fully on-chain AI. In the coming weeks, we&apos;ll ship
                more AI apps built on this Loyal backbone.
              </p>

              <p style={{ margin: 0 }}>
                For this test run, there&apos;s no per-query fee—only wallet
                verification is required.
              </p>

              <p style={{ margin: 0 }}>
                Please report any bugs to our discord testing channel.
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                marginTop: "2rem",
                width: "100%",
                padding: "1rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#fff",
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow:
                  "0 4px 20px 0 rgba(0, 0, 0, 0.3), " +
                  "inset 0 1px 2px rgba(255, 255, 255, 0.1)",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.border =
                  "1px solid rgba(255, 255, 255, 0.3)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 24px 0 rgba(0, 0, 0, 0.4), " +
                  "inset 0 1px 2px rgba(255, 255, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.border =
                  "1px solid rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 20px 0 rgba(0, 0, 0, 0.3), " +
                  "inset 0 1px 2px rgba(255, 255, 255, 0.1)";
              }}
            >
              I understand
            </button>
          </div>
        </div>
      )}

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

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }


        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDownSimple {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes subtlePulse {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            box-shadow: 0 2px 10px rgba(255, 68, 68, 0.2);
          }
          50% {
            transform: translateX(-50%) scale(1.03);
            box-shadow: 0 4px 15px rgba(255, 68, 68, 0.35);
          }
        }

        input::placeholder,
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        /* Hide scrollbar for textarea */
        textarea::-webkit-scrollbar {
          display: none;
        }
        textarea {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        /* Custom scrollbar for chat messages */
        .chat-messages-container::-webkit-scrollbar {
          width: 8px;
        }

        .chat-messages-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin: 10px 0;
        }

        .chat-messages-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .chat-messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Firefox custom scrollbar */
        .chat-messages-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </main>
  );
}
