"use strict";

/* Step 9: Getting hired. */
(() => {
const R = String.raw;

Object.assign(window.LESSONS, {
  "hired": [
    "Entry-level security jobs get a lot of applicants, and many ask for experience. The people who get through show proof: things they've built, IT work they've done, and a clear story about why security. Treat the search itself like a project.",
    { fig: "funnel", cap: "A job application is a series of filters. Each stage is looking for something different." },
    { h: "What employers look for at entry level" },
    { ul: [
      "Solid foundations: networking, Windows and Linux, how logins and permissions work.",
      "Evidence you can learn on your own: a home lab, write-ups, CTFs, a certification.",
      "Communication: clear writing and calm explanations, because security is half talking to people.",
      "Some IT experience, even help desk. Many security managers prefer it to a pure security background.",
    ] },
    { h: "A 12-week plan" },
    { table: [
      ["Weeks", "Focus"],
      ["1 to 2", "Pick two target roles (for example SOC analyst and IT support). Rewrite your resume and LinkedIn for them. List 30 employers in your area."],
      ["3 to 4", "Finish one portfolio project and publish the write-up."],
      ["5 to 8", "Apply to 5 to 10 roles a week, IT as well as security. Go to one meetup a month. Track everything in a spreadsheet."],
      ["9 to 12", "Practise interviews out loud, follow up on applications, start a second project."],
    ] },
    { tip: "Apply even if you meet only about 70% of a job ad. Ads describe an ideal; managers interview people who are close and clearly keen to learn." },
    { check: [
      ["Why apply to IT support roles when you want a security job?", "They're easier to get, they teach how real companies run, and many security teams hire from their own IT staff."],
      ["What's the most convincing thing an entry-level candidate can show?", "Proof of work: a documented home lab, investigations or projects they can talk through in detail."],
    ] },
  ],

  "portfolio": [
    { h: "Projects that impress" },
    { table: [
      ["Project", "Shows", "Roughly"],
      ["Home SIEM: Wazuh or Elastic collecting Sysmon and Windows logs from your lab, with a few working alerts", "Logging, detections, Windows", "2 to 3 weekends"],
      ["A small Active Directory lab with Group Policy, auditing and a write-up of what each event ID means", "Windows admin, AD, event logs", "2 weekends"],
      ["Three phishing analyses from a blue team platform, written like real escalation notes", "Triage, email headers, writing", "1 weekend"],
      ["A Python tool on GitHub that parses logs or calls a threat intel API, with a README", "Scripting, Git", "1 to 2 weekends"],
      ["A cloud logging lab: CloudTrail or the Activity log into a SIEM, with an alert on a risky change", "Cloud, IAM, logging", "2 weekends"],
      ["A detection rules repo with test data and a short explanation per rule", "Detection engineering, Git", "Ongoing"],
    ] },
    { h: "How to write it up" },
    { code: R`# Home SIEM with Wazuh

## Goal
Collect Windows and Linux logs from my lab and alert on failed logons and new services.

## Setup
(diagram) DC01, WS01, LNX01 on an isolated network; Wazuh on LNX01.

## What I did
1. Installed Sysmon with a community config on DC01 and WS01 ...
2. ...

## What went wrong
Agents didn't connect because of a firewall rule; found it with tcpdump on port 1514.

## What I learned
...

## Next
Map my three alerts to MITRE ATT&CK and test them with simulated events.`, label: "README.md template" },
    "The \"what went wrong\" section is the one interviewers ask about most. It shows you can troubleshoot, and it's the hardest part to fake.",
    { h: "What not to publish" },
    { ul: [
      "Solutions to retired or active machines on platforms whose rules forbid it.",
      "Anything from an employer: logs, IP addresses, screenshots of internal tools.",
      "Your own home IP address, real passwords or API keys, even expired ones.",
    ] },
    { check: [
      ["Why include what went wrong in a write-up?", "It proves you actually did the work and shows your troubleshooting, which is what the job needs."],
      ["You did a great investigation at work. Can you put it in your portfolio?", "Not the real data. You can describe the type of problem and your approach in general terms, or recreate it in your lab."],
    ] },
  ],

  "resume": [
    { h: "Bullets that work" },
    "Every bullet should say what you did, with what, and what changed. Numbers help, but only true ones.",
    { table: [
      ["Weak", "Strong"],
      ["Responsible for monitoring alerts", "Triaged about 40 alerts per shift in Splunk; escalated 12 confirmed phishing incidents with written timelines"],
      ["Helped users with IT issues", "Resolved 25+ tickets a week across Windows, Microsoft 365 and VPN access, with a 95% satisfaction score"],
      ["Built a home lab", "Built a 4-VM lab with Active Directory and Wazuh; wrote 5 detections for logon and service events (GitHub link)"],
      ["Knowledge of Python", "Wrote a Python tool that ranks failed SSH logins by source IP; used it to tune a firewall block list"],
    ], cap: "Examples only: use your own real numbers." },
    { h: "Layout for career changers" },
    { ol: [
      "Name, city, email, LinkedIn and GitHub links. No photo or full address needed in Canada and the US.",
      "A two-line summary aimed at the role.",
      "Skills, grouped: Networking · Windows and AD · Linux · SIEM · Scripting · Cloud.",
      "Projects, with links: this is your experience if you don't have security jobs yet.",
      "Work experience, with transferable bullets (customer service, troubleshooting, shift work).",
      "Certifications and education.",
    ] },
    { h: "Getting past the software" },
    "Many employers use an applicant tracking system (ATS) that parses and searches resumes. Use standard section headings, a simple one-column layout, and the same words as the job ad where they're true (if it says \"incident response\", don't only write \"IR\"). Save as PDF unless the ad asks for Word.",
    { tip: "Keep one master resume with everything, then cut a one-page version for each type of role you apply to." },
    { check: [
      ["Rewrite \"Did security monitoring\" as a stronger bullet.", "Something like: \"Monitored Microsoft Sentinel alerts for a 300-user company; investigated and closed 30+ alerts a week, escalating 4 confirmed incidents.\" (with your real details)."],
      ["Why mirror the job ad's words?", "Applicant tracking systems and recruiters search for them. Using them, honestly, gets you seen."],
    ] },
  ],

  "ctf": [
    "Capture-the-flag (CTF) events are security puzzles: solve a challenge, find a hidden \"flag\" string, score points. They're legal, fun, and a good way to practise and meet people.",
    { h: "Formats" },
    { table: [
      ["Format", "How it works"],
      ["Jeopardy", "A board of challenges in categories, worth more points as they get harder. The most common format"],
      ["Attack-defence", "Teams defend their own services while finding flaws in others', inside the event's own network"],
      ["King of the hill", "Gain and keep control of a shared target for points"],
      ["Blue team / defensive", "Investigate logs, memory or traffic to answer questions about an incident"],
    ] },
    { h: "Categories, and the careers they point to" },
    { table: [
      ["Category", "You'll practise", "Closest career"],
      ["Web", "How web apps break", "Pen testing, AppSec"],
      ["Forensics", "Disk images, memory, packet captures", "DFIR, SOC"],
      ["Crypto", "Spotting weak or misused cryptography", "AppSec, research"],
      ["Reverse engineering", "Reading compiled programs", "Malware analysis"],
      ["Binary exploitation (pwn)", "Memory corruption flaws", "Vulnerability research"],
      ["OSINT", "Finding public information", "Threat intel, investigations"],
    ] },
    { h: "Getting started" },
    { ul: [
      "picoCTF keeps its challenges online all year and starts at beginner level.",
      "CTFtime lists upcoming events worldwide and team rankings.",
      "Join a team: a university club, a local meetup or an online community. Solving together is how most people learn.",
      "Write up a challenge after the event ends. Organisers usually ask you to wait.",
    ] },
    { check: [
      ["Which CTF category is closest to SOC and incident response work?", "Forensics (and blue team CTFs that hand you logs or captures)."],
      ["When is it OK to publish a write-up?", "After the event ends, and only if the organisers allow it."],
    ] },
  ],

  "community": [
    "Many first security jobs come through someone who already knows you. Meeting people isn't about collecting contacts; it's about being someone people remember as keen and helpful.",
    { h: "Where to find people" },
    { table: [
      ["Where", "What it's like"],
      ["BSides conferences", "Cheap or free community conferences in many cities; very welcoming to newcomers"],
      ["OWASP chapters", "Free meetups about application security"],
      ["ISC2 and ISACA chapters", "More professional; good for GRC and management contacts"],
      ["DEF CON groups and local meetups", "Hands-on talks and workshops"],
      ["University and college clubs", "CTF teams, talks, and alumni already in the industry"],
      ["Online communities", "Discord servers and forums for specific certs, tools and roles"],
    ] },
    { h: "What to actually do" },
    { ul: [
      "Volunteer at a conference. You meet the organisers, who know everyone.",
      "Ask people what they're working on, then listen. People remember good listeners.",
      "Give a five-minute lightning talk on something you built. It's the fastest way to be known.",
      "Follow up within a few days with a short, specific message.",
    ] },
    { code: R`Hi Priya, thanks for the chat at BSides on Saturday about moving from help desk into
your SOC. I tried the Sysmon config you mentioned on my lab domain controller and wrote up
what changed: <link>. If your team ever has an opening for a junior analyst, I'd love to
hear about it. Either way, thanks for the advice.`, label: "A follow-up message" },
    { check: [
      ["What makes a follow-up message work?", "It's short, mentions something specific from the conversation, shows you acted on it, and asks for little."],
      ["Why is volunteering at a conference worth it?", "You meet organisers and speakers, who are well connected, and you're seen as helpful rather than asking for something."],
    ] },
  ],

  "interviews": [
    { h: "The usual stages" },
    { flow: ["Recruiter screen|motivation, salary, logistics", "Hiring manager|your story and fit", "Technical|questions, a scenario, maybe a lab", "Team or final|culture, questions for them"] },
    { h: "Stories with STAR" },
    "Behavioural questions (\"tell me about a time you…\") want a short, structured story.",
    { flow: ["Situation|where and when", "Task|what you had to do", "Action|what you did, in detail", "Result|what changed, ideally with a number"], cap: "Prepare three or four stories (a hard problem, a mistake, a conflict, something you learned fast) and adapt them to each question." },
    { h: "Scenario questions" },
    "\"A user reports a weird email\" or \"this alert fired, walk me through it\" test how you think, not whether you know the answer. Use a simple frame out loud:",
    { flow: ["Clarify|ask what you know and don't", "Gather|which logs or tools you'd check", "Hypothesise|what it could be", "Act|contain or escalate", "Communicate|who you'd tell, what you'd write"] },
    { check: [
      ["What happens when you type a URL into a browser and press Enter?", "Outline: DNS lookup (cache, resolver, root, TLD, authoritative), TCP handshake to port 443, TLS handshake with certificate check, HTTP request, response, page rendering. Mention DHCP and ARP if you want to go deeper. See [[networking|Networking]]."],
      ["What's the difference between hashing and encryption?", "Hashing is one-way and used to check integrity or store passwords; encryption is reversible with a key and keeps data secret."],
      ["A user says they entered their password on a fake login page. What do you do?", "Reset the password and revoke sessions, check sign-in logs for use of the account (and new MFA methods or mailbox rules), find other recipients of the same email, block the site, and document it. Thank the user for reporting quickly."],
      ["TCP or UDP: which does DNS use?", "Mostly UDP on port 53 for normal lookups, TCP for large responses and zone transfers."],
      ["Explain least privilege to a non-technical manager.", "Everyone gets only the access their job needs, so a stolen account or a mistake can only do limited damage."],
      ["A host is contacting the same external IP every 60 seconds. How would you investigate?", "Identify the process making the connections (EDR), check the destination's reputation and history, look at what else the host did, decide whether to isolate, and escalate with evidence."],
      ["What would you do if you didn't know the answer?", "Say so honestly, then explain how you'd find out (documentation, logs, a colleague, testing in a lab). Interviewers value that more than a guess."],
    ], title: "Questions you'll probably get" },
    { h: "Questions to ask them" },
    { ul: [
      "What does a typical shift or week look like for this role?",
      "How is the team trained, and is there time or budget for certifications?",
      "How many alerts does an analyst handle in a day, and how much is automated?",
      "What does someone in this role usually move on to after two years?",
    ] },
    { tip: "Thinking out loud is the single most useful interview habit. Silence looks like being stuck; reasoning looks like being an analyst." },
  ],

  "clearance": [
    "Government, defence and some critical-infrastructure jobs require security screening before you start. You can't apply for a clearance yourself; the employer or department sponsors you for a specific job.",
    { table: [
      ["", "Canada", "United States"],
      ["Who runs it", "The federal government, through the hiring department or Contract Security Program", "Federal agencies, through the employer"],
      ["Levels", "Reliability status (most federal jobs), Secret, Top Secret", "Confidential, Secret, Top Secret; SCI is extra access on top of Top Secret"],
      ["Citizenship", "Not always required for reliability status; varies for higher levels", "US citizenship required for a clearance"],
      ["What's checked", "Identity, criminal record, credit, background, and more for higher levels", "A long form (SF-86), background investigation, interviews; continuous vetting afterwards"],
    ], cap: "A simplified overview. Each job ad says which level is needed." },
    { h: "Helping your own screening" },
    { ul: [
      "Be completely honest on the forms. Hiding something is usually worse than the thing itself.",
      "Keep a record of past addresses, employers, travel and references with contact details.",
      "Manage debts responsibly; financial trouble is a common concern in screening.",
      "Expect it to take weeks or months, especially at higher levels.",
    ] },
    { check: [
      ["Can you get a security clearance before you have a job offer?", "Generally no; an employer or department sponsors you for a specific position."],
      ["What does SCI mean in the US?", "Sensitive Compartmented Information: additional controlled access granted on top of a Top Secret clearance."],
    ] },
  ],
});

Object.assign(window.FIGURES, {
  "funnel": (g) => {
    const stages = [
      ["Applications", 340, "m", "resume matches the ad; projects linked"],
      ["Recruiter screen", 290, "m", "a clear story: why security, why here"],
      ["Hiring manager", 240, "y", "proof you've done the work: labs, IT jobs"],
      ["Technical interview", 190, "a", "think out loud; say how you'd find out"],
      ["Offer", 140, "g", "ask questions, compare offers calmly"],
    ];
    const out = [g.text(190, 16, "Each stage filters", "c s b"), g.text(390, 16, "What gets you through", "s b")];
    stages.forEach(([name, w, cls, tip], i) => {
      const y = 28 + i * 50;
      out.push(g.box(190 - w / 2, y, w, 40, `!${name}`, cls), g.line(190 + w / 2, y + 20, 380, y + 20, "lf"), g.text(390, y + 24.5, tip, "s"));
    });
    return g.svg(680, 284, out);
  },
});
})();
