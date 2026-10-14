(() => {
  // Render a small Discord/Markdown subset using DOM nodes, never source HTML.
  function element(tag, text) {
    const result = document.createElement(tag);
    if (text !== undefined) result.textContent = text;
    return result;
  }

  function link(label, href) {
    const result = element("a", label);
    result.href = href;
    result.target = "_blank";
    result.rel = "noopener noreferrer";
    return result;
  }

  function inline(parent, text, depth = 0) {
    if (depth > 4) { parent.append(document.createTextNode(text)); return; }
    const tokens = /\\([\\`*_~\[\]()>])|`([^`\n]+)`|\*\*([^\n]+?)\*\*|__([^\n]+?)__|~~([^\n]+?)~~|\*([^*\n]+)\*|(?<!\w)_([^_\n]+)_(?!\w)|\[([^\]\n]+)\]\((https?:\/\/[^\s<>]+)\)|(https?:\/\/[^\s<>]+)/g;
    let offset = 0;
    for (const match of text.matchAll(tokens)) {
      parent.append(document.createTextNode(text.slice(offset, match.index)));
      if (match[1]) parent.append(document.createTextNode(match[1]));
      else if (match[2]) parent.append(element("code", match[2]));
      else if (match[9]) parent.append(link(match[8], match[9]));
      else if (match[10]) {
        let href = match[10].replace(/[.,!?;:]+$/, "");
        while (href.endsWith(")") && (href.match(/\)/g) || []).length > (href.match(/\(/g) || []).length) href = href.slice(0, -1);
        parent.append(link(href, href), document.createTextNode(match[10].slice(href.length)));
      } else {
        const tag = match[3] ? "strong" : match[4] ? "u" : match[5] ? "del" : "em";
        const child = element(tag);
        inline(child, match[3] || match[4] || match[5] || match[6] || match[7], depth + 1);
        parent.append(child);
      }
      offset = match.index + match[0].length;
    }
    parent.append(document.createTextNode(text.slice(offset)));
  }

  function render(text, className = "") {
    const root = element("div");
    root.className = `${className} post-content`.trim();
    const lines = String(text).replace(/\r\n?/g, "\n").split("\n");
    let paragraph = null;
    let list = null;
    let quote = null;
    let code = null;
    let codeLines = 0;
    for (const line of lines) {
      if (code) {
        if (/^\s*```\s*$/.test(line)) code = null;
        else code.textContent += (codeLines++ ? "\n" : "") + line;
        continue;
      }
      if (/^\s*```[^`]*$/.test(line)) {
        code = element("code");
        codeLines = 0;
        const pre = element("pre");
        pre.append(code); root.append(pre);
        paragraph = list = quote = null;
        continue;
      }
      if (!line.trim()) { paragraph = list = quote = null; continue; }
      const quoted = line.match(/^\s*> ?(.*)$/);
      const item = line.match(/^\s*(?:([-*])\s+|(\d+)\.\s+)(.*)$/);
      if (quoted) {
        if (!quote) { quote = element("blockquote"); root.append(quote); }
        else quote.append(element("br"));
        inline(quote, quoted[1]);
        paragraph = list = null;
      } else if (item) {
        const tag = item[2] ? "ol" : "ul";
        if (!list || list.tagName.toLowerCase() !== tag) {
          list = element(tag);
          if (item[2]) list.start = Number(item[2]);
          root.append(list);
        }
        const child = element("li"); inline(child, item[3]); list.append(child);
        paragraph = quote = null;
      } else {
        if (!paragraph) { paragraph = element("p"); root.append(paragraph); }
        else paragraph.append(element("br"));
        inline(paragraph, line);
        list = quote = null;
      }
    }
    return root;
  }

  window.PakHubPostFormat = { render };
})();
