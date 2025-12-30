"use client";

import { MessageCircleQuestion } from "lucide-react";

export function ProductlaneButton() {
  const handleClick = () => {
    if (typeof window !== "undefined" && window.Productlane) {
      window.Productlane.open("INDEX");
    }
  };

  return (
    <button
      aria-label="Feedback and support"
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "48px",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(48px)",
        border: "none",
        borderRadius: "9999px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow:
          "0px 4px 8px 0px rgba(0, 0, 0, 0.04), 0px 2px 4px 0px rgba(0, 0, 0, 0.02)",
        zIndex: 50,
      }}
      type="button"
    >
      <MessageCircleQuestion size={24} />
    </button>
  );
}
