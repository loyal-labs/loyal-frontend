"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import type { Recipe } from "@/hooks/use-recipes";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  onDelete: () => void;
}

export function RecipeCard({ recipe, onClick, onDelete }: RecipeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    // Small delay for animation before actual delete
    setTimeout(() => {
      onDelete();
    }, 200);
  };

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={onClick}
          onHoverEnd={() => setIsHovered(false)}
          onHoverStart={() => setIsHovered(true)}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
            padding: "10px 14px",
            width: "230px",
            background: "rgba(26, 26, 26, 0.5)",
            backdropFilter: "blur(24px) saturate(150%)",
            WebkitBackdropFilter: "blur(24px) saturate(150%)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            userSelect: "none",
            overflow: "visible",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Delete button - overflowing top right, visible on hover */}
          <motion.button
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            initial={{ opacity: 0, scale: 0.8 }}
            onClick={handleDelete}
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(239, 68, 68, 0.9)",
              border: "2px solid rgba(26, 26, 26, 0.8)",
              borderRadius: "50%",
              cursor: "pointer",
              zIndex: 10,
            }}
            transition={{ duration: 0.15 }}
            type="button"
            whileHover={{ scale: 1.15, background: "rgba(239, 68, 68, 1)" }}
          >
            <svg
              aria-label="Delete recipe"
              fill="none"
              height="10"
              role="img"
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              width="10"
            >
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </motion.button>

          {/* Photo - circular */}
          <div
            style={{
              flexShrink: 0,
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            {recipe.photoUrl ? (
              <Image
                alt={recipe.name}
                height={32}
                src={recipe.photoUrl}
                style={{ objectFit: "cover" }}
                width={32}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {recipe.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Text content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Recipe name */}
            <p
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontWeight: 600,
                fontSize: "12px",
                color: "#fff",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {recipe.name}
            </p>

            {/* "recipe" subtitle */}
            <p
              style={{
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                fontWeight: 500,
                fontSize: "9px",
                color: "rgba(255, 255, 255, 0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "2px 0 0 0",
              }}
            >
              recipe
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
