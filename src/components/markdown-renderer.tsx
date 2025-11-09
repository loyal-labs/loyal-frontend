"use client";

import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";

import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { CopyIcon, type CopyIconHandle } from "@/components/ui/copy";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const copyIconRefs = useRef<Map<string, CopyIconHandle>>(new Map());

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      const iconHandle = copyIconRefs.current.get(id);
      iconHandle?.startAnimation();

      setTimeout(() => {
        setCopiedCode(null);
        iconHandle?.stopAnimation();
      }, 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  // Simple hash function for generating stable IDs
  const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  };

  // Use useMemo to create stable components that won't cause hydration issues
  const components = useMemo(() => {
    return {
      // Custom code block with copy button
      pre({ children, ...props }: React.HTMLProps<HTMLPreElement>) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const codeElement = children as any;
        const code = codeElement?.props?.children?.[0] || "";
        const language =
          codeElement?.props?.className?.replace("language-", "") || "text";
        // Use stable ID based on code content hash
        const codeId = `code-${simpleHash(code)}`;

        return (
          <div
            style={{
              position: "relative",
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {/* Language label and copy button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255, 255, 255, 0.6)",
                    fontFamily: "monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {language}
                </span>
                <button
                  onClick={() => {
                    handleCopyCode(code, codeId);
                  }}
                  style={{
                    padding: "0.25rem",
                    background:
                      copiedCode === codeId
                        ? "rgba(34, 197, 94, 0.15)"
                        : "transparent",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    transition: "all 0.3s ease",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  <CopyIcon
                    ref={(el) => {
                      if (el) copyIconRefs.current.set(codeId, el);
                    }}
                    size={16}
                  />
                  <span style={{ fontSize: "0.75rem" }}>
                    {copiedCode === codeId ? "Copied!" : "Copy"}
                  </span>
                </button>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "1rem",
                  overflowX: "auto",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                }}
                {...props}
              >
                {children}
              </pre>
            </div>
          </div>
        );
      },

      // Inline code
      code({ children, ...props }: React.HTMLProps<HTMLElement>) {
        return (
          <code
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              padding: "0.125rem 0.375rem",
              borderRadius: "4px",
              fontSize: "0.875em",
              fontFamily: "monospace",
              color: "rgba(255, 255, 255, 0.95)",
            }}
            {...props}
          >
            {children}
          </code>
        );
      },

      // Blockquote
      blockquote({ children, ...props }: React.HTMLProps<HTMLQuoteElement>) {
        return (
          <blockquote
            style={{
              borderLeft: "3px solid rgba(255, 255, 255, 0.3)",
              paddingLeft: "1rem",
              margin: "1rem 0",
              color: "rgba(255, 255, 255, 0.8)",
              fontStyle: "italic",
            }}
            {...props}
          >
            {children}
          </blockquote>
        );
      },

      // Tables with glassmorphic style
      table({ children, ...props }: React.HTMLProps<HTMLTableElement>) {
        return (
          <div style={{ overflowX: "auto", margin: "1rem 0" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                overflow: "hidden",
              }}
              {...props}
            >
              {children}
            </table>
          </div>
        );
      },

      th({ children, ...props }: React.HTMLProps<HTMLTableCellElement>) {
        return (
          <th
            style={{
              padding: "0.75rem",
              background: "rgba(255, 255, 255, 0.08)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
              textAlign: "left",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.95)",
            }}
            {...props}
          >
            {children}
          </th>
        );
      },

      td({ children, ...props }: React.HTMLProps<HTMLTableCellElement>) {
        return (
          <td
            style={{
              padding: "0.75rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              color: "rgba(255, 255, 255, 0.85)",
            }}
            {...props}
          >
            {children}
          </td>
        );
      },

      // Links
      a({ children, href, ...props }: React.HTMLProps<HTMLAnchorElement>) {
        return (
          <a
            href={href}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(191, 219, 254, 1)";
              e.currentTarget.style.borderBottomColor =
                "rgba(191, 219, 254, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(147, 197, 253, 1)";
              e.currentTarget.style.borderBottomColor =
                "rgba(147, 197, 253, 0.3)";
            }}
            rel="noopener noreferrer"
            style={{
              color: "rgba(147, 197, 253, 1)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(147, 197, 253, 0.3)",
              transition: "all 0.2s ease",
            }}
            target="_blank"
            {...props}
          >
            {children}
          </a>
        );
      },

      // Horizontal rule
      hr({ ...props }: React.HTMLProps<HTMLHRElement>) {
        return (
          <hr
            style={{
              border: "none",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
              margin: "2rem 0",
            }}
            {...props}
          />
        );
      },

      // Lists
      ul({ children, ...props }: React.HTMLProps<HTMLUListElement>) {
        return (
          <ul
            style={{
              paddingLeft: "1.5rem",
              margin: "0.75rem 0",
              color: "rgba(255, 255, 255, 0.9)",
              listStyleType: "disc",
              listStylePosition: "outside",
            }}
            {...props}
          >
            {children}
          </ul>
        );
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ol({ children, ...props }: any) {
        return (
          <ol
            style={{
              paddingLeft: "1.5rem",
              margin: "0.75rem 0",
              color: "rgba(255, 255, 255, 0.9)",
              listStyleType: "decimal",
              listStylePosition: "outside",
            }}
            {...props}
          >
            {children}
          </ol>
        );
      },

      // List items
      li({ children, ...props }: React.HTMLProps<HTMLLIElement>) {
        return (
          <li
            style={{
              marginBottom: "0.5rem",
              lineHeight: 1.6,
              color: "rgba(255, 255, 255, 0.9)",
              display: "list-item",
            }}
            {...props}
          >
            {children}
          </li>
        );
      },

      // Headings
      h1({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) {
        return (
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 600,
              marginTop: "1.5rem",
              marginBottom: "1rem",
              color: "rgba(255, 255, 255, 0.95)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              paddingBottom: "0.5rem",
            }}
            {...props}
          >
            {children}
          </h1>
        );
      },

      h2({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) {
        return (
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              marginTop: "1.25rem",
              marginBottom: "0.75rem",
              color: "rgba(255, 255, 255, 0.95)",
            }}
            {...props}
          >
            {children}
          </h2>
        );
      },

      h3({ children, ...props }: React.HTMLProps<HTMLHeadingElement>) {
        return (
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginTop: "1rem",
              marginBottom: "0.5rem",
              color: "rgba(255, 255, 255, 0.95)",
            }}
            {...props}
          >
            {children}
          </h3>
        );
      },

      // Paragraphs
      p({ children, ...props }: React.HTMLProps<HTMLParagraphElement>) {
        return (
          <p
            style={{
              margin: "0.75rem 0",
              lineHeight: 1.7,
              color: "rgba(255, 255, 255, 0.9)",
            }}
            {...props}
          >
            {children}
          </p>
        );
      },
    };
  }, [copiedCode, copyIconRefs]);

  return (
    <div className={className}>
      <ReactMarkdown
        components={components}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
