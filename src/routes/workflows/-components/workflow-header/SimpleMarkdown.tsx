import React from "react";

/** Parse inline tokens: **bold**, *italic*, `code` */
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else {
      parts.push(
        <code key={key++} className="bg-zinc-100 rounded px-1 font-mono text-xs">
          {token.slice(1, -1)}
        </code>
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/**
 * Minimal XSS-safe Markdown renderer. Supports:
 * headings (#/##/###), **bold**, *italic*, `inline code`,
 * ```code blocks```, unordered lists (- / *), ordered lists (1.),
 * and paragraph text. Does NOT render raw HTML — safe against AI-generated XSS.
 */
export const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: "ul" | "ol" = "ul";
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    if (listType === "ul") {
      elements.push(
        <ul key={key++} className="list-disc list-inside my-1.5 space-y-0.5 pl-1">
          {listItems}
        </ul>
      );
    } else {
      elements.push(
        <ol key={key++} className="list-decimal list-inside my-1.5 space-y-0.5 pl-1">
          {listItems}
        </ol>
      );
    }
    listItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code fence
    if (line.startsWith("```")) {
      flushList();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre
          key={key++}
          className="bg-zinc-100 rounded p-2 my-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap"
        >
          {codeLines.join("\n")}
        </pre>
      );
      continue;
    }

    // Headings
    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h1) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-base font-bold text-zinc-800 mt-4 mb-1 border-b border-zinc-100 pb-0.5">
          {parseInline(h1[1])}
        </h2>
      );
      continue;
    }
    if (h2) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-sm font-bold text-zinc-800 mt-3 mb-1">
          {parseInline(h2[1])}
        </h3>
      );
      continue;
    }
    if (h3) {
      flushList();
      elements.push(
        <h4 key={key++} className="text-sm font-semibold text-zinc-700 mt-2 mb-0.5">
          {parseInline(h3[1])}
        </h4>
      );
      continue;
    }

    // Unordered list item
    const ulMatch = line.match(/^[-*] (.+)/);
    if (ulMatch) {
      if (listItems.length === 0) listType = "ul";
      listItems.push(
        <li key={key++} className="text-sm text-zinc-700">
          {parseInline(ulMatch[1])}
        </li>
      );
      continue;
    }

    // Ordered list item
    const olMatch = line.match(/^\d+\. (.+)/);
    if (olMatch) {
      if (listItems.length === 0) listType = "ol";
      listItems.push(
        <li key={key++} className="text-sm text-zinc-700">
          {parseInline(olMatch[1])}
        </li>
      );
      continue;
    }

    // Blank line — flush list and skip
    if (line.trim() === "") {
      flushList();
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={key++} className="text-sm text-zinc-700 my-1 leading-relaxed">
        {parseInline(line)}
      </p>
    );
  }

  flushList();
  return <div className="space-y-0">{elements}</div>;
};
