"use strict";

/* Practice quiz: pick a set, answer one question at a time, read why, then review the misses.
   Questions and options are shuffled each run. Best scores stay in this browser only. */
(() => {
  const SETS = window.QUIZ_SETS || [];
  const ALL = window.QUIZ || [];
  const picker = document.getElementById("picker");
  const grid = document.getElementById("set-grid");
  const area = document.getElementById("quiz-area");
  if (!picker || !grid || !area || !ALL.length) return;

  const MIXED_SIZE = 25;
  const MIXED = { id: "mixed", t: "Mixed exam", d: `${MIXED_SIZE} random questions from every set. A good check before a real exam.` };
  const KEY = (id) => `cyber-roadmaps:quiz:${id}`;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let run = null;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function readBest(id) {
    try {
      const saved = JSON.parse(store.get(KEY(id)) || "null");
      return saved && Number.isFinite(saved.score) && Number.isFinite(saved.total) ? saved : null;
    } catch { return null; }
  }

  function saveBest(id, score, total) {
    const old = readBest(id);
    if (!old || score / total > old.score / old.total) store.set(KEY(id), JSON.stringify({ score, total }));
  }

  /* ---------- Set picker ---------- */

  function setCard(set, count, extraClass) {
    const button = el("button", `set-card${extraClass ? ` ${extraClass}` : ""}`);
    button.type = "button";
    const meta = el("span", "set-meta");
    meta.append(el("span", "", `${count} questions`));
    if (set.certs) meta.append(el("span", "", set.certs));
    const best = readBest(set.id);
    if (best) meta.append(el("span", "set-best", `Best ${best.score}/${best.total}`));
    button.append(el("b", "", set.t), el("span", "set-desc", set.d), meta);
    button.addEventListener("click", () => start(set.id));
    return button;
  }

  function renderPicker() {
    const cards = [setCard(MIXED, Math.min(MIXED_SIZE, ALL.length), "mixed")];
    for (const set of SETS) {
      const count = ALL.filter((q) => q.s === set.id).length;
      if (count) cards.push(setCard(set, count));
    }
    grid.replaceChildren(...cards);
  }

  /* ---------- Running a quiz ---------- */

  function start(id) {
    const set = id === MIXED.id ? MIXED : SETS.find((s) => s.id === id);
    if (!set) return;
    const pool = id === MIXED.id ? shuffle(ALL).slice(0, MIXED_SIZE) : shuffle(ALL.filter((q) => q.s === id));
    run = {
      set,
      items: pool.map((q) => ({
        q: q.q,
        e: q.e,
        options: shuffle(q.o.map((text, i) => ({ text, right: i === q.a }))),
      })),
      i: 0,
      score: 0,
      missed: [],
      answered: false,
    };
    picker.hidden = true;
    area.hidden = false;
    history.replaceState(null, "", `#${id}`);
    showQuestion();
    area.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" });
  }

  function topBar() {
    const top = el("div", "quiz-top");
    top.append(el("p", "kicker", run.set.t));
    const count = el("p", "quiz-count");
    count.id = "quiz-count";
    top.append(count);
    const bar = el("div", "quiz-bar");
    bar.setAttribute("aria-hidden", "true");
    const fill = el("span");
    fill.id = "quiz-fill";
    bar.append(fill);
    return [top, bar];
  }

  function paintCount() {
    const total = run.items.length;
    const done = run.i + (run.answered ? 1 : 0);
    document.getElementById("quiz-count").textContent =
      `Question ${run.i + 1} of ${total} · ${run.score} right so far`;
    document.getElementById("quiz-fill").style.width = `${(done / total) * 100}%`;
  }

  function showQuestion() {
    const item = run.items[run.i];
    run.answered = false;

    const title = el("h2", "", item.q);
    title.id = "quiz-question";
    title.tabIndex = -1;

    const options = el("ol", "options");
    options.setAttribute("aria-labelledby", "quiz-question");
    item.options.forEach((option, index) => {
      const li = el("li");
      const button = el("button", "option");
      button.type = "button";
      button.dataset.index = index;
      const key = el("span", "key", String(index + 1));
      key.setAttribute("aria-hidden", "true");
      button.append(key, el("span", "", option.text), el("span", "sr-only note"));
      button.addEventListener("click", () => answer(index));
      li.append(button);
      options.append(li);
    });

    const feedback = el("div", "feedback");
    feedback.id = "quiz-feedback";
    feedback.hidden = true;
    const live = el("div");
    live.setAttribute("aria-live", "polite");
    live.append(feedback);

    const actions = el("div", "quiz-actions");
    const quit = el("button", "button quiet", "Choose another set");
    quit.type = "button";
    quit.addEventListener("click", backToPicker);
    const next = el("button", "button", run.i === run.items.length - 1 ? "See your score" : "Next question");
    next.type = "button";
    next.id = "quiz-next";
    next.hidden = true;
    next.addEventListener("click", () => {
      run.i++;
      if (run.i < run.items.length) showQuestion();
      else finish();
    });
    actions.append(quit, el("p", "quiz-hint", "Tip: press 1–4 to answer."), next);

    area.replaceChildren(...topBar(), title, options, live, actions);
    paintCount();
    title.focus({ preventScroll: true });
  }

  function answer(index) {
    if (!run || run.answered) return;
    const item = run.items[run.i];
    const chosen = item.options[index];
    if (!chosen) return;
    run.answered = true;
    if (chosen.right) run.score++;
    else run.missed.push({ item, chosen: chosen.text });

    area.querySelectorAll(".option").forEach((button, i) => {
      const option = item.options[i];
      button.disabled = true;
      const note = button.querySelector(".note");
      if (option.right) {
        button.classList.add("right");
        note.textContent = i === index ? " (your answer, correct)" : " (correct answer)";
      } else if (i === index) {
        button.classList.add("wrong");
        note.textContent = " (your answer, incorrect)";
      } else {
        button.classList.add("dim");
      }
    });

    const feedback = document.getElementById("quiz-feedback");
    feedback.className = `feedback ${chosen.right ? "good" : "bad"}`;
    const right = item.options.find((option) => option.right);
    const verdict = el("strong", "", chosen.right ? "Right" : "Not quite");
    if (!chosen.right) verdict.append(el("span", "sr-only", `. The answer is: ${right.text}.`));
    feedback.replaceChildren(verdict, el("p", "", item.e));
    feedback.hidden = false;

    paintCount();
    const next = document.getElementById("quiz-next");
    next.hidden = false;
    next.focus({ preventScroll: true });
  }

  function finish() {
    const total = run.items.length;
    const pct = Math.round((run.score / total) * 100);
    saveBest(run.set.id, run.score, total);

    const title = el("h2", "", "Your score");
    title.tabIndex = -1;
    const score = el("p", "result-score", `${run.score} / ${total}`);
    const message = el("p", "muted",
      pct >= 90 ? `${pct}%. You know this topic well. Try the mixed exam or a harder set next.`
        : pct >= 70 ? `${pct}%. Solid. Read the explanations for the ones you missed, then try again in a day or two.`
        : `${pct}%. Worth another pass. Read the explanations below, revisit the matching roadmap topics, then try again.`);

    const parts = [el("p", "kicker", run.set.t), title, score, message];

    if (run.missed.length) {
      parts.push(el("h3", "", "The ones to review"));
      const list = el("ul", "review");
      for (const { item, chosen } of run.missed) {
        const li = el("li");
        const right = item.options.find((option) => option.right);
        li.append(el("b", "", item.q), el("p", "", `Your answer: ${chosen}`), el("p", "ans", `Right answer: ${right.text}`), el("p", "muted", item.e));
        list.append(li);
      }
      parts.push(list);
    }

    const actions = el("div", "quiz-actions");
    const again = el("button", "button", "Try this set again");
    again.type = "button";
    const setId = run.set.id;
    again.addEventListener("click", () => start(setId));
    const back = el("button", "button quiet", "Choose another set");
    back.type = "button";
    back.addEventListener("click", backToPicker);
    actions.append(back, again);
    parts.push(actions);

    area.replaceChildren(...parts);
    title.focus({ preventScroll: true });
    area.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" });
  }

  function backToPicker() {
    run = null;
    area.hidden = true;
    area.replaceChildren();
    picker.hidden = false;
    history.replaceState(null, "", location.pathname + location.search);
    renderPicker();
    const heading = document.getElementById("pick-title");
    if (heading) {
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" });
    }
  }

  document.addEventListener("keydown", (event) => {
    if (!run || run.answered || area.hidden) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target.closest && event.target.closest("input, textarea, select")) return;
    const n = Number(event.key);
    if (Number.isInteger(n) && n >= 1 && n <= run.items[run.i].options.length) {
      event.preventDefault();
      answer(n - 1);
    }
  });

  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id === MIXED.id || SETS.some((s) => s.id === id)) start(id);
  }

  renderPicker();
  picker.hidden = false;
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
