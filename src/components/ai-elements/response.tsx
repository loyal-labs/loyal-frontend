"use client";

import "katex/dist/katex.min.css";

import type { HTMLAttributes } from "react";
import { memo, useMemo } from "react";
import type { Components } from "react-markdown";
import { Streamdown } from "streamdown";

import { cn } from "@/lib/utils";

export type ResponseProps = HTMLAttributes<HTMLDivElement> & {
  children: string;
  parseIncompleteMarkdown?: boolean;
  isAnimating?: boolean;
};

// Dark theme components matching glassmorphic style
const customComponents: Partial<Components> = {
  ol: ({ children, ...props }) => (
    <ol
      style={{
        paddingLeft: "1.5rem",
        margin: "0.75rem 0",
        color: "rgba(255, 255, 255, 0.9)",
        listStyleType: "decimal",
      }}
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li
      style={{
        marginBottom: "0.5rem",
        lineHeight: 1.6,
        color: "rgba(255, 255, 255, 0.9)",
      }}
      {...props}
    >
      {children}
    </li>
  ),
  ul: ({ children, ...props }) => (
    <ul
      style={{
        paddingLeft: "1.5rem",
        margin: "0.75rem 0",
        color: "rgba(255, 255, 255, 0.9)",
        listStyleType: "disc",
      }}
      {...props}
    >
      {children}
    </ul>
  ),
  strong: ({ children, ...props }) => (
    <strong
      style={{
        fontWeight: 600,
        color: "rgba(255, 255, 255, 0.95)",
      }}
      {...props}
    >
      {children}
    </strong>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      rel="noreferrer"
      style={{
        color: "rgba(147, 197, 253, 1)",
        textDecoration: "underline",
        transition: "color 0.2s ease",
      }}
      target="_blank"
      {...props}
    >
      {children}
    </a>
  ),
  h1: ({ children, ...props }) => (
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
  ),
  h2: ({ children, ...props }) => (
    <h2
      style={{
        fontSize: "1.5rem",
        fontWeight: 600,
        marginTop: "1.25rem",
        marginBottom: "0.75rem",
        color: "rgba(147, 197, 253, 1)",
      }}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
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
  ),
  h4: ({ children, ...props }) => (
    <h4
      style={{
        fontSize: "1.125rem",
        fontWeight: 600,
        marginTop: "1rem",
        marginBottom: "0.5rem",
        color: "rgba(255, 255, 255, 0.95)",
      }}
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5
      style={{
        fontSize: "1rem",
        fontWeight: 600,
        marginTop: "1rem",
        marginBottom: "0.5rem",
        color: "rgba(255, 255, 255, 0.95)",
      }}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6
      style={{
        fontSize: "0.875rem",
        fontWeight: 600,
        marginTop: "1rem",
        marginBottom: "0.5rem",
        color: "rgba(255, 255, 255, 0.95)",
      }}
      {...props}
    >
      {children}
    </h6>
  ),
  table: ({ children, ...props }) => (
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
  ),
  thead: ({ children, ...props }) => (
    <thead
      style={{
        background: "rgba(255, 255, 255, 0.08)",
      }}
      {...props}
    >
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => (
    <tr
      style={{
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
      }}
      {...props}
    >
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th
      style={{
        padding: "0.75rem 1rem",
        textAlign: "left",
        fontWeight: 600,
        fontSize: "0.875rem",
        color: "rgba(255, 255, 255, 0.95)",
      }}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      style={{
        padding: "0.75rem 1rem",
        fontSize: "0.875rem",
        color: "rgba(255, 255, 255, 0.85)",
      }}
      {...props}
    >
      {children}
    </td>
  ),
  blockquote: ({ children, ...props }) => (
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
  ),
  p: ({ children, ...props }) => (
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
  ),
  hr: ({ ...props }) => (
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
  ),
  // Code blocks use global CSS styling for dark glassmorphic theme
  pre: ({ children, ...props }) => <pre {...props}>{children}</pre>,
  code: ({ children, ...props }) => <code {...props}>{children}</code>,
};

export const Response = memo(
  ({
    className,
    children,
    parseIncompleteMarkdown: shouldParseIncompleteMarkdown = true,
    isAnimating = false,
    ...props
  }: ResponseProps) => {
    const components = useMemo(() => customComponents, []);

    return (
      <div
        className={cn(
          "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          className
        )}
        {...props}
      >
        <Streamdown
          components={components}
          controls={{ code: true, table: true, mermaid: true }}
          isAnimating={isAnimating}
          parseIncompleteMarkdown={shouldParseIncompleteMarkdown}
          shikiTheme={["github-dark", "github-dark"]}
        >
          {children}
        </Streamdown>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
