# Cyber security career roadmaps

Free, interactive roadmaps for getting into cyber security and penetration testing, with real pay and job market data and a comparison of certifications.

- **Cyber security roadmap:** IT foundations, networking, systems, scripting, security fundamentals, cloud and the SOC, then a specialty
- **Penetration testing roadmap:** ethics and scope, a legal practice lab, recon, scanning, web and internal testing, reporting, specialising, getting hired, and growing into a senior tester, with a note on what seniors know at every step
- Click any topic for what it is, how it's used on the job, what to learn and free resources
- Job checkpoints show which jobs you could apply for at each point, with official pay data
- Jobs and pay page with US (BLS, O*NET) and Canadian (Job Bank) figures, and every source linked
- 25 certifications compared by cost, format and level, with filters
- Study plans for Security+, PenTest+, eJPT, PNPT, CPTS and OSCP+: exam formats, a weekly plan, legal labs and the path from junior to senior
- A practice quiz with 121 original exam-style questions in 11 sets, each answer explained (no exam dumps: nothing is copied from a real exam)
- Progress is saved in your browser only; there are no accounts

## Run it locally

It's a static site with no build step:

```bash
python -m http.server 5320
```

Then open http://localhost:5320.

## How it's put together

- `data/cyber-security.js` and `data/penetration-testing.js` hold each roadmap's steps and topics
- `data/shared.js` holds the resource links, the jobs shown at checkpoints and the certification names
- `roadmap.js` draws the chart, the side panel and the progress bar
- `data/quiz.js` holds the practice questions and `quiz.js` runs the quiz
- `jobs.html`, `certifications.html` and `study.html` are plain HTML

## Corrections

Pay, job market numbers and certification prices go out of date; they were last checked in November 2026. If you spot a mistake, please open an issue.

## A note on ethics

Only practise on systems you own or have written permission to test. Unauthorised access is a crime in Canada, the US and most other countries.

## License

[MIT](LICENSE)
