"use strict";

/* Draws a roadmap from window.ROADMAP: steps down a centre line with topics on either side,
   a side panel for each topic, and progress kept in this browser only. */
(() => {
  const data = window.ROADMAP;
  const LINKS = window.LINKS || {};
  const JOBS = window.JOBS || {};
  const CERTS = window.CERTS || {};
  const root = document.getElementById("roadmap");
  if (!data || !root) return;

  const SVG_NS = "http://www.w3.org/2000/svg";
  const KEY = `cyber-roadmaps:progress:${data.id}`;
  const LEVELS = { core: "Core", useful: "Good to know", later: "Later or optional" };
  const STATUS_WORDS = { done: "done", learning: "learning", skip: "skipped" };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let progress = {};
  try { progress = JSON.parse(store.get(KEY) || "{}") || {}; } catch { progress = {}; }

  const nodes = new Map(); // id -> { item, kind, step }
  const order = [];        // reading order, for the previous and next buttons

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const pad = (n) => String(n).padStart(2, "0");

  function register(item, kind, step) {
    nodes.set(item.id, { item, kind, step });
    order.push(item.id);
  }

  /* ---------- Build the chart ---------- */

  function topicButton(item, kind) {
    const level = item.lv || "core";
    const button = el("button", kind === "main" ? "node main" : `node sub ${level}`);
    button.type = "button";
    button.dataset.id = item.id;
    button.setAttribute("aria-haspopup", "dialog");
    if (kind === "sub") button.append(el("span", "dot"));
    const tick = el("span", "tick", "✓");
    tick.setAttribute("aria-hidden", "true");
    button.append(el("span", "label", item.t), tick, el("span", "sr-only state"));
    button.addEventListener("click", () => openTopic(item.id));
    return button;
  }

  function linkNode(item) {
    const link = el("a", "node sub link");
    link.href = item.href;
    link.append(el("span", "label", item.t), el("span", "arrow", "→"));
    return link;
  }

  const list = el("ol", "rm-list");
  let stepNumber = 0;

  for (const step of data.steps) {
    if (step.checkpoint) {
      register(step, "checkpoint", step);
      const li = el("li", "rm-cp");
      const button = el("button", "cp-node");
      button.type = "button";
      button.dataset.id = step.id;
      button.setAttribute("aria-haspopup", "dialog");
      button.append(el("span", "cp-tag", "Job checkpoint"), el("span", "label", step.t));
      button.addEventListener("click", () => openTopic(step.id));
      li.append(button);
      list.append(li);
      continue;
    }

    step.no = ++stepNumber;
    register(step, "main", step);
    const li = el("li", "rm-step");
    li.id = `step-${step.id}`;

    const centre = el("div", "rm-center");
    const num = el("span", "rm-num");
    num.append(el("span", "rm-num-word", "Step "), pad(step.no));
    centre.append(num, topicButton(step, "main"));
    li.append(centre);

    for (const side of ["left", "right"]) {
      const box = el("div", `rm-side rm-${side}`);
      const ul = el("ul");
      for (const item of step[side] || []) {
        const entry = el("li");
        if (item.href) {
          entry.append(linkNode(item));
        } else {
          register(item, "sub", step);
          entry.append(topicButton(item, "sub"));
        }
        ul.append(entry);
      }
      box.append(ul);
      li.append(box);
    }
    list.append(li);
  }

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.classList.add("rm-wires");
  svg.setAttribute("aria-hidden", "true");

  root.replaceChildren(svg, list);

  if (data.end) {
    const end = el("div", "rm-end");
    end.append(el("p", "", data.end));
    root.append(end);
  }

  /* ---------- Wires ---------- */

  function drawWires() {
    if (getComputedStyle(svg).display === "none") return;
    const base = root.getBoundingClientRect();
    const box = (node) => {
      const r = node.getBoundingClientRect();
      return { l: r.left - base.left, r: r.right - base.left, cx: (r.left + r.right) / 2 - base.left, cy: (r.top + r.bottom) / 2 - base.top };
    };
    svg.setAttribute("width", base.width);
    svg.setAttribute("height", base.height);
    svg.setAttribute("viewBox", `0 0 ${base.width} ${base.height}`);

    const parts = [];
    const mains = [...list.querySelectorAll(".node.main")].map(box);
    if (mains.length > 1) {
      parts.push(`<path class="spine" d="M${mains[0].cx} ${mains[0].cy} V${mains[mains.length - 1].cy}"/>`);
    }
    for (const stepEl of list.querySelectorAll(".rm-step")) {
      const main = box(stepEl.querySelector(".node.main"));
      for (const side of ["left", "right"]) {
        for (const node of stepEl.querySelectorAll(`.rm-${side} .node`)) {
          const sub = box(node);
          const x1 = side === "left" ? main.l : main.r;
          const x2 = side === "left" ? sub.r : sub.l;
          const mid = (x1 + x2) / 2;
          const cls = node.classList.contains("later") ? ' class="later"' : "";
          parts.push(`<path${cls} d="M${x1} ${main.cy} C${mid} ${main.cy} ${mid} ${sub.cy} ${x2} ${sub.cy}"/>`);
        }
      }
    }
    svg.innerHTML = parts.join("");
  }

  let frame = 0;
  const scheduleWires = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(drawWires);
  };
  new ResizeObserver(scheduleWires).observe(root);
  if (document.fonts) document.fonts.ready.then(scheduleWires);

  /* ---------- Progress ---------- */

  const progressText = document.getElementById("progress-text");
  const progressTrack = document.getElementById("progress-track");
  const progressFill = document.getElementById("progress-fill");
  const resetButton = document.getElementById("reset-progress");
  const countable = [...nodes.values()].filter((entry) => entry.kind !== "checkpoint");

  function save() {
    if (Object.keys(progress).length) store.set(KEY, JSON.stringify(progress));
    else store.remove(KEY);
  }

  function paintNode(id) {
    const status = progress[id];
    for (const node of document.querySelectorAll(`[data-id="${CSS.escape(id)}"]`)) {
      if (status) node.dataset.status = status;
      else delete node.dataset.status;
      const state = node.querySelector(".state");
      if (state) state.textContent = status ? `, ${STATUS_WORDS[status]}` : "";
    }
  }

  function paintProgress() {
    if (!progressText) return;
    const total = countable.length;
    const done = countable.filter((entry) => progress[entry.item.id] === "done").length;
    const learning = countable.filter((entry) => progress[entry.item.id] === "learning").length;
    progressText.textContent = `${done} of ${total} done${learning ? ` · ${learning} learning` : ""}`;
    progressFill.style.width = `${total ? (done / total) * 100 : 0}%`;
    progressTrack.setAttribute("aria-valuemax", total);
    progressTrack.setAttribute("aria-valuenow", done);
    progressTrack.setAttribute("aria-valuetext", `${done} of ${total} topics done`);
    if (resetButton) resetButton.disabled = Object.keys(progress).length === 0;
  }

  function setStatus(id, status) {
    if (status) progress[id] = status;
    else delete progress[id];
    save();
    paintNode(id);
    paintStatusButtons();
    paintProgress();
  }

  for (const id of nodes.keys()) paintNode(id);
  paintProgress();

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (!window.confirm("Clear your progress on this roadmap? This only affects this browser.")) return;
      const ids = Object.keys(progress);
      progress = {};
      save();
      ids.forEach(paintNode);
      paintStatusButtons();
      paintProgress();
    });
  }

  /* ---------- Side panel ---------- */

  const backdrop = el("div", "drawer-backdrop");
  const drawer = el("aside", "drawer");
  drawer.id = "topic-panel";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-labelledby", "panel-title");
  drawer.innerHTML = `
    <div class="drawer-top">
      <p class="kicker" id="panel-kicker"></p>
      <button type="button" class="icon-btn" data-close aria-label="Close panel">×</button>
    </div>
    <div class="drawer-scroll" id="panel-body"></div>
    <div class="drawer-foot">
      <div class="status-row" role="group" aria-label="Mark this topic">
        <button type="button" data-set="done" aria-pressed="false">Done</button>
        <button type="button" data-set="learning" aria-pressed="false">Learning</button>
        <button type="button" data-set="skip" aria-pressed="false">Skip</button>
        <button type="button" data-set="" aria-pressed="false">Clear</button>
      </div>
      <div class="step-row">
        <button type="button" class="button quiet" data-move="-1">← Previous</button>
        <button type="button" class="button quiet" data-move="1">Next →</button>
      </div>
    </div>`;
  backdrop.hidden = true;
  drawer.hidden = true;
  document.body.append(backdrop, drawer);

  const kicker = drawer.querySelector("#panel-kicker");
  const body = drawer.querySelector("#panel-body");
  const statusRow = drawer.querySelector(".status-row");
  const prevButton = drawer.querySelector('[data-move="-1"]');
  const nextButton = drawer.querySelector('[data-move="1"]');

  let currentId = null;
  let closeTimer = 0;

  function paintStatusButtons() {
    if (!currentId) return;
    const status = progress[currentId] || "";
    for (const button of statusRow.querySelectorAll("button")) {
      button.setAttribute("aria-pressed", String(button.dataset.set === status));
    }
  }

  function heading(text) {
    return el("h3", "", text);
  }

  function bulletList(items) {
    const ul = el("ul");
    for (const text of items) ul.append(el("li", "", text));
    return ul;
  }

  function resourceList(keys) {
    const ul = el("ul", "res-list");
    for (const key of keys) {
      const link = LINKS[key];
      if (!link) continue;
      const [label, url, cost] = link;
      const li = el("li");
      const a = el("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      const text = el("span", "", label);
      text.append(el("span", "host", new URL(url).hostname.replace(/^www\./, "")));
      const tag = el("span", `tag ${cost}`, { free: "Free", paid: "Paid", mixed: "Free + paid" }[cost]);
      a.append(text, tag);
      li.append(a);
      ul.append(li);
    }
    return ul;
  }

  function fillPanel(entry) {
    const { item, kind, step } = entry;
    kicker.textContent = kind === "checkpoint" ? "Job checkpoint"
      : kind === "main" ? `Step ${pad(step.no)} of ${stepNumber}`
      : `Step ${pad(step.no)} · ${step.t}`;

    const parts = [];
    if (kind === "main") parts.push(el("span", "badge main", "Main step"));
    if (kind === "sub") {
      const level = item.lv || "core";
      parts.push(el("span", `badge ${level}`, LEVELS[level]));
    }

    const title = el("h2", "", item.t);
    title.id = "panel-title";
    title.tabIndex = -1;
    parts.push(title);
    if (item.d) parts.push(el("p", "", item.d));

    if (item.job) {
      const box = el("div", "on-job");
      box.append(el("strong", "", "On the job"), el("p", "", item.job));
      parts.push(box);
    }

    if (item.learn) parts.push(heading("What to learn"), bulletList(item.learn));

    if (kind === "main") {
      const subs = [...(step.left || []), ...(step.right || [])];
      if (subs.length) {
        const ul = el("ul", "chips");
        for (const sub of subs) {
          const li = el("li");
          if (sub.href) {
            const a = el("a", "", `${sub.t} →`);
            a.href = sub.href;
            li.append(a);
          } else {
            const button = el("button", "", sub.t);
            button.type = "button";
            if (progress[sub.id]) button.dataset.status = progress[sub.id];
            button.addEventListener("click", () => openTopic(sub.id));
            li.append(button);
          }
          ul.append(li);
        }
        parts.push(heading("Topics in this step"), ul);
      }
    }

    if (item.practice) parts.push(heading("Practise"), el("p", "", item.practice));

    if (item.jobs) {
      const ul = el("ul", "job-list");
      for (const key of item.jobs) {
        const job = JOBS[key];
        if (!job) continue;
        const li = el("li");
        li.append(el("b", "", job.t), el("span", "pay", job.pay));
        if (job.note) li.append(el("p", "small muted", job.note));
        const more = el("a", "small", "Day-to-day work and how people get in");
        more.href = `jobs.html#${job.anchor}`;
        li.append(more);
        ul.append(li);
      }
      parts.push(heading("Jobs you could apply for now"), ul);
    }

    if (item.certs) {
      const ul = el("ul", "chips");
      for (const key of item.certs) {
        const cert = CERTS[key];
        if (!cert) continue;
        const li = el("li");
        const a = el("a", "", cert);
        a.href = `certifications.html#${key}`;
        li.append(a);
        ul.append(li);
      }
      parts.push(heading("Certifications that cover this"), ul);
    }

    if (item.links && item.links.length) parts.push(heading("Where to learn it"), resourceList(item.links));

    body.replaceChildren(...parts);
    body.scrollTop = 0;

    statusRow.hidden = kind === "checkpoint";
    const at = order.indexOf(item.id);
    prevButton.disabled = at <= 0;
    nextButton.disabled = at >= order.length - 1;
    paintStatusButtons();
    return title;
  }

  function openTopic(id) {
    const entry = nodes.get(id);
    if (!entry) return;
    currentId = id;
    const title = fillPanel(entry);
    clearTimeout(closeTimer);
    if (drawer.hidden) {
      drawer.hidden = false;
      backdrop.hidden = false;
      requestAnimationFrame(() => {
        drawer.classList.add("open");
        backdrop.classList.add("open");
      });
      document.addEventListener("keydown", onKey);
    }
    title.focus({ preventScroll: true });
    history.replaceState(null, "", `#${id}`);
  }

  function closePanel() {
    if (!currentId) return;
    const lastId = currentId;
    currentId = null;
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    document.removeEventListener("keydown", onKey);
    closeTimer = setTimeout(() => {
      drawer.hidden = true;
      backdrop.hidden = true;
    }, reduceMotion.matches ? 0 : 230);
    history.replaceState(null, "", location.pathname + location.search);
    const node = list.querySelector(`[data-id="${CSS.escape(lastId)}"]`);
    if (node) {
      node.focus({ preventScroll: true });
      node.scrollIntoView({ block: "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" });
    }
  }

  function onKey(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...drawer.querySelectorAll("a[href], button:not([disabled])")]
      .filter((node) => node.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !drawer.contains(active) || active.id === "panel-title")) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !drawer.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  }

  drawer.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) { closePanel(); return; }
    const setter = event.target.closest("button[data-set]");
    if (setter && currentId) { setStatus(currentId, setter.dataset.set); return; }
    const mover = event.target.closest("button[data-move]");
    if (mover && currentId) {
      const next = order[order.indexOf(currentId) + Number(mover.dataset.move)];
      if (next) openTopic(next);
    }
  });
  backdrop.addEventListener("click", closePanel);

  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (nodes.has(id)) openTopic(id);
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
