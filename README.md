# Cyber security career roadmaps

Free, interactive roadmaps for getting into cyber security and penetration testing, with real pay and job market data and a comparison of certifications.

- **Cyber security roadmap:** IT foundations, networking, systems, scripting, security fundamentals, cloud and the SOC, then a specialty
- **Penetration testing roadmap:** ethics and scope, a legal practice lab, recon, scanning, web and internal testing, reporting, specialising and getting hired
- Click any topic for what it is, how it's used on the job, what to learn and free resources
- Job checkpoints show which jobs you could apply for at each point, with official pay data
- Jobs and pay page with US (BLS, O*NET) and Canadian (Job Bank) figures, and every source linked
- 25 certifications compared by cost, format and level, with filters
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
- `jobs.html` and `certifications.html` are plain HTML

## Corrections

Pay, job market numbers and certification prices go out of date; they were last checked in November 2026. If you spot a mistake, please open an issue.

## A note on ethics

Only practise on systems you own or have written permission to test. Unauthorised access is a crime in Canada, the US and most other countries.

## License

[MIT](LICENSE)
