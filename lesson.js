"use strict";

/* Lessons: the "Deep dive" part of the roadmap's side panel.
   Content lives in data/lessons/*.js as plain blocks. Figures are small SVG drawings made with
   the helpers in `g` below, so they pick up the site's colours in both the light and dark theme.

   Block types (a plain string is a paragraph):
     { h }                   section heading, listed in the "In this lesson" contents
     { ul } / { ol }         lists
     { fig, cap }            a figure from window.FIGURES
     { table, cap }          first row is the header
     { code, label }         a code or log sample
     { tip } / { warn } / { note }, with optional { title }
     { flow, loop, cap }     a row of steps; "Title|small text" per step
     { terms }               [term, meaning] pairs
     { try, t }              a hands-on exercise
     { check, title }        [question, answer] pairs, answers hidden until opened
   Inline text: `code`, **bold**, [[topic-id|link text]] (or [[page.html#id|text]]). */
window.LESSONS = window.LESSONS || {};
window.FIGURES = window.FIGURES || {};

window.renderLesson = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  /* ---------- Figure helpers ---------- */

  const g = {
    svg(w, h, parts) {
      return `<svg xmlns="${SVG_NS}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="min-width:${Math.min(w, 560)}px;max-width:${Math.round(w * 1.25)}px">${parts.join("")}</svg>`;
    },
    rect(x, y, w, h, cls = "", r = 8) {
      return `<rect class="bx ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
    },
    text(x, y, s, cls = "") {
      return `<text class="${cls}" x="${x}" y="${y}">${esc(s)}</text>`;
    },
    lines(x, y, list, cls = "", lh = 16) {
      return list.map((s, i) => this.text(x, y + i * lh, s, cls)).join("");
    },
    /* A box with centred lines. Line prefixes: ! bold, ~ small and muted, ^ small, ` small mono. */
    box(x, y, w, h, label, cls = "", r = 8) {
      const list = [].concat(label);
      const lh = 16;
      const first = y + h / 2 - ((list.length - 1) * lh) / 2 + 4.5;
      const words = cls.split(" ");
      const tone = words.includes("d") ? " iv" : words.includes("r") ? " on" : "";
      return this.rect(x, y, w, h, cls, r) + list.map((raw, i) => {
        let s = raw;
        let c = "c";
        if (s[0] === "!") { s = s.slice(1); c += " b"; }
        else if (s[0] === "~") { s = s.slice(1); c += " s mu"; }
        else if (s[0] === "^") { s = s.slice(1); c += " s"; }
        else if (s[0] === "`") { s = s.slice(1); c += " s mo"; }
        return this.text(x + w / 2, first + i * lh, s, c + tone);
      }).join("");
    },
    line(x1, y1, x2, y2, cls = "") {
      return `<line class="ln ${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    },
    arrow(x1, y1, x2, y2, cls = "") {
      return this.line(x1, y1, x2, y2, `ar ${cls}`);
    },
    path(d, cls = "") {
      return `<path class="ln ${cls}" d="${d}"/>`;
    },
    circle(cx, cy, r, cls = "") {
      return `<circle class="bx ${cls}" cx="${cx}" cy="${cy}" r="${r}"/>`;
    },
    poly(points, cls = "") {
      return `<polygon class="bx ${cls}" points="${points}"/>`;
    },
  };

  /* Arrowheads live in one hidden SVG so every figure can share them. */
  function ensureDefs() {
    if (document.getElementById("fg-defs")) return;
    const holder = document.createElementNS(SVG_NS, "svg");
    holder.id = "fg-defs";
    holder.setAttribute("width", "0");
    holder.setAttribute("height", "0");
    holder.setAttribute("aria-hidden", "true");
    holder.setAttribute("focusable", "false");
    holder.innerHTML = `<defs>${["", "-a", "-t"].map((s) =>
      `<marker id="fg-ah${s}" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path class="fg-ah${s}" d="M0 0.6L10 5L0 9.4z"/></marker>`).join("")}</defs>`;
    document.body.append(holder);
  }

  /* ---------- Text ---------- */

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\[\[[^\]]+\]\])/;

  function inline(node, text) {
    String(text).split(INLINE).forEach((part, i) => {
      if (!part) return;
      if (i % 2 === 0) { node.append(part); return; }
      if (part[0] === "`") { node.append(el("code", "", part.slice(1, -1))); return; }
      if (part[0] === "*") { node.append(el("strong", "", part.slice(2, -2))); return; }
      const [target, label] = part.slice(2, -2).split("|");
      const a = el("a", "", label || target);
      a.href = target.includes(".html") ? target : `#${target}`;
      node.append(a);
    });
    return node;
  }

  function countWords(value) {
    if (typeof value === "string") return value.split(/\s+/).filter(Boolean).length;
    if (Array.isArray(value)) return value.reduce((n, v) => n + countWords(v), 0);
    if (value && typeof value === "object") {
      return Object.entries(value).reduce((n, [key, v]) => n + (key === "fig" ? 0 : countWords(v)), 0);
    }
    return 0;
  }

  /* ---------- Blocks ---------- */

  function figure(block) {
    const make = window.FIGURES[block.fig];
    if (typeof make !== "function") return document.createComment(` missing figure ${block.fig} `);
    const fig = el("figure", "fig");
    const box = el("div", "fig-box");
    box.innerHTML = make(g);
    const svg = box.querySelector("svg");
    if (svg) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", block.alt || block.cap || "Diagram");
    }
    box.tabIndex = 0;
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "Diagram (scrolls sideways on small screens)");
    fig.append(box);
    if (block.cap) fig.append(inline(el("figcaption"), block.cap));
    return fig;
  }

  function table(block) {
    const wrap = el("div", "tbl");
    wrap.tabIndex = 0;
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Table (scrolls sideways on small screens)");
    const t = el("table");
    const [head, ...rows] = block.table;
    if (block.cap) t.append(inline(el("caption"), block.cap));
    const thead = el("thead");
    const headRow = el("tr");
    for (const cell of head) {
      const th = inline(el("th"), cell);
      th.scope = "col";
      headRow.append(th);
    }
    thead.append(headRow);
    const tbody = el("tbody");
    for (const row of rows) {
      const tr = el("tr");
      row.forEach((cell, i) => {
        const td = inline(el(i === 0 ? "th" : "td"), cell);
        if (i === 0) td.scope = "row";
        tr.append(td);
      });
      tbody.append(tr);
    }
    t.append(thead, tbody);
    wrap.append(t);
    return wrap;
  }

  function flow(block) {
    const wrap = el("figure", "flow-wrap");
    const ol = el("ol", "flow");
    for (const step of block.flow) {
      const [title, sub] = step.split("|");
      const li = el("li");
      const box = el("span", "flow-box");
      box.append(inline(el("b"), title));
      if (sub) box.append(inline(el("span"), sub));
      li.append(box);
      ol.append(li);
    }
    if (block.loop) {
      const li = el("li", "flow-loop");
      li.append(inline(el("span"), block.loop));
      ol.append(li);
    }
    wrap.append(ol);
    if (block.cap) wrap.append(inline(el("figcaption"), block.cap));
    return wrap;
  }

  function sectionHeading(text, addToc) {
    const h = inline(el("h4", "ls-h"), text);
    h.tabIndex = -1;
    addToc(h.textContent, h);
    return h;
  }

  function renderBlock(block, addToc) {
    if (typeof block === "string") return inline(el("p"), block);
    if (block.h) return sectionHeading(block.h, addToc);
    if (block.ul || block.ol) {
      const list = el(block.ol ? "ol" : "ul", "ls-list");
      for (const item of block.ul || block.ol) list.append(inline(el("li"), item));
      return list;
    }
    if (block.fig) return figure(block);
    if (block.table) return table(block);
    if (block.flow) return flow(block);
    if (block.code !== undefined) {
      const fig = el("figure", "ls-code");
      if (block.label) fig.append(el("figcaption", "", block.label));
      const pre = el("pre");
      pre.tabIndex = 0;
      pre.append(el("code", "", block.code));
      fig.append(pre);
      return fig;
    }
    if (block.tip || block.warn || block.note) {
      const kind = block.tip ? "tip" : block.warn ? "warn" : "note";
      const box = el("div", `callout ${kind}`);
      box.append(el("strong", "", block.title || { tip: "Tip", warn: "Careful", note: "Good to know" }[kind]));
      box.append(inline(el("p"), block[kind]));
      return box;
    }
    if (block.terms) {
      const dl = el("dl", "terms");
      for (const [term, meaning] of block.terms) dl.append(inline(el("dt"), term), inline(el("dd"), meaning));
      return dl;
    }
    if (block.try) {
      const box = el("div", "try");
      box.append(el("strong", "", block.t || "Try it"));
      const ol = el("ol");
      for (const step of block.try) ol.append(inline(el("li"), step));
      box.append(ol);
      return box;
    }
    if (block.check) {
      const wrap = el("div", "check");
      wrap.append(sectionHeading(block.title || "Check yourself", addToc));
      for (const [question, answer] of block.check) {
        const details = el("details");
        details.append(inline(el("summary"), question), inline(el("p"), answer));
        wrap.append(details);
      }
      return wrap;
    }
    return document.createComment(" unknown lesson block ");
  }

  return function renderLesson(blocks) {
    ensureDefs();
    const section = el("section", "lesson");
    const head = el("div", "lesson-head");
    const label = el("h3", "", "Deep dive");
    label.id = "lesson-label";
    section.setAttribute("aria-labelledby", label.id);
    const minutes = Math.max(1, Math.round(countWords(blocks) / 200));
    head.append(label, el("span", "lesson-time", `about ${minutes} min read`));
    section.append(head);

    const sections = blocks.filter((b) => b && (b.h || b.check)).length;
    const toc = sections >= 3 ? el("ul", "lesson-toc") : null;
    if (toc) {
      toc.setAttribute("aria-label", "In this lesson");
      section.append(toc);
    }
    const addToc = (text, target) => {
      if (!toc) return;
      const li = el("li");
      const button = el("button", "", text);
      button.type = "button";
      button.addEventListener("click", () => {
        target.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" });
        target.focus({ preventScroll: true });
      });
      li.append(button);
      toc.append(li);
    };

    for (const block of blocks) section.append(renderBlock(block, addToc));
    return section;
  };
})();
