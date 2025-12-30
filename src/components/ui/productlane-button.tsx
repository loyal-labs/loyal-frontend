"use client";

export function ProductlaneButton() {
  const handleClick = () => {
    if (typeof window !== "undefined" && window.Productlane) {
      window.Productlane.open("CHANGELOG");
    }
  };

  return (
    <button
      aria-label="View changelog"
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
      <svg
        aria-hidden="true"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="m3 11 18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </svg>
    </button>
  );
}
